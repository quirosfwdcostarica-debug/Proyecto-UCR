import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    destino: string;
    metodoPago?: string;
    moneda?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { exalumnoId, monto, destino, metodoPago, moneda } = body;

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

  // Verificar que existe el perfil de exalumno
  const exalumno = await prisma.exalumno.findUnique({
    where: { user_id: exalumnoId },
  });
  if (!exalumno) {
    return NextResponse.json({ message: "Perfil de exalumno no encontrado" }, { status: 404 });
  }

  try {
    const donacion = await prisma.donacion.create({
      data: {
        exalumno_id: exalumnoId,
        monto,
        destino,
        metodo_pago: metodoPago || null,
        moneda: moneda || "CRC",
        estado: "PENDIENTE",
      },
    });

    return NextResponse.json(donacion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/donaciones]", error);
    return NextResponse.json(
      { message: "Error al registrar la donación" },
      { status: 500 }
    );
  }
}
