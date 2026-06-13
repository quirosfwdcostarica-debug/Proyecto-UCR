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

  if (role !== "EXALUMNO" && role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo exalumnos pueden ver su historial de donaciones" },
      { status: 403 }
    );
  }

  try {
    const donaciones = await prisma.donacion.findMany({
      where: {
        exalumnoId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        monto: true,
        comprobanteUrl: true,
        status: true,
        destino: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(donaciones);
  } catch (error) {
    console.error("[GET /api/donaciones/mis-donaciones]", error);
    return NextResponse.json(
      { message: "Error al obtener el historial de donaciones" },
      { status: 500 }
    );
  }
}
