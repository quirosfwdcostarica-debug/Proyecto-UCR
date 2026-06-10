import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  try {
    if (role === "ESTUDIANTE") {
      // Verificar que existe el perfil de estudiante
      const estudiante = await prisma.estudiante.findUnique({
        where: { id: userId },
      });
      if (!estudiante) {
        return NextResponse.json({ message: "Perfil de estudiante no encontrado" }, { status: 404 });
      }

      const matches = await prisma.match.findMany({
        where: { estudianteId: userId },
        orderBy: { afinidad: "desc" },
        include: {
          exalumno: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
                  bio: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(matches);
    }

    if (role === "EXALUMNO") {
      // Verificar que existe el perfil de exalumno
      const exalumno = await prisma.exalumno.findUnique({
        where: { id: userId },
      });
      if (!exalumno) {
        return NextResponse.json({ message: "Perfil de exalumno no encontrado" }, { status: 404 });
      }

      const matches = await prisma.match.findMany({
        where: { exalumnoId: userId },
        orderBy: { afinidad: "desc" },
        include: {
          estudiante: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
                  proyectoFinalizado: true,
                  // NUNCA incluir nivelBeca
                },
              },
            },
          },
        },
      });

      return NextResponse.json(matches);
    }

    if (role === "ADMIN") {
      const matches = await prisma.match.findMany({
        orderBy: { afinidad: "desc" },
        include: {
          estudiante: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          exalumno: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
      return NextResponse.json(matches);
    }

    return NextResponse.json({ message: "Rol no válido" }, { status: 400 });
  } catch (error) {
    console.error("[GET /api/matches/mis-matches]", error);
    return NextResponse.json(
      { message: "Error al obtener los matches" },
      { status: 500 }
    );
  }
}
