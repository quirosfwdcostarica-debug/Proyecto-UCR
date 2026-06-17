import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const apoyo = searchParams.get("apoyoBuscado");
  const nombre = searchParams.get("nombre");

  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        ...(carrera && {
          carrera: { contains: carrera, mode: "insensitive" },
        }),
        ...(apoyo === "mentoria" && { busca_mentoria: true }),
        ...(apoyo === "empleo" && { busca_empleo: true }),
        ...(apoyo === "pasantia" && { busca_pasantia: true }),
        ...(apoyo === "financiamiento" && { busca_financiamiento: true }),
        user: {
          activo: true,
          status: { not: "SUSPENDIDO" },
          ...(nombre && {
            nombre: { contains: nombre, mode: "insensitive" },
          }),
        },
      },
      select: {
        user_id: true,
        carrera: true,
        escuela_facultad: true,
        sede: true,
        nivel_academico: true,
        proyecto_titulo: true,
        proyecto_tipo: true,
        busca_financiamiento: true,
        busca_mentoria: true,
        busca_empleo: true,
        busca_pasantia: true,
        user: {
          select: {
            id: true,
            nombre: true,
            foto_url: true,
          },
        },
      },
      orderBy: { user: { created_at: "desc" } },
    });

    // Normalize shape for frontend compatibility
    const sanitized = estudiantes.map((est) => ({
      ...est,
      id: est.user_id,
      user: {
        id: est.user.id,
        name: est.user.nombre,
        image: est.user.foto_url,
      },
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json(
      { message: "Error al obtener el directorio de estudiantes" },
      { status: 500 }
    );
  }
}
