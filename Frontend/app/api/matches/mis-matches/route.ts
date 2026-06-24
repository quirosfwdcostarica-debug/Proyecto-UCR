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

    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    if (role === "ESTUDIANTE") {
      const { data: rawMatches } = await supabaseAdmin
        .from('MATCHES')
        .select('*')
        .eq('estudiante_id', userId)
        .order('created_at', { ascending: false });

      const exalumnoIds = rawMatches?.map((m: any) => m.exalumno_id) || [];
      const { data: exalumnos } = await supabaseAdmin.from('EXALUMNOS').select('*').in('user_id', exalumnoIds);
      const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre, foto_url, email').in('id', exalumnoIds);

      matches = (rawMatches || []).map((m: any) => {
        const exa = exalumnos?.find((e: any) => e.user_id === m.exalumno_id);
        const usr = users?.find((u: any) => u.id === m.exalumno_id);
        return {
          ...m,
          exalumno: exa ? { ...exa, user: usr } : null
        };
      });
    } else if (role === "EXALUMNO") {
      const { data: rawMatches } = await supabaseAdmin
        .from('MATCHES')
        .select('*')
        .eq('exalumno_id', userId)
        .order('created_at', { ascending: false });

      const estudianteIds = rawMatches?.map((m: any) => m.estudiante_id) || [];
      const { data: estudiantes } = await supabaseAdmin.from('ESTUDIANTES').select('*').in('user_id', estudianteIds);
      const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre, foto_url, email').in('id', estudianteIds);

      matches = (rawMatches || []).map((m: any) => {
        const est = estudiantes?.find((e: any) => e.user_id === m.estudiante_id);
        const usr = users?.find((u: any) => u.id === m.estudiante_id);
        return {
          ...m,
          estudiante: est ? { ...est, user: usr } : null
        };
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
