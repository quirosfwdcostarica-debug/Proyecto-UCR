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

    // Get match counts
    let matchesActivos = 0;
    let matchesPendientes = 0;

    if (tipo === "ESTUDIANTE") {
      matchesActivos = await prisma.match.count({
        where: { estudiante_id: userId, estado: "ACTIVO" },
      });
      matchesPendientes = await prisma.match.count({
        where: { estudiante_id: userId, estado: "SUGERIDO" },
      });
    } else if (tipo === "EXALUMNO") {
      matchesActivos = await prisma.match.count({
        where: { exalumno_id: userId, estado: "ACTIVO" },
      });
      matchesPendientes = await prisma.match.count({
        where: { exalumno_id: userId, estado: "SUGERIDO" },
      });
    }

    return NextResponse.json({
      ...user,
      matchesActivos,
      matchesPendientes,
    });
  } catch (error) {
    console.error("[GET /api/users/me]", error);
    return NextResponse.json({ message: "Error al obtener perfil" }, { status: 500 });
  }
}
