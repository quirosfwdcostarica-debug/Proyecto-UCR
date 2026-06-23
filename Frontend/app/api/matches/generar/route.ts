import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calcularAfinidad } from "@/lib/matching";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const parseArr = (v: any): string[] =>
      Array.isArray(v) ? (v as string[]) : (() => { try { return JSON.parse(v) as string[]; } catch { return []; } })();

    const estudiantes = await prisma.estudiante.findMany({
      select: {
        user_id: true, carrera: true, proyecto_tipo: true,
        busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
      },
    });
    const exalumnos = await prisma.exalumno.findMany({
      where: { user: { activo: true, status: { not: "SUSPENDIDO" } } },
      select: {
        user_id: true, escuela_facultad: true,
        ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
        ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
        ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
      },
    });

    let creados = 0;
    let actualizados = 0;

    for (const est of estudiantes) {
      for (const exa of exalumnos) {
        const estCompat = {
          carrera: est.carrera || "",
          apoyoBuscado: [
            ...(est.busca_mentoria ? ["mentoria"] : []),
            ...(est.busca_empleo ? ["empleo"] : []),
            ...(est.busca_pasantia ? ["pasantia"] : []),
            ...(est.busca_financiamiento ? ["financiamiento"] : []),
          ],
          areaProyecto: est.proyecto_tipo || null,
          areasInteres: [] as string[],
        };

        const exaCompat = {
          carrera: exa.escuela_facultad || "",
          sector: null as string | null,
          areasInteres: [] as string[],
          apoyoOfrecido: [
            ...(exa.ofrece_mentoria ? ["mentoria"] : []),
            ...(exa.ofrece_empleo ? ["empleo"] : []),
            ...(exa.ofrece_pasantia ? ["pasantia"] : []),
            ...(exa.ofrece_donacion_dinero ? ["financiamiento"] : []),
            ...(exa.ofrece_guest_speaking ? ["guest speaking"] : []),
            ...(exa.ofrece_volunteering ? ["volunteering"] : []),
            ...(exa.ofrece_career_advice ? ["career advice"] : []),
            ...(exa.ofrece_networking ? ["networking"] : []),
          ],
        };

        const { score, reasons } = calcularAfinidad(estCompat, exaCompat);

        if (score > 0) {
          const existingMatch = await prisma.match.findUnique({
            where: { estudiante_id_exalumno_id: { estudiante_id: est.user_id, exalumno_id: exa.user_id } },
          });

          if (existingMatch) {
            if (existingMatch.score_match !== score) {
              await prisma.match.update({
                where: { id: existingMatch.id },
                data: { score_match: score, match_reasons: reasons },
              });
              actualizados++;
            }
          } else {
            await prisma.match.create({
              data: {
                estudiante_id: est.user_id,
                exalumno_id: exa.user_id,
                score_match: score,
                estado: "SUGERIDO",
                match_reasons: reasons,
              },
            });
            creados++;
          }
        }
      }
    }

    return NextResponse.json({ message: "Proceso de matching completado", creados, actualizados });
  } catch (error) {
    console.error("[Matches] Error en generación:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
