import { z } from "zod";
import { CATALOGO_AREAS, SECTORES, TIPOS_APOYO } from "../constants";

export const estudianteProfileSchema = z.object({
  carrera: z.string().min(2, "La carrera es obligatoria y debe ser válida."),
  avanceProyecto: z.number().min(0).max(100, "El avance debe ser entre 0 y 100%."),
  areaProyecto: z.enum(CATALOGO_AREAS).optional(),
  apoyoBuscado: z.array(z.enum(TIPOS_APOYO)).min(1, "Debes seleccionar al menos un tipo de apoyo buscado."),
  // nivelBeca es estrictamente privado y puede o no enviarse desde el UI, 
  // usualmente se valida internamente o como opcional en el formulario público.
  nivelBeca: z.string().optional(),
});

export const exalumnoProfileSchema = z.object({
  carrera: z.string().min(2, "La carrera es obligatoria."),
  sector: z.enum(SECTORES),
  areasInteres: z.array(z.enum(CATALOGO_AREAS)).min(1, "Debes seleccionar al menos un área de interés."),
  apoyoOfrecido: z.array(z.enum(TIPOS_APOYO)).min(1, "Debes seleccionar al menos un tipo de apoyo que ofreces."),
});

export type EstudianteProfileFormValues = z.infer<typeof estudianteProfileSchema>;
export type ExalumnoProfileFormValues = z.infer<typeof exalumnoProfileSchema>;

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Correo electrónico inválido."),
  phone: z.string().optional(),
  image: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "La biografía no puede exceder 500 caracteres.").optional(),
  socialLinks: z.object({
    linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
    twitter: z.string().url("URL inválida").optional().or(z.literal("")),
    github: z.string().url("URL inválida").optional().or(z.literal("")),
    website: z.string().url("URL inválida").optional().or(z.literal(""))
  }).optional(),
  
  fecha_nacimiento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  
  // Student fields
  nivel_beca: z.string().optional().nullable(),
  carnet_ucr: z.string().optional().nullable(),
  carrera: z.string().optional().nullable(),
  escuela_facultad: z.string().optional().nullable(),
  sede: z.string().optional().nullable(),
  anio_ingreso: z.coerce.number().optional().nullable(),
  nivel_academico: z.string().optional().nullable(),
  promedio_ponderado: z.coerce.number().optional().nullable(),
  proyecto_titulo: z.string().optional().nullable(),
  proyecto_tipo: z.string().optional().nullable(),
  proyecto_descripcion: z.string().max(1000).optional().nullable(),
  proyecto_necesidades: z.array(z.string()).optional().nullable(),
  proyecto_porcentaje_avance: z.coerce.number().min(0).max(100).optional().nullable(),
  area_tematica: z.string().optional().nullable(),
  areas_interes: z.array(z.string()).optional().nullable(),
  habilidades: z.any().optional().nullable(),
  soft_skills: z.array(z.string()).optional().nullable(),
  idiomas: z.array(z.object({ idioma: z.string(), nivel: z.string() })).optional().nullable(),
  busca_financiamiento: z.boolean().optional(),
  busca_mentoria: z.boolean().optional(),
  busca_empleo: z.boolean().optional(),
  busca_pasantia: z.boolean().optional(),

  // Exalumni fields
  anio_graduacion: z.coerce.number().optional().nullable(),
  empresa_actual: z.string().optional().nullable(),
  cargo_actual: z.string().optional().nullable(),
  sector: z.string().optional().nullable(),
  pais_ciudad: z.string().optional().nullable(),
  anios_experiencia: z.coerce.number().optional().nullable(),
  linkedin_url: z.string().optional().nullable(),
  biografia: z.string().max(1000).optional().nullable(),
  ofrece_mentoria: z.boolean().optional(),
  ofrece_empleo: z.boolean().optional(),
  ofrece_pasantia: z.boolean().optional(),
  ofrece_proyecto: z.boolean().optional(),
  ofrece_donacion_dinero: z.boolean().optional(),
  ofrece_guest_speaking: z.boolean().optional(),
  ofrece_volunteering: z.boolean().optional(),
  ofrece_career_advice: z.boolean().optional(),
  ofrece_networking: z.boolean().optional(),
  // Pausar perfil (estudiante) — activo = !perfil_pausado
  perfil_pausado: z.boolean().optional(),
});

export type UserProfileUpdateValues = z.infer<typeof userProfileUpdateSchema>;
