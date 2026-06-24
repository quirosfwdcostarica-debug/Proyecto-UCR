import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── GET /api/donaciones ──────────────────────────────────────────────────────
// EXALUMNO: donaciones enviadas (exalumno_id = yo)
// ESTUDIANTE: donaciones recibidas (proyecto_estudiante_id = yo)
// ADMIN: todas; con ?userId=xxx filtra las de ese usuario (enviadas o recibidas)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const tipo = (session.user as any).tipo as string;
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  let whereClause: any;

  if (tipo === "ADMIN") {
    if (targetUserId) {
      whereClause = {
        OR: [
          { exalumno_id: targetUserId },
          { proyecto_estudiante_id: targetUserId },
        ],
      };
    } else {
      whereClause = {};
    }
  } else if (tipo === "EXALUMNO") {
    whereClause = { exalumno_id: userId };
  } else if (tipo === "ESTUDIANTE") {
    whereClause = { proyecto_estudiante_id: userId };
  } else {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const [donaciones, aggConfirmada, aggPendiente] = await Promise.all([
      (prisma.donacion.findMany as any)({
        where: whereClause,
        select: {
          id: true,
          monto: true,
          destino: true,
          moneda: true,
          metodo_pago: true,
          estado: true,
          comprobante_url: true,
          created_at: true,
          updated_at: true,
          exalumno: {
            select: {
              user: { select: { id: true, nombre: true, foto_url: true } },
            },
          },
          estudiante: {
            select: {
              proyecto_titulo: true,
              user: { select: { nombre: true } },
            },
          },
        },
        orderBy: { created_at: "desc" },
      }) as Promise<any[]>,
      prisma.donacion.aggregate({
        where: { ...whereClause, estado: "CONFIRMADA" },
        _sum: { monto: true },
      }),
      prisma.donacion.aggregate({
        where: { ...whereClause, estado: "PENDIENTE" },
        _sum: { monto: true },
      }),
    ]);

    const data = donaciones.map((d: any) => ({
      id: d.id,
      monto: Number(d.monto),
      destino: d.destino,
      moneda: d.moneda ?? "CRC",
      metodo_pago: d.metodo_pago,
      estado: d.estado,
      comprobante_url: d.comprobante_url ?? null,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
      proyecto_titulo: d.estudiante?.proyecto_titulo ?? d.destino ?? "Donación general",
      estudiante_nombre: d.estudiante?.user?.nombre ?? null,
      exalumno_nombre: d.exalumno?.user?.nombre ?? null,
      exalumno_id: d.exalumno?.user?.id ?? null,
      exalumno_foto: d.exalumno?.user?.foto_url ?? null,
    }));

    return NextResponse.json({
      data,
      total: data.length,
      totalConfirmada: Number(aggConfirmada._sum.monto ?? 0),
      totalPendiente: Number(aggPendiente._sum.monto ?? 0),
    });
  } catch (error) {
    console.error("[GET /api/donaciones]", error);
    return NextResponse.json({ message: "Error al obtener donaciones" }, { status: 500 });
  }
}

// ─── POST /api/donaciones ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  if (role !== "EXALUMNO" && role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo exalumnos pueden realizar donaciones" },
      { status: 403 }
    );
  }

  let body: {
    exalumnoId: string;
    monto: number;
    comprobanteUrl: string;
    destino: string;
    metodoPago?: string;
    proyectoEstudianteId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { exalumnoId, monto, comprobanteUrl, destino, metodoPago, proyectoEstudianteId } = body;

  if (!exalumnoId || !monto || !destino) {
    return NextResponse.json(
      { message: "Faltan campos requeridos: exalumnoId, monto, destino" },
      { status: 400 }
    );
  }

  if (monto <= 0) {
    return NextResponse.json({ message: "El monto debe ser mayor a 0" }, { status: 400 });
  }

  if (role !== "ADMIN" && exalumnoId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: userExists } = await supabaseAdmin.from('USERS').select('id').eq('id', exalumnoId).maybeSingle();
  if (!userExists) {
    try {
      await supabaseAdmin.from('USERS').insert({
        id: exalumnoId,
        nombre: session.user?.name || "Usuario Restaurado",
        email: session.user?.email || `user_${exalumnoId}@example.com`,
        tipo: "EXALUMNO",
        activo: true,
        email_verified: true,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Fallo auto-creando usuario:", e);
    }
  }

  let { data: exalumno } = await supabaseAdmin.from('EXALUMNOS').select('user_id').eq('user_id', exalumnoId).maybeSingle();
  if (!exalumno) {
    try {
      await supabaseAdmin.from('EXALUMNOS').insert({ user_id: exalumnoId, updated_at: new Date().toISOString() });
    } catch (err: any) {
      return NextResponse.json({ message: "Error interno creando perfil: " + err.message }, { status: 500 });
    }
  }

  try {
    const { data: donacion, error } = await supabaseAdmin.from('DONACIONES').insert({
      id: crypto.randomUUID(),
      exalumno_id: exalumnoId,
      monto,
      destino,
      estado: "PENDIENTE",
      comprobante_url: comprobanteUrl || null,
      updated_at: new Date().toISOString(),
      ...(metodoPago ? { metodo_pago: metodoPago } : {}),
      ...(proyectoEstudianteId ? { proyecto_estudiante_id: proyectoEstudianteId } : {}),
    }).select('*').single();

    if (error) throw error;

    return NextResponse.json(donacion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/donaciones]", error);
    return NextResponse.json({ message: "Error al registrar la donación" }, { status: 500 });
  }
}
