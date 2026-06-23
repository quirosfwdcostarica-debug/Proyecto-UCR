import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

function getToken_(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: req.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);
}

// PUT /api/connections/[id]/cancel — cancelar solicitud pendiente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken_(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    await prisma.match.update({
      where: { id: params.id },
      data:  { estado: "CERRADO", closed_at: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/connections/:id/cancel]", error);
    return NextResponse.json({ message: "Error al cancelar la conexión" }, { status: 500 });
  }
}
