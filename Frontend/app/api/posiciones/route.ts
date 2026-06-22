import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

// GET — lista pública de posiciones activas (estudiantes y exalumnos pueden ver)
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipo      = searchParams.get("tipo")      || undefined;
  const modalidad = searchParams.get("modalidad") || undefined;
  const empresa   = searchParams.get("empresa")   || undefined;
  const titulo    = searchParams.get("titulo")    || undefined;
  const page      = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  try {
    const where: any = {
      estado: "activa",
      ...(tipo      && { tipo:      { contains: tipo,      mode: "insensitive" } }),
      ...(modalidad && { modalidad: { contains: modalidad, mode: "insensitive" } }),
      ...(empresa   && { empresa:   { contains: empresa,   mode: "insensitive" } }),
      ...(titulo    && { titulo:    { contains: titulo,    mode: "insensitive" } }),
    };

    const [total, rows] = await Promise.all([
      prisma.posicion.count({ where }),
      prisma.posicion.findMany({
        where,
        select: {
          id: true, titulo: true, tipo: true, modalidad: true,
          jornada: true, empresa: true, estado: true, fecha_limite: true, created_at: true,
          _count: { select: { aplicaciones: true } },
          exalumno: { select: { user: { select: { id: true, nombre: true, foto_url: true } } } },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const data = rows.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      modalidad: p.modalidad,
      jornada: p.jornada,
      empresa: p.empresa,
      estado: p.estado,
      fecha_limite: p.fecha_limite ? p.fecha_limite.toISOString() : null,
      created_at: p.created_at.toISOString(),
      aplicantes: p._count.aplicaciones,
      exalumno: {
        id: p.exalumno?.user?.id ?? null,
        nombre: p.exalumno?.user?.nombre ?? null,
        foto_url: p.exalumno?.user?.foto_url ?? null,
      },
    }));

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/posiciones]", error);
    return NextResponse.json({ message: "Error al obtener posiciones" }, { status: 500 });
  }
}

// POST — crear nueva posición (solo exalumno)
export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if (token.tipo !== "EXALUMNO" && token.tipo !== "ADMIN")
    return NextResponse.json({ message: "Solo exalumnos pueden publicar posiciones" }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const {
    titulo, tipo, modalidad, jornada, empresa, fecha_limite,
    descripcion, responsabilidades, horario, beneficios,
    nivel_grado_minimo, area_estudio, hard_skills, idiomas_requeridos, soft_skills,
    matching_weights,
  } = body;
  if (!titulo) return NextResponse.json({ message: "El título es requerido" }, { status: 400 });

  try {
    const posicion = await prisma.posicion.create({
      data: {
        exalumno_id: token.id as string,
        titulo,
        tipo: tipo || null,
        modalidad: modalidad || null,
        jornada: jornada || null,
        empresa: empresa || null,
        estado: "activa",
        fecha_limite: fecha_limite ? new Date(fecha_limite) : null,
        descripcion: descripcion || null,
        responsabilidades: responsabilidades || null,
        horario: horario || null,
        beneficios: beneficios || null,
        nivel_grado_minimo: nivel_grado_minimo || null,
        area_estudio: area_estudio || null,
        hard_skills: hard_skills || null,
        idiomas_requeridos: idiomas_requeridos || null,
        soft_skills: soft_skills || null,
        matching_weights: matching_weights || null,
      },
    });
    return NextResponse.json(posicion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posiciones]", error);
    return NextResponse.json({ message: "Error al crear posición" }, { status: 500 });
  }
}
