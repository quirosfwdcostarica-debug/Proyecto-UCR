import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH — editar contenido de un mensaje (solo el remitente)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { matchId: string; messageId: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  let body: { content: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.content?.trim())
    return NextResponse.json({ message: "El mensaje no puede estar vacío" }, { status: 400 });

  const message = await prisma.message.findUnique({
    where: { id: params.messageId },
    select: { id: true, sender_id: true, match_id: true },
  });

  if (!message)
    return NextResponse.json({ message: "Mensaje no encontrado" }, { status: 404 });
  if (message.sender_id !== session.user.id)
    return NextResponse.json({ message: "No puedes editar mensajes de otros" }, { status: 403 });
  if (message.match_id !== params.matchId)
    return NextResponse.json({ message: "Mensaje no pertenece a este chat" }, { status: 400 });

  const updated = await prisma.message.update({
    where: { id: params.messageId },
    data: { content: body.content.trim() },
  });

  return NextResponse.json(updated);
}

// DELETE — eliminar un mensaje (solo el remitente)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { matchId: string; messageId: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  const message = await prisma.message.findUnique({
    where: { id: params.messageId },
    select: { id: true, sender_id: true, match_id: true },
  });

  if (!message)
    return NextResponse.json({ message: "Mensaje no encontrado" }, { status: 404 });
  if (message.sender_id !== session.user.id)
    return NextResponse.json({ message: "No puedes eliminar mensajes de otros" }, { status: 403 });
  if (message.match_id !== params.matchId)
    return NextResponse.json({ message: "Mensaje no pertenece a este chat" }, { status: 400 });

  await prisma.message.delete({ where: { id: params.messageId } });

  return NextResponse.json({ ok: true });
}
