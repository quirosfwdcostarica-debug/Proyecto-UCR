import { EstudianteRegisterForm } from "@/components/forms/EstudianteRegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegistroEstudiantePage() {
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

      {/* Panel Derecho (Formulario) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto">
        <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-10 lg:left-10 z-50 flex items-center gap-2 text-slate-500 hover:text-[#0f4c81] transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Volver al Dashboard</span>
        </Link>
        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-30 bg-cover bg-bottom mix-blend-multiply pointer-events-none"></div>
        
        <div className="w-full max-w-xl bg-white p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10 my-8">
          <div className="text-center mb-8">
            <img src="/escudo-ucr.png" alt="Escudo UCR" className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display mb-3">
              Únete como Estudiante
            </h2>
            <p className="text-slate-500 font-medium">
              Crea tu cuenta institucional para recibir mentoría, pasantías y apoyo en tu proyecto de graduación.
            </p>
          </div>

          <EstudianteRegisterForm />

          <div className="mt-8 text-center text-slate-500 font-medium">
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
