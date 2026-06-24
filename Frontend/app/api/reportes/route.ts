import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendPerfilAutoSuspendido } from "@/lib/email";

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

  if (reportadorId === reportadoId) {
    return NextResponse.json(
      { message: "No puedes reportarte a ti mismo" },
      { status: 400 }
    );
  }

  // Verificar que el usuario reportado existe (tabla USERS)
  const reportado = await prisma.user.findUnique({
    where: { id: reportadoId },
  });
  if (!reportado) {
    return NextResponse.json({ message: "Usuario reportado no encontrado" }, { status: 404 });
  }

  // Verificar que el reportador no haya reportado ya al mismo usuario
  const reportePrevio = await prisma.reportePerfil.findFirst({
    where: { reportado_por: reportadorId, perfil_reportado: reportadoId },
  });
  if (reportePrevio) {
    return NextResponse.json(
      { message: "Ya has reportado a este usuario anteriormente" },
      { status: 409 }
    );
  }

  try {
    // Crear el reporte, recontar y aplicar auto-suspensión de forma atómica (T-51).
    const { totalReportes, suspendidoAuto } = await prisma.$transaction(async (tx) => {
      await tx.reportePerfil.create({
        data: {
          reportado_por: reportadorId,
          perfil_reportado: reportadoId,
          motivo,
        },
      });

      const total = await tx.reportePerfil.count({
        where: { perfil_reportado: reportadoId },
      });

      // Mantener sincronizado el contador del usuario
      const yaSuspendido = reportado.status === "SUSPENDIDO";
      const debeSuspender = total >= REPORTES_PARA_SUSPENSION && !yaSuspendido;

      await tx.user.update({
        where: { id: reportadoId },
        data: {
          reportes_recibidos: total,
          ...(debeSuspender ? { status: "SUSPENDIDO", activo: false } : {}),
        },
      });

      return { totalReportes: total, suspendidoAuto: debeSuspender };
    });

    // Notificar a los administradores si hubo auto-suspensión (best-effort, fuera de la transacción)
    if (suspendidoAuto) {
      try {
        const admins = await prisma.user.findMany({
          where: { tipo: "ADMIN" },
          select: { email: true },
        });
        await Promise.all(
          admins
            .filter((a) => a.email)
            .map((a) =>
              sendPerfilAutoSuspendido(a.email, reportado.nombre, reportado.email, totalReportes)
            )
        );
      } catch (mailErr) {
        console.error("[POST /api/reportes] Falló el email a admins:", mailErr);
      }
    }

    // T-52: NUNCA devolver reportado_por ni el objeto del reporte (anonimato del reportador).
    return NextResponse.json(
      {
        message: suspendidoAuto
          ? "Reporte registrado. El usuario fue suspendido automáticamente."
          : "Reporte registrado exitosamente.",
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

// GET: Lista de reportes agrupados (solo ADMIN)
export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Agrupar por usuario reportado
    const reportesAgrupados = await prisma.reportePerfil.groupBy({
      by: ["perfil_reportado"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const reportadoIds = reportesAgrupados.map((r) => r.perfil_reportado);

    const usuarios = await prisma.user.findMany({
      where: { id: { in: reportadoIds } },
      select: { id: true, nombre: true, email: true, status: true, tipo: true },
    });

    const ultimosReportes = await prisma.reportePerfil.findMany({
      where: { perfil_reportado: { in: reportadoIds } },
      orderBy: { created_at: "desc" },
      select: { perfil_reportado: true, motivo: true, created_at: true },
    });

    const result = reportesAgrupados.map((grupo) => {
      const usuario = usuarios.find((u) => u.id === grupo.perfil_reportado);
      const motivos = ultimosReportes
        .filter((r) => r.perfil_reportado === grupo.perfil_reportado)
        .map((r) => r.motivo);

      return {
        usuario: usuario
          ? { ...usuario, name: usuario.nombre, role: usuario.tipo }
          : null,
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
