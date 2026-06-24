import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendDonacionAprobada, sendDonacionRecibidaStudent, sendDonacionRechazada } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;
  const adminId = session?.user?.id;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { status: "CONFIRMADA" | "RECHAZADA"; motivo_rechazo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { status } = body;

  // Map frontend status names to DB estado values
  const estadoMap: Record<string, "CONFIRMADA" | "RECHAZADA"> = {
    APROBADA: "CONFIRMADA",
    CONFIRMADA: "CONFIRMADA",
    RECHAZADA: "RECHAZADA",
  };

  const estado = estadoMap[status];
  if (!estado) {
    return NextResponse.json(
      { message: "Status debe ser CONFIRMADA (o APROBADA) o RECHAZADA" },
      { status: 400 }
    );
  }

  // El motivo es obligatorio al rechazar
  const motivo = body.motivo_rechazo?.trim();
  if (estado === "RECHAZADA" && !motivo) {
    return NextResponse.json(
      { message: "Debes indicar un motivo para rechazar la donación." },
      { status: 400 }
    );
  }

  try {
    const donacion = await prisma.donacion.findUnique({
      where: { id: params.id },
      include: {
        exalumno: {
          include: {
            user: { select: { nombre: true, email: true } },
          },
        },
        estudiante: {
          include: {
            user: { select: { nombre: true, email: true } },
          }
        }
      },
    });

    if (!donacion) {
      return NextResponse.json({ message: "Donación no encontrada" }, { status: 404 });
    }

    const updated = await prisma.donacion.update({
      where: { id: params.id },
      data: {
        estado,
        confirmado_por: adminId, // Auditoría (RNF-08)
        motivo_rechazo: estado === "RECHAZADA" ? motivo : null,
      },
    });

    console.log(`[AUDITORIA] Donación ${params.id} ha sido ${estado} por el admin ${adminId}.${estado === "RECHAZADA" ? ` Motivo: ${motivo}` : ""}`);

    // Si se rechaza, notificar al donante con el motivo
    if (estado === "RECHAZADA" && donacion.exalumno?.user?.email) {
      await sendDonacionRechazada(
        donacion.exalumno.user.email,
        donacion.exalumno.user.nombre || "Exalumno",
        Number(donacion.monto),
        donacion.destino || "Fondo General",
        motivo!
      );
    }

    // Si se aprueba/confirma, enviar emails
    if (estado === "CONFIRMADA") {
      if (donacion.exalumno?.user?.email) {
        await sendDonacionAprobada(
          donacion.exalumno.user.email,
          donacion.exalumno.user.nombre || "Exalumno",
          Number(donacion.monto),
          donacion.destino || "Fondo General"
        );
      }
      
      // Notificar al estudiante si es un proyecto específico
      if (donacion.estudiante?.user?.email) {
        await sendDonacionRecibidaStudent(
          donacion.estudiante.user.email,
          donacion.estudiante.user.nombre || "Estudiante",
          donacion.estudiante.proyecto_titulo || "Proyecto UCR",
          Number(donacion.monto)
        );
      }
    }

    return NextResponse.json({ ...updated, status: updated.estado });
  } catch (error) {
    console.error("[PATCH /api/admin/donaciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la donación" }, { status: 500 });
  }
}
