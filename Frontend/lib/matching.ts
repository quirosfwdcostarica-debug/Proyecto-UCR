// lib/matching.ts — Algoritmo de afinidad UCR Alumni
// Scoring: carrera(30) + areas_interes(30 prop) + sector↔area_tematica(20) + apoyo(20) = 100

export interface EstudianteCompat {
  carrera?: string | null;
  apoyoBuscado?: string[];       // ["mentoria", "empleo", ...]
  areaProyecto?: string | null;  // area_tematica
  areasInteres?: string[];       // areas_interes JSON array
  avanceProyecto?: number | null;
  user?: { name?: string | null; image?: string | null };
  [key: string]: any;
}

export interface ExalumnoCompat {
  carrera?: string | null;
  sector?: string | null;
  apoyoOfrecido?: string[];  // ["mentoria", "empleo", ...]
  areasInteres?: string[];   // areas_interes JSON array
  user?: { name?: string | null; image?: string | null };
  [key: string]: any;
}

/**
 * Calcula la afinidad entre un estudiante y un exalumno.
 * Devuelve { score, reasons, breakdown } donde score máximo es 100.
 *
 * Criterios (checklist):
 * +30: Misma carrera UCR
 * +30: Áreas de interés en común (proporcional al overlap)
 * +20: Sector del exalumno ↔ área temática del proyecto
 * +20: Tipo de apoyo ofrecido ↔ buscado (cualquier coincidencia)
 */
export function calcularAfinidad(
  estudiante: EstudianteCompat,
  exalumno: ExalumnoCompat
): { score: number; reasons: string[]; breakdown: Record<string, number> } {
  const reasons: string[] = [];
  const breakdown: Record<string, number> = { carrera: 0, intereses: 0, sector: 0, apoyo: 0 };

  // 1. Misma carrera (+30)
  const carreraEst = (estudiante.carrera || "").toLowerCase().trim();
  const carreraExa = (exalumno.carrera || "").toLowerCase().trim();
  if (carreraEst && carreraExa && (carreraEst.includes(carreraExa) || carreraExa.includes(carreraEst))) {
    breakdown.carrera = 30;
    reasons.push("Misma área académica");
  }

  // 2. Áreas de interés en común (+30 proporcional)
  const areasEst = (estudiante.areasInteres || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  const areasExa = (exalumno.areasInteres || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (areasEst.length > 0 && areasExa.length > 0) {
    const interseccion = areasEst.filter((a) => areasExa.includes(a));
    if (interseccion.length > 0) {
      breakdown.intereses = Math.round(30 * interseccion.length / Math.max(areasEst.length, 1));
      reasons.push(`Áreas de interés comunes: ${interseccion.slice(0, 2).join(", ")}`);
    }
  }

  // 3. Sector exalumno ↔ área temática del proyecto (+20)
  const sector = (exalumno.sector || "").toLowerCase().trim();
  const areaProyecto = (estudiante.areaProyecto || "").toLowerCase().trim();
  if (sector && areaProyecto && (sector.includes(areaProyecto) || areaProyecto.includes(sector))) {
    breakdown.sector = 20;
    reasons.push("Sector profesional compatible con área del proyecto");
  }

  // 4. Tipo de apoyo ofrecido ↔ buscado (+20 si hay cualquier coincidencia)
  const apoyoBuscadoSet = new Set((estudiante.apoyoBuscado || []).map((a) => a.toLowerCase().trim()));
  const apoyoOfrecidoSet = new Set((exalumno.apoyoOfrecido || []).map((a) => a.toLowerCase().trim()));
  const apoyoComun = Array.from(apoyoBuscadoSet).filter((a) => apoyoOfrecidoSet.has(a));
  if (apoyoComun.length > 0) {
    breakdown.apoyo = 20;
    reasons.push(`Apoyo compatible: ${apoyoComun.slice(0, 2).join(", ")}`);
  }

  const score = Math.min(breakdown.carrera + breakdown.intereses + breakdown.sector + breakdown.apoyo, 100);
  return { score, reasons, breakdown };
}
