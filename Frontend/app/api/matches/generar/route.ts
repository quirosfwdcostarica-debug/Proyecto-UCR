import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { calcularAfinidad } from "@/lib/matching";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const estudiantes = await prisma.estudiante.findMany({ include: { user: true } });
    const exalumnos = await prisma.exalumno.findMany({ include: { user: true } });

    let creados = 0;
    let actualizados = 0;

    for (const est of estudiantes) {
      for (const exa of exalumnos) {
        const { score, reasons } = calcularAfinidad(est, exa);

        if (score > 0) {
          const existingMatch = await prisma.match.findUnique({
            where: {
              estudianteId_exalumnoId: {
                estudianteId: est.id,
                exalumnoId: exa.id,
              },
            },
          });

          if (existingMatch) {
            if (existingMatch.afinidad !== score) {
              await prisma.match.update({
                where: { id: existingMatch.id },
                data: { afinidad: score, matchReasons: reasons },
              });
              actualizados++;
            }
          } else {
            await prisma.match.create({
              data: {
                estudianteId: est.id,
                exalumnoId: exa.id,
                afinidad: score,
                status: "SUGERIDO",
                matchReasons: reasons,
              },
            });
            creados++;
          }
        }
      }
    }

    return NextResponse.json({
      message: "Proceso de matching completado",
      creados,
      actualizados,
    });
  } catch (error) {
    console.error("[Matches] Error en generación:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
