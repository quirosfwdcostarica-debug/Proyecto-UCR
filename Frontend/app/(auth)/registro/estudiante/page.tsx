import { EstudianteProfileForm } from "@/components/forms/EstudianteProfileForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function RegistroEstudiantePage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 relative">
      {/* Botón flotante para volver al Dashboard */}
      <Link href="/">
        <Button variant="ghost" className="absolute top-6 right-6 z-30 font-body text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white/70 hover:bg-white border border-slate-200 shadow-sm rounded-full px-4 h-10 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Button>
      </Link>

      {/* Columna Izquierda: Decorativa */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        {/* Imagen de fondo del Campus UCR */}
        <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center"></div>

        
        {/* Overlay degradado oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-slate-900/40 to-slate-950/80 z-10"></div>
        
        {/* Patrones decorativos sutiles detrás del texto */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob z-0"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0f4c81] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000 z-0"></div>

        <div className="relative z-20 p-12 text-center text-white">
          <img 
            src="/escudo-ucr.png" 
            alt="Escudo UCR" 
            className="h-28 w-auto mx-auto mb-8 drop-shadow-xl object-contain"
          />
          <h1 className="text-5xl font-black tracking-wide mb-4 text-white drop-shadow-lg font-display">
            Únete a la Red como Estudiante
          </h1>
          <p className="text-lg text-white/95 max-w-md mx-auto drop-shadow-md font-body font-light leading-relaxed">
            Conecta con profesionales de tu carrera para recibir mentoría, pasantías y apoyo en tu proyecto de graduación.
          </p>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 relative overflow-hidden bg-slate-50/40">
        {/* Imagen de fondo patrón de graduación y UCR */}
        <div className="absolute inset-0 opacity-40 pointer-events-none z-0 select-none bg-cover bg-center" style={{ backgroundImage: "url('/login-pattern.png')" }}></div>

        {/* Círculo decorativo azul brillante detrás del form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-400/20 to-blue-600/10 rounded-full blur-[100px] z-0"></div>

        <div className="w-full max-w-xl relative z-10">
          <EstudianteProfileForm />
        </div>
      </div>
    </div>
  );
}
