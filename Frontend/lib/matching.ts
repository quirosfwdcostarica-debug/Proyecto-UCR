// lib/matching.ts — Algoritmo de afinidad UCR Alumni
// Usa campos reales del schema Prisma (busca_*/ofrece_* booleans)

export interface EstudianteCompat {
  carrera?: string | null;
  apoyoBuscado?: string[];
  areaProyecto?: string | null;
  avanceProyecto?: number | null;
  user?: { name?: string | null; image?: string | null };
  [key: string]: any;
}

export interface ExalumnoCompat {
  carrera?: string | null;
  sector?: string | null;
  apoyoOfrecido?: string[];
  areasInteres?: string[];
  user?: { name?: string | null; image?: string | null };
  [key: string]: any;
}

/**
 * Calcula la afinidad entre un estudiante y un exalumno.
 * Devuelve { score, reasons } donde score máximo es 100.
 *
 * Criterios:
 * - +30 pts: carrera/área de estudio coincide
 * - +40 pts: intersección entre apoyoBuscado[] y apoyoOfrecido[]
 * - +20 pts: intersección entre areaProyecto y areasInteres[]
 * - +10 pts: avanceProyecto >= 50 (proyecto maduro)
 */
export function calcularAfinidad(
  estudiante: EstudianteCompat,
  exalumno: ExalumnoCompat
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const carreraEst = (estudiante.carrera || "").toLowerCase().trim();
  const carreraExa = (exalumno.carrera || "").toLowerCase().trim();

  // --- +30 pts: Misma carrera / sector ---
  if (
    carreraEst &&
    carreraExa &&
    (carreraEst.includes(carreraExa) || carreraExa.includes(carreraEst))
  ) {
    score += 30;
    reasons.push("Misma área académica");
  } else if (carreraEst && carreraExa) {
    // Si no coinciden carreras, dar puntaje parcial (0) — no rechazar automáticamente
    // El admin puede igualmente generar el match
  }

  // --- +40 pts: Intersección de tipos de apoyo ---
  const apoyoBuscadoSet = new Set(
    (estudiante.apoyoBuscado || []).map((a) => a.toLowerCase().trim())
  );
  const apoyoOfrecidoSet = new Set(
    (exalumno.apoyoOfrecido || []).map((a) => a.toLowerCase().trim())
  );

  const interseccion = Array.from(apoyoBuscadoSet).filter((apoyo) =>
    apoyoOfrecidoSet.has(apoyo)
  );

  if (interseccion.length > 0) {
    score += 40;
    reasons.push(`Apoyo compatible: ${interseccion.join(", ")}`);
  }

  // --- +20 pts: Área del proyecto coincide con áreas de interés del exalumno ---
  if (estudiante.areaProyecto) {
    const areaProyectoNorm = estudiante.areaProyecto.toLowerCase().trim();
    const areasInteresNorm = (exalumno.areasInteres || []).map((a) =>
      a.toLowerCase().trim()
    );
    if (areasInteresNorm.includes(areaProyectoNorm)) {
      score += 20;
      reasons.push("Área de proyecto compatible");
    }
  }

  // --- +10 pts: Proyecto maduro (avance >= 50%) ---
  if ((estudiante.avanceProyecto ?? 0) >= 50) {
    score += 10;
    reasons.push("Proyecto en etapa avanzada");
  }

  return { score: Math.min(score, 100), reasons };
}
