import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = (session.user as any).tipo;

    let matches: any[] = [];

    if (role === "ESTUDIANTE") {
      matches = await prisma.match.findMany({
        where: {
          estudiante_id: userId,
          score_match: { gt: 0 },
        },
        orderBy: { score_match: "desc" },
        include: {
          exalumno: {
            include: {
              user: {
                select: { nombre: true, email: true, foto_url: true },
              },
            },
          },
        },
      });
    } else if (role === "EXALUMNO") {
      matches = await prisma.match.findMany({
        where: {
          exalumno_id: userId,
          score_match: { gt: 0 },
        },
        orderBy: { score_match: "desc" },
        include: {
          estudiante: {
            include: {
              user: {
                select: { nombre: true, email: true, foto_url: true },
              },
            },
          },
        },
      });
    }

    // Normalize field names for frontend compatibility
    const normalized = matches.map((m) => ({
      ...m,
      afinidad: m.score_match,
      status: m.estado,
      exalumno: m.exalumno
        ? {
            ...m.exalumno,
            id: m.exalumno.user_id,
            user: m.exalumno.user
              ? {
                  name: m.exalumno.user.nombre,
                  email: m.exalumno.user.email,
                  image: m.exalumno.user.foto_url,
                }
              : null,
          }
        : undefined,
      estudiante: m.estudiante
        ? {
            ...m.estudiante,
            id: m.estudiante.user_id,
            user: m.estudiante.user
              ? {
                  name: m.estudiante.user.nombre,
                  email: m.estudiante.user.email,
                  image: m.estudiante.user.foto_url,
                }
              : null,
          }
        : undefined,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[Matches] Error al obtener mis-matches:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
