"use server";

import prisma from "@/lib/prisma";

export async function calculateAfinidad(estudianteId: string, exalumnoId: string) {
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId }
  });

  const exalumno = await prisma.exalumno.findUnique({
    where: { id: exalumnoId }
  });

  if (!estudiante || !exalumno) throw new Error("Perfiles no encontrados");

  let score = 0;

  // 1. +30 puntos: Misma carrera exacta
  if (estudiante.carrera.trim().toLowerCase() === exalumno.carrera.trim().toLowerCase()) {
    score += 30;
  }

  // 2. +30 puntos: Proporción de áreas de interés en común
  // El estudiante tiene 1 areaProyecto, el exalumno tiene N areasInteres
  if (estudiante.areaProyecto && exalumno.areasInteres.includes(estudiante.areaProyecto)) {
    score += 30; // 100% de match de área principal
  }

  // 3. +20 puntos: Coincidencia entre sector del exalumno y área del proyecto/carrera
  // Simplificación semántica o mapeo si fuera necesario. 
  // Por ahora, asumimos que si el sector tiene relación léxica directa, se otorgan puntos
  // En un motor real avanzado usaríamos embeddings. Aquí aplicamos una regla heurística base:
  if (estudiante.areaProyecto && exalumno.sector.toLowerCase().includes(estudiante.areaProyecto.split(" ")[0].toLowerCase())) {
    score += 20;
  } else if (score < 50) {
    // Bonus alternativo si comparten muchas áreas
    score += 10;
  }

  // 4. +20 puntos: Coincidencia en tipo de apoyo ofrecido/buscado
  const apoyosEnComun = estudiante.apoyoBuscado.filter(apoyo => exalumno.apoyoOfrecido.includes(apoyo));
  if (apoyosEnComun.length > 0) {
    const proportion = apoyosEnComun.length / Math.max(estudiante.apoyoBuscado.length, 1);
    score += Math.floor(20 * proportion);
  }

  // Clampear puntaje a 100 max
  const afinidad = Math.min(score, 100);

  // Upsert the match
  const match = await prisma.match.upsert({
    where: {
      estudianteId_exalumnoId: {
        estudianteId,
        exalumnoId
      }
    },
    update: {
      afinidad
    },
    create: {
      estudianteId,
      exalumnoId,
      afinidad,
      status: "SUGERIDO"
    }
  });

  return match;
}

export async function getMatchesForEstudiante(estudianteId: string) {
  return await prisma.match.findMany({
    where: { estudianteId },
    include: { exalumno: { include: { user: true } } },
    orderBy: { afinidad: "desc" }
  });
}
