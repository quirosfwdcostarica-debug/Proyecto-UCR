import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MisMatchesClient from "./MisMatchesClient";

export default async function MisMatchesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).tipo || (session.user as any).role;
  const userId = session.user.id;

  let matches: any[] = [];

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    if (role === "EXALUMNO") {
      redirect("/mis-matches/exalumno");
    }

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
          exalumno: {
            carrera: exa?.carrera,
            sector: exa?.sector,
            apoyo_ofrecido: [],
            user: usr ? { nombre: usr.nombre, foto_url: usr.foto_url, email: usr.email } : null
          }
        };
      });
    }


    // Normalize for the client
    matches = matches.map((m: any) => ({
      id: m.id,
      afinidad: m.score_match || 0,
      desglose: m.desglose_score ? (typeof m.desglose_score === "string" ? JSON.parse(m.desglose_score) : m.desglose_score) : null,
      status: m.estado,
      initiated_by: m.initiated_by,
      exalumno: m.exalumno ? {
        carrera: m.exalumno.carrera,
        sector: m.exalumno.sector,
        apoyoOfrecido: m.exalumno.apoyo_ofrecido || [],
        user: { name: m.exalumno.user?.nombre, image: m.exalumno.user?.foto_url }
      } : null,
      estudiante: m.estudiante ? {
        carrera: m.estudiante.carrera,
        avanceProyecto: m.estudiante.proyecto_porcentaje_avance || 0,
        areaProyecto: m.estudiante.area_proyecto,
        apoyoBuscado: m.estudiante.apoyo_buscado || [],
        user: { name: m.estudiante.user?.nombre, image: m.estudiante.user?.foto_url }
      } : null,
    }));
  } catch (error) {
    console.error("Error fetching matches:", error);
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Mis Matches</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gestiona tus conexiones con la red de exalumnos UCR.
        </p>
      </div>

      <MisMatchesClient matches={matches} currentUserId={userId} />
    </div>
  );
}