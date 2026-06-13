import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  // Solo el propio usuario o ADMIN puede modificar
  if (userId !== params.id && role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { cuentaPausada?: boolean; proyectoFinalizado?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { cuentaPausada, proyectoFinalizado } = body;
  const updateData: Record<string, boolean> = {};

  if (typeof cuentaPausada === "boolean") {
    updateData.cuentaPausada = cuentaPausada;
  }
  if (typeof proyectoFinalizado === "boolean") {
    // Solo ESTUDIANTE puede marcar proyecto como finalizado
    if (role !== "ADMIN" && role !== "ESTUDIANTE") {
      return NextResponse.json(
        { message: "Solo estudiantes pueden finalizar proyectos" },
        { status: 403 }
      );
    }
    updateData.proyectoFinalizado = proyectoFinalizado;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "Sin datos para actualizar" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        cuentaPausada: true,
        proyectoFinalizado: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/users/[id]/status]", error);
    return NextResponse.json(
      { message: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  if (userId !== params.id && role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        cuentaPausada: true,
        proyectoFinalizado: true,
        status: true,
      },
    });
    if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET /api/users/[id]/status]", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
