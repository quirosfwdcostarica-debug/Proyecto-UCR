import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/messages/${params.matchId}`, { cache: "no-store" });
  if (!res.ok) return NextResponse.json([], { status: 200 });
  return NextResponse.json(await res.json());
}

export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ message: "El mensaje no puede estar vacío" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}/messages/${params.matchId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender_id: session.user.id, content: content.trim() }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(err, { status: res.status });
  }

  return NextResponse.json(await res.json(), { status: 201 });
}
