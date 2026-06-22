import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Columnas existentes en EXALUMNOS (sin: carrera, sector, areas_interes, perfil_completo, visible_en_directorio)
const EXALUMNO_SELECT = {
  user_id: true, carnet_ucr: true, escuela_facultad: true,
  anio_graduacion: true, empresa_actual: true, cargo_actual: true,
  pais_ciudad: true, anios_experiencia: true, linkedin_url: true,
  biografia: true, github_url: true, website_url: true,
  habilidades: true, certificaciones: true, experiencia_laboral: true,
  ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
  ofrece_proyecto: true, ofrece_donacion_dinero: true,
  ofrece_guest_speaking: true, ofrece_volunteering: true,
  ofrece_career_advice: true, ofrece_networking: true,
  user: { select: { nombre: true, email: true, foto_url: true } },
} as const;

// Columnas existentes en ESTUDIANTES (sin: visible_en_directorio, proyecto_descripcion, etc.)
const ESTUDIANTE_SELECT = {
  user_id: true, carnet_ucr: true, carrera: true, escuela_facultad: true,
  sede: true, anio_ingreso: true, nivel_academico: true,
  promedio_ponderado: true, proyecto_titulo: true, proyecto_tipo: true,
  busca_financiamiento: true, busca_mentoria: true,
  busca_empleo: true, busca_pasantia: true,
  user: { select: { nombre: true, email: true, foto_url: true } },
} as const;

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
        where: { estudiante_id: userId },
        orderBy: { score_match: "desc" },
        select: {
          id: true, exalumno_id: true, estudiante_id: true,
          tipo_apoyo: true, score_match: true, estado: true, resultado: true,
          initiated_by: true, match_reasons: true,
          accepted_at: true, rejected_at: true, closed_at: true,
          created_at: true, updated_at: true,
          exalumno: { select: EXALUMNO_SELECT },
        },
      });
    } else if (role === "EXALUMNO") {
      matches = await prisma.match.findMany({
        where: { exalumno_id: userId },
        orderBy: { score_match: "desc" },
        select: {
          id: true, exalumno_id: true, estudiante_id: true,
          tipo_apoyo: true, score_match: true, estado: true, resultado: true,
          initiated_by: true, match_reasons: true,
          accepted_at: true, rejected_at: true, closed_at: true,
          created_at: true, updated_at: true,
          estudiante: { select: ESTUDIANTE_SELECT },
        },
      });
    }

    const normalized = matches.map((m) => ({
      ...m,
      afinidad: m.score_match,
      status: m.estado,
      initiated_by: m.initiated_by ?? "sistema",
      exalumno: m.exalumno
        ? {
            ...m.exalumno,
            id: m.exalumno.user_id,
            carrera: m.exalumno.escuela_facultad ?? "",
            sector: m.exalumno.empresa_actual ?? m.exalumno.cargo_actual ?? "",
            apoyoOfrecido: [
              m.exalumno.ofrece_mentoria        ? "Mentoría"       : null,
              m.exalumno.ofrece_empleo          ? "Empleo"         : null,
              m.exalumno.ofrece_pasantia        ? "Pasantía"       : null,
              m.exalumno.ofrece_donacion_dinero ? "Financiamiento" : null,
              m.exalumno.ofrece_guest_speaking  ? "Guest Speaking" : null,
              m.exalumno.ofrece_networking      ? "Networking"     : null,
            ].filter(Boolean) as string[],
            user: m.exalumno.user
              ? { name: m.exalumno.user.nombre, email: m.exalumno.user.email, image: m.exalumno.user.foto_url }
              : null,
          }
        : undefined,
      estudiante: m.estudiante
        ? {
            ...m.estudiante,
            id: m.estudiante.user_id,
            avanceProyecto: m.score_match ?? 0,
            apoyoBuscado: [
              m.estudiante.busca_mentoria       ? "Mentoría"       : null,
              m.estudiante.busca_empleo         ? "Empleo"         : null,
              m.estudiante.busca_pasantia       ? "Pasantía"       : null,
              m.estudiante.busca_financiamiento ? "Financiamiento" : null,
            ].filter(Boolean) as string[],
            user: m.estudiante.user
              ? { name: m.estudiante.user.nombre, email: m.estudiante.user.email, image: m.estudiante.user.foto_url }
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
