"use server";

import { generateText } from "ai";

// ─── Fallback value estimates by area ─────────────────────────────────────────
const FALLBACK_VALUES: Record<string, {
  valorDesarrollo: number;
  valorMercado: number;
  impactoSocial: number;
  valorAcademico: number;
  puntuacionGlobal: number;
  resumenEjecutivo: string;
  fortalezas: string[];
  oportunidades: string[];
  costoDesarrollo: number;
  roi: number;
}> = {
  "Tecnologías de la Información": {
    valorDesarrollo: 18500,
    valorMercado: 85000,
    impactoSocial: 78,
    valorAcademico: 88,
    puntuacionGlobal: 84,
    resumenEjecutivo: "Este proyecto tecnológico tiene un alto potencial de mercado en el sector de software empresarial costarricense. La solución aborda una necesidad real de digitalización en instituciones educativas o empresas, con posibilidad de escalarse a nivel regional centroamericano.",
    fortalezas: ["Alta demanda del mercado tecnológico local", "Aplicabilidad inmediata en sector educativo y empresarial", "Posibilidad de patente de software o spin-off"],
    oportunidades: ["Alianzas con empresas tech de la GAM", "Fondos CONICIT para innovación tecnológica", "Concurso UCR Emprende"],
    costoDesarrollo: 4200,
    roi: 362,
  },
  "Inteligencia Artificial": {
    valorDesarrollo: 42000,
    valorMercado: 210000,
    impactoSocial: 82,
    valorAcademico: 95,
    puntuacionGlobal: 91,
    resumenEjecutivo: "Proyecto de alto valor científico y comercial. Los modelos de IA desarrollados en Costa Rica tienen gran demanda internacional. Este trabajo puede derivar en publicaciones indexadas, patentes y transferencia tecnológica al sector productivo.",
    fortalezas: ["Altísima demanda de talento IA a nivel global", "Potencial de publicación en revistas Q1", "Aplicabilidad en múltiples industrias"],
    oportunidades: ["Becas DAAD o Fulbright para doctorado", "Colaboración con Microsoft Research o Google", "Fondos MICITT para IA"],
    costoDesarrollo: 8500,
    roi: 394,
  },
  "Ingeniería Civil": {
    valorDesarrollo: 35000,
    valorMercado: 120000,
    impactoSocial: 88,
    valorAcademico: 85,
    puntuacionGlobal: 87,
    resumenEjecutivo: "Proyecto de ingeniería con impacto directo en la seguridad y ordenamiento territorial de Costa Rica. Los estudios geotécnicos, estructurales o de infraestructura son vitales para el desarrollo nacional y son altamente valorados por el MOPT, municipalidades y empresas constructoras.",
    fortalezas: ["Impacto directo en seguridad pública", "Alta demanda de estudios de ingeniería certificados", "Aplicabilidad en proyectos de infraestructura nacional"],
    oportunidades: ["Contratos con MOPT o ICE", "Fondos del BID para infraestructura resiliente", "Consultoría en proyectos privados"],
    costoDesarrollo: 9800,
    roi: 243,
  },
  "Salud Pública": {
    valorDesarrollo: 22000,
    valorMercado: 75000,
    impactoSocial: 95,
    valorAcademico: 87,
    puntuacionGlobal: 89,
    resumenEjecutivo: "Proyecto de alto impacto social en el sistema de salud costarricense. Las investigaciones en salud pública aportan valor directo a la CCSS y al MINSA, con potencial de influir en políticas sanitarias nacionales y publicaciones en revistas indexadas.",
    fortalezas: ["Impacto directo en bienestar de la población", "Alineado con objetivos de la CCSS", "Alta relevancia para financiadores internacionales de salud"],
    oportunidades: ["Financiamiento OPS/OMS", "Colaboración con Caja Costarricense de Seguro Social", "Fondo Nacional de Ciencia y Tecnología (FONACIT)"],
    costoDesarrollo: 5600,
    roi: 239,
  },
  "default": {
    valorDesarrollo: 15000,
    valorMercado: 55000,
    impactoSocial: 75,
    valorAcademico: 80,
    puntuacionGlobal: 78,
    resumenEjecutivo: "Este proyecto presenta un valor académico y práctico sólido dentro de su área de conocimiento. Con una adecuada difusión y vinculación con el sector productivo, puede generar un impacto significativo y atraer interés de financiadores o colaboradores externos.",
    fortalezas: ["Aporte original al conocimiento en el área", "Metodología rigurosa adaptada al contexto costarricense", "Potencial de transferencia al sector productivo"],
    oportunidades: ["Fondos CONICIT o MICITT", "Colaboración con cámaras empresariales", "Publicación en revistas académicas regionales"],
    costoDesarrollo: 3500,
    roi: 214,
  },
};

function getFallback(area: string) {
  const keys = Object.keys(FALLBACK_VALUES);
  const match = keys.find(k =>
    area.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(area.toLowerCase())
  );
  return FALLBACK_VALUES[match || "default"];
}

export interface ProjectValueResult {
  valorDesarrollo: number;       // USD — estimated market value of the final product/solution
  valorMercado: number;          // USD — realistic market price if commercialized
  costoDesarrollo: number;       // USD — realistic cost to develop the project
  roi: number;                   // % — return on investment potential
  impactoSocial: number;         // 0–100 — social/community impact score
  valorAcademico: number;        // 0–100 — academic rigor and novelty score
  puntuacionGlobal: number;      // 0–100 — overall project value score
  resumenEjecutivo: string;      // brief executive summary
  fortalezas: string[];          // top 3 strengths
  oportunidades: string[];       // top 3 funding/growth opportunities
  isFallback?: boolean;
}

export async function calculateProjectValue(
  titulo: string,
  descripcion: string,
  area: string,
  modalidad: string,
  duracion: string,
  problema: string,
  objetivo: string,
  recursos: string[]
): Promise<{ success: boolean; data?: ProjectValueResult; error?: string }> {

  const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

  if (!apiKey) {
    const fallback = getFallback(area);
    return { success: true, data: { ...fallback, isFallback: true } };
  }

  const prompt = `Eres un experto evaluador de proyectos de graduación universitarios en Costa Rica. 
Analizas el valor económico, académico y social de proyectos TFG de la Universidad de Costa Rica (UCR).

Datos del proyecto:
- Título: "${titulo}"
- Área: "${area}"
- Modalidad: "${modalidad}"
- Duración estimada: "${duracion}"
- Descripción: "${descripcion}"
- Problema que resuelve: "${problema}"
- Objetivo principal: "${objetivo}"
- Recursos necesarios: ${recursos.join(", ")}

Evalúa este proyecto y devuelve ÚNICAMENTE un JSON válido (sin markdown, sin texto extra) con esta estructura:
{
  "valorDesarrollo": <número entero en USD — valor estimado del producto/solución si se terminara y comercializara>,
  "valorMercado": <número entero en USD — precio real de mercado del resultado final si se vendiera como producto>,
  "costoDesarrollo": <número entero en USD — costo realista de desarrollar el proyecto desde cero>,
  "roi": <número entero — porcentaje de retorno sobre inversión esperado>,
  "impactoSocial": <número del 0 al 100 — impacto en la sociedad costarricense>,
  "valorAcademico": <número del 0 al 100 — valor científico/académico y novedad del trabajo>,
  "puntuacionGlobal": <número del 0 al 100 — puntuación global ponderada del proyecto>,
  "resumenEjecutivo": "<párrafo corto de 2-3 oraciones describiendo el valor del proyecto>",
  "fortalezas": ["<fortaleza 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "oportunidades": ["<oportunidad de financiamiento o crecimiento 1>", "<oportunidad 2>", "<oportunidad 3>"]
}

Usa valores realistas para Costa Rica. El valor de mercado debe reflejar el sector (software B2B, salud, infraestructura, etc.).`;

  try {
    const { groq } = await import("@ai-sdk/groq");
    const { text } = await generateText({
      // @ts-expect-error type mismatch ai-sdk/groq
      model: groq("llama3-70b-8192"),
      prompt,
      maxTokens: 800,
    });

    let clean = text.trim()
      .replace(/^```json\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(clean) as ProjectValueResult;
    return { success: true, data: parsed };
  } catch (err: any) {
    console.error("[calculateProjectValue] error:", err);
    const fallback = getFallback(area);
    return { success: true, data: { ...fallback, isFallback: true } };
  }
}
