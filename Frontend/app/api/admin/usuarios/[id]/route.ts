import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH — actualizar tipo/status de un usuario (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const TIPOS_VALIDOS = ["ESTUDIANTE", "EXALUMNO", "ADMIN"];
  const STATUS_VALIDOS = ["PENDIENTE", "ACTIVO", "SUSPENDIDO"];

  const data: any = {};
  if (body.tipo !== undefined) {
    if (!TIPOS_VALIDOS.includes(body.tipo))
      return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
    data.tipo = body.tipo;
  }
  if (body.status !== undefined) {
    if (!STATUS_VALIDOS.includes(body.status))
      return NextResponse.json({ message: "Status inválido" }, { status: 400 });
    data.status = body.status;
    data.activo  = body.status === "ACTIVO";
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ message: "Nada que actualizar" }, { status: 400 });

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, tipo: true, status: true, activo: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/usuarios/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar usuario" }, { status: 500 });
  }
}
