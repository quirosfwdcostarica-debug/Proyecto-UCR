// Algoritmo de cálculo de afinidad entre estudiante y exalumno.
// Trabaja con los datos de las tablas ESTUDIANTES y EXALUMNOS vía el backend API.

export type EstudianteParaMatch = {
  user_id?: string;
  id?: string;
  carrera?: string | null;
  busca_mentoria?: boolean;
  busca_empleo?: boolean;
  busca_pasantia?: boolean;
  busca_financiamiento?: boolean;
  proyecto_tipo?: string | null;
  proyecto_titulo?: string | null;
  // Legacy Prisma fields (compatibilidad)
  apoyoBuscado?: string[];
  areaProyecto?: string | null;
  user?: { name?: string; nombre?: string; image?: string; foto_url?: string; email?: string };
};

export type ExalumnoParaMatch = {
  user_id?: string;
  id?: string;
  escuela_facultad?: string | null;
  empresa_actual?: string | null;
  cargo_actual?: string | null;
  ofrece_mentoria?: boolean;
  ofrece_empleo?: boolean;
  ofrece_pasantia?: boolean;
  ofrece_donacion_dinero?: boolean;
  ofrece_networking?: boolean;
  ofrece_career_advice?: boolean;
  // Legacy Prisma fields (compatibilidad)
  carrera?: string;
  sector?: string;
  areasInteres?: string[];
  apoyoOfrecido?: string[];
  user?: { name?: string; nombre?: string; image?: string; foto_url?: string; email?: string };
};

export function calcularAfinidad(
  estudiante: EstudianteParaMatch,
  exalumno: ExalumnoParaMatch
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Normalizar carreras: usar escuela_facultad del exalumno o campo carrera legacy
  const carreraEst = (estudiante.carrera || "").toLowerCase().trim();
  const carreraExa = (exalumno.escuela_facultad || exalumno.carrera || "").toLowerCase().trim();

  // 1. Misma carrera UCR (30 puntos)
  if (carreraEst && carreraExa && carreraEst === carreraExa) {
    score += 30;
    reasons.push("Carrera compartida");
  }

  // 2. Áreas de interés en común: areaProyecto del estudiante vs areasInteres del exalumno (30 pts)
  const areaProyecto = estudiante.areaProyecto || estudiante.proyecto_tipo || null;
  if (areaProyecto) {
    const areaProyectoNorm = areaProyecto.toLowerCase().trim();
    const areasInteresNorm = (exalumno.areasInteres || []).map((a) => a.toLowerCase().trim());
    if (areasInteresNorm.includes(areaProyectoNorm)) {
      score += 30;
      reasons.push(`Interés en común: ${areaProyecto}`);
    }
  }

  // 3. Sector profesional vs área del proyecto (20 puntos)
  const sector = exalumno.sector || exalumno.empresa_actual || "";
  if (areaProyecto && sector) {
    const sectorNorm = sector.toLowerCase().trim();
    const areaNorm = areaProyecto.toLowerCase().trim();
    if (
      sectorNorm === areaNorm ||
      sectorNorm.includes(areaNorm) ||
      areaNorm.includes(sectorNorm)
    ) {
      score += 20;
      reasons.push("Sector afín al proyecto");
    }
  }

  // 4. Tipo de apoyo ofrecido ↔ buscado (20 puntos)
  // Construir arrays de apoyo normalizados
  const apoyoBuscado: string[] = estudiante.apoyoBuscado || [
    ...(estudiante.busca_mentoria ? ["mentoria"] : []),
    ...(estudiante.busca_empleo ? ["empleo"] : []),
    ...(estudiante.busca_pasantia ? ["pasantia"] : []),
    ...(estudiante.busca_financiamiento ? ["financiamiento"] : []),
  ];

  const apoyoOfrecido: string[] = exalumno.apoyoOfrecido || [
    ...(exalumno.ofrece_mentoria ? ["mentoria"] : []),
    ...(exalumno.ofrece_empleo ? ["empleo"] : []),
    ...(exalumno.ofrece_pasantia ? ["pasantia"] : []),
    ...(exalumno.ofrece_donacion_dinero ? ["financiamiento"] : []),
    ...(exalumno.ofrece_networking ? ["networking"] : []),
    ...(exalumno.ofrece_career_advice ? ["career_advice"] : []),
  ];

  const apoyoBuscadoSet = new Set(apoyoBuscado.map((a) => a.toLowerCase().trim()));
  const apoyoOfrecidoSet = new Set(apoyoOfrecido.map((a) => a.toLowerCase().trim()));

  const interseccionApoyo = Array.from(apoyoBuscadoSet).filter((apoyo) =>
    apoyoOfrecidoSet.has(apoyo)
  );

  if (interseccionApoyo.length > 0) {
    score += 20;
    reasons.push(`Coincidencia en apoyo: ${interseccionApoyo.join(", ")}`);
  }

  return { score: Math.min(score, 100), reasons };
}
