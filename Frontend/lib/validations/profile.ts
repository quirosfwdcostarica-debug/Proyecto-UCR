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
  }).optional()
});

export type UserProfileUpdateValues = z.infer<typeof userProfileUpdateSchema>;
