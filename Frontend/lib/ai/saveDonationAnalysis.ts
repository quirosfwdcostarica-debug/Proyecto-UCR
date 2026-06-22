/**
 * saveDonationAnalysis.ts
 *
 * Guarda el resultado del análisis de Grok en la tabla `donation_ai_analysis`
 * de Supabase usando el service client (no Prisma, ya que la tabla
 * no está en el schema sincronizado con la BD).
 *
 * En caso de error de escritura, lanza una excepción para que el caller
 * pueda registrarla sin romper el flujo principal.
 */

import { createClient } from "@supabase/supabase-js";
import type { GrokAnalysisResult } from "./aiDonationAnalysisService";

// ─── Cliente Supabase con service role (privilegios completos, solo server-side) ──

function getSupabaseServiceClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !service) {
    throw new Error(
      "Variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_KEY no configuradas."
    );
  }

  return createClient(url, service, {
    auth: { persistSession: false },
  });
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SaveAnalysisInput {
  donationRequestId: string;
  analysis: GrokAnalysisResult;
  rawResponse?: unknown;
}

export interface SaveAnalysisErrorInput {
  donationRequestId: string;
  errorMessage: string;
}

// ─── Guardar análisis exitoso ─────────────────────────────────────────────────

export async function saveDonationAnalysis(input: SaveAnalysisInput): Promise<void> {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase.from("donation_ai_analysis").insert({
    donation_request_id:  input.donationRequestId,
    summary:              input.analysis.resumen_general,
    main_reason:          input.analysis.motivo_principal,
    relevant_factors:     input.analysis.factores_relevantes,
    priority_level:       input.analysis.nivel_prioridad,
    priority_reason:      input.analysis.justificacion_prioridad,
    positive_aspects:     input.analysis.aspectos_positivos,
    verification_points:  input.analysis.aspectos_por_verificar,
    admin_recommendation: input.analysis.recomendacion_admin,
    grok_raw_response:    input.rawResponse ?? null,
    analysis_error:       null,
  });

  if (error) {
    throw new Error(`Error al guardar análisis en Supabase: ${error.message}`);
  }
}

// ─── Guardar registro de error (sin romper el sistema) ───────────────────────

export async function saveDonationAnalysisError(input: SaveAnalysisErrorInput): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();

    await supabase.from("donation_ai_analysis").insert({
      donation_request_id:  input.donationRequestId,
      summary:              null,
      main_reason:          null,
      relevant_factors:     null,
      priority_level:       null,
      priority_reason:      null,
      positive_aspects:     null,
      verification_points:  null,
      admin_recommendation: null,
      grok_raw_response:    null,
      analysis_error:       input.errorMessage,
    });
  } catch (e) {
    // No lanzar — registrar el error de registro sin propagar
    console.error("[saveDonationAnalysisError] No se pudo registrar el error:", e);
  }
}

// ─── Leer análisis por donation_request_id ────────────────────────────────────

export async function getDonationAnalysis(donationRequestId: string): Promise<{
  id: string;
  donation_request_id: string;
  summary: string | null;
  main_reason: string | null;
  relevant_factors: string[] | null;
  priority_level: "Alta" | "Media" | "Baja" | null;
  priority_reason: string | null;
  positive_aspects: string[] | null;
  verification_points: string[] | null;
  admin_recommendation: string | null;
  analysis_error: string | null;
  created_at: string;
} | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("donation_ai_analysis")
    .select("*")
    .eq("donation_request_id", donationRequestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al leer análisis de Supabase: ${error.message}`);
  }

  return data ?? null;
}
