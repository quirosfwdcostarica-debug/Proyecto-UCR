import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const tipo = (session?.user as any)?.tipo;

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const { data: user } = await supabaseAdmin.from('USERS').select('*').eq('id', userId).maybeSingle();
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    let matchesActivos = 0;
    let matchesPendientes = 0;
    let matchesContactados = 0;
    let donacionTotalConfirmada = 0;
    let proyectosPatrocinados: any[] = [];

    if (tipo === "ESTUDIANTE") {
      const { data: estMatches } = await supabaseAdmin.from('MATCHES').select('estado').eq('estudiante_id', userId);
      matchesActivos = estMatches?.filter((m:any) => m.estado === "ACTIVO").length || 0;
      matchesPendientes = estMatches?.filter((m:any) => m.estado === "SUGERIDO").length || 0;
    } else if (tipo === "EXALUMNO") {
      const { data: exaMatches } = await supabaseAdmin.from('MATCHES').select('estado').eq('exalumno_id', userId);
      matchesActivos = exaMatches?.filter((m:any) => m.estado === "ACTIVO").length || 0;
      matchesPendientes = exaMatches?.filter((m:any) => m.estado === "SUGERIDO").length || 0;
      matchesContactados = exaMatches?.filter((m:any) => m.estado === "CONTACTADO").length || 0;

      const { data: donaciones } = await supabaseAdmin.from('DONACIONES').select('monto, estado, proyecto_estudiante_id').eq('exalumno_id', userId);
      if (donaciones) {
        donacionTotalConfirmada = donaciones.filter((d:any) => d.estado === "CONFIRMADA").reduce((sum:number, d:any) => sum + Number(d.monto), 0);
        
        const patrocinados = donaciones.filter((d:any) => d.proyecto_estudiante_id != null).slice(0, 3);
        
        const estIds = patrocinados.map((d:any) => d.proyecto_estudiante_id);
        if (estIds.length > 0) {
          const { data: estudiantes } = await supabaseAdmin.from('ESTUDIANTES').select('*').in('user_id', estIds);
          const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre').in('id', estIds);
          
          proyectosPatrocinados = patrocinados.map((d:any) => {
            const est = estudiantes?.find((e:any) => e.user_id === d.proyecto_estudiante_id);
            const usr = users?.find((u:any) => u.id === d.proyecto_estudiante_id);
            return {
              monto: Number(d.monto),
              estado: d.estado,
              nombre_estudiante: usr?.nombre ?? "Estudiante",
              proyecto_titulo: est?.proyecto_titulo ?? "Proyecto",
              avance: est?.proyecto_porcentaje_avance ?? 0,
            };
          });
        }
      }
    }

    return NextResponse.json({
      ...user,
      matchesActivos,
      matchesPendientes,
      matchesContactados,
      donacionTotalConfirmada,
      proyectosPatrocinados,
    });
  } catch (error) {
    console.error("[GET /api/users/me]", error);
    return NextResponse.json({ message: "Error al obtener perfil" }, { status: 500 });
  }
}
