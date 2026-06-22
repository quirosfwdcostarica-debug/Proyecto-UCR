/**
 * aiDonationAnalysisService.ts
 *
 * Servicio aislado de IA para análisis de solicitudes de donación.
 * Utiliza Grok (xAI) para generar un informe objetivo de apoyo al administrador.
 *
 * IMPORTANTE:
 * - La IA NO aprueba ni rechaza solicitudes.
 * - Solo genera información de apoyo para la decisión humana del administrador.
 * - No se utilizan atributos protegidos (género, edad, raza, etc.).
 * - Todo el análisis se basa únicamente en los datos proporcionados.
 */

// ─── Tipos de entrada ───────────────────────────────────────────────────────

export interface DonacionData {
  id: string;
  monto: number;
  destino: string | null;
  moneda: string | null;
  metodo_pago: string | null;
  comprobante_url: string | null;
  created_at: string;
}

export interface EstudianteData {
  carrera: string | null;
  escuela_facultad: string | null;
  sede: string | null;
  nivel_academico: string | null;
  promedio_ponderado: number | null;
  nivel_beca: string | null;
  proyecto_titulo: string | null;
  proyecto_tipo: string | null;
  proyecto_descripcion: string | null;
  proyecto_necesidades: Record<string, unknown> | null;
  proyecto_porcentaje_avance: number | null;
  busca_financiamiento: boolean;
}

export interface ExalumnoData {
  carrera: string | null;
  empresa_actual: string | null;
  sector: string | null;
}

// ─── Tipo de salida ──────────────────────────────────────────────────────────

export interface GrokAnalysisResult {
  resumen_general: string;
  motivo_principal: string;
  factores_relevantes: string[];
  nivel_prioridad: "Alta" | "Media" | "Baja";
  justificacion_prioridad: string;
  aspectos_positivos: string[];
  aspectos_por_verificar: string[];
  recomendacion_admin: string;
  advertencia: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-3-mini";
const TIMEOUT_MS = 30_000; // 30 segundos

// ─── Construcción del prompt ─────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Eres un asistente de análisis imparcial para una plataforma universitaria de donaciones. 
Tu única función es analizar solicitudes de donación y generar un informe objetivo de apoyo para el administrador.

REGLAS OBLIGATORIAS:
1. NO apruebes ni rechaces solicitudes automáticamente.
2. NO discrimines por sexo, raza, religión, nacionalidad, orientación sexual ni ideología política.
3. NO inventes ni inferas información que no esté explícitamente proporcionada.
4. NO emitas juicios morales ni conclusiones definitivas.
5. Basa el análisis ÚNICAMENTE en los datos proporcionados.
6. Mantén un tono neutro, profesional y comprensible para el administrador.
7. La recomendación NUNCA es vinculante — siempre es el administrador quien decide.

FORMATO DE RESPUESTA (JSON estricto, sin texto adicional):
{
  "resumen_general": "string",
  "motivo_principal": "string",
  "factores_relevantes": ["string"],
  "nivel_prioridad": "Alta | Media | Baja",
  "justificacion_prioridad": "string",
  "aspectos_positivos": ["string"],
  "aspectos_por_verificar": ["string"],
  "recomendacion_admin": "string",
  "advertencia": "La decisión final corresponde exclusivamente al administrador."
}`;
}

function buildUserPrompt(
  donacion: DonacionData,
  estudiante: EstudianteData,
  exalumno: ExalumnoData
): string {
  // Datos del proyecto estudiantil
  const proyectoInfo: string[] = [];
  if (estudiante.proyecto_titulo) proyectoInfo.push(`Título: ${estudiante.proyecto_titulo}`);
  if (estudiante.proyecto_tipo) proyectoInfo.push(`Tipo: ${estudiante.proyecto_tipo}`);
  if (estudiante.proyecto_descripcion) proyectoInfo.push(`Descripción: ${estudiante.proyecto_descripcion}`);
  if (estudiante.proyecto_porcentaje_avance !== null) {
    proyectoInfo.push(`Porcentaje de avance: ${estudiante.proyecto_porcentaje_avance}%`);
  }
  if (estudiante.proyecto_necesidades && Object.keys(estudiante.proyecto_necesidades).length > 0) {
    proyectoInfo.push(`Necesidades declaradas: ${JSON.stringify(estudiante.proyecto_necesidades)}`);
  }

  // Datos académicos (sin atributos protegidos)
  const academicInfo: string[] = [];
  if (estudiante.carrera) academicInfo.push(`Carrera: ${estudiante.carrera}`);
  if (estudiante.nivel_academico) academicInfo.push(`Nivel académico: ${estudiante.nivel_academico}`);
  if (estudiante.nivel_beca) academicInfo.push(`Nivel de beca socioeconómica: ${estudiante.nivel_beca}`);
  if (estudiante.promedio_ponderado !== null) {
    academicInfo.push(`Promedio ponderado: ${estudiante.promedio_ponderado}`);
  }
  if (estudiante.escuela_facultad) academicInfo.push(`Facultad: ${estudiante.escuela_facultad}`);
  if (estudiante.sede) academicInfo.push(`Sede: ${estudiante.sede}`);

  // Datos de la donación
  const donacionInfo: string[] = [
    `Monto solicitado: ${donacion.monto} ${donacion.moneda ?? "CRC"}`,
    `Destino declarado: ${donacion.destino ?? "No especificado"}`,
  ];
  if (donacion.metodo_pago) donacionInfo.push(`Método de pago: ${donacion.metodo_pago}`);
  donacionInfo.push(`Comprobante adjunto: ${donacion.comprobante_url ? "Sí" : "No"}`);

  return `Analiza la siguiente solicitud de donación universitaria y genera un informe objetivo:

=== DATOS DE LA SOLICITUD ===
${donacionInfo.join("\n")}

=== INFORMACIÓN ACADÉMICA DEL ESTUDIANTE ===
${academicInfo.length > 0 ? academicInfo.join("\n") : "No disponible"}

=== DATOS DEL PROYECTO ===
${proyectoInfo.length > 0 ? proyectoInfo.join("\n") : "No disponible"}

=== CONTEXTO DEL DONANTE ===
Carrera del exalumno: ${exalumno.carrera ?? "No disponible"}
Sector laboral: ${exalumno.sector ?? "No disponible"}

Recuerda: responde SOLO con el JSON solicitado, sin texto adicional.`;
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function analyzeWithGrok(
  donacion: DonacionData,
  estudiante: EstudianteData,
  exalumno: ExalumnoData
): Promise<GrokAnalysisResult> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY no está configurada en las variables de entorno.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user",   content: buildUserPrompt(donacion, estudiante, exalumno) },
        ],
        temperature: 0.2,    // Baja temperatura → respuestas más deterministas
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de la API de Grok [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "";

    if (!rawContent) {
      throw new Error("La API de Grok retornó una respuesta vacía.");
    }

    // Parsear y validar el JSON de respuesta
    let parsed: Partial<GrokAnalysisResult>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error(`Respuesta de Grok no es JSON válido: ${rawContent.slice(0, 200)}`);
    }

    // Validar campos obligatorios y proveer defaults seguros
    const result: GrokAnalysisResult = {
      resumen_general:         parsed.resumen_general         ?? "No disponible",
      motivo_principal:        parsed.motivo_principal        ?? "No especificado",
      factores_relevantes:     Array.isArray(parsed.factores_relevantes)  ? parsed.factores_relevantes  : [],
      nivel_prioridad:         validatePriority(parsed.nivel_prioridad),
      justificacion_prioridad: parsed.justificacion_prioridad ?? "No disponible",
      aspectos_positivos:      Array.isArray(parsed.aspectos_positivos)   ? parsed.aspectos_positivos   : [],
      aspectos_por_verificar:  Array.isArray(parsed.aspectos_por_verificar) ? parsed.aspectos_por_verificar : [],
      recomendacion_admin:     parsed.recomendacion_admin     ?? "Requiere revisión manual.",
      advertencia:             "La decisión final corresponde exclusivamente al administrador.",
    };

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validatePriority(value: unknown): "Alta" | "Media" | "Baja" {
  if (value === "Alta" || value === "Media" || value === "Baja") return value;
  return "Media"; // Default seguro
}
