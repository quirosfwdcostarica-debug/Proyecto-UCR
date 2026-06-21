import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const tipo = (session?.user as any)?.tipo;

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        foto_url: true,
        tipo: true,
        estudiante: {
          select: {
            carrera: true,
            escuela_facultad: true,
            proyecto_titulo: true,
            proyecto_tipo: true,
            nivel_academico: true,
            busca_mentoria: true,
            busca_empleo: true,
            busca_pasantia: true,
            busca_financiamiento: true,
          },
        },
        exalumno: {
          select: {
            empresa_actual: true,
            cargo_actual: true,
            pais_ciudad: true,
            escuela_facultad: true,
            anio_graduacion: true,
            ofrece_mentoria: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    let matchesActivos = 0;
    let matchesPendientes = 0;
    let matchesContactados = 0;
    let donacionTotalConfirmada = 0;
    let proyectosPatrocinados: any[] = [];

    if (tipo === "ESTUDIANTE") {
      [matchesActivos, matchesPendientes] = await Promise.all([
        prisma.match.count({ where: { estudiante_id: userId, estado: "ACTIVO" } }),
        prisma.match.count({ where: { estudiante_id: userId, estado: "SUGERIDO" } }),
      ]);
    } else if (tipo === "EXALUMNO") {
      [matchesActivos, matchesPendientes, matchesContactados] = await Promise.all([
        prisma.match.count({ where: { exalumno_id: userId, estado: "ACTIVO" } }),
        prisma.match.count({ where: { exalumno_id: userId, estado: "SUGERIDO" } }),
        prisma.match.count({ where: { exalumno_id: userId, estado: "CONTACTADO" } }),
      ]);

      const [agg, recentDonaciones] = await Promise.all([
        prisma.donacion.aggregate({
          where: { exalumno_id: userId, estado: "CONFIRMADA" },
          _sum: { monto: true },
        }),
        prisma.donacion.findMany({
          where: { exalumno_id: userId, proyecto_estudiante_id: { not: null } },
          select: {
            monto: true,
            estado: true,
            estudiante: {
              select: {
                proyecto_titulo: true,
                proyecto_porcentaje_avance: true,
                user: { select: { nombre: true } },
              },
            },
          },
          orderBy: { created_at: "desc" },
          take: 3,
        }),
      ]);

      donacionTotalConfirmada = Number(agg._sum.monto ?? 0);
      proyectosPatrocinados = recentDonaciones.map((d) => ({
        monto: Number(d.monto),
        estado: d.estado,
        nombre_estudiante: d.estudiante?.user?.nombre ?? "Estudiante",
        proyecto_titulo: d.estudiante?.proyecto_titulo ?? "Proyecto",
        avance: d.estudiante?.proyecto_porcentaje_avance ?? 0,
      }));
    }

    return NextResponse.json({
      ...user,
      matchesActivos,
      matchesPendientes,
      matchesContactados,
      donacionTotalConfirmada,
      proyectosPatrocinados,
    });
  } catch (error) {
    console.error("[GET /api/users/me]", error);
    return NextResponse.json({ message: "Error al obtener perfil" }, { status: 500 });
  }
}
