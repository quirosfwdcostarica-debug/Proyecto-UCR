import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — vista pública del proyecto de un estudiante específico (por su user_id)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { data: estudiante, error } = await supabaseAdmin
      .from("ESTUDIANTES")
      .select(`
        carrera, escuela_facultad, sede, nivel_academico,
        proyecto_titulo, proyecto_tipo, proyecto_descripcion,
        proyecto_porcentaje_avance, proyecto_necesidades,
        busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia,
        visible_en_directorio,
        user:USERS!ESTUDIANTES_user_id_fkey(nombre, foto_url)
      `)
      .eq("user_id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!estudiante) return NextResponse.json({ message: "Estudiante no encontrado" }, { status: 404 });

    const u = Array.isArray(estudiante.user) ? estudiante.user[0] : estudiante.user;

    if (!estudiante.visible_en_directorio || !estudiante.proyecto_titulo)
      return NextResponse.json({ message: "Proyecto no disponible" }, { status: 404 });

    return NextResponse.json({
      studentId: params.id,
      nombre: u?.nombre,
      foto_url: u?.foto_url,
      carrera: estudiante.carrera,
      escuela_facultad: estudiante.escuela_facultad,
      sede: estudiante.sede,
      nivel_academico: estudiante.nivel_academico,
      proyecto_titulo: estudiante.proyecto_titulo,
      proyecto_tipo: estudiante.proyecto_tipo,
      proyecto_descripcion: estudiante.proyecto_descripcion,
      proyecto_porcentaje_avance: estudiante.proyecto_porcentaje_avance ?? 0,
      proyecto_necesidades: estudiante.proyecto_necesidades,
      busca_financiamiento: !!estudiante.busca_financiamiento,
      busca_mentoria: !!estudiante.busca_mentoria,
      busca_empleo: !!estudiante.busca_empleo,
      busca_pasantia: !!estudiante.busca_pasantia,
    });
  } catch (error) {
    console.error("[GET /api/proyectos/[id]]", error);
    return NextResponse.json({ message: "Error al obtener proyecto" }, { status: 500 });
  }
}
