import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("status") || undefined;
    const nombre = searchParams.get("nombre") || undefined;

    const matches = await prisma.match.findMany({
      where: {
        ...(estado ? { estado: estado as any } : {}),
        ...(nombre
          ? {
              OR: [
                { estudiante: { user: { nombre: { contains: nombre, mode: "insensitive" } } } },
                { exalumno: { user: { nombre: { contains: nombre, mode: "insensitive" } } } },
              ],
            }
          : {}),
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true, estado: true, score_match: true, tipo_apoyo: true,
        match_reasons: true, initiated_by: true, created_at: true,
        estudiante_id: true, exalumno_id: true,
        estudiante: { select: { user_id: true, carrera: true, user: { select: { nombre: true, email: true } } } },
        exalumno:   { select: { user_id: true, carrera: true, user: { select: { nombre: true, email: true } } } },
      },
    });

    // Normalize for frontend compatibility
    const normalized = matches.map((m) => ({
      ...m,
      status: m.estado,
      afinidad: m.score_match,
      estudianteId: m.estudiante_id,
      exalumnoId: m.exalumno_id,
      estudiante: m.estudiante
        ? {
            ...m.estudiante,
            id: m.estudiante.user_id,
            user: { name: m.estudiante.user.nombre, email: m.estudiante.user.email },
          }
        : null,
      exalumno: m.exalumno
        ? {
            ...m.exalumno,
            id: m.exalumno.user_id,
            user: { name: m.exalumno.user.nombre, email: m.exalumno.user.email },
          }
        : null,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[Admin Matches] Error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
