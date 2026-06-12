import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  const requesterId = (session?.user as any)?.id as string | undefined;
  const requesterRole = (session?.user as any)?.tipo || (session?.user as any)?.role;

  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const areaProyecto = searchParams.get("areaProyecto");
  const apoyoBuscado = searchParams.get("apoyoBuscado");
  const nombre = searchParams.get("nombre");

  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        ...(carrera && {
          carrera: { contains: carrera, mode: "insensitive" },
        }),
        ...(areaProyecto && {
          areaProyecto: { contains: areaProyecto, mode: "insensitive" },
        }),
        ...(apoyoBuscado && {
          apoyoBuscado: { has: apoyoBuscado },
        }),
        user: {
          cuentaPausada: false,
          status: { not: "SUSPENDIDO" },
          ...(nombre && {
            name: { contains: nombre, mode: "insensitive" },
          }),
        },
      },
      select: {
        id: true,
        carrera: true,
        avanceProyecto: true,
        areaProyecto: true,
        apoyoBuscado: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            proyectoFinalizado: true,
            // NUNCA incluir nivelBeca
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Excluir nivelBeca del resultado (double-safety: no está en el select, 
    // pero lo dejamos explícito por claridad)
    const sanitized = estudiantes.map((est) => {
      // Si el solicitante es el propio usuario o ADMIN, podría ver nivelBeca,
      // pero como no lo seleccionamos arriba, simplemente retornamos tal cual.
      return est;
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json(
      { message: "Error al obtener el directorio de estudiantes" },
      { status: 500 }
    );
  }
}
