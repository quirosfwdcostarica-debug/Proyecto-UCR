import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendMatchAceptado, sendMatchRechazado } from "@/lib/email";

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

  let body: { status: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { status: newStatus } = body;

  // Obtener el match existente con datos de ambos usuarios
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      estudiante: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      exalumno: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });
  }

  // Verificar permisos y transiciones de estado válidas
  if (role === "ESTUDIANTE") {
    // Estudiante solo puede mover de SUGERIDO a CONTACTADO
    if (match.estudianteId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (match.status !== "SUGERIDO" || newStatus !== "CONTACTADO") {
      return NextResponse.json(
        { message: "Transición de estado no válida. Solo puedes mover de SUGERIDO a CONTACTADO." },
        { status: 400 }
      );
    }
  } else if (role === "EXALUMNO") {
    // Exalumno solo puede mover de CONTACTADO a ACTIVO o rechazar (eliminar)
    if (match.exalumnoId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (match.status !== "CONTACTADO") {
      return NextResponse.json(
        { message: "Solo puedes responder a matches en estado CONTACTADO." },
        { status: 400 }
      );
    }
    if (newStatus !== "ACTIVO" && newStatus !== "RECHAZADO") {
      return NextResponse.json(
        { message: "Estado inválido. Usa ACTIVO o RECHAZADO." },
        { status: 400 }
      );
    }
  } else if (role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Si el exalumno rechaza, eliminar el match
    if (newStatus === "RECHAZADO") {
      await prisma.match.delete({ where: { id: params.id } });

      // Notificar al estudiante
      if (match.estudiante.user.email) {
        await sendMatchRechazado(
          match.estudiante.user.email,
          match.estudiante.user.name || "Estudiante"
        );
      }

      return NextResponse.json({ message: "Match rechazado y eliminado" });
    }

    // Actualizar el status del match
    const updated = await prisma.match.update({
      where: { id: params.id },
      data: { status: newStatus as "SUGERIDO" | "CONTACTADO" | "ACTIVO" },
    });

    // Si se activa el match, notificar al estudiante
    if (newStatus === "ACTIVO" && match.estudiante.user.email) {
      await sendMatchAceptado(
        match.estudiante.user.email,
        match.estudiante.user.name || "Estudiante",
        match.exalumno.user.name || "Exalumno"
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/matches/[id]]", error);
    return NextResponse.json(
      { message: "Error al actualizar el match" },
      { status: 500 }
    );
  }
}
