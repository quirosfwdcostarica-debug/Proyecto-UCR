"use client";
import { useState } from "react";
import { Loader2, Bot, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AiAnalysisViewerProps {
  donacionId: string;
}

interface GrokAnalysisResult {
  resumen_general: string;
  motivo_principal: string;
  factores_relevantes: string[];
  nivel_prioridad: "Alta" | "Media" | "Baja";
  justificacion_prioridad: string;
  aspectos_positivos: string[];
  aspectos_por_verificar: string[];
  recomendacion_admin: string;
  advertencia: string;
  analysis_error?: string | null;
}

export function AiAnalysisViewer({ donacionId }: AiAnalysisViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GrokAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setExpanded(true);
    if (analysis || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/donaciones/${donacionId}/analysis`);
      if (res.status === 404) {
        setError("El análisis de IA aún no está disponible para esta solicitud.");
      } else if (!res.ok) {
        throw new Error("No se pudo cargar el análisis");
      } else {
        const data = await res.json();
        if (data.analysis_error) {
          setError(`Grok encontró un error al analizar esta donación: ${data.analysis_error}`);
        } else {
          setAnalysis({
            resumen_general: data.summary,
            motivo_principal: data.main_reason,
            factores_relevantes: data.relevant_factors || [],
            nivel_prioridad: data.priority_level,
            justificacion_prioridad: data.priority_reason,
            aspectos_positivos: data.positive_aspects || [],
            aspectos_por_verificar: data.verification_points || [],
            recomendacion_admin: data.admin_recommendation,
            advertencia: "La decisión final corresponde exclusivamente al administrador.",
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    Alta: "bg-red-100 text-red-800 border-red-200",
    Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Baja: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">
      <button
        onClick={() => (expanded ? setExpanded(false) : fetchAnalysis())}
        className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            Análisis de IA (Grok)
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 text-sm border-t border-slate-200 dark:border-slate-700">
          {loading && (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando informe...
            </div>
          )}

          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-100 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {analysis && !loading && !error && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Resumen General</h4>
                  <p className="text-slate-600 dark:text-slate-400">{analysis.resumen_general}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className={`font-semibold ${priorityColors[analysis.nivel_prioridad]}`}>
                    Prioridad: {analysis.nivel_prioridad}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Motivo Principal</h4>
                <p className="text-slate-600 dark:text-slate-400">{analysis.motivo_principal}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Aspectos Positivos
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-xs space-y-1">
                    {analysis.aspectos_positivos.map((ap, i) => (
                      <li key={i}>{ap}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Por Verificar
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-xs space-y-1">
                    {analysis.aspectos_por_verificar.map((av, i) => (
                      <li key={i}>{av}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">Recomendación para el Administrador</h4>
                <p className="text-indigo-800 dark:text-indigo-300 font-medium mb-2">{analysis.recomendacion_admin}</p>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-black/20 p-2 rounded">
                  <Info className="w-4 h-4" />
                  <span>{analysis.advertencia}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
