import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const apoyo = searchParams.get("apoyo");
  const nombre = searchParams.get("nombre");

  try {
    const exalumnos = await prisma.exalumno.findMany({
      where: {
        ...(carrera && {
          escuela_facultad: { contains: carrera, mode: "insensitive" },
        }),
        ...(apoyo === "mentoria" && { ofrece_mentoria: true }),
        ...(apoyo === "empleo" && { ofrece_empleo: true }),
        ...(apoyo === "pasantia" && { ofrece_pasantia: true }),
        ...(apoyo === "financiamiento" && { ofrece_donacion_dinero: true }),
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
        escuela_facultad: true,
        empresa_actual: true,
        cargo_actual: true,
        pais_ciudad: true,
        anios_experiencia: true,
        linkedin_url: true,
        biografia: true,
        ofrece_mentoria: true,
        ofrece_empleo: true,
        ofrece_pasantia: true,
        ofrece_donacion_dinero: true,
        ofrece_networking: true,
        ofrece_career_advice: true,
        user: {
          select: {
            id: true,
            nombre: true,
            foto_url: true,
            email: true,
          },
        },
      },
      orderBy: { user: { created_at: "desc" } },
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
