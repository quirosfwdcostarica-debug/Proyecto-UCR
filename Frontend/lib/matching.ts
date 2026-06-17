import { Estudiante, Exalumno, User } from "@prisma/client";

export type EstudianteConUser = Estudiante & { user: User };
export type ExalumnoConUser = Exalumno & { user: User };

export function calcularAfinidad(
  estudiante: EstudianteConUser,
  exalumno: ExalumnoConUser
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Misma carrera UCR (30 puntos)
  if (
    estudiante.carrera &&
    exalumno.carrera &&
    estudiante.carrera.toLowerCase().trim() === exalumno.carrera.toLowerCase().trim()
  ) {
    score += 30;
    reasons.push("Carrera compartida");
  }

  // 2. Áreas de interés en común (Hasta 30 puntos)
  // El estudiante solo tiene areaProyecto en el esquema actual. Asignamos 30 puntos si hay coincidencia.
  if (estudiante.areaProyecto) {
    const areaProyectoNorm = estudiante.areaProyecto.toLowerCase().trim();
    const areasInteresNorm = (exalumno.areasInteres || []).map((a) => a.toLowerCase().trim());
    if (areasInteresNorm.includes(areaProyectoNorm)) {
      score += 30;
      reasons.push(`Interés en común: ${estudiante.areaProyecto}`);
    }
  }

  // 3. Sector profesional del exalumno <-> área temática del proyecto (20 puntos)
  if (estudiante.areaProyecto && exalumno.sector) {
    const sectorNorm = exalumno.sector.toLowerCase().trim();
    const areaProyectoNorm = estudiante.areaProyecto.toLowerCase().trim();
    // Validamos coincidencia directa o si comparten palabras clave
    if (sectorNorm === areaProyectoNorm || sectorNorm.includes(areaProyectoNorm) || areaProyectoNorm.includes(sectorNorm)) {
      score += 20;
      reasons.push(`Sector afín al proyecto`);
    }
  }

  // 4. Tipo de apoyo ofrecido <-> buscado (20 puntos)
  const apoyoBuscadoSet = new Set((estudiante.apoyoBuscado || []).map((a) => a.toLowerCase().trim()));
  const apoyoOfrecidoSet = new Set((exalumno.apoyoOfrecido || []).map((a) => a.toLowerCase().trim()));

  const interseccionApoyo = Array.from(apoyoBuscadoSet).filter((apoyo) => apoyoOfrecidoSet.has(apoyo));
  if (interseccionApoyo.length > 0) {
    score += 20;
    reasons.push(`Coincidencia en apoyo: ${interseccionApoyo.join(", ")}`);
  }

  return { score: Math.min(score, 100), reasons };
}
