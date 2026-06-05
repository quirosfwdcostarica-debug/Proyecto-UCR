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
