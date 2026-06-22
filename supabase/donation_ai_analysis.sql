-- ============================================================
-- GROK AI ANALYSIS — Tabla de análisis automático de donaciones
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS "donation_ai_analysis" (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_request_id    UUID        NOT NULL,
  summary                TEXT,
  main_reason            TEXT,
  relevant_factors       JSONB,
  priority_level         TEXT        CHECK (priority_level IN ('Alta', 'Media', 'Baja')),
  priority_reason        TEXT,
  positive_aspects       JSONB,
  verification_points    JSONB,
  admin_recommendation   TEXT,
  grok_raw_response      JSONB,
  analysis_error         TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas rápidas por donation_request_id
CREATE INDEX IF NOT EXISTS idx_dai_donation_request_id
  ON "donation_ai_analysis"(donation_request_id);

-- Índice para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_dai_created_at
  ON "donation_ai_analysis"(created_at DESC);

-- Política RLS: solo el service role puede insertar/leer
-- El frontend nunca accede directamente; siempre pasa por la API de Next.js
ALTER TABLE "donation_ai_analysis" ENABLE ROW LEVEL SECURITY;

-- Permitir que el service role (backend) haga todo
CREATE POLICY "service_role_full_access" ON "donation_ai_analysis"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verificación
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'donation_ai_analysis'
ORDER BY ordinal_position;
