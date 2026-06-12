import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const sector = searchParams.get("sector");
  const apoyo = searchParams.get("apoyo");
  const nombre = searchParams.get("nombre");

  try {
    const exalumnos = await prisma.exalumno.findMany({
      where: {
        // Filtros en el perfil de exalumno
        ...(carrera && {
          carrera: { contains: carrera, mode: "insensitive" },
        }),
        ...(sector && {
          sector: { contains: sector, mode: "insensitive" },
        }),
        ...(apoyo && {
          apoyoOfrecido: { has: apoyo },
        }),
        // El usuario no debe estar pausado ni suspendido
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
        sector: true,
        areasInteres: true,
        apoyoOfrecido: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(exalumnos);
  } catch (error) {
    console.error("[GET /api/exalumnos]", error);
    return NextResponse.json(
      { message: "Error al obtener el directorio de exalumnos" },
      { status: 500 }
    );
  }
}
