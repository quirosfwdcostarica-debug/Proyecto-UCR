"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { GraduationCap, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";

export default function SelectorRegistroPage() {
  return (
    <div className="flex min-h-screen bg-ucr-gris-fondo dark:bg-ucr-negro font-body relative overflow-hidden">
      {/* Background (Left panel with image and right-edge gradient fade) */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[50%] z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-[30%_center]"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        {/* Transparent esmeralda color overlay over the image */}
        <div className="absolute inset-0 bg-ucr-esmeralda/20 dark:bg-ucr-esmeralda/35" />
        {/* Smooth horizontal gradient fade: Blends the image's right edge into the solid gris-fondo background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ucr-gris-fondo/10 via-[60%] to-ucr-gris-fondo dark:via-ucr-negro/10 dark:via-[60%] dark:to-ucr-negro" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
        {/* Panel Izquierdo Content (Text floating over left side) */}
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-between px-16 py-20 text-white min-h-screen">
          <div className="pt-8">
            <h1 className="text-4xl md:text-5xl font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-display leading-[1.1] uppercase">
              Fundación Exalumnos<br/>U
            </h1>
          </div>
          <div className="pb-8">
            <p className="text-lg md:text-xl text-sky-100 max-w-lg font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-relaxed font-body">
              Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
            </p>
          </div>
        </div>

        {/* Panel Derecho (Forms sitting over the blended background with watermark) */}
        <div className="w-full lg:w-[50%] flex items-center justify-center p-8 sm:p-12 min-h-screen relative bg-ucr-gris-fondo dark:bg-ucr-negro lg:bg-transparent">
          <Link href="/" className="absolute top-8 right-8 sm:top-10 sm:right-10 lg:right-16 z-50 flex items-center gap-2 text-slate-500 hover:text-ucr-naranja transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
          </Link>
          
          {/* Watermark pattern overlay */}
          <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-[0.12] dark:opacity-[0.05] bg-cover bg-bottom mix-blend-multiply dark:mix-blend-overlay pointer-events-none z-0"></div>
          
          <div className="w-full max-w-xl relative z-10 py-12">
            <div className="text-center mb-10">
              <img src="/logo.png" alt="Logo Alumni U" className="w-24 h-24 mx-auto mb-6 object-contain" />
              <h2 className="text-3xl font-medium tracking-tight text-[#333333] dark:text-white font-display mb-3 uppercase">
                Únete a la Comunidad
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium font-body">
                Selecciona cómo deseas participar en la plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {/* Estudiante Card */}
              <Link href="/registro/estudiante" className="group">
                <div className="h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(84,188,255,0.15)] hover:border-ucr-celeste/40 transition-all duration-300 overflow-hidden flex flex-col relative">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-ucr-celeste transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                    <div className="bg-ucr-celeste-tint dark:bg-ucr-celeste/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-ucr-celeste-tint/80 transition-all duration-300">
                      <GraduationCap className="h-10 w-10 text-ucr-esmeralda dark:text-ucr-celeste" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2 font-display uppercase">Soy Estudiante</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                      Busco mentoría, pasantías o apoyo para mi proyecto de graduación.
                    </p>
                    <div className="mt-auto inline-flex items-center text-sm font-bold text-ucr-esmeralda dark:text-ucr-celeste font-body">
                      Registrarme <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Exalumno Card */}
              <Link href="/registro/exalumno" className="group">
                <div className="h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(255,155,24,0.15)] hover:border-ucr-amarillo/40 transition-all duration-300 overflow-hidden flex flex-col relative">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-ucr-amarillo transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                    <div className="bg-ucr-beige-tint dark:bg-ucr-amarillo/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-ucr-beige-tint/80 transition-all duration-300">
                      <Briefcase className="h-10 w-10 text-ucr-amarillo" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2 font-display uppercase">Soy Exalumno</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                      Deseo ofrecer mentoría, empleo o apoyar proyectos de nuevos talentos.
                    </p>
                    <div className="mt-auto inline-flex items-center text-sm font-bold text-ucr-amarillo font-body">
                      Registrarme <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-12 text-center text-slate-500 font-medium font-body">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-bold text-ucr-celeste hover:text-sky-500 hover:underline transition-colors">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
