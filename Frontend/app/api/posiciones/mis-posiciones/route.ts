import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const tipo = (session.user as any)?.tipo as string;

  if (tipo !== "EXALUMNO" && tipo !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const whereClause = tipo === "ADMIN" ? {} : { exalumno_id: userId };

    const posiciones = await prisma.posicion.findMany({
      where: whereClause,
      select: {
        id: true,
        titulo: true,
        tipo: true,
        modalidad: true,
        jornada: true,
        empresa: true,
        estado: true,
        fecha_limite: true,
        created_at: true,
        _count: { select: { aplicaciones: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const data = posiciones.map((p) => ({
      ...p,
      fecha_limite: p.fecha_limite ? p.fecha_limite.toISOString() : null,
      created_at: p.created_at.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/posiciones/mis-posiciones]", error);
    return NextResponse.json({ message: "Error al obtener posiciones" }, { status: 500 });
  }
}
