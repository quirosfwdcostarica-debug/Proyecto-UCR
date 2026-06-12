import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const REPORTES_PARA_SUSPENSION = 3;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const reportadorId = (session.user as any).id as string;

  let body: { reportadoId: string; motivo: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { reportadoId, motivo } = body;

  if (!reportadoId || !motivo) {
    return NextResponse.json(
      { message: "Faltan campos: reportadoId, motivo" },
      { status: 400 }
    );
  }

  // No puede reportarse a sí mismo
  if (reportadorId === reportadoId) {
    return NextResponse.json(
      { message: "No puedes reportarte a ti mismo" },
      { status: 400 }
    );
  }

  // Verificar que el usuario reportado existe
  const reportado = await prisma.user.findUnique({
    where: { id: reportadoId },
  });
  if (!reportado) {
    return NextResponse.json({ message: "Usuario reportado no encontrado" }, { status: 404 });
  }

  // Verificar que el reportador no haya reportado ya al mismo usuario
  const reportePrevio = await prisma.reportePerfil.findFirst({
    where: { reportadorId, reportadoId },
  });
  if (reportePrevio) {
    return NextResponse.json(
      { message: "Ya has reportado a este usuario anteriormente" },
      { status: 409 }
    );
  }

  try {
    // Crear el reporte
    const reporte = await prisma.reportePerfil.create({
      data: { reportadorId, reportadoId, motivo },
    });

    // Contar todos los reportes del usuario reportado
    const totalReportes = await prisma.reportePerfil.count({
      where: { reportadoId },
    });

    let suspendidoAuto = false;

    // Auto-suspensión si llega a 3 o más reportes
    if (totalReportes >= REPORTES_PARA_SUSPENSION && reportado.status !== "SUSPENDIDO") {
      await prisma.user.update({
        where: { id: reportadoId },
        data: { status: "SUSPENDIDO" },
      });
      suspendidoAuto = true;
    }

    return NextResponse.json(
      {
        message: suspendidoAuto
          ? "Reporte registrado. El usuario fue suspendido automáticamente."
          : "Reporte registrado exitosamente.",
        reporte,
        totalReportes,
        suspendidoAuto,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reportes]", error);
    return NextResponse.json(
      { message: "Error al registrar el reporte" },
      { status: 500 }
    );
  }
}

// GET: Lista de reportes (solo ADMIN)
export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Agrupar por usuario reportado y contar
    const reportesAgrupados = await prisma.reportePerfil.groupBy({
      by: ["reportadoId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    // Obtener datos de los usuarios reportados
    const reportadoIds = reportesAgrupados.map((r) => r.reportadoId);
    const usuarios = await prisma.user.findMany({
      where: { id: { in: reportadoIds } },
      select: { id: true, name: true, email: true, status: true, role: true },
    });

    // Obtener últimos motivos por usuario
    const ultimosReportes = await prisma.reportePerfil.findMany({
      where: { reportadoId: { in: reportadoIds } },
      orderBy: { createdAt: "desc" },
      select: { reportadoId: true, motivo: true, createdAt: true },
    });

    const result = reportesAgrupados.map((grupo) => {
      const usuario = usuarios.find((u) => u.id === grupo.reportadoId);
      const motivos = ultimosReportes
        .filter((r) => r.reportadoId === grupo.reportadoId)
        .map((r) => r.motivo);

      return {
        usuario,
        totalReportes: grupo._count.id,
        motivos,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/reportes]", error);
    return NextResponse.json({ message: "Error al obtener reportes" }, { status: 500 });
  }
}
