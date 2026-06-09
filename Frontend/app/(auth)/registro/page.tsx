"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";

export default function SelectorRegistroPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#0f4c81] sm:text-5xl mb-4">
          Únete a la Comunidad UCR
        </h1>
        <p className="text-lg text-slate-600">
          Selecciona cómo deseas participar en la plataforma. Ya seas un estudiante buscando apoyo o un exalumno dispuesto a dar de vuelta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Estudiante Card */}
        <Link href="/registro/estudiante" className="group">
          <Card className="h-full border-2 border-transparent hover:border-blue-400 transition-all duration-300 shadow-md hover:shadow-xl bg-white overflow-hidden">
            <div className="h-2 w-full bg-blue-500"></div>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Soy Estudiante</CardTitle>
              <CardDescription className="text-base mt-2">
                Busco mentoría, pasantías o apoyo para mi proyecto de graduación.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <div className="inline-flex items-center text-sm font-bold text-blue-600">
                Registrarme como estudiante <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Exalumno Card */}
        <Link href="/registro/exalumno" className="group">
          <Card className="h-full border-2 border-transparent hover:border-[#0f4c81] transition-all duration-300 shadow-md hover:shadow-xl bg-white overflow-hidden">
            <div className="h-2 w-full bg-[#0f4c81]"></div>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-10 w-10 text-[#0f4c81]" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Soy Exalumno</CardTitle>
              <CardDescription className="text-base mt-2">
                Deseo ofrecer mentoría, empleo, donaciones o proyectos a nuevos talentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <div className="inline-flex items-center text-sm font-bold text-[#0f4c81]">
                Registrarme como exalumno <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="mt-12 text-center text-slate-500">
        ¿Ya tienes una cuenta? <Link href="/login" className="text-[#0f4c81] font-semibold hover:underline">Inicia sesión aquí</Link>
      </div>
    </div>
  );
}
