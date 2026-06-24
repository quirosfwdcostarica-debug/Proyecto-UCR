import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  if (role !== "EXALUMNO" && role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo exalumnos pueden ver su historial de donaciones" },
      { status: 403 }
    );
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: donaciones, error } = await supabaseAdmin
      .from('DONACIONES')
      .select('id, monto, estado, destino, metodo_pago, moneda, created_at, updated_at')
      .eq('exalumno_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const normalized = (donaciones || []).map((d: any) => ({
      ...d,
      status: d.estado,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[GET /api/donaciones/mis-donaciones]", error);
    return NextResponse.json(
      { message: "Error al obtener el historial de donaciones" },
      { status: 500 }
    );
  }
}
