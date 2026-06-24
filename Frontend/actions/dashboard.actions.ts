"use server";

import prisma from "@/lib/prisma";

export async function getJobPositions() {
  try {
    const posiciones = await prisma.posicion.findMany({
      where: { estado: "activa" },
      select: {
        id: true, titulo: true, tipo: true, modalidad: true,
        empresa: true, jornada: true, fecha_limite: true,
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    return posiciones.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      modalidad: p.modalidad,
      empresa: p.empresa,
      jornada: p.jornada,
      fecha_limite: p.fecha_limite?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching posiciones:", error);
    return [];
  }
}

export async function getStudentProjects() {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: estudiantes, error } = await supabaseAdmin
      .from('ESTUDIANTES')
      .select('user_id, carrera, proyecto_titulo, proyecto_tipo, proyecto_descripcion, proyecto_porcentaje_avance, user:USERS(nombre, foto_url, activo)')
      .eq('visible_en_directorio', true)
      .eq('busca_financiamiento', true)
      .not('proyecto_titulo', 'is', null);

    if (error || !estudiantes) {
      console.error("Supabase error fetching student projects:", error);
      return [];
    }

    // Filtramos manualmente por activo == true ya que Supabase no soporta filtro anidado fácil sin inner join en rpc
    const activeEstudiantes = estudiantes.filter((e: any) => e.user?.activo === true);

    return activeEstudiantes.map((e: any) => ({
      id: e.user_id,
      nombre: e.proyecto_titulo ?? "Sin título",
      carrera: e.carrera ?? "Carrera no especificada",
      descripcion: e.proyecto_descripcion ?? e.proyecto_tipo ?? "Proyecto de estudiante",
      avance: e.proyecto_porcentaje_avance ?? 0,
      estudianteNombre: e.user?.nombre ?? "Estudiante",
    }));
  } catch (error) {
    console.error("Error fetching student projects:", error);
    return [];
  }
}
