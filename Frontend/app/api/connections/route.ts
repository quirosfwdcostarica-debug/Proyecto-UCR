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
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Si ya existe un match activo/contactado, devolverlo sin reenviar email
    const { data: existing, error: existingError } = await supabase
      .from('MATCHES')
      .select('id')
      .eq('estudiante_id', estudiante_id)
      .eq('exalumno_id', exalumno_id)
      .neq('estado', 'CERRADO')
      .maybeSingle();

    if (existing) return NextResponse.json({ id: existing.id }, { status: 200 });

    // Check existing match
    const { data: existingMatch, error: matchQueryError } = await supabase
      .from('MATCHES')
      .select('id')
      .eq('estudiante_id', estudiante_id)
      .eq('exalumno_id', exalumno_id)
      .maybeSingle();

    let matchId;

    if (existingMatch) {
      matchId = existingMatch.id;
      const { error: updateError } = await supabase
        .from('MATCHES')
        .update({
          estado: "CONTACTADO",
          initiated_by: senderId,
          rejected_at: null,
          closed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);
      if (updateError) throw updateError;
    } else {
      const { randomUUID } = require('crypto');
      matchId = randomUUID();
      const { error: insertError } = await supabase
        .from('MATCHES')
        .insert({
          id: matchId,
          estudiante_id,
          exalumno_id,
          estado: "CONTACTADO",
          initiated_by: senderId,
          updated_at: new Date().toISOString()
        });
      if (insertError) throw insertError;
    }

    // Obtener datos para el email
    const { data: emisor } = await supabase.from('USERS').select('nombre').eq('id', senderId).maybeSingle();
    const { data: receptor } = await supabase.from('USERS').select('nombre, email').eq('id', receiver_id).maybeSingle();

    // Crear notificación en la BD
    const notifType = tipo === "ESTUDIANTE" ? "match_contact_request" : "match_offer";
    const notifTitle = tipo === "ESTUDIANTE" ? "Solicitud de Apoyo" : "Nueva Oferta de Apoyo";
    const notifMsg = tipo === "ESTUDIANTE" 
      ? `${emisor?.nombre || 'Un estudiante'} te ha enviado una solicitud de apoyo.`
      : `${emisor?.nombre || 'Un exalumno'} te ha ofrecido apoyo.`;

    await supabase.from('NOTIFICATIONS').insert({
      id: randomUUID(),
      user_id: receiver_id,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      read: false,
      reference_id: matchId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (receptor?.email) {
      await sendMatchConnectionRequest(
        receptor.email,
        receptor.nombre ?? "",
        emisor?.nombre ?? ""
      );
    }

    return NextResponse.json({ id: matchId }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/connections]", error);
    return NextResponse.json({ message: "Error al crear la conexión" }, { status: 500 });
  }
}
