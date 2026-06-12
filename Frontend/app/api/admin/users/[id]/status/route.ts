import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { status: "ACTIVO" | "SUSPENDIDO" | "PENDIENTE" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { status } = body;
  const validStatuses = ["ACTIVO", "SUSPENDIDO", "PENDIENTE"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { message: `Status inválido. Debe ser: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]/status]", error);
    return NextResponse.json({ message: "Error al actualizar el status del usuario" }, { status: 500 });
  }
}
