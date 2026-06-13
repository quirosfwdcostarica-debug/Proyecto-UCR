import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendDonacionAprobada } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { status: "APROBADA" | "RECHAZADA" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { status } = body;

  if (status !== "APROBADA" && status !== "RECHAZADA") {
    return NextResponse.json(
      { message: "Status debe ser APROBADA o RECHAZADA" },
      { status: 400 }
    );
  }

  try {
    const donacion = await prisma.donacion.findUnique({
      where: { id: params.id },
      include: {
        exalumno: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!donacion) {
      return NextResponse.json({ message: "Donación no encontrada" }, { status: 404 });
    }

    const updated = await prisma.donacion.update({
      where: { id: params.id },
      data: { status },
    });

    // Si se aprueba, enviar email de confirmación al exalumno
    if (status === "APROBADA" && donacion.exalumno.user.email) {
      await sendDonacionAprobada(
        donacion.exalumno.user.email,
        donacion.exalumno.user.name || "Exalumno",
        donacion.monto,
        donacion.destino
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/donaciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la donación" }, { status: 500 });
  }
}
