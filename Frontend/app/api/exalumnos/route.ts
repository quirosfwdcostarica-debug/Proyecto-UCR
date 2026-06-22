import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nombre      = searchParams.get("nombre")      || undefined;
  // "carrera" del UI → escuela_facultad en BD (única columna disponible)
  const carrera     = searchParams.get("carrera")     || undefined;
  // "empresa" del UI → empresa_actual en BD
  const empresa     = searchParams.get("empresa")     || undefined;
  const pais_ciudad = searchParams.get("pais_ciudad") || undefined;
  const tipo_apoyo  = searchParams.get("tipo_apoyo")  || undefined;
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  try {
    const apoyoFilter: Record<string, boolean> = {};
    if (tipo_apoyo === "mentoria")      apoyoFilter.ofrece_mentoria       = true;
    else if (tipo_apoyo === "empleo")   apoyoFilter.ofrece_empleo         = true;
    else if (tipo_apoyo === "pasantia") apoyoFilter.ofrece_pasantia       = true;
    else if (tipo_apoyo === "guest_speaking") apoyoFilter.ofrece_guest_speaking = true;
    else if (tipo_apoyo === "career_advice")  apoyoFilter.ofrece_career_advice  = true;
    else if (tipo_apoyo === "networking")     apoyoFilter.ofrece_networking     = true;
    else if (tipo_apoyo === "volunteering")   apoyoFilter.ofrece_volunteering   = true;
    else if (tipo_apoyo === "financiamiento") apoyoFilter.ofrece_donacion_dinero = true;

    const where = {
      // Filtros opcionales — no excluir exalumnos por campos vacíos
      ...(carrera   && { escuela_facultad: { contains: carrera,   mode: "insensitive" as const } }),
      ...(empresa   && { empresa_actual:   { contains: empresa,   mode: "insensitive" as const } }),
      ...(pais_ciudad && { pais_ciudad:    { contains: pais_ciudad, mode: "insensitive" as const } }),
      ...apoyoFilter,
      user: {
        status: { not: "SUSPENDIDO" as const },
        ...(nombre && { nombre: { contains: nombre, mode: "insensitive" as const } }),
      },
    };

    const [total, rows] = await Promise.all([
      prisma.exalumno.count({ where }),
      prisma.exalumno.findMany({
        where,
        select: {
          user_id: true,
          escuela_facultad: true,
          anio_graduacion: true,
          empresa_actual: true,
          cargo_actual: true,
          pais_ciudad: true,
          anios_experiencia: true,
          linkedin_url: true,
          biografia: true,
          github_url: true,
          website_url: true,
          habilidades: true,
          ofrece_mentoria: true,
          ofrece_empleo: true,
          ofrece_pasantia: true,
          ofrece_proyecto: true,
          ofrece_donacion_dinero: true,
          ofrece_guest_speaking: true,
          ofrece_volunteering: true,
          ofrece_career_advice: true,
          ofrece_networking: true,
          user: { select: { id: true, nombre: true, foto_url: true } },
        },
        orderBy: { anio_graduacion: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const data = rows.map((ex) => ({
      user_id: ex.user_id,
      carrera: ex.escuela_facultad ?? "",
      escuela_facultad: ex.escuela_facultad ?? "",
      anio_graduacion: ex.anio_graduacion ?? null,
      empresa_actual: ex.empresa_actual ?? "",
      cargo_actual: ex.cargo_actual ?? "",
      pais_ciudad: ex.pais_ciudad ?? null,
      anios_experiencia: ex.anios_experiencia ?? null,
      linkedin_url: ex.linkedin_url ?? null,
      biografia: ex.biografia ?? null,
      github_url: ex.github_url ?? null,
      website_url: ex.website_url ?? null,
      habilidades: ex.habilidades ?? [],
      ofrece_mentoria: !!ex.ofrece_mentoria,
      ofrece_empleo: !!ex.ofrece_empleo,
      ofrece_pasantia: !!ex.ofrece_pasantia,
      ofrece_proyecto: !!ex.ofrece_proyecto,
      ofrece_donacion_dinero: !!ex.ofrece_donacion_dinero,
      ofrece_guest_speaking: !!ex.ofrece_guest_speaking,
      ofrece_volunteering: !!ex.ofrece_volunteering,
      ofrece_career_advice: !!ex.ofrece_career_advice,
      ofrece_networking: !!ex.ofrece_networking,
      User: {
        id: ex.user.id,
        nombre: ex.user.nombre,
        foto_url: ex.user.foto_url,
        email: null,
      },
    }));

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/exalumnos]", error);
    return NextResponse.json({ message: "Error al obtener el directorio" }, { status: 500 });
  }
}
