"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { userProfileUpdateSchema, type UserProfileUpdateValues } from "@/lib/validations/profile";
import { generarSugerenciasParaEstudiante } from "@/actions/matching.actions";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcExalumnoPerfil(ex: any): boolean {
  return !!(
    ex?.carrera &&
    ex?.anio_graduacion &&
    ex?.empresa_actual &&
    ex?.cargo_actual &&
    (ex?.ofrece_mentoria || ex?.ofrece_empleo || ex?.ofrece_pasantia ||
      ex?.ofrece_proyecto || ex?.ofrece_donacion_dinero || ex?.ofrece_guest_speaking ||
      ex?.ofrece_volunteering || ex?.ofrece_career_advice || ex?.ofrece_networking)
  );
}

function calcEstudianteVisible(u: any, est: any): boolean {
  return !!(
    u?.nombre &&
    est?.carnet_ucr &&
    est?.carrera &&
    est?.sede &&
    est?.proyecto_titulo &&
    est?.area_tematica &&
    (est?.busca_financiamiento || est?.busca_mentoria || est?.busca_empleo || est?.busca_pasantia)
  );
}

// ─── GET perfil del usuario autenticado ───────────────────────────────────────

// Selects explícitos con solo columnas que existen en la BD (sin migration pendiente)
const EXALUMNO_DB_SELECT = {
  user_id: true, carnet_ucr: true, escuela_facultad: true,
  anio_graduacion: true, empresa_actual: true, cargo_actual: true,
  pais_ciudad: true, anios_experiencia: true, linkedin_url: true,
  biografia: true, github_url: true, website_url: true,
  habilidades: true, certificaciones: true, experiencia_laboral: true,
  ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
  ofrece_proyecto: true, ofrece_donacion_dinero: true,
  ofrece_guest_speaking: true, ofrece_volunteering: true,
  ofrece_career_advice: true, ofrece_networking: true,
} as const;

const ESTUDIANTE_DB_SELECT = {
  user_id: true, carnet_ucr: true, carrera: true, escuela_facultad: true,
  sede: true, anio_ingreso: true, nivel_academico: true, promedio_ponderado: true,
  nivel_beca: true,
  proyecto_titulo: true, proyecto_tipo: true,
  busca_financiamiento: true, busca_mentoria: true,
  busca_empleo: true, busca_pasantia: true,
} as const;

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const rawUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, nombre: true, tipo: true, email_verified: true,
      foto_url: true, activo: true, reportes_recibidos: true,
      cedula: true, fecha_nacimiento: true, genero: true,
      exalumno: { select: EXALUMNO_DB_SELECT },
      estudiante: { select: ESTUDIANTE_DB_SELECT },
    },
  });
  const user = rawUser as any;

  if (!user) throw new Error("Usuario no encontrado.");

  const ex = user.exalumno;
  const est = user.estudiante;

  return {
    id: user.id,
    name: user.nombre,
    email: user.email,
    image: user.foto_url ?? "",
    tipo: user.tipo,
    bio: ex?.biografia ?? est ? "" : "",
    fecha_nacimiento: user.fecha_nacimiento
      ? user.fecha_nacimiento.toISOString().split("T")[0]
      : "",
    genero: user.genero ?? "",
    socialLinks: {
      linkedin: ex?.linkedin_url ?? "",
      github: ex?.github_url ?? "",
      twitter: "",
      website: ex?.website_url ?? "",
    },

    // Estudiante (nivel_beca es privado: solo el propio estudiante lo ve)
    nivel_beca: est?.nivel_beca ?? "",
    carnet_ucr: est?.carnet_ucr ?? "",
    carrera: est?.carrera ?? ex?.carrera ?? "",
    escuela_facultad: est?.escuela_facultad ?? ex?.escuela_facultad ?? "",
    sede: est?.sede ?? "",
    anio_ingreso: est?.anio_ingreso ?? "",
    nivel_academico: est?.nivel_academico ?? "",
    promedio_ponderado: est?.promedio_ponderado ? Number(est.promedio_ponderado) : "",
    proyecto_titulo: est?.proyecto_titulo ?? "",
    proyecto_tipo: est?.proyecto_tipo ?? "",
    proyecto_descripcion: est?.proyecto_descripcion ?? "",
    proyecto_necesidades: est?.proyecto_necesidades ?? [],
    proyecto_porcentaje_avance: est?.proyecto_porcentaje_avance ?? 0,
    area_tematica: est?.area_tematica ?? "",
    areas_interes: est?.areas_interes ?? [],
    habilidades: est?.habilidades ?? ex?.habilidades ?? [],
    busca_financiamiento: !!est?.busca_financiamiento,
    busca_mentoria: !!est?.busca_mentoria,
    busca_empleo: !!est?.busca_empleo,
    busca_pasantia: !!est?.busca_pasantia,
    perfil_pausado: est?.activo === false,
    visible_en_directorio: !!est?.visible_en_directorio,

    // Exalumno
    anio_graduacion: ex?.anio_graduacion ?? "",
    empresa_actual: ex?.empresa_actual ?? "",
    cargo_actual: ex?.cargo_actual ?? "",
    sector: ex?.sector ?? "",
    pais_ciudad: ex?.pais_ciudad ?? "",
    anios_experiencia: ex?.anios_experiencia ?? "",
    linkedin_url: ex?.linkedin_url ?? "",
    biografia: ex?.biografia ?? "",
    ofrece_mentoria: !!ex?.ofrece_mentoria,
    ofrece_empleo: !!ex?.ofrece_empleo,
    ofrece_pasantia: !!ex?.ofrece_pasantia,
    ofrece_proyecto: !!ex?.ofrece_proyecto,
    ofrece_donacion_dinero: !!ex?.ofrece_donacion_dinero,
    ofrece_guest_speaking: !!ex?.ofrece_guest_speaking,
    ofrece_volunteering: !!ex?.ofrece_volunteering,
    ofrece_career_advice: !!ex?.ofrece_career_advice,
    ofrece_networking: !!ex?.ofrece_networking,
    perfil_completo: !!ex?.perfil_completo,
  };
}

// ─── GET perfil público por ID ────────────────────────────────────────────────

export async function getPublicProfile(userId: string) {
  const rawUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, nombre: true, foto_url: true, tipo: true, activo: true,
      status: true,
      exalumno: { select: EXALUMNO_DB_SELECT },
      estudiante: { select: ESTUDIANTE_DB_SELECT },
    },
  });
  const user = rawUser as any;

  if (!user || user.status === "SUSPENDIDO") return null;

  const ex = user.exalumno;
  const est = user.estudiante;

  // Solo exponer datos públicos
  return {
    id: user.id,
    nombre: user.nombre,
    foto_url: user.foto_url,
    tipo: user.tipo,
    // Exalumno público
    carrera: ex?.carrera ?? est?.carrera ?? null,
    empresa_actual: ex?.empresa_actual ?? null,
    cargo_actual: ex?.cargo_actual ?? null,
    sector: ex?.sector ?? null,
    pais_ciudad: ex?.pais_ciudad ?? null,
    anios_experiencia: ex?.anios_experiencia ?? null,
    anio_graduacion: ex?.anio_graduacion ?? null,
    escuela_facultad: ex?.escuela_facultad ?? est?.escuela_facultad ?? null,
    linkedin_url: ex?.linkedin_url ?? null,
    github_url: ex?.github_url ?? null,
    website_url: ex?.website_url ?? null,
    biografia: ex?.biografia ?? null,
    habilidades: ex?.habilidades ?? est?.habilidades ?? null,
    certificaciones: ex?.certificaciones ?? null,
    experiencia_laboral: ex?.experiencia_laboral ?? null,
    areas_interes: ex?.areas_interes ?? est?.areas_interes ?? null,
    ofrece_mentoria: !!ex?.ofrece_mentoria,
    ofrece_empleo: !!ex?.ofrece_empleo,
    ofrece_pasantia: !!ex?.ofrece_pasantia,
    ofrece_proyecto: !!ex?.ofrece_proyecto,
    ofrece_donacion_dinero: !!ex?.ofrece_donacion_dinero,
    ofrece_guest_speaking: !!ex?.ofrece_guest_speaking,
    ofrece_volunteering: !!ex?.ofrece_volunteering,
    ofrece_career_advice: !!ex?.ofrece_career_advice,
    ofrece_networking: !!ex?.ofrece_networking,
    // Estudiante público (sin datos privados)
    area_tematica: est?.area_tematica ?? null,
    proyecto_titulo: est?.proyecto_titulo ?? null,
    proyecto_tipo: est?.proyecto_tipo ?? null,
    proyecto_descripcion: est?.proyecto_descripcion ?? null,
    proyecto_porcentaje_avance: est?.proyecto_porcentaje_avance ?? null,
    busca_financiamiento: !!est?.busca_financiamiento,
    busca_mentoria: !!est?.busca_mentoria,
    busca_empleo: !!est?.busca_empleo,
    busca_pasantia: !!est?.busca_pasantia,
    visible_en_directorio: !!(ex?.visible_en_directorio ?? est?.visible_en_directorio),
  };
}

// ─── UPDATE perfil del usuario autenticado ────────────────────────────────────

// Formato carné UCR: letra opcional + 5-9 dígitos (ej. A12345, B123456, 12345678)
const CARNE_UCR_REGEX = /^[A-Za-z]?\d{5,9}$/;

export async function updateUserProfile(data: UserProfileUpdateValues) {
  const parsed = userProfileUpdateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Datos de perfil inválidos.");

  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const userId = session.user.id;
  const tipo = ((session.user as any).tipo as string)?.toUpperCase();
  const d = parsed.data;

  // Validar formato de carné UCR (T-11)
  if (d.carnet_ucr && !CARNE_UCR_REGEX.test(d.carnet_ucr.trim())) {
    throw new Error("El carné UCR tiene un formato inválido. Ejemplo válido: A12345 o 123456.");
  }

  // 1. Actualizar tabla USERS
  await prisma.user.update({
    where: { id: userId },
    data: {
      nombre: d.name,
      foto_url: d.image || null,
      fecha_nacimiento: d.fecha_nacimiento ? new Date(d.fecha_nacimiento) : null,
      genero: d.genero || null,
    },
  });

  let proyectoCompleto = false;

  if (tipo === "EXALUMNO") {
    const exBase = {
      carnet_ucr:           d.carnet_ucr || null,
      escuela_facultad:     d.escuela_facultad || null,
      anio_graduacion:      d.anio_graduacion ? Number(d.anio_graduacion) : null,
      empresa_actual:       d.empresa_actual || null,
      cargo_actual:         d.cargo_actual || null,
      pais_ciudad:          d.pais_ciudad || null,
      anios_experiencia:    d.anios_experiencia ? Number(d.anios_experiencia) : null,
      linkedin_url:         d.linkedin_url || d.socialLinks?.linkedin || null,
      github_url:           d.socialLinks?.github || null,
      website_url:          d.socialLinks?.website || null,
      biografia:            (d as any).biografia || d.bio || null,
      ofrece_mentoria:      !!d.ofrece_mentoria,
      ofrece_empleo:        !!d.ofrece_empleo,
      ofrece_pasantia:      !!d.ofrece_pasantia,
      ofrece_proyecto:      !!d.ofrece_proyecto,
      ofrece_donacion_dinero: !!d.ofrece_donacion_dinero,
      ofrece_guest_speaking:  !!d.ofrece_guest_speaking,
      ofrece_volunteering:    !!d.ofrece_volunteering,
      ofrece_career_advice:   !!d.ofrece_career_advice,
      ofrece_networking:      !!d.ofrece_networking,
    };

    await prisma.exalumno.upsert({
      where:  { user_id: userId },
      create: { user_id: userId, ...exBase },
      update: exBase,
    });
  }

  if (tipo === "ESTUDIANTE") {
    const estBase = {
      nivel_beca:           (d as any).nivel_beca || null,
      carnet_ucr:           d.carnet_ucr?.trim() || null,
      carrera:              (d as any).carrera || null,
      escuela_facultad:     d.escuela_facultad || null,
      sede:                 d.sede || null,
      anio_ingreso:         d.anio_ingreso ? Number(d.anio_ingreso) : null,
      nivel_academico:      d.nivel_academico || null,
      promedio_ponderado:   d.promedio_ponderado ? new Decimal(d.promedio_ponderado) : null,
      proyecto_titulo:      d.proyecto_titulo || null,
      proyecto_tipo:        d.proyecto_tipo || null,
      busca_financiamiento: !!d.busca_financiamiento,
      busca_mentoria:       !!d.busca_mentoria,
      busca_empleo:         !!d.busca_empleo,
      busca_pasantia:       !!d.busca_pasantia,
    };

    await prisma.estudiante.upsert({
      where:  { user_id: userId },
      create: { user_id: userId, ...estBase },
      update: estBase,
    });

    try {
      await generarSugerenciasParaEstudiante(userId);
    } catch (e) {
      console.error("[updateUserProfile] Falló la generación de sugerencias de match:", e);
    }
  }

  revalidatePath("/perfil/editar");
  revalidatePath("/directorio/estudiantes");
  revalidatePath("/directorio/exalumnos");

  return { success: true, proyectoCompleto: false };
}
