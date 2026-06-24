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

// PUT /api/connections/[id]/accept — aceptar solicitud pendiente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken_(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { error } = await supabase
      .from('MATCHES')
      .update({ estado: 'ACTIVO', accepted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) throw error;

    const { data: match } = await supabase.from('MATCHES').select('*').eq('id', params.id).maybeSingle();
    if (match && match.initiated_by) {
      await supabase.from('NOTIFICATIONS').insert({
        id: require('crypto').randomUUID(),
        user_id: match.initiated_by,
        title: "Solicitud Aceptada",
        message: "Aceptaron tu solicitud de conexión. ¡Ya pueden chatear!",
        type: "match_accepted",
        read: false,
        reference_id: params.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/connections/:id/accept]", error);
    return NextResponse.json({ message: "Error al aceptar la conexión" }, { status: 500 });
  }
}
