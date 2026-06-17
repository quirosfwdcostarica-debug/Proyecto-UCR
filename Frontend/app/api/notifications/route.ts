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
    const notifications = await prisma.$queryRaw<any[]>`
      SELECT 
        id::text, 
        title, 
        message, 
        type, 
        read, 
        created_at AS "time"
      FROM "NOTIFICATIONS"
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;

    // Map database timestamp to relative or formatted string
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

      const isExalumno = (session.user as any)?.tipo === 'EXALUMNO';
      const matchesUrl = isExalumno ? '/mis-matches/exalumno' : '/mis-matches';

      return {
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        time: timeStr,
        url: matchesUrl
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
