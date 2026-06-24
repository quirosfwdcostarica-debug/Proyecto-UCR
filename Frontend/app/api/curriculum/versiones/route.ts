import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Asegura que exista el Curriculum del estudiante y devuelve su id.
async function ensureCurriculumId(estudianteId: string): Promise<string> {
  const cur = await prisma.curriculum.upsert({
    where: { estudiante_id: estudianteId },
    create: { estudiante_id: estudianteId },
    update: {},
    select: { id: true },
  });
  return cur.id;
}

// GET /api/curriculum/versiones — lista las versiones adaptadas del estudiante (T-49)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }
  if ((session.user as any).tipo !== "ESTUDIANTE") {
    return NextResponse.json({ message: "Solo estudiantes." }, { status: 403 });
  }

  try {
    const curriculum = await prisma.curriculum.findUnique({
      where: { estudiante_id: session.user.id },
      select: {
        versiones: {
          orderBy: { created_at: "desc" },
          select: {
            id: true, nombre_version: true, posicion_id: true,
            ats_score: true, created_at: true,
            posicion: { select: { titulo: true, empresa: true } },
          },
        },
      },
    });

    const data = (curriculum?.versiones ?? []).map((v) => ({
      id: v.id,
      nombre_version: v.nombre_version,
      posicion_id: v.posicion_id,
      posicion_titulo: v.posicion?.titulo ?? null,
      posicion_empresa: v.posicion?.empresa ?? null,
      ats_score: v.ats_score,
      created_at: v.created_at.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/curriculum/versiones]", error);
    return NextResponse.json({ message: "Error al obtener versiones" }, { status: 500 });
  }
}

// POST /api/curriculum/versiones — guarda una versión adaptada del CV (T-49 / T-50)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }
  if ((session.user as any).tipo !== "ESTUDIANTE") {
    return NextResponse.json({ message: "Solo estudiantes." }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { posicion_id, nombre_version, contenido, ats_score } = body ?? {};
  if (!contenido || typeof contenido !== "object") {
    return NextResponse.json({ message: "Falta el contenido del CV adaptado." }, { status: 400 });
  }

  try {
    const curriculumId = await ensureCurriculumId(session.user.id);

    const version = await prisma.curriculumVersion.create({
      data: {
        curriculum_id: curriculumId,
        posicion_id: posicion_id || null,
        nombre_version: nombre_version || "Versión adaptada",
        contenido,
        ats_score: typeof ats_score === "number" ? Math.max(0, Math.min(100, Math.round(ats_score))) : null,
      },
      select: { id: true, nombre_version: true, created_at: true },
    });

    return NextResponse.json({ success: true, version });
  } catch (error) {
    console.error("[POST /api/curriculum/versiones]", error);
    return NextResponse.json({ message: "Error al guardar la versión" }, { status: 500 });
  }
}
