import { PrismaClient } from '@prisma/client';
import { calculateMatchScore } from './services/match-engine.service';

const prisma = new PrismaClient();

async function main() {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: { activo: true, visible_en_directorio: true }
    });
    const exalumnos = await prisma.exalumno.findMany({
      where: { visible_en_directorio: true, user: { activo: true } }
    });

    console.log(`Estudiantes: ${estudiantes.length}, Exalumnos: ${exalumnos.length}`);

    const existingMatches = await prisma.match.findMany({
      select: { estudiante_id: true, exalumno_id: true }
    });
    
    const existingPairs = new Set(
      existingMatches.map(m => `${m.estudiante_id}-${m.exalumno_id}`)
    );

    for (const estudiante of estudiantes) {
      for (const exalumno of exalumnos) {
        const pairKey = `${estudiante.user_id}-${exalumno.user_id}`;
        if (existingPairs.has(pairKey)) continue;

        const res = calculateMatchScore(estudiante, exalumno);
        console.log(`Score para ${pairKey}: ${res.score}`);

        if (res.score >= 50) {
          console.log("Creando match...");
          await prisma.match.create({
            data: {
              estudiante_id: estudiante.user_id,
              exalumno_id: exalumno.user_id,
              estado: "SUGERIDO",
              score_match: res.score,
              tipo_apoyo: "General",
              match_reasons: { reasons: res.reasons, desglose: res.desglose },
              initiated_by: "sistema"
            }
          });
          console.log("Match creado.");
        }
      }
    }
    console.log("Fin exitoso");
  } catch (e) {
    console.error("Error completo:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
