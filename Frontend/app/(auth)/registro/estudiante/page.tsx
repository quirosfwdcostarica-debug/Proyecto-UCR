import { EstudianteRegisterForm } from "@/components/forms/EstudianteRegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegistroEstudiantePage() {
  return (
    <div className="flex min-h-screen bg-ucr-naranja font-body relative overflow-hidden">


      {/* Panel Izquierdo (Imagen y Texto) - Identical to Login left side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between px-12 pt-8 pb-12 text-white z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        {/* Naranja transparente en toda la imagen */}
        <div className="absolute inset-0 bg-ucr-naranja/50 mix-blend-multiply z-0" />
        <div className="absolute inset-0 bg-ucr-naranja/30 z-0" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white drop-shadow-md leading-[1.2] uppercase">
            Fundación<br />Exalumnos
          </h1>
        </div>
        <div className="relative z-10">
          <p className="text-lg text-sky-100 max-w-sm font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-relaxed font-body">
            Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
          </p>
        </div>
      </div>

      {/* Panel Derecho (Formulario) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto z-20">
        <div className="absolute inset-0 bg-ucr-naranja z-0" />
        
        {/* Isotipo decorativo */}
        <img
          src="/logo-isotipo.png"
          alt=""
          aria-hidden="true"
          className="absolute w-[620px] h-[620px] object-contain opacity-25 pointer-events-none z-0 -bottom-24 -left-24"
          style={{ 
            filter: "brightness(0) invert(1)", 
            transform: "rotate(20deg)"
          }}
        />

        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-[0.08] bg-cover bg-bottom mix-blend-overlay pointer-events-none z-0" />

        <Link 
          href="/login?view=registro" 
          className="absolute top-8 left-8 sm:top-10 sm:left-10 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Volver</span>
        </Link>
        
        <div className="w-full max-w-xl bg-white/95 backdrop-blur-sm p-6 sm:p-10 rounded-[2rem] border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative z-10 my-8">
          <div className="text-center mb-8">
            <div 
              className="w-24 h-24 mx-auto mb-6 bg-sky-100" 
              style={{ WebkitMaskImage: "url('/logo.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: "url('/logo.png')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
              aria-label="Logo Estudiantes U"
              role="img"
            />
            <h2 className="text-3xl font-medium tracking-tight text-slate-800 font-display mb-3 uppercase">
              Únete como Estudiante
            </h2>
            <p className="text-slate-500 font-medium font-body">
              Crea tu cuenta institucional para recibir mentoría, pasantías y apoyo en tu proyecto de graduación.
            </p>
          </div>

          <EstudianteRegisterForm />

          <div className="mt-8 text-center text-slate-500 font-medium font-body">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-bold text-ucr-celeste hover:underline transition-colors">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
