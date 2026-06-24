import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo ADMIN puede acceder a estas estadísticas" },
      { status: 403 }
    );
  }

  // Rango de fechas opcional (T-34). Por defecto: últimos 12 meses.
  const { searchParams } = new URL(_request.url);
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");
  const desde = desdeParam ? new Date(desdeParam + "T00:00:00") : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const hasta = hastaParam ? new Date(hastaParam + "T23:59:59") : null;
  const rangoDonacion = { gte: desde, ...(hasta ? { lte: hasta } : {}) };

  try {
    // KPIs desde las tablas MAYÚSCULAS vía rawQuery (más eficiente)
    const [
      totalDonadoResult,
      matchesActivos,
      matchesCerrados,
      estudiantesActivos,
      exalumnosActivos,
    ] = await Promise.all([
      prisma.$queryRaw<{ total: number; count: number }[]>`
        SELECT
          COALESCE(SUM(monto), 0) as total,
          COUNT(*) as count
        FROM "DONACIONES"
        WHERE estado = 'CONFIRMADA'
      `,
      prisma.match.count({ where: { estado: "ACTIVO" } }),
      prisma.match.count({ where: { estado: "CERRADO" } }),
      prisma.user.count({ where: { tipo: "ESTUDIANTE", status: "ACTIVO", activo: true } }),
      prisma.user.count({ where: { tipo: "EXALUMNO", status: "ACTIVO", activo: true } }),
    ]);

    // Donaciones confirmadas dentro del rango (para gráfico, total del periodo y donantes)
    const todasDonaciones = await prisma.donacion.findMany({
      where: {
        estado: "CONFIRMADA",
        created_at: rangoDonacion,
      },
      select: { monto: true, created_at: true, exalumno_id: true, proyecto_estudiante_id: true },
      orderBy: { created_at: "asc" },
    });

    // ── Donantes nuevos vs. recurrentes (dentro del rango) ──────────────────
    // Para cada donante en el rango, contar si tenía donaciones confirmadas ANTES del rango.
    const donantesEnRango = Array.from(new Set(todasDonaciones.map((d) => d.exalumno_id)));
    let donantesRecurrentes = 0;
    if (donantesEnRango.length > 0) {
      const previas = await prisma.donacion.groupBy({
        by: ["exalumno_id"],
        where: {
          estado: "CONFIRMADA",
          exalumno_id: { in: donantesEnRango },
          created_at: { lt: desde },
        },
      });
      const setPrevias = new Set(previas.map((p) => p.exalumno_id));
      donantesRecurrentes = donantesEnRango.filter((id) => setPrevias.has(id)).length;
    }
    const donantesNuevos = donantesEnRango.length - donantesRecurrentes;

    // Proyectos apoyados: proyectos distintos que recibieron donación confirmada en el rango
    const proyectosApoyados = new Set(
      todasDonaciones.map((d) => d.proyecto_estudiante_id).filter(Boolean)
    ).size;

    // Total donado dentro del rango
    const totalDonadoRango = todasDonaciones.reduce((sum, d) => sum + Number(d.monto), 0);

    // Procesar donaciones por mes
    const donacionesPorMes: Record<string, number> = {};
    const mesesES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (const donacion of todasDonaciones) {
      const fecha = new Date(donacion.created_at);
      const key = `${mesesES[fecha.getMonth()]} ${fecha.getFullYear()}`;
      donacionesPorMes[key] = (donacionesPorMes[key] || 0) + Number(donacion.monto);
    }

    const graficoDonaciones = Object.entries(donacionesPorMes).map(([mes, total]) => ({
      mes,
      total,
    }));

    // Donaciones pendientes
    const donacionesPendientes = await prisma.donacion.findMany({
      where: { estado: "PENDIENTE" },
      orderBy: { created_at: "asc" },
      include: {
        exalumno: {
          select: {
            user_id: true,
            user: { select: { id: true, nombre: true, email: true } },
          },
        },
      },
    });

    // Normalize pendientes for frontend
    const pendientesNormalized = donacionesPendientes.map((d) => ({
      ...d,
      status: d.estado,
      createdAt: d.created_at,
      exalumno: d.exalumno
        ? {
            ...d.exalumno,
            id: d.exalumno.user_id,
            user: {
              id: d.exalumno.user.id,
              name: d.exalumno.user.nombre,
              email: d.exalumno.user.email,
            },
          }
        : null,
    }));

    // Distribución de estudiantes por sede
    const estudiantesSedes = await prisma.$queryRaw<{ sede: string; count: number }[]>`
      SELECT sede, COUNT(*) as count
      FROM "ESTUDIANTES"
      WHERE sede IS NOT NULL
      GROUP BY sede
    `;
    const graficoSedes = estudiantesSedes.map(r => ({ name: r.sede || 'Desconocida', value: Number(r.count) }));

    // Distribución de matches por carrera (usando la carrera del estudiante como base)
    const matchesPorCarrera = await prisma.$queryRaw<{ carrera: string; count: number }[]>`
      SELECT e.carrera, COUNT(*) as count
      FROM "MATCHES" m
      JOIN "ESTUDIANTES" e ON m.estudiante_id = e.user_id
      WHERE m.estado = 'ACTIVO' AND e.carrera IS NOT NULL
      GROUP BY e.carrera
    `;
    const graficoMatchesCarrera = matchesPorCarrera.map(r => ({ name: r.carrera || 'Desconocida', value: Number(r.count) }));

    const totales = totalDonadoResult[0];

    return NextResponse.json({
      kpis: {
        totalDonado: Number(totales?.total) || 0,
        donacionesAprobadas: Number(totales?.count) || 0,
        matchesActivos,
        matchesCerrados,
        estudiantesActivos,
        exalumnosActivos,
        // Métricas del periodo seleccionado (T-34)
        totalDonadoPeriodo: totalDonadoRango,
        proyectosApoyados,
        donantesNuevos,
        donantesRecurrentes,
      },
      rango: {
        desde: desde.toISOString(),
        hasta: hasta ? hasta.toISOString() : null,
      },
      graficoDonaciones,
      graficoSedes,
      graficoMatchesCarrera,
      graficoDonantes: [
        { name: "Nuevos", value: donantesNuevos },
        { name: "Recurrentes", value: donantesRecurrentes },
      ],
      donacionesPendientes: pendientesNormalized,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ message: "Error al obtener estadísticas" }, { status: 500 });
  }
}
