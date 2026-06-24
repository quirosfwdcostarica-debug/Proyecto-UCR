import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  let session: any = null;
  let userId: string | undefined;

  // Robust auth handling with detailed logging
  try {
    session = await auth();
    userId = session?.user?.id;
    console.log("[notifications] session userId:", userId, "| type:", typeof userId);
  } catch (authErr: any) {
    console.error("[notifications] auth() falló:", authErr?.message);
    return NextResponse.json({ message: "Error de autenticación" }, { status: 500 });
  }

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  // Validate UUID format before casting in raw SQL
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error("[notifications] userId no es UUID válido:", userId);
    return NextResponse.json({ message: "ID de usuario inválido" }, { status: 400 });
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: notificationsData, error } = await supabase
      .from('NOTIFICATIONS')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const notifications = notificationsData || [];

    const isExalumno = (session.user as any)?.tipo === 'EXALUMNO';
    const matchesUrl = isExalumno ? '/mis-matches/exalumno' : '/mis-matches';

    const formatted = notifications.map(n => {
      const date = new Date(n.time);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = "Hace un momento";
      if (diffDays > 0) {
        timeStr = `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
      } else if (diffHours > 0) {
        timeStr = `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
      } else if (diffMins > 0) {
        timeStr = `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
      }

      // Notifications where the user can Accept/Reject inline
      const isActionable =
        (n.type === 'match_offer' && !isExalumno) ||
        (n.type === 'match_contact_request' && isExalumno);

      // Role to pass to rechazarMatch
      const rejectedBy = isExalumno ? 'exalumno' : 'estudiante';

      // For accepted matches, link directly to chat
      let url = matchesUrl;
      if (n.type === 'match_accepted' && n.matchId) {
        url = `/mensajes?matchId=${n.matchId}`;
      } else if (n.type?.includes('connection')) {
        url = '/mis-conexiones';
      }

      return {
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        time: timeStr,
        type: n.type,
        matchId: n.reference_id || n.matchId || null,
        actionable: isActionable && !!(n.reference_id || n.matchId) && !n.read,
        rejectedBy,
        url,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("[GET /api/notifications] DB ERROR:", error?.message, error?.code);
    return NextResponse.json({ message: "Error al obtener notificaciones" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;

    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    if (id) {
      const { error } = await supabase
        .from('NOTIFICATIONS')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('NOTIFICATIONS')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/notifications]", error);
    return NextResponse.json({ message: "Error al actualizar notificaciones" }, { status: 500 });
  }
}
