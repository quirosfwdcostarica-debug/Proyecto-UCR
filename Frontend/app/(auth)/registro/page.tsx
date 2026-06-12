"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { GraduationCap, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";

export default function SelectorRegistroPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      {/* Panel Izquierdo (Imagen y Texto) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        <div className="absolute inset-0 bg-[#02477B]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02477B]/90 via-[#02477B]/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 py-16">
          <div className="absolute top-16 left-0 right-0 flex justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg font-display leading-tight text-center">
              Fundación Exalumnos<br/>UCR
            </h1>
          </div>
          <p className="text-lg md:text-xl text-sky-100 max-w-lg font-medium drop-shadow-md text-center mt-10">
            Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
          </p>
        </div>
      </div>

      {/* Panel Derecho (Selector) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <Link href="/" className="absolute top-8 left-8 sm:top-10 sm:left-10 z-50 flex items-center gap-2 text-slate-500 hover:text-[#0f4c81] transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Volver al Dashboard</span>
        </Link>
        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-30 bg-cover bg-bottom mix-blend-multiply pointer-events-none"></div>
        
        <div className="w-full max-w-xl relative z-10">
          <div className="text-center mb-10">
            <img src="/UCR_EXALUMNOS-1024x1024.png" alt="Escudo UCR" className="w-24 h-24 mx-auto mb-6 object-contain" />
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display mb-3">
              Únete a la Comunidad
            </h2>
            <p className="text-slate-500 font-medium">
              Selecciona cómo deseas participar en la plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {/* Estudiante Card */}
            <Link href="/registro/estudiante" className="group">
              <div className="h-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                    <GraduationCap className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">Soy Estudiante</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Busco mentoría, pasantías o apoyo para mi proyecto de graduación.
                  </p>
                  <div className="mt-auto inline-flex items-center text-sm font-bold text-blue-600">
                    Registrarme <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Exalumno Card */}
            <Link href="/registro/exalumno" className="group">
              <div className="h-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(2,71,123,0.15)] hover:border-[#0f4c81]/30 transition-all duration-300 overflow-hidden flex flex-col relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#02477B] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-100 transition-all duration-300">
                    <Briefcase className="h-10 w-10 text-[#02477B]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">Soy Exalumno</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Deseo ofrecer mentoría, empleo o apoyar proyectos de nuevos talentos.
                  </p>
                  <div className="mt-auto inline-flex items-center text-sm font-bold text-[#02477B]">
                    Registrarme <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 text-center text-slate-500 font-medium">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-bold text-[#00c0f3] hover:text-[#00a0cc] hover:underline transition-colors">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
