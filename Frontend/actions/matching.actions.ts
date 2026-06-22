"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { calcularAfinidad } from "@/lib/matching";
import {
  sendMatchAceptado,
  sendMatchRechazado,
  sendMatchConnectionRequest,
  sendAdminNewActiveMatch,
} from "@/lib/email";

export type MatchEstado = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toApoyoBuscado(est: any): string[] {
  const a: string[] = [];
  if (est.busca_mentoria) a.push("mentoria");
  if (est.busca_empleo) a.push("empleo");
  if (est.busca_pasantia) a.push("pasantia");
  if (est.busca_financiamiento) a.push("financiamiento");
  return a;
}

function toApoyoOfrecido(exa: any): string[] {
  const a: string[] = [];
  if (exa.ofrece_mentoria) a.push("mentoria");
  if (exa.ofrece_empleo) a.push("empleo");
  if (exa.ofrece_pasantia) a.push("pasantia");
  if (exa.ofrece_donacion_dinero) a.push("financiamiento");
  if (exa.ofrece_guest_speaking) a.push("guest speaking");
  if (exa.ofrece_volunteering) a.push("volunteering");
  if (exa.ofrece_career_advice) a.push("career advice");
  if (exa.ofrece_networking) a.push("networking");
  return a;
}

function parseJsonArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  try { return JSON.parse(val as string) as string[]; } catch { return []; }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@alumni.ucr.ac.cr";

// ─── Queries ──────────────────────────────────────────────────────────────────

// Selects explícitos (columnas existentes en BD)
const MATCH_EXALUMNO_SELECT = {
  user_id: true, escuela_facultad: true, empresa_actual: true, cargo_actual: true,
  ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
  ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
  ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
  user: { select: { nombre: true, email: true, foto_url: true } },
} as const;

const MATCH_ESTUDIANTE_SELECT = {
  user_id: true, carrera: true, proyecto_titulo: true, proyecto_tipo: true,
  busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
  user: { select: { nombre: true, email: true, foto_url: true } },
} as const;

const MATCH_BASE_SELECT = {
  id: true, exalumno_id: true, estudiante_id: true,
  tipo_apoyo: true, score_match: true, estado: true, resultado: true,
  initiated_by: true, match_reasons: true,
  rechazado_por_estudiante: true,
  accepted_at: true, rejected_at: true, closed_at: true,
  created_at: true, updated_at: true,
} as const;

export async function getMatchesForEstudiante(estudianteId?: string) {
  const session = await auth();
  const id = estudianteId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  return prisma.match.findMany({
    where: { estudiante_id: id },
    orderBy: { score_match: "desc" },
    select: { ...MATCH_BASE_SELECT, exalumno: { select: MATCH_EXALUMNO_SELECT } },
  });
}

export async function getMatchesForExalumno(exalumnoId?: string) {
  const session = await auth();
  const id = exalumnoId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  return prisma.match.findMany({
    where: { exalumno_id: id },
    orderBy: { score_match: "desc" },
    select: { ...MATCH_BASE_SELECT, estudiante: { select: MATCH_ESTUDIANTE_SELECT } },
  });
}

// ─── Transiciones de estado ───────────────────────────────────────────────────

export async function contactarMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const userId = session.user.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true, estado: true, estudiante_id: true, exalumno_id: true, initiated_by: true,
      estudiante: { select: { user: { select: { nombre: true, email: true } } } },
      exalumno: { select: { user: { select: { nombre: true, email: true } } } },
    },
  });
  if (!match) throw new Error("Match no encontrado");
  if (match.estado === "CERRADO") throw new Error("Esta conexión fue cerrada previamente. No puede reactivarse.");
  if (match.estado !== "SUGERIDO") throw new Error("El match ya no está en estado sugerido");
  if (match.estudiante_id !== userId) throw new Error("Solo el estudiante puede contactar");

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { estado: "CONTACTADO", initiated_by: userId },
  });

  const receptorEmail = match.exalumno.user.email;
  const receptorNombre = match.exalumno.user.nombre || "Exalumno";
  const emisorNombre = match.estudiante.user.nombre || "Estudiante";

  if (receptorEmail) {
    await sendMatchConnectionRequest(receptorEmail, receptorNombre, emisorNombre);
  }

  revalidatePath("/mis-matches");
  return updated;
}

export async function aceptarMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const userId = session.user.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true, estado: true, estudiante_id: true, exalumno_id: true, initiated_by: true,
      estudiante: { select: { user: { select: { nombre: true, email: true } } } },
      exalumno: { select: { user: { select: { nombre: true, email: true } } } },
    },
  });
  if (!match) throw new Error("Match no encontrado");
  if (match.estado !== "CONTACTADO") throw new Error("El match no está en estado contactado");
  if (match.initiated_by === userId) throw new Error("No puedes aceptar tu propia solicitud");

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { estado: "ACTIVO", accepted_at: new Date() },
  });

  const estudianteEmail = match.estudiante.user.email;
  const estudianteNombre = match.estudiante.user.nombre || "Estudiante";
  const exalumnoNombre = match.exalumno.user.nombre || "Exalumno";

  if (estudianteEmail) {
    await sendMatchAceptado(estudianteEmail, estudianteNombre, exalumnoNombre);
  }
  await sendAdminNewActiveMatch(ADMIN_EMAIL, estudianteNombre, exalumnoNombre);

  revalidatePath("/mis-matches");
  return updated;
}

export async function rechazarMatch(matchId: string, rejectedBy: "estudiante" | "exalumno") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const userId = session.user.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true, estado: true, estudiante_id: true, exalumno_id: true, initiated_by: true,
      estudiante: { select: { user: { select: { nombre: true, email: true } } } },
      exalumno: { select: { user: { select: { nombre: true, email: true } } } },
    },
  });
  if (!match) throw new Error("Match no encontrado");
  if (match.estado !== "CONTACTADO") throw new Error("El match no está en estado contactado");
  if (match.initiated_by === userId) throw new Error("No puedes rechazar tu propia solicitud");

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { estado: "CERRADO", rejected_at: new Date() },
  });

  const initiatorId = match.initiated_by;
  const isStudentInitiated = initiatorId === match.estudiante_id;
  const emisorEmail = isStudentInitiated
    ? match.estudiante.user.email
    : match.exalumno.user.email;
  const emisorNombre = isStudentInitiated
    ? match.estudiante.user.nombre || "Estudiante"
    : match.exalumno.user.nombre || "Exalumno";

  if (emisorEmail) {
    await sendMatchRechazado(emisorEmail, emisorNombre);
  }

  revalidatePath("/mis-matches");
  return updated;
}

export async function cerrarMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Match no encontrado");
  if (match.estado !== "ACTIVO") throw new Error("Solo puedes cerrar matches activos");
  if (match.estudiante_id !== session.user.id && match.exalumno_id !== session.user.id) {
    throw new Error("No autorizado");
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { estado: "CERRADO", closed_at: new Date() },
  });

  revalidatePath("/mis-matches");
  return updated;
}

/**
 * Ofrecer Apoyo — el EXALUMNO inicia la conexión desde el directorio de estudiantes.
 * Previene duplicados y bloquea si el exalumno fue rechazado previamente por el estudiante.
 */
export async function ofrecerApoyo(estudianteId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const exalumnoId = session.user.id;

  // Block if previously rejected by student (rejected_at set + initiated by alumni)
  const previousRejection = await prisma.match.findFirst({
    where: {
      estudiante_id: estudianteId,
      exalumno_id: exalumnoId,
      estado: "CERRADO",
      rejected_at: { not: null },
      initiated_by: exalumnoId,
    },
  });
  if (previousRejection) {
    throw new Error("Este estudiante ya rechazó previamente tu solicitud de conexión.");
  }

  // Return existing open match (or stop if one exists)
  const existing = await prisma.match.findFirst({
    where: { estudiante_id: estudianteId, exalumno_id: exalumnoId },
  });
  if (existing && existing.estado !== "CERRADO") {
    return { success: true, matchId: existing.id };
  }
  // CERRADO match exists → will re-open via upsert below (fall through)

  // Compute affinity score using only existing DB columns
  const [estudianteData, exalumnoData] = await Promise.all([
    prisma.estudiante.findUnique({
      where: { user_id: estudianteId },
      select: {
        carrera: true, proyecto_tipo: true,
        busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
      },
    }),
    prisma.exalumno.findUnique({
      where: { user_id: exalumnoId },
      select: {
        escuela_facultad: true,
        ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
        ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
        ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
      },
    }),
  ]);

  const { score, reasons, breakdown } = calcularAfinidad(
    {
      carrera: estudianteData?.carrera,
      apoyoBuscado: toApoyoBuscado(estudianteData ?? {}),
      areaProyecto: estudianteData?.proyecto_tipo ?? null,
      areasInteres: [],
    },
    {
      carrera: exalumnoData?.escuela_facultad ?? null,
      sector: null,
      apoyoOfrecido: toApoyoOfrecido(exalumnoData ?? {}),
      areasInteres: [],
    }
  );

  const tipoApoyo = `C:${breakdown.carrera},I:${breakdown.intereses},A:${breakdown.sector},S:${breakdown.apoyo}`;

  const matchData = {
    estado:       "CONTACTADO" as const,
    score_match:  score,
    tipo_apoyo:   tipoApoyo,
    match_reasons: reasons,
    initiated_by: exalumnoId,
    rejected_at:  null,
    accepted_at:  null,
    closed_at:    null,
  };

  const match = await prisma.match.upsert({
    where: { estudiante_id_exalumno_id: { estudiante_id: estudianteId, exalumno_id: exalumnoId } },
    create: { estudiante_id: estudianteId, exalumno_id: exalumnoId, ...matchData },
    update: matchData,
  });

  // Notify student
  const [estudianteUser, exalumnoUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: estudianteId }, select: { nombre: true, email: true } }),
    prisma.user.findUnique({ where: { id: exalumnoId }, select: { nombre: true } }),
  ]);

  if (estudianteUser?.email) {
    await sendMatchConnectionRequest(
      estudianteUser.email,
      estudianteUser.nombre || "Estudiante",
      exalumnoUser?.nombre || "Exalumno"
    );
  }

  revalidatePath("/directorio/estudiantes");
  revalidatePath("/mis-matches");
  return { success: true, matchId: match.id };
}

/**
 * Genera sugerencias de match para un estudiante contra todos los exalumnos activos visibles.
 * Se llama automáticamente al completar el perfil del estudiante.
 */
export async function generarSugerenciasParaEstudiante(estudianteId: string) {
  const estudianteData = await prisma.estudiante.findUnique({
    where: { user_id: estudianteId },
    select: {
      carrera: true, proyecto_tipo: true,
      busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
    },
  });
  if (!estudianteData) return [];

  // Solo columnas existentes en BD (sin visible_en_directorio, status)
  const exalumnos = await prisma.exalumno.findMany({
    where: {
      escuela_facultad: { not: null },
      empresa_actual: { not: null },
      user: { status: { not: "SUSPENDIDO" as const } },
    },
    select: {
      user_id: true,
      escuela_facultad: true,
      ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
      ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
      ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
    },
  });

  const estCompat = {
    carrera: estudianteData.carrera,
    apoyoBuscado: toApoyoBuscado(estudianteData),
    areaProyecto: estudianteData.proyecto_tipo ?? null,
    areasInteres: [],
  };

  const results = await Promise.allSettled(
    exalumnos.map(async (exa) => {
      // Don't suggest if previously rejected
      const rejected = await prisma.match.findFirst({
        where: { estudiante_id: estudianteId, exalumno_id: exa.user_id, estado: "CERRADO", rejected_at: { not: null } },
      });
      if (rejected) return null;

      const { score, reasons, breakdown } = calcularAfinidad(estCompat, {
        carrera: exa.escuela_facultad ?? null,
        sector: null,
        apoyoOfrecido: toApoyoOfrecido(exa),
        areasInteres: [],
      });

      if (score === 0) return null;

      const tipoApoyo = `C:${breakdown.carrera},I:${breakdown.intereses},A:${breakdown.sector},S:${breakdown.apoyo}`;

      return prisma.match.upsert({
        where: { estudiante_id_exalumno_id: { estudiante_id: estudianteId, exalumno_id: exa.user_id } },
        create: {
          estudiante_id: estudianteId,
          exalumno_id: exa.user_id,
          estado: "SUGERIDO",
          score_match: score,
          tipo_apoyo: tipoApoyo,
          match_reasons: reasons,
        },
        update: { score_match: score, tipo_apoyo: tipoApoyo, match_reasons: reasons },
      });
    })
  );

  revalidatePath("/mis-matches");
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
