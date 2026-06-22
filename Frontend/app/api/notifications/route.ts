import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    // Try with reference_id column (requires migration). Falls back gracefully if column doesn't exist yet.
    let notifications: any[];
    try {
      notifications = await prisma.$queryRaw<any[]>`
        SELECT
          id::text,
          title,
          message,
          type,
          read,
          created_at AS "time",
          reference_id::text AS "matchId"
        FROM "NOTIFICATIONS"
        WHERE user_id = ${userId}::uuid
          AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } catch {
      notifications = await prisma.$queryRaw<any[]>`
        SELECT
          id::text,
          title,
          message,
          type,
          read,
          created_at AS "time",
          NULL::text AS "matchId"
        FROM "NOTIFICATIONS"
        WHERE user_id = ${userId}::uuid
          AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

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
      }

      return {
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        time: timeStr,
        type: n.type,
        matchId: n.matchId || null,
        actionable: isActionable && !!n.matchId && !n.read,
        rejectedBy,
        url,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/notifications]", error);
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

    if (id) {
      await prisma.$executeRaw`
        UPDATE "NOTIFICATIONS"
        SET read = true, updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${userId}::uuid
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "NOTIFICATIONS"
        SET read = true, updated_at = NOW()
        WHERE user_id = ${userId}::uuid AND read = false
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/notifications]", error);
    return NextResponse.json({ message: "Error al actualizar notificaciones" }, { status: 500 });
  }
}
