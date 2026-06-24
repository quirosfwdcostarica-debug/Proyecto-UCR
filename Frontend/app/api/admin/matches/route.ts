import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("status") || null;
    const nombre = searchParams.get("nombre") || null;

    let query = supabaseAdmin
      .from("MATCHES")
      .select(`
        id, estado, score_match, tipo_apoyo, match_reasons,
        initiated_by, created_at, estudiante_id, exalumno_id,
        estudiante:ESTUDIANTES!MATCHES_estudiante_id_fkey(
          user_id, carrera,
          user:USERS!ESTUDIANTES_user_id_fkey(nombre, email)
        ),
        exalumno:EXALUMNOS!MATCHES_exalumno_id_fkey(
          user_id, escuela_facultad,
          user:USERS!EXALUMNOS_user_id_fkey(nombre, email)
        )
      `)
      .order("created_at", { ascending: false });

    if (estado) query = query.eq("estado", estado);

    const { data: matches, error } = await query;
    if (error) throw error;

    const normalized = (matches ?? []).map((m: any) => {
      const est = Array.isArray(m.estudiante) ? m.estudiante[0] : m.estudiante;
      const exa = Array.isArray(m.exalumno)   ? m.exalumno[0]   : m.exalumno;
      const estUser = Array.isArray(est?.user) ? est.user[0] : est?.user;
      const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;

      // Filter by nombre on JS side (Supabase doesn't support ilike on nested tables easily)
      if (nombre) {
        const n = nombre.toLowerCase();
        if (!estUser?.nombre?.toLowerCase().includes(n) && !exaUser?.nombre?.toLowerCase().includes(n)) {
          return null;
        }
      }

      return {
        ...m,
        status: m.estado,
        afinidad: m.score_match,
        estudianteId: m.estudiante_id,
        exalumnoId: m.exalumno_id,
        estudiante: est ? { ...est, id: est.user_id, user: { name: estUser?.nombre, email: estUser?.email } } : null,
        exalumno:   exa ? { ...exa, id: exa.user_id, user: { name: exaUser?.nombre, email: exaUser?.email } } : null,
      };
    }).filter(Boolean);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[Admin Matches] Error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
