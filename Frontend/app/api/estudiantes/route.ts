import { NextRequest, NextResponse } from "next/server";
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
      id: est.user_id,
      carrera: est.carrera ?? "",
      avanceProyecto: 0,
      areaProyecto: est.proyecto_tipo ?? null,
      apoyoBuscado: [
        est.busca_mentoria       ? "Mentoría"       : null,
        est.busca_empleo         ? "Empleo"         : null,
        est.busca_pasantia       ? "Pasantía"       : null,
        est.busca_financiamiento ? "Financiamiento" : null,
      ].filter(Boolean) as string[],
      user: {
        id: est.user.id,
        name: est.user.nombre,
        image: est.user.foto_url,
        bio: null,
        proyectoFinalizado: false,
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
