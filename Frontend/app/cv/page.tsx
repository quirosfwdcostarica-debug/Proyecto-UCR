"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Check, Edit2, Trash2, Download, CheckCircle2, Loader2, Lightbulb } from "lucide-react";

export default function CVOptimizer() {
  return (
    <div className="min-h-full bg-[#f8fafc] flex flex-col">
      <TopBar title="CV Optimization" />
      
      {/* Header Info */}
      <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between z-10">
        <div>
          <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">AI Career Assistant</p>
          <h1 className="text-2xl font-bold text-foreground">Optimización de CV</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0 px-3 py-1 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Análisis AI Activo
            </Badge>
            <span className="text-slate-600 font-medium">Puntaje de coincidencia: <span className="text-green-600 font-bold text-lg">88%</span></span>
          </div>
          <div className="flex gap-3 border-l border-slate-200 pl-6">
            <Button variant="outline" className="border-slate-300">
              <Download className="w-4 h-4 mr-2" /> Descargar PDF
            </Button>
            <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white">Finalizar y Aplicar</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column - Original CV */}
        <div className="w-1/2 p-8 overflow-y-auto border-r border-border bg-white">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CV Original
            </h2>
            <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200 uppercase tracking-widest text-[10px]">SOLO LECTURA</Badge>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="border-b border-slate-200 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Mariana Rodríguez</h1>
              <p className="text-slate-500 text-lg">Ingeniera de Software | San José, Costa Rica</p>
            </div>

            <div className="mb-8">
              <h3 className="text-[#0f4c81] font-bold text-sm mb-3">Perfil Profesional</h3>
              <p className="text-slate-600 leading-relaxed">
                Soy una ingeniera graduada de la UCR con 4 años de experiencia. He trabajado en desarrollo web usando varios lenguajes y me gusta trabajar en equipo para resolver problemas difíciles. Busco una oportunidad para crecer.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-[#0f4c81] font-bold text-sm mb-4">Experiencia</h3>
              
              <div className="mb-6">
                <h4 className="font-bold text-slate-800">Desarrollador Senior - TechSoluciones</h4>
                <p className="text-slate-400 text-sm italic mb-2">2021 - Presente</p>
                <ul className="list-disc list-outside ml-4 text-slate-600 space-y-2">
                  <li>Lidero un equipo de 5 personas para hacer aplicaciones.</li>
                  <li>Uso React y Node.js todos los días.</li>
                  <li>Mejoré el tiempo de carga de la página principal.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-400">Junior Dev - Startup Inc.</h4>
                <p className="text-slate-300 text-sm italic mb-2">2019 - 2021</p>
              </div>
            </div>

            <div>
              <h3 className="text-[#0f4c81] font-bold text-sm mb-3">Habilidades</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm">JavaScript</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm">React</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm">Node.js</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm">SQL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Optimized Version */}
        <div className="w-1/2 p-8 overflow-y-auto bg-[#f8fafc] relative">
          <div className="flex justify-between items-center mb-8 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-[#0f4c81] flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Versión Optimizada
            </h2>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 uppercase tracking-widest text-[10px] px-2 py-0.5">SUGERENCIA AI</Badge>
          </div>

          <div className="max-w-xl mx-auto space-y-6 pb-24">
            
            {/* Optimized Profile Box */}
            <div className="bg-white border border-[#bfdbfe] rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#eff6ff] px-4 py-2 border-b border-[#bfdbfe] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0f4c81]" />
                <span className="text-xs font-bold text-[#0f4c81] tracking-wider">PERFIL PROFESIONAL OPTIMIZADO</span>
              </div>
              <div className="p-5">
                <p className="text-slate-700 leading-relaxed mb-6">
                  Ingeniera de Software Full-Stack especializada en ecosistemas escalables con <span className="bg-green-100 text-green-800 px-1 rounded font-medium">4+ años de trayectoria</span> transformando requisitos complejos en soluciones técnicas de alto rendimiento. Experta en el stack MERN y metodologías ágiles, con un enfoque probado en la optimización de latencia y liderazgo de equipos técnicos.
                </p>
                <div className="flex gap-3 mb-4">
                  <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white flex-1"><Check className="w-4 h-4 mr-2" /> Aceptar</Button>
                  <Button variant="outline" className="flex-1"><Edit2 className="w-4 h-4 mr-2" /> Editar</Button>
                  <Button variant="outline" className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Razonamiento AI:</span> Se han incluido palabras clave detectadas en la vacante (escalabilidad, alto rendimiento) y se cuantificó el impacto profesional.
              </div>
            </div>

            {/* Optimized Experience */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-xs font-bold text-[#0f4c81] tracking-wider">EXPERIENCIA REESTRUCTURADA</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-800">TechSoluciones | Desarrollador Senior</h4>
                <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">Logros Clave</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Liderazgo técnico de un equipo multidisciplinario de 5 ingenieros, logrando un <span className="text-[#0f4c81] font-semibold">incremento del 25% en la velocidad de entrega</span> de sprints.
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Optimización de la arquitectura Front-end en React, reduciendo los tiempos de carga (LCP) en un <span className="text-[#0f4c81] font-semibold">40% para 1M+ de usuarios</span> mensuales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white px-6">Aceptar</Button>
                  <Button variant="outline" className="px-6">Descartar</Button>
                </div>
              </div>
            </div>

            {/* Suggested Skills */}
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-800">Habilidades Sugeridas</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-full text-sm font-medium shadow-sm hover:bg-green-100 cursor-pointer transition-colors">GraphQL +</span>
                <span className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-full text-sm font-medium shadow-sm hover:bg-green-100 cursor-pointer transition-colors">AWS S3 +</span>
                <span className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-full text-sm font-medium shadow-sm hover:bg-green-100 cursor-pointer transition-colors">Microservices +</span>
              </div>
              <p className="text-xs text-green-600 italic">Estas habilidades aparecen frecuentemente en el perfil del cargo solicitado.</p>
            </div>

          </div>
          
          {/* Floating Action Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0a192f] text-white rounded-xl shadow-2xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm mb-1">Generando sugerencias finales...</p>
              <p className="text-xs text-blue-200 mb-2">Revisando sección de Educación</p>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-2/3 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
