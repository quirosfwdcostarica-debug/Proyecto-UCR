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

  try {
    // KPIs desde las tablas MAYÚSCULAS vía rawQuery (más eficiente)
    const [
      totalDonadoResult,
      matchesActivos,
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
      prisma.user.count({ where: { tipo: "ESTUDIANTE", status: "ACTIVO", activo: true } }),
      prisma.user.count({ where: { tipo: "EXALUMNO", status: "ACTIVO", activo: true } }),
    ]);

    // Donaciones de los últimos 12 meses agrupadas por mes
    const todasDonaciones = await prisma.donacion.findMany({
      where: {
        estado: "CONFIRMADA",
        created_at: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
      select: { monto: true, created_at: true },
      orderBy: { created_at: "asc" },
    });

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

    const totales = totalDonadoResult[0];

    return NextResponse.json({
      kpis: {
        totalDonado: Number(totales?.total) || 0,
        donacionesAprobadas: Number(totales?.count) || 0,
        matchesActivos,
        estudiantesActivos,
        exalumnosActivos,
      },
      graficoDonaciones,
      donacionesPendientes: pendientesNormalized,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ message: "Error al obtener estadísticas" }, { status: 500 });
  }
}
