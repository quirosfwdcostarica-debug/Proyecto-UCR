import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — obtiene el proyecto actual del estudiante autenticado
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;
  if (tipo !== "ESTUDIANTE") return NextResponse.json({ message: "Solo estudiantes" }, { status: 403 });

  try {
    const estudiante = await prisma.estudiante.findUnique({
      where: { user_id: userId },
      select: {
        carnet_ucr: true,
        carrera: true,
        escuela_facultad: true,
        sede: true,
        anio_ingreso: true,
        nivel_academico: true,
        proyecto_titulo: true,
        proyecto_tipo: true,
        proyecto_descripcion: true,
        proyecto_necesidades: true,
        proyecto_porcentaje_avance: true,
        busca_financiamiento: true,
        busca_mentoria: true,
        busca_empleo: true,
        busca_pasantia: true,
        visible_en_directorio: true,
        user: { select: { nombre: true, foto_url: true } },
      },
    });

    if (!estudiante) return NextResponse.json({ message: "Perfil de estudiante no encontrado" }, { status: 404 });

    return NextResponse.json({ ...estudiante });
  } catch (error) {
    console.error("[GET /api/proyectos]", error);
    return NextResponse.json({ message: "Error al obtener proyecto" }, { status: 500 });
  }
}

// PATCH — guarda o publica el proyecto del estudiante
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;
  if (tipo !== "ESTUDIANTE") return NextResponse.json({ message: "Solo estudiantes" }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const {
    proyecto_titulo,
    proyecto_tipo,
    proyecto_descripcion,
    proyecto_necesidades,
    proyecto_porcentaje_avance,
    busca_financiamiento,
    busca_mentoria,
    busca_empleo,
    busca_pasantia,
    publicar,
  } = body;

  try {
    const data: any = {};

    if (proyecto_titulo !== undefined) data.proyecto_titulo = String(proyecto_titulo);
    if (proyecto_tipo !== undefined) data.proyecto_tipo = String(proyecto_tipo);
    if (proyecto_descripcion !== undefined) data.proyecto_descripcion = String(proyecto_descripcion);
    if (proyecto_necesidades !== undefined) data.proyecto_necesidades = proyecto_necesidades ?? {};
    if (proyecto_porcentaje_avance !== undefined) {
      const n = Number(proyecto_porcentaje_avance);
      data.proyecto_porcentaje_avance = isNaN(n) ? 0 : n;
    }
    if (busca_financiamiento !== undefined) data.busca_financiamiento = Boolean(busca_financiamiento);
    if (busca_mentoria !== undefined) data.busca_mentoria = Boolean(busca_mentoria);
    if (busca_empleo !== undefined) data.busca_empleo = Boolean(busca_empleo);
    if (busca_pasantia !== undefined) data.busca_pasantia = Boolean(busca_pasantia);
    if (publicar === true) data.visible_en_directorio = true;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true, publicado: false });
    }

    await prisma.estudiante.update({
      where: { user_id: userId },
      data,
      select: { user_id: true },
    });

    return NextResponse.json({ ok: true, publicado: publicar === true });
  } catch (error: any) {
    console.error("[PATCH /api/proyectos] code:", error?.code, "msg:", error?.message);
    const msg = error?.code === "P2025"
      ? "No se encontró el perfil de estudiante. Completa tu perfil primero."
      : `Error al guardar proyecto: ${error?.message ?? "desconocido"}`;
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

// DELETE — elimina el proyecto del estudiante (borra campos, no el registro)
export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;
  if (tipo !== "ESTUDIANTE") return NextResponse.json({ message: "Solo estudiantes" }, { status: 403 });

  try {
    await prisma.estudiante.update({
      where: { user_id: userId },
      data: {
        proyecto_titulo: null,
        proyecto_tipo: null,
        proyecto_descripcion: null,
        proyecto_necesidades: null,
        proyecto_porcentaje_avance: null,
        busca_financiamiento: false,
        busca_mentoria: false,
        busca_empleo: false,
        busca_pasantia: false,
        visible_en_directorio: false,
      },
      select: { user_id: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[DELETE /api/proyectos]", error?.message);
    return NextResponse.json({ message: "Error al eliminar proyecto" }, { status: 500 });
  }
}
