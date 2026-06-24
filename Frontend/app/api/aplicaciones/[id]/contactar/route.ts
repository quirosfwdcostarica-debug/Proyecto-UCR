import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST — exalumno crea/activa un match ACTIVO con el estudiante que aplicó
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "EXALUMNO" && tipo !== "ADMIN")
    return NextResponse.json({ message: "Solo exalumnos pueden contactar aplicantes" }, { status: 403 });

  const aplicacion = await prisma.aplicacion.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      estudiante_id: true,
      posicion: { select: { exalumno_id: true } },
    },
  });

  if (!aplicacion)
    return NextResponse.json({ message: "Aplicación no encontrada" }, { status: 404 });

  const exalumnoId = tipo === "ADMIN" ? aplicacion.posicion.exalumno_id : userId;

  if (tipo !== "ADMIN" && aplicacion.posicion.exalumno_id !== userId)
    return NextResponse.json({ message: "No tienes permiso para contactar este aplicante" }, { status: 403 });

  const estudianteId = aplicacion.estudiante_id;

  let match = await prisma.match.findUnique({
    where: {
      estudiante_id_exalumno_id: {
        estudiante_id: estudianteId,
        exalumno_id:   exalumnoId,
      },
    },
  });

  if (!match) {
    match = await prisma.match.create({
      data: {
        estudiante_id: estudianteId,
        exalumno_id:   exalumnoId,
        estado:        "ACTIVO",
        score_match:   0,
        initiated_by:  userId,
        tipo_apoyo:    "empleo",
        accepted_at:   new Date(),
      },
    });
  } else if (match.estado !== "ACTIVO") {
    match = await prisma.match.update({
      where: { id: match.id },
      data: { estado: "ACTIVO", accepted_at: new Date() },
    });
  }

  return NextResponse.json({ matchId: match.id });
}
