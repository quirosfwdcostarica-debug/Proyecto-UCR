import { Estudiante, Exalumno, User } from "@prisma/client";

export type EstudianteConUser = Estudiante & { user: User };
export type ExalumnoConUser = Exalumno & { user: User };

/**
 * Calcula la afinidad entre un estudiante y un exalumno.
 * Score máximo: 100 puntos
 *
 * Criterios:
 * - +40 pts: intersección entre apoyoBuscado[] del estudiante y apoyoOfrecido[] del exalumno
 * - +30 pts: carrera del exalumno coincide con la del estudiante (case-insensitive)
 * - +20 pts: intersección entre areaProyecto del estudiante y areasInteres[] del exalumno
 * - +10 pts: avanceProyecto del estudiante es >= 50 (proyecto maduro)
 */
export function calcularAfinidad(
  estudiante: EstudianteConUser,
  exalumno: ExalumnoConUser
): number {
  let score = 0;

  // --- +40 pts: Intersección de tipos de apoyo ---
  const apoyoBuscadoSet = new Set(
    (estudiante.apoyoBuscado || []).map((a) => a.toLowerCase().trim())
  );
  const apoyoOfrecidoSet = new Set(
    (exalumno.apoyoOfrecido || []).map((a) => a.toLowerCase().trim())
  );

  const tieneInterseccionApoyo = Array.from(apoyoBuscadoSet).some((apoyo) =>
    apoyoOfrecidoSet.has(apoyo)
  );
  if (tieneInterseccionApoyo) {
    score += 40;
  }

  // --- +30 pts: Coincidencia de carrera ---
  if (
    estudiante.carrera &&
    exalumno.carrera &&
    estudiante.carrera.toLowerCase().trim() === exalumno.carrera.toLowerCase().trim()
  ) {
    score += 30;
  }

  // --- +20 pts: Intersección de área de proyecto con áreas de interés ---
  if (estudiante.areaProyecto) {
    const areaProyectoNorm = estudiante.areaProyecto.toLowerCase().trim();
    const areasInteresNorm = (exalumno.areasInteres || []).map((a) =>
      a.toLowerCase().trim()
    );
    if (areasInteresNorm.includes(areaProyectoNorm)) {
      score += 20;
    }
  }

  // --- +10 pts: Proyecto maduro (avance >= 50%) ---
  if ((estudiante.avanceProyecto ?? 0) >= 50) {
    score += 10;
  }

  return Math.min(score, 100);
}
