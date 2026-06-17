import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = (session.user as any).tipo;

    let matches: any[] = [];

    if (role === "ESTUDIANTE") {
      matches = await prisma.match.findMany({
        where: { estudianteId: userId, afinidad: { gt: 0 } },
        orderBy: { afinidad: "desc" },
        include: {
          exalumno: {
            include: { user: { select: { name: true, email: true, image: true, phone: true } } },
          },
        },
      });
    } else if (role === "EXALUMNO") {
      matches = await prisma.match.findMany({
        where: { exalumnoId: userId, afinidad: { gt: 0 } },
        orderBy: { afinidad: "desc" },
        include: {
          estudiante: {
            include: { user: { select: { name: true, email: true, image: true, phone: true } } },
          },
        },
      });
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error("[Matches] Error al obtener mis-matches:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
