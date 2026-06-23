import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { sendMatchConnectionRequest } from "@/lib/email";

function getToken_(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: req.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);
}

// POST /api/connections — solicitar conexión con un exalumno
export async function POST(request: NextRequest) {
  const token = await getToken_(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { receiver_id } = body;
  if (!receiver_id) return NextResponse.json({ message: "receiver_id es requerido" }, { status: 400 });

  const senderId = token.id as string;
  const tipo     = token.tipo as string;

  const estudiante_id = tipo === "ESTUDIANTE" ? senderId : receiver_id;
  const exalumno_id   = tipo === "ESTUDIANTE" ? receiver_id : senderId;

  try {
    // Si ya existe un match activo/contactado, devolverlo sin reenviar email
    const existing = await prisma.match.findFirst({
      where: { estudiante_id, exalumno_id, estado: { not: "CERRADO" } },
    });
    if (existing) return NextResponse.json({ id: existing.id }, { status: 200 });

    const match = await prisma.match.upsert({
      where: { estudiante_id_exalumno_id: { estudiante_id, exalumno_id } },
      create: {
        estudiante_id,
        exalumno_id,
        estado:       "CONTACTADO",
        initiated_by: senderId,
      },
      update: {
        estado:       "CONTACTADO",
        initiated_by: senderId,
        rejected_at:  null,
        closed_at:    null,
      },
    });

    // Obtener datos para el email
    const [emisor, receptor] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId },   select: { nombre: true } }),
      prisma.user.findUnique({ where: { id: receiver_id }, select: { nombre: true, email: true } }),
    ]);

    if (receptor?.email) {
      await sendMatchConnectionRequest(
        receptor.email,
        receptor.nombre ?? "",
        emisor?.nombre ?? ""
      );
    }

    return NextResponse.json({ id: match.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/connections]", error);
    return NextResponse.json({ message: "Error al crear la conexión" }, { status: 500 });
  }
}
