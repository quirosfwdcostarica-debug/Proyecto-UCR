import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const posicion = await prisma.posicion.findUnique({
      where: { id: params.id },
      select: {
        id: true, titulo: true, tipo: true, modalidad: true,
        jornada: true, empresa: true, estado: true, fecha_limite: true,
        created_at: true, updated_at: true, exalumno_id: true,
        descripcion: true, responsabilidades: true, horario: true, beneficios: true,
        nivel_grado_minimo: true, area_estudio: true, hard_skills: true,
        idiomas_requeridos: true, soft_skills: true, matching_weights: true,
        _count: { select: { aplicaciones: true } },
        exalumno: {
          select: {
            user: { select: { id: true, nombre: true, foto_url: true } },
            cargo_actual: true, empresa_actual: true, pais_ciudad: true,
          },
        },
        aplicaciones: {
          where: { estudiante_id: token.id as string },
          select: { id: true, estado: true, created_at: true },
          take: 1,
        },
      },
    });

    if (!posicion) return NextResponse.json({ message: "Posición no encontrada" }, { status: 404 });

    return NextResponse.json({
      id: posicion.id,
      titulo: posicion.titulo,
      tipo: posicion.tipo,
      modalidad: posicion.modalidad,
      jornada: posicion.jornada,
      empresa: posicion.empresa,
      estado: posicion.estado,
      fecha_limite: posicion.fecha_limite ? posicion.fecha_limite.toISOString() : null,
      created_at: posicion.created_at.toISOString(),
      updated_at: posicion.updated_at.toISOString(),
      exalumno_id: posicion.exalumno_id,
      aplicantes: posicion._count.aplicaciones,
      descripcion: posicion.descripcion,
      responsabilidades: posicion.responsabilidades,
      horario: posicion.horario,
      beneficios: posicion.beneficios,
      nivel_grado_minimo: posicion.nivel_grado_minimo,
      area_estudio: posicion.area_estudio,
      hard_skills: posicion.hard_skills,
      idiomas_requeridos: posicion.idiomas_requeridos,
      soft_skills: posicion.soft_skills,
      matching_weights: posicion.matching_weights,
      exalumno: {
        id: posicion.exalumno?.user?.id ?? null,
        nombre: posicion.exalumno?.user?.nombre ?? null,
        foto_url: posicion.exalumno?.user?.foto_url ?? null,
        cargo_actual: posicion.exalumno?.cargo_actual ?? null,
        empresa_actual: posicion.exalumno?.empresa_actual ?? null,
        pais_ciudad: posicion.exalumno?.pais_ciudad ?? null,
      },
      mi_aplicacion: posicion.aplicaciones[0] ?? null,
    });
  } catch (error) {
    console.error("[GET /api/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al obtener posición" }, { status: 500 });
  }
}

// PATCH — actualizar estado de posición (solo dueño o admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const posicion = await prisma.posicion.findUnique({ where: { id: params.id } });
  if (!posicion) return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  if (token.tipo !== "ADMIN" && posicion.exalumno_id !== token.id)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const updated = await prisma.posicion.update({
      where: { id: params.id },
      data: {
        ...(body.titulo !== undefined && { titulo: String(body.titulo) }),
        ...(body.tipo !== undefined && { tipo: body.tipo }),
        ...(body.modalidad !== undefined && { modalidad: body.modalidad }),
        ...(body.jornada !== undefined && { jornada: body.jornada }),
        ...(body.empresa !== undefined && { empresa: body.empresa }),
        ...(body.estado !== undefined && { estado: body.estado }),
        ...(body.fecha_limite !== undefined && {
          fecha_limite: body.fecha_limite ? new Date(body.fecha_limite) : null,
        }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
        ...(body.responsabilidades !== undefined && { responsabilidades: body.responsabilidades }),
        ...(body.horario !== undefined && { horario: body.horario }),
        ...(body.beneficios !== undefined && { beneficios: body.beneficios }),
        ...(body.nivel_grado_minimo !== undefined && { nivel_grado_minimo: body.nivel_grado_minimo }),
        ...(body.area_estudio !== undefined && { area_estudio: body.area_estudio }),
        ...(body.hard_skills !== undefined && { hard_skills: body.hard_skills }),
        ...(body.idiomas_requeridos !== undefined && { idiomas_requeridos: body.idiomas_requeridos }),
        ...(body.soft_skills !== undefined && { soft_skills: body.soft_skills }),
        ...(body.matching_weights !== undefined && { matching_weights: body.matching_weights }),
      },
      select: {
        id: true, titulo: true, tipo: true, modalidad: true,
        jornada: true, empresa: true, estado: true, fecha_limite: true,
        descripcion: true, responsabilidades: true, horario: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE — elimina una posición (solo dueño o admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const posicion = await prisma.posicion.findUnique({ where: { id: params.id }, select: { exalumno_id: true } });
    if (!posicion) return NextResponse.json({ message: "No encontrada" }, { status: 404 });
    if (token.tipo !== "ADMIN" && posicion.exalumno_id !== token.id)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await prisma.posicion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
