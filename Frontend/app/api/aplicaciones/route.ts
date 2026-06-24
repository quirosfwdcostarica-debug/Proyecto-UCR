import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendNuevaAplicacion } from "@/lib/email";

// GET — aplicaciones del usuario
// ESTUDIANTE: las que él envió
// EXALUMNO/ADMIN: recibidas en sus posiciones
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;
  const { searchParams } = new URL(request.url);
  const posicionId = searchParams.get("posicion_id") || undefined;

  try {
    let aplicaciones: any[];

    if (tipo === "ESTUDIANTE") {
      aplicaciones = await prisma.aplicacion.findMany({
        where: { estudiante_id: userId },
        select: {
          id: true, estado: true, created_at: true, updated_at: true,
          posicion: {
            select: {
              id: true, titulo: true, tipo: true, modalidad: true,
              empresa: true, estado: true, fecha_limite: true,
              exalumno: { select: { user: { select: { nombre: true, foto_url: true } } } },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else if (tipo === "EXALUMNO" || tipo === "ADMIN") {
      const posWhere: any = tipo === "ADMIN" ? {} : { exalumno_id: userId };
      if (posicionId) posWhere.id = posicionId;

      aplicaciones = await prisma.aplicacion.findMany({
        where: { posicion: posWhere },
        select: {
          id: true, estado: true, created_at: true, updated_at: true,
          estudiante_id: true,
          posicion: { select: { id: true, titulo: true, empresa: true } },
          estudiante: {
            select: {
              carrera: true, nivel_academico: true,
              user: { select: { nombre: true, foto_url: true, email: true } },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const data = aplicaciones.map((a: any) => ({
      id: a.id,
      estado: a.estado,
      created_at: a.created_at.toISOString(),
      updated_at: a.updated_at.toISOString(),
      estudiante_id: a.estudiante_id ?? null,
      posicion: a.posicion ? {
        id: a.posicion.id,
        titulo: a.posicion.titulo,
        tipo: a.posicion.tipo ?? null,
        modalidad: a.posicion.modalidad ?? null,
        empresa: a.posicion.empresa ?? null,
        estado: a.posicion.estado ?? null,
        fecha_limite: a.posicion.fecha_limite ? a.posicion.fecha_limite.toISOString() : null,
        exalumno_nombre: a.posicion.exalumno?.user?.nombre ?? null,
        exalumno_foto: a.posicion.exalumno?.user?.foto_url ?? null,
      } : null,
      estudiante: a.estudiante ? {
        nombre: a.estudiante.user?.nombre ?? null,
        foto_url: a.estudiante.user?.foto_url ?? null,
        email: a.estudiante.user?.email ?? null,
        carrera: a.estudiante.carrera ?? null,
        nivel_academico: a.estudiante.nivel_academico ?? null,
      } : null,
    }));

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("[GET /api/aplicaciones]", error);
    return NextResponse.json({ message: "Error al obtener aplicaciones" }, { status: 500 });
  }
}

// POST — aplicar a una posición (solo estudiante)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "ESTUDIANTE")
    return NextResponse.json({ message: "Solo estudiantes pueden aplicar" }, { status: 403 });

  let body: { posicion_id: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.posicion_id)
    return NextResponse.json({ message: "posicion_id es requerido" }, { status: 400 });

  // Verificar que la posición existe y está activa
  const posicion = await prisma.posicion.findUnique({ where: { id: body.posicion_id } });
  if (!posicion) return NextResponse.json({ message: "Posición no encontrada" }, { status: 404 });
  if (posicion.estado !== "activa")
    return NextResponse.json({ message: "Esta posición ya no está activa" }, { status: 400 });

  // Verificar que no haya aplicado ya
  const existing = await prisma.aplicacion.findFirst({
    where: { posicion_id: body.posicion_id, estudiante_id: userId },
  });
  if (existing)
    return NextResponse.json({ message: "Ya aplicaste a esta posición" }, { status: 409 });

  // Asegurarse que el estudiante tiene perfil
  const estPerfil = await prisma.estudiante.findUnique({ where: { user_id: userId } });
  if (!estPerfil)
    return NextResponse.json({ message: "Debes completar tu perfil de estudiante primero" }, { status: 400 });

  try {
    const aplicacion = await prisma.aplicacion.create({
      data: {
        posicion_id: body.posicion_id,
        estudiante_id: userId,
        estado: "PENDIENTE",
      },
    });

    // Notify the exalumno who owns the position
    const [posicionData, estudianteData] = await Promise.all([
      prisma.posicion.findUnique({
        where: { id: body.posicion_id },
        select: {
          titulo: true,
          exalumno: { select: { user: { select: { email: true, nombre: true } } } },
        },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { nombre: true } }),
    ]);

    const exalumnoEmail  = posicionData?.exalumno?.user?.email;
    const exalumnoNombre = posicionData?.exalumno?.user?.nombre ?? "Exalumno";
    const posicionTitulo = posicionData?.titulo ?? "la posición";
    const estudianteNombre = estudianteData?.nombre ?? "Estudiante";

    if (exalumnoEmail) {
      await sendNuevaAplicacion(exalumnoEmail, exalumnoNombre, posicionTitulo, estudianteNombre);
    }

    return NextResponse.json(aplicacion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/aplicaciones]", error);
    return NextResponse.json({ message: "Error al registrar aplicación" }, { status: 500 });
  }
}
