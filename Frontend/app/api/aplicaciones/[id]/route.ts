import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  sendAplicacionSeleccionada,
  sendAplicacionDescartada,
} from "@/lib/email";

// ─── PATCH — exalumno selecciona o descarta un aplicante ─────────────────────
// Body: { action: "seleccionar" | "descartar", cerrarPosicion?: boolean }
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "EXALUMNO" && tipo !== "ADMIN")
    return NextResponse.json({ message: "Solo exalumnos pueden gestionar aplicaciones" }, { status: 403 });

  let body: { action: string; cerrarPosicion?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { action, cerrarPosicion = false } = body;
  if (!["seleccionar", "descartar"].includes(action))
    return NextResponse.json({ message: "Acción inválida. Use 'seleccionar' o 'descartar'" }, { status: 400 });

  // Fetch the application with full context
  const aplicacion = await prisma.aplicacion.findUnique({
    where: { id: params.id },
    select: {
      id: true, estado: true, posicion_id: true, estudiante_id: true,
      posicion: {
        select: {
          id: true, titulo: true, empresa: true, exalumno_id: true,
          estado: true,
          exalumno: { select: { user: { select: { nombre: true, email: true } } } },
        },
      },
      estudiante: {
        select: {
          user: { select: { nombre: true, email: true } },
        },
      },
    },
  });

  if (!aplicacion)
    return NextResponse.json({ message: "Aplicación no encontrada" }, { status: 404 });

  // Verify ownership (exalumno must own the position)
  if (tipo !== "ADMIN" && aplicacion.posicion.exalumno_id !== userId)
    return NextResponse.json({ message: "No tienes permiso para gestionar esta aplicación" }, { status: 403 });

  if (aplicacion.estado !== "PENDIENTE")
    return NextResponse.json({ message: "Esta aplicación ya fue procesada" }, { status: 400 });

  const estudianteEmail    = aplicacion.estudiante.user.email;
  const estudianteNombre   = aplicacion.estudiante.user.nombre ?? "Estudiante";
  const posicionTitulo     = aplicacion.posicion.titulo ?? "la posición";
  const exalumnoNombre     = aplicacion.posicion.exalumno?.user.nombre ?? "";
  const exalumnoEmail      = aplicacion.posicion.exalumno?.user.email ?? "";

  try {
    if (action === "seleccionar") {
      // 1. Mark this application as SELECCIONADO
      const updated = await prisma.aplicacion.update({
        where: { id: params.id },
        data: { estado: "SELECCIONADO" },
        select: { id: true, estado: true },
      });

      // 2. Send success email to selected student
      if (estudianteEmail) {
        await sendAplicacionSeleccionada(estudianteEmail, estudianteNombre, posicionTitulo, exalumnoNombre, exalumnoEmail);
      }

      // 3. If requested: close position + reject all other PENDIENTE applicants
      if (cerrarPosicion) {
        const otrosPendientes = await prisma.aplicacion.findMany({
          where: {
            posicion_id: aplicacion.posicion_id,
            id: { not: params.id },
            estado: "PENDIENTE",
          },
          select: {
            id: true,
            estudiante: { select: { user: { select: { email: true, nombre: true } } } },
          },
        });

        // Batch update to DESCARTADO
        await prisma.aplicacion.updateMany({
          where: {
            posicion_id: aplicacion.posicion_id,
            id: { not: params.id },
            estado: "PENDIENTE",
          },
          data: { estado: "DESCARTADO" },
        });

        // Send rejection emails to other applicants (anonymous — "posición fue cubierta")
        await Promise.allSettled(
          otrosPendientes.map((a) => {
            const email = a.estudiante.user.email;
            const nombre = a.estudiante.user.nombre ?? "Estudiante";
            if (email) return sendAplicacionDescartada(email, nombre, posicionTitulo);
          })
        );

        // Mark position as cubierta
        await prisma.posicion.update({
          where: { id: aplicacion.posicion_id },
          data: { estado: "cubierta" },
          select: { id: true },
        });
      }

      return NextResponse.json({ ok: true, estado: updated.estado });
    }

    if (action === "descartar") {
      const updated = await prisma.aplicacion.update({
        where: { id: params.id },
        data: { estado: "DESCARTADO" },
        select: { id: true, estado: true },
      });

      if (estudianteEmail) {
        await sendAplicacionDescartada(estudianteEmail, estudianteNombre, posicionTitulo);
      }

      return NextResponse.json({ ok: true, estado: updated.estado });
    }
  } catch (error) {
    console.error("[PATCH /api/aplicaciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la aplicación" }, { status: 500 });
  }
}

// ─── DELETE — estudiante retira su aplicación (solo si PENDIENTE) ─────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "ESTUDIANTE")
    return NextResponse.json({ message: "Solo estudiantes pueden retirar aplicaciones" }, { status: 403 });

  const aplicacion = await prisma.aplicacion.findUnique({
    where: { id: params.id },
    select: { id: true, estado: true, estudiante_id: true },
  });

  if (!aplicacion)
    return NextResponse.json({ message: "Aplicación no encontrada" }, { status: 404 });
  if (aplicacion.estudiante_id !== userId)
    return NextResponse.json({ message: "No tienes permiso para retirar esta aplicación" }, { status: 403 });
  if (aplicacion.estado !== "PENDIENTE")
    return NextResponse.json({ message: "Solo puedes retirar aplicaciones en estado 'En revisión'" }, { status: 400 });

  try {
    await prisma.aplicacion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/aplicaciones/[id]]", error);
    return NextResponse.json({ message: "Error al retirar la aplicación" }, { status: 500 });
  }
}
