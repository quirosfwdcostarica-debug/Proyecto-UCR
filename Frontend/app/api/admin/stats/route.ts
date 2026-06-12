import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Solo ADMIN puede acceder a estas estadísticas" }, { status: 403 });
  }

  try {
    // --- KPIs principales ---
    const [
      donacionesAprobadas,
      matchesActivos,
      estudiantesActivos,
      exalumnosActivos,
      todasDonaciones,
    ] = await Promise.all([
      prisma.donacion.aggregate({
        where: { status: "APROBADA" },
        _sum: { monto: true },
        _count: true,
      }),
      prisma.match.count({ where: { status: "ACTIVO" } }),
      prisma.user.count({
        where: { role: "ESTUDIANTE", status: "ACTIVO", cuentaPausada: false },
      }),
      prisma.user.count({
        where: { role: "EXALUMNO", status: "ACTIVO", cuentaPausada: false },
      }),
      // Donaciones de los últimos 12 meses agrupadas por mes
      prisma.donacion.findMany({
        where: {
          status: "APROBADA",
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: { monto: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Procesar donaciones por mes para el gráfico
    const donacionesPorMes: Record<string, number> = {};
    const mesesES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (const donacion of todasDonaciones) {
      const fecha = new Date(donacion.createdAt);
      const key = `${mesesES[fecha.getMonth()]} ${fecha.getFullYear()}`;
      donacionesPorMes[key] = (donacionesPorMes[key] || 0) + donacion.monto;
    }

    const graficoDonaciones = Object.entries(donacionesPorMes).map(([mes, total]) => ({
      mes,
      total,
    }));

    // Donaciones pendientes para la cola
    const donacionesPendientes = await prisma.donacion.findMany({
      where: { status: "PENDIENTE" },
      orderBy: { createdAt: "asc" },
      include: {
        exalumno: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      kpis: {
        totalDonado: donacionesAprobadas._sum.monto || 0,
        donacionesAprobadas: donacionesAprobadas._count,
        matchesActivos,
        estudiantesActivos,
        exalumnosActivos,
      },
      graficoDonaciones,
      donacionesPendientes,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ message: "Error al obtener estadísticas" }, { status: 500 });
  }
}
