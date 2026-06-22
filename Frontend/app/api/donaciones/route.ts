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
    comprobanteUrl: string;
    destino: string;
    metodoPago?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { exalumnoId, monto, comprobanteUrl, destino, metodoPago } = body;

  // Validaciones básicas
  if (!exalumnoId || !monto || !comprobanteUrl || !destino) {
    return NextResponse.json(
      { message: "Faltan campos requeridos: exalumnoId, monto, comprobanteUrl, destino" },
      { status: 400 }
    );
  }

  if (monto <= 0) {
    return NextResponse.json({ message: "El monto debe ser mayor a 0" }, { status: 400 });
  }

  // Verificar que el exalumnoId coincide con el usuario autenticado (a menos que sea ADMIN)
  if (role !== "ADMIN" && exalumnoId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Magia para restaurar la sesión si el usuario fue borrado por detrás:
  let userExists = await prisma.user.findUnique({ where: { id: exalumnoId } });
  
  if (!userExists) {
    try {
      await prisma.user.create({
        data: {
          id: exalumnoId,
          nombre: session.user?.name || "Usuario Restaurado",
          email: session.user?.email || `user_${exalumnoId}@example.com`,
          tipo: "EXALUMNO" as any,
          activo: true,
          email_verified: true,
        }
      });
    } catch (e) {
      console.error("Fallo auto-creando usuario:", e);
    }
  }

  // Verificar que existe el perfil de exalumno, si no existe lo creamos
  let exalumno = await prisma.exalumno.findUnique({
    where: { user_id: exalumnoId },
  });
  
  if (!exalumno) {
    try {
      exalumno = await prisma.exalumno.create({
        data: {
          user_id: exalumnoId,
        }
      });
    } catch (err: any) {
      console.error("Error creating exalumno profile:", err);
      return NextResponse.json({ message: "Error interno creando perfil: " + err.message }, { status: 500 });
    }
  }

  try {
    const donacion = await prisma.donacion.create({
      data: {
        exalumno_id: exalumnoId,
        monto,
        destino,
        estado: "PENDIENTE",
        ...(metodoPago ? { metodo_pago: metodoPago } : {}),
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
