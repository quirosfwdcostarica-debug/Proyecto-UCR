"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Helper to send connection email via EmailJS
async function sendConnectionEmail(email: string, receptorNombre: string, emisorNombre: string) {
  const SERVICE_ID = process.env.NEXT_PUBLIC_MENTOR_EMAILJS_SERVICE_ID || "service_d5bz6g6";
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_MENTOR_EMAILJS_TEMPLATE_ID || "template_hih689c";
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_MENTOR_EMAILJS_PUBLIC_KEY || "aHutWhaN4ipX-uMVq";

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: { email, name: receptorNombre, nombre_emisor: emisorNombre },
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Error sending connection email:", error);
    return false;
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MatchEstado = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

// ─── Cálculo de afinidad ──────────────────────────────────────────────────────

export async function calculateAfinidad(estudianteId: string, exalumnoId: string) {
  try {
    const [estudianteRes, exalumnoRes] = await Promise.all([
      fetch(`${API_URL}/estudiantes/${estudianteId}`, { cache: "no-store" }),
      fetch(`${API_URL}/exalumnos/${exalumnoId}`, { cache: "no-store" }),
    ]);

    if (!estudianteRes.ok || !exalumnoRes.ok) throw new Error("Perfiles no encontrados");

    const estudiante = await estudianteRes.json();
    const exalumno = await exalumnoRes.json();

    // 1. Misma carrera UCR (30 pts)
    let scoreCarrera = 0;
    if (
      estudiante.carrera &&
      exalumno.escuela_facultad &&
      estudiante.carrera.trim().toLowerCase() === exalumno.escuela_facultad.trim().toLowerCase()
    ) scoreCarrera = 30;

    // 2. Áreas de interés en común (30 pts, proporcional)
    const apoyoBuscado: string[] = [];
    if (estudiante.busca_mentoria)       apoyoBuscado.push("mentoria");
    if (estudiante.busca_empleo)         apoyoBuscado.push("empleo");
    if (estudiante.busca_pasantia)       apoyoBuscado.push("pasantia");
    if (estudiante.busca_financiamiento) apoyoBuscado.push("financiamiento");

    const apoyoOfrecido: string[] = [];
    if (exalumno.ofrece_mentoria)        apoyoOfrecido.push("mentoria");
    if (exalumno.ofrece_empleo)          apoyoOfrecido.push("empleo");
    if (exalumno.ofrece_pasantia)        apoyoOfrecido.push("pasantia");
    if (exalumno.ofrece_donacion_dinero) apoyoOfrecido.push("financiamiento");

    const apoyosEnComun = apoyoBuscado.filter(a => apoyoOfrecido.includes(a));
    let scoreIntereses = 0;
    if (apoyoBuscado.length > 0) {
      scoreIntereses = Math.round(30 * apoyosEnComun.length / apoyoBuscado.length);
    }

    // 3. Sector exalumno ↔ área temática del proyecto (20 pts)
    let scoreArea = 0;
    if (exalumno.escuela_facultad && estudiante.proyecto_tipo) {
      const sector = exalumno.escuela_facultad.trim().toLowerCase();
      const area   = estudiante.proyecto_tipo.trim().toLowerCase();
      if (sector === area || sector.includes(area) || area.includes(sector)) {
        scoreArea = 20;
      }
    }

    // 4. Tipo de apoyo ofrecido ↔ buscado: al menos 1 coincidencia = 20 pts (flat)
    const scoreApoyo = apoyosEnComun.length > 0 ? 20 : 0;

    const scoreMatch = Math.min(scoreCarrera + scoreIntereses + scoreArea + scoreApoyo, 100);
    const tipoApoyo  = `C:${scoreCarrera},I:${scoreIntereses},A:${scoreArea},S:${scoreApoyo}`;

    // Crear o actualizar el match vía backend API
    const existing = await fetch(`${API_URL}/matches/estudiante/${estudianteId}`, { cache: "no-store" });
    const existingMatches = existing.ok ? await existing.json() : [];
    const existingMatch = existingMatches.find((m: any) => m.exalumno_id === exalumnoId);

    if (existingMatch) {
      const res = await fetch(`${API_URL}/matches/${existingMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score_match: scoreMatch, tipo_apoyo: tipoApoyo }),
      });
      return res.ok ? await res.json() : existingMatch;
    } else {
      const res = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudiante_id: estudianteId,
          exalumno_id: exalumnoId,
          score_match: scoreMatch,
          tipo_apoyo: tipoApoyo,
          estado: "SUGERIDO",
        }),
      });
      return res.ok ? await res.json() : null;
    }
  } catch (error) {
    console.error("Error calculating afinidad:", error);
    return null;
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Matches del estudiante autenticado, ordenados por score */
export async function getMatchesForEstudiante(estudianteId?: string) {
  const session = await auth();
  const id = estudianteId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/matches/estudiante/${id}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

/** Matches del exalumno autenticado */
export async function getMatchesForExalumno(exalumnoId?: string) {
  const session = await auth();
  const id = exalumnoId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/matches/exalumno/${id}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// ─── Transiciones de estado ───────────────────────────────────────────────────

/**
 * SUGERIDO → CONTACTADO
 * Lo ejecuta el ESTUDIANTE cuando hace clic en "Contactar".
 */
export async function contactarMatch(matchId: string) {
  const res = await fetch(`${API_URL}/matches/${matchId}/contactar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al contactar el match");
  }

  const updated = await res.json();

  // Notificaciones y email se manejan en el backend
  revalidatePath("/mis-matches");
  return updated;
}

/**
 * CONTACTADO → ACTIVO
 * Lo ejecuta el EXALUMNO cuando acepta el contacto.
 */
export async function aceptarMatch(matchId: string) {
  const res = await fetch(`${API_URL}/matches/${matchId}/aceptar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al aceptar el match");
  }

  const updated = await res.json();
  revalidatePath("/mis-matches");
  revalidatePath("/mis-matches/exalumno");
  return updated;
}

/**
 * Ofrecer Apoyo (lo ejecuta el EXALUMNO en el directorio de estudiantes).
 * El backend crea la notificación y envía el email al estudiante,
 * y verifica que el exalumno no haya sido rechazado previamente.
 */
export async function ofrecerApoyo(estudianteId: string) {
  const session = await auth();
  const exalumnoId = session?.user?.id;
  if (!exalumnoId) throw new Error("No estás autenticado.");

  const res = await fetch(`${API_URL}/matches/ofrecer-apoyo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estudianteId, exalumnoId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al ofrecer apoyo");
  }

  const match = await res.json();
  revalidatePath("/directorio/estudiantes");
  revalidatePath("/mis-matches/exalumno");
  return { success: true, matchId: match.id as string };
}

/**
 * CONTACTADO → CERRADO (rechazo)
 * rejectedBy: 'estudiante' cuando el estudiante rechaza una oferta del exalumno
 *             'exalumno' cuando el exalumno rechaza la solicitud del estudiante
 */
export async function rechazarMatch(matchId: string, rejectedBy: "estudiante" | "exalumno") {
  const res = await fetch(`${API_URL}/matches/${matchId}/rechazar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rejectedBy }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al rechazar el match");
  }

  const updated = await res.json();
  revalidatePath("/mis-matches");
  revalidatePath("/mis-matches/exalumno");
  return updated;
}

/**
 * ACTIVO → CERRADO
 * Lo puede ejecutar cualquiera de los dos participantes.
 */
export async function cerrarMatch(matchId: string) {
  const res = await fetch(`${API_URL}/matches/${matchId}/cerrar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al cerrar el match");
  }

  const updated = await res.json();
  revalidatePath("/mis-matches");
  revalidatePath("/mis-matches/exalumno");
  return updated;
}

/**
 * Genera sugerencias de match para un estudiante contra todos los exalumnos activos.
 */
export async function generarSugerenciasParaEstudiante(estudianteId: string) {
  const exalumnosRes = await fetch(`${API_URL}/exalumnos`, { cache: "no-store" });
  if (!exalumnosRes.ok) return [];
  const exalumnos = await exalumnosRes.json();

  const results = await Promise.all(
    exalumnos.map((e: any) => calculateAfinidad(estudianteId, e.user_id))
  );

  revalidatePath("/mis-matches");
  return results.filter(Boolean);
}
