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

    const estudiantes = await prisma.estudiante.findMany({
      include: { user: true },
    });
    const exalumnos = await prisma.exalumno.findMany({
      include: { user: true },
    });

    let creados = 0;
    let actualizados = 0;

    for (const est of estudiantes) {
      for (const exa of exalumnos) {
        // Build compatible objects for calcularAfinidad
        const estCompat = {
          ...est,
          id: est.user_id,
          carrera: est.carrera || "",
          apoyoBuscado: [
            ...(est.busca_mentoria ? ["mentoria"] : []),
            ...(est.busca_empleo ? ["empleo"] : []),
            ...(est.busca_pasantia ? ["pasantia"] : []),
            ...(est.busca_financiamiento ? ["financiamiento"] : []),
          ],
          areaProyecto: est.proyecto_tipo || null,
          user: { ...est.user, name: est.user.nombre, image: est.user.foto_url },
        } as any;

        const exaCompat = {
          ...exa,
          id: exa.user_id,
          carrera: exa.escuela_facultad || "",
          sector: exa.empresa_actual || "",
          areasInteres: [],
          apoyoOfrecido: [
            ...(exa.ofrece_mentoria ? ["mentoria"] : []),
            ...(exa.ofrece_empleo ? ["empleo"] : []),
            ...(exa.ofrece_pasantia ? ["pasantia"] : []),
            ...(exa.ofrece_donacion_dinero ? ["financiamiento"] : []),
          ],
          user: { ...exa.user, name: exa.user.nombre, image: exa.user.foto_url },
        } as any;

        const { score, reasons } = calcularAfinidad(estCompat, exaCompat);

        if (score > 0) {
          const existingMatch = await prisma.match.findUnique({
            where: {
              estudiante_id_exalumno_id: {
                estudiante_id: est.user_id,
                exalumno_id: exa.user_id,
              },
            },
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
