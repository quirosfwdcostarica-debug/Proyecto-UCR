"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to send connection email via EmailJS (matching backend implementation)
async function sendConnectionEmail(email: string, receptorNombre: string, emisorNombre: string) {
  const SERVICE_ID = process.env.NEXT_PUBLIC_MENTOR_EMAILJS_SERVICE_ID || "service_d5bz6g6";
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_MENTOR_EMAILJS_TEMPLATE_ID || "template_hih689c";
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_MENTOR_EMAILJS_PUBLIC_KEY || "aHutWhaN4ipX-uMVq";

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          email,
          name: receptorNombre,
          nombre_emisor: emisorNombre,
        },
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Error sending connection email:", error);
    return false;
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MatchStatus = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

// ─── Cálculo de afinidad ──────────────────────────────────────────────────────

export async function calculateAfinidad(estudianteId: string, exalumnoId: string) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId } });
  const exalumno   = await prisma.exalumno.findUnique({ where: { id: exalumnoId } });

  if (!estudiante || !exalumno) throw new Error("Perfiles no encontrados");

  let score = 0;

  // +30: misma carrera
  if (estudiante.carrera.trim().toLowerCase() === exalumno.carrera.trim().toLowerCase()) score += 30;

  // +30: área de proyecto en intereses del exalumno
  if (estudiante.areaProyecto && exalumno.areasInteres.includes(estudiante.areaProyecto)) score += 30;

  // +20: sector vs área proyecto
  if (estudiante.areaProyecto && exalumno.sector.toLowerCase().includes(estudiante.areaProyecto.split(" ")[0].toLowerCase())) {
    score += 20;
  } else if (score < 50) {
    score += 10;
  }

  // +20: tipo de apoyo en común
  const apoyosEnComun = estudiante.apoyoBuscado.filter(a => exalumno.apoyoOfrecido.includes(a));
  if (apoyosEnComun.length > 0) {
    score += Math.floor(20 * (apoyosEnComun.length / Math.max(estudiante.apoyoBuscado.length, 1)));
  }

  const afinidad = Math.min(score, 100);

  const match = await prisma.match.upsert({
    where:  { estudianteId_exalumnoId: { estudianteId, exalumnoId } },
    update: { afinidad },
    create: { estudianteId, exalumnoId, afinidad, status: "SUGERIDO" },
  });

  return match;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Matches del estudiante autenticado, ordenados por afinidad */
export async function getMatchesForEstudiante(estudianteId?: string) {
  const session = await auth();
  const id = estudianteId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  return prisma.match.findMany({
    where:   { estudianteId: id },
    include: { exalumno: { include: { user: true } } },
    orderBy: { afinidad: "desc" },
  });
}

/** Matches del exalumno autenticado */
export async function getMatchesForExalumno(exalumnoId?: string) {
  const session = await auth();
  const id = exalumnoId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  return prisma.match.findMany({
    where:   { exalumnoId: id },
    include: { estudiante: { include: { user: true } } },
    orderBy: { afinidad: "desc" },
  });
}

// ─── Transiciones de estado ───────────────────────────────────────────────────

/**
 * SUGERIDO → CONTACTADO
 * Lo ejecuta el ESTUDIANTE cuando hace clic en "Contactar".
 */
export async function contactarMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match)                       throw new Error("Match no encontrado");
  if (match.status !== "SUGERIDO")  throw new Error(`No se puede contactar un match en estado ${match.status}`);

  const updated = await prisma.match.update({
    where: { id: matchId },
    data:  { status: "CONTACTADO" },
  });

  // Get profiles from USERS table
  const [estudianteUser, exalumnoUser] = await Promise.all([
    prisma.$queryRaw<any[]>`SELECT nombre FROM "USERS" WHERE id = ${match.estudianteId}::uuid`,
    prisma.$queryRaw<any[]>`SELECT nombre, email FROM "USERS" WHERE id = ${match.exalumnoId}::uuid`
  ]);

  const estudianteNombre = estudianteUser[0]?.nombre || "Un estudiante";
  const exalumnoNombre = exalumnoUser[0]?.nombre || "Exalumno";
  const exalumnoEmail = exalumnoUser[0]?.email;

  // Insert notification for the Exalumno
  await prisma.$executeRaw`
    INSERT INTO "NOTIFICATIONS" (id, user_id, title, message, type, read, created_at, updated_at)
    VALUES (gen_random_uuid(), ${match.exalumnoId}::uuid, 'Nueva solicitud de contacto', ${`${estudianteNombre} quiere contactar contigo para solicitar apoyo.`}, 'match_request', false, NOW(), NOW())
  `;

  // Send connection email to the Exalumno
  if (exalumnoEmail) {
    await sendConnectionEmail(exalumnoEmail, exalumnoNombre, estudianteNombre);
  }

  revalidatePath("/mis-matches");
  return updated;
}

/**
 * CONTACTADO → ACTIVO
 * Lo ejecuta el EXALUMNO cuando acepta el contacto.
 */
export async function aceptarMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match)                         throw new Error("Match no encontrado");
  if (match.status !== "CONTACTADO")  throw new Error(`No se puede activar un match en estado ${match.status}`);

  const updated = await prisma.match.update({
    where: { id: matchId },
    data:  { status: "ACTIVO" },
  });

  // Get exalumno name from USERS table
  const [exalumnoUser] = await prisma.$queryRaw<any[]>`SELECT nombre FROM "USERS" WHERE id = ${match.exalumnoId}::uuid`;
  const exalumnoNombre = exalumnoUser[0]?.nombre || "Un exalumno";

  // Insert notification for the Estudiante
  await prisma.$executeRaw`
    INSERT INTO "NOTIFICATIONS" (id, user_id, title, message, type, read, created_at, updated_at)
    VALUES (gen_random_uuid(), ${match.estudianteId}::uuid, 'Contacto aceptado', ${`${exalumnoNombre} ha aceptado tu solicitud de contacto.`}, 'match_accepted', false, NOW(), NOW())
  `;

  revalidatePath("/mis-matches");
  revalidatePath("/mis-matches/exalumno");
  return updated;
}

/**
 * Ofrecer Apoyo (lo ejecuta el EXALUMNO en el directorio de estudiantes)
 */
export async function ofrecerApoyo(estudianteId: string) {
  const session = await auth();
  const exalumnoId = session?.user?.id;

  if (!exalumnoId) {
    throw new Error("No estás autenticado.");
  }

  // Get names and emails from USERS table
  const [estudianteUser, exalumnoUser] = await Promise.all([
    prisma.$queryRaw<any[]>`SELECT nombre, email FROM "USERS" WHERE id = ${estudianteId}::uuid`,
    prisma.$queryRaw<any[]>`SELECT nombre FROM "USERS" WHERE id = ${exalumnoId}::uuid`
  ]);

  const estudianteNombre = estudianteUser[0]?.nombre || "Estudiante";
  const estudianteEmail = estudianteUser[0]?.email;
  const exalumnoNombre = exalumnoUser[0]?.nombre || "Un exalumno";

  // Create or update match status to CONTACTADO
  const existingMatch = await prisma.match.findUnique({
    where: { estudianteId_exalumnoId: { estudianteId, exalumnoId } }
  });

  if (existingMatch) {
    await prisma.match.update({
      where: { id: existingMatch.id },
      data: { status: "CONTACTADO" }
    });
  } else {
    await prisma.match.create({
      data: {
        estudianteId,
        exalumnoId,
        afinidad: 85, // Default affinity for manual offer
        status: "CONTACTADO"
      }
    });
  }

  // Insert notification for the Estudiante
  await prisma.$executeRaw`
    INSERT INTO "NOTIFICATIONS" (id, user_id, title, message, type, read, created_at, updated_at)
    VALUES (gen_random_uuid(), ${estudianteId}::uuid, 'Oferta de apoyo recibida', ${`${exalumnoNombre} te ha ofrecido apoyo para tu proyecto.`}, 'match_request', false, NOW(), NOW())
  `;

  // Send connection email to the Estudiante (student is the receptor, exalumno is the emisor)
  if (estudianteEmail) {
    await sendConnectionEmail(estudianteEmail, estudianteNombre, exalumnoNombre);
  }

  revalidatePath("/directorio/estudiantes");
  revalidatePath("/mis-matches");
  return { success: true };
}

/**
 * ACTIVO → CERRADO
 * Lo puede ejecutar cualquiera de los dos participantes.
 */
export async function cerrarMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match)                    throw new Error("Match no encontrado");
  if (match.status !== "ACTIVO") throw new Error(`Solo se puede cerrar un match ACTIVO (estado actual: ${match.status})`);

  const updated = await prisma.match.update({
    where: { id: matchId },
    data:  { status: "CERRADO" },
  });

  revalidatePath("/mis-matches");
  revalidatePath("/mis-matches/exalumno");
  return updated;
}

/**
 * Genera sugerencias de match para un estudiante contra todos los exalumnos activos.
 * Crea o actualiza el registro Match con status SUGERIDO si aún no existe.
 */
export async function generarSugerenciasParaEstudiante(estudianteId: string) {
  const exalumnos = await prisma.exalumno.findMany({
    include: { user: { select: { status: true } } },
  });

  const activos = exalumnos.filter(e => e.user.status === "ACTIVO");
  const results = await Promise.all(activos.map(e => calculateAfinidad(estudianteId, e.id)));

  revalidatePath("/mis-matches");
  return results;
}
