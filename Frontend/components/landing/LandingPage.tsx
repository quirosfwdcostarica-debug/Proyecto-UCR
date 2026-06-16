"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Briefcase, 
  Heart, 
  Users, 
  Coffee, 
  ArrowRight, 
  Sparkles, 
  MessageSquare,
  Award,
  BookOpen,
  ArrowUpRight,
  Shield,
  Lightbulb,
  Sparkle,
  Phone,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WelcomeCarousel, LANDING_CAROUSEL_IMAGES } from "@/components/layout/WelcomeCarousel";
import { IntroVideo } from "@/components/layout/IntroVideo";

// Componentes de las Figuras Oficiales de la Marca
const UCRUElement = ({ className = "" }: { className?: string }) => (
  <div className={`select-none pointer-events-none ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      {/* Red-orange U-shape */}
      <path d="M 30 15 H 85 V 50 A 27.5 27.5 0 0 1 30 50 Z" fill="#F34B26" />
      {/* Orange circle */}
      <circle cx="28" cy="48" r="14" fill="#FF9B18" />
    </svg>
  </div>
);

const UCRFlowerElement = ({ className = "" }: { className?: string }) => (
  <div className={`select-none pointer-events-none ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      {/* 12 Petals rotated around center (50, 50) */}
      <circle cx="50" cy="50" r="12" fill="#FF9B18" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <rect
          key={deg}
          x="46.5"
          y="12"
          width="7"
          height="28"
          rx="3.5"
          fill="#FF9B18"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
    </svg>
  </div>
);

const UCRSlantedBarElement = ({ className = "", color = "#006AD3" }: { className?: string; color?: string }) => (
  <div className={`select-none pointer-events-none ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]" preserveAspectRatio="none">
      {/* Parallelogram slanted to the left */}
      <polygon points="40,0 100,0 60,100 0,100" fill={color} />
    </svg>
  </div>
);

export default function LandingPage() {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Auto-slide effect for the carousel (6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % LANDING_CAROUSEL_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);



  // Datos mockeados de testimonios
  const testimonios = [
    {
      nombre: "Gabriel Solano",
      rol: "Estudiante de Ing. Eléctrica",
      texto: "Gracias a la beca del fondo de Exalumnos pude adquirir los componentes necesarios para finalizar mi proyecto de investigación de energía renovable, y hoy realizo una pasantía gestionada a través de la bolsa de la plataforma.",
      iniciales: "GS",
      color: "bg-ucr-esmeralda",
    },
    {
      nombre: "Ing. María Valverde",
      rol: "Ingeniera Principal en Intel CR (Exalumna)",
      texto: "Poder guiar a muchachos talentosos que están en la misma posición en la que yo estuve hace años es sumamente gratificante. Compartir un café virtual de 30 minutos puede marcar la diferencia en sus carreras.",
      iniciales: "MV",
      color: "bg-ucr-amarillo text-ucr-negro",
    },
    {
      nombre: "Andrea Gómez",
      rol: "Graduada de Computación",
      texto: "La plataforma me conectó con un mentor excepcional que me aconsejó durante todo mi último año. Hoy trabajo en el equipo que él lidera. ¡Una red de apoyo real y activa!",
      iniciales: "AG",
      color: "bg-[#006AD3]",
    }
  ];

  return (
    <div className="min-h-screen bg-ucr-gris-fondo dark:bg-ucr-negro font-body transition-colors duration-300 relative overflow-hidden flex flex-col">
      {/* Intro Video (plays once per session) */}
      <IntroVideo />
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-ucr-celeste/10 dark:bg-ucr-celeste/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-ucr-esmeralda/10 dark:bg-ucr-esmeralda/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header/Navbar (Absolute overlay) */}
      <header className="absolute top-0 left-0 w-full z-50 transition-all duration-300 bg-gradient-to-b from-black/70 via-black/30 to-transparent border-none">
        <div className="w-full pl-6 pr-0 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo U" 
              className="h-12 w-auto object-contain dark:brightness-110"
            />
            <div className="hidden sm:block border-l border-white/20 pl-3">
              <span className="text-base font-medium tracking-tight text-white font-display block leading-none">EXALUMNOS U</span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block mt-1">Impacto y Legado</span>
            </div>
          </div>


          {/* CTA Buttons */}
          <div className="flex items-center gap-3 pr-6">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white font-bold text-xs uppercase tracking-wider">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button className="bg-[#006AD3] hover:bg-[#0056ab] text-white font-extrabold text-xs uppercase tracking-wider rounded-[10px] h-10 px-5 border-none transition-all shadow-md">
                Inscribirse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[680px] flex items-center pb-28 text-white overflow-hidden bg-ucr-negro w-full">
        <WelcomeCarousel 
          className="absolute inset-0 w-full h-full z-0 bg-ucr-negro" 
          currentIndex={currentCarouselIndex} 
          images={LANDING_CAROUSEL_IMAGES}
        />
        
        {/* Overlays: gradient mask for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ucr-negro/85 via-ucr-negro/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-ucr-negro/50 via-transparent to-transparent z-10 pointer-events-none" />
        
        {/* Diagonal Slash Cutout */}
        <div className="absolute bottom-0 left-0 right-0 h-[160px] z-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {/* Subtle background wave accent (taller and scalloped) */}
            <path 
              d="M 0,32 C 100,32 120,12 200,12 C 280,12 300,42 400,42 C 500,42 520,5 620,5 C 720,5 750,32 850,32 C 900,32 950,22 1000,22 L 1000,100 L 0,100 Z" 
              fill="#4BA5D9" 
              opacity="0.3" 
            />
            {/* Main brand blue wavy shape (taller and scalloped, filled all the way to the bottom) */}
            <path 
              d="M 0,40 C 100,40 120,20 200,20 C 280,20 300,50 400,50 C 500,50 520,10 620,10 C 720,10 750,40 850,40 C 900,40 950,30 1000,30 L 1000,100 L 0,100 Z" 
              fill="#006AD3" 
            />
          </svg>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="md:col-span-8 space-y-6 text-left pt-16 relative">
            {/* Very subtle background star watermark behind text */}
            <div className="absolute -left-12 -top-16 w-64 h-64 text-white/[0.03] pointer-events-none z-0 select-none animate-[spin_180s_linear_infinite] hidden lg:block">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                <path d="M50 0 L55 35 L85 15 L65 45 L100 50 L65 55 L85 85 L55 65 L50 100 L45 65 L15 85 L35 55 L0 50 L35 45 L15 15 L45 35 Z" />
              </svg>
            </div>
            {/* Slide Index Indicator */}
            <div className="flex items-center gap-3 text-sm font-semibold tracking-widest font-body text-slate-300">
              <span>{String(currentCarouselIndex + 1).padStart(2, '0')}</span>
              <span className="w-16 h-[2px] bg-ucr-celeste block"></span>
              <span className="opacity-50">03</span>
            </div>

            {/* Overline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ucr-celeste/15 border border-ucr-celeste/30 text-ucr-celeste text-xs font-bold uppercase tracking-widest font-body">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              COMUNIDAD OFICIAL ALUMNI U
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight font-display leading-[1.15] text-white max-w-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              Fundación <br/>
              <span className="font-light">Exalumnos de la U</span>
            </h1>
            
            {/* Sub-info details */}
            <div className="text-xs sm:text-sm font-semibold tracking-wider text-slate-200/90 font-body uppercase">
              LA UNIVERSIDAD • PORTAL DE VINCULACIÓN PROFESIONAL
            </div>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl font-medium font-body">
              El punto de encuentro donde graduados consolidados de la Universidad guían, patrocinan y abren oportunidades profesionales a estudiantes que construyen su futuro.
            </p>

            {/* CTA and Arrows */}
            <div className="pt-4 flex flex-wrap items-center gap-6">
              <a href="#roles">
                <Button className="h-14 px-10 rounded-[10px] bg-[#006AD3] hover:bg-[#0056ab] text-white font-bold shadow-lg transition-all text-sm uppercase tracking-wider border-none">
                  ¿Querés ser parte?
                </Button>
              </a>
              <a href="#pilares">
                <Button className="h-14 px-8 rounded-[10px] bg-[#F34B26] hover:bg-[#d73b1d] text-white font-bold shadow-lg transition-all text-sm uppercase tracking-wider border-none">
                  CONOCER MÁS
                </Button>
              </a>
            </div>

          </div>

          {/* Right Content - Empty grid column to keep layout alignment and campus background visible */}
          <div className="hidden md:block md:col-span-4" />
        </div>


      </section>

      {/* Roles Selection Section (Floating entry points moved below Hero to maintain design cleanliness) */}
      <section id="roles" className="py-20 bg-ucr-gris-fondo dark:bg-ucr-negro relative z-20 border-b border-slate-200/40 dark:border-slate-800/40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 space-y-3 relative">
            {/* Centered background watermark */}
            <UCRUElement className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-80 dark:opacity-50 pointer-events-none z-0 rotate-12" />
            <div className="relative z-10 space-y-3">
              <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">¿CÓMO DESEAS PARTICIPAR?</h2>
              <h3 className="text-3xl font-medium font-display text-ucr-texto-oscuro dark:text-white uppercase leading-tight">SELECCIONA TU ROL DE INGRESO</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                Únete a la plataforma oficial de vinculación de la Universidad según tu perfil.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Card */}
            <Link href="/registro/estudiante" className="group">
              <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 hover:border-ucr-celeste p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ucr-celeste to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="flex items-start gap-5">
                  <div className="bg-ucr-celeste-tint dark:bg-ucr-celeste/20 text-ucr-esmeralda dark:text-ucr-celeste p-4 rounded-2xl group-hover:scale-110 group-hover:bg-ucr-celeste/30 transition-all duration-300">
                    <GraduationCap className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-white font-display flex items-center gap-2 uppercase">
                      Soy Estudiante
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                      Accede a mentoría profesional, agenda cafés virtuales, solicita becas de graduación y postulate a pasantías exclusivas.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Alumni Card */}
            <Link href="/registro/exalumno" className="group">
              <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 hover:border-ucr-amarillo p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ucr-amarillo to-[#FFB347] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="flex items-start gap-5">
                  <div className="bg-ucr-beige-tint dark:bg-ucr-amarillo/20 text-ucr-amarillo p-4 rounded-2xl group-hover:scale-110 group-hover:bg-ucr-beige-tint/30 transition-all duration-300">
                    <Briefcase className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-white font-display flex items-center gap-2 uppercase">
                      Soy Exalumno
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                      Comparte tu trayectoria, ofrece mentoría a futuros colegas, publica ofertas de empleo y patrocina proyectos e iniciativas estudiantiles.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="pilares" className="py-20 lg:py-28 w-full bg-white dark:bg-ucr-negro border-b border-slate-200/40 dark:border-slate-800/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative">
          {/* Centered background watermark */}
          <UCRFlowerElement className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-80 dark:opacity-50 pointer-events-none z-0 animate-[spin_180s_linear_infinite]" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">¿CÓMO FUNCIONA LA RED?</h2>
            <h3 className="text-3xl sm:text-4xl font-medium tracking-tight font-display text-ucr-texto-oscuro dark:text-white leading-tight uppercase">
              LOS TRES PILARES DE NUESTRO IMPACTO
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Conectamos el conocimiento académico de las aulas de la U con el liderazgo práctico de los sectores profesionales.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <Card className="p-8 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-celeste transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div>
              <div className="bg-ucr-celeste-tint dark:bg-ucr-celeste/20 text-ucr-esmeralda dark:text-sky-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-300">
                <Coffee className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold text-ucr-texto-oscuro dark:text-white mb-3 font-display uppercase">
                MENTORÍAS Y CAFÉS VIRTUALES
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Conéctate directamente para conversar informalmente. Recibe guía sobre tu proyecto final, revisiones de currículum y recomendaciones clave para dar tus primeros pasos profesionales.
              </p>
            </div>

          </Card>

          {/* Pillar 2 */}
          <Card className="p-8 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-esmeralda transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div>
              <div className="bg-ucr-turquesa-tint dark:bg-ucr-esmeralda/20 text-[#004C63] dark:text-sky-300 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold text-ucr-texto-oscuro dark:text-white mb-3 font-display uppercase">
                OPORTUNIDADES LABORALES
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Accede a una bolsa de empleo diseñada específicamente para estudiantes y graduados recientes de la U. Encuentra vacantes publicadas y recomendadas de primera mano por los mismos exalumnos.
              </p>
            </div>

          </Card>

          {/* Pillar 3 */}
          <Card className="p-8 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-naranja transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div>
              <div className="bg-ucr-rosa-tint dark:bg-ucr-naranja/20 text-ucr-naranja w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-300">
                <Heart className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold text-ucr-texto-oscuro dark:text-white mb-3 font-display uppercase">
                FILANTROPÍA Y BECAS DE IMPULSO
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Apoya o postula a fondos especiales para financiar proyectos de graduación. El fondo solidario de exalumnos busca que ningún estudiante talentoso detenga su carrera por limitaciones económicas.
              </p>
            </div>

          </Card>
        </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impacto" className="bg-ucr-naranja text-white py-20 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.1),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text left */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-bold text-white/90 uppercase tracking-widest font-body">CIFRAS QUE INSPIRAN</h2>
              <h3 className="text-3xl sm:text-4xl font-medium font-display leading-tight uppercase text-white">
                EL IMPACTO DE NUESTRA RED DE EXALUMNOS DE LA U
              </h3>
              <p className="text-sm text-white/85 leading-relaxed font-medium font-body">
                La Fundación trabaja incansablemente para promover la inserción laboral y el desarrollo académico. Cada aporte, cada hora de mentoría compartida y cada donación construye un camino más sólido para las próximas generaciones.
              </p>
              <div className="border-t border-white/20 pt-6">
                <p className="text-xs text-white/90 font-bold flex items-center gap-2 font-body">
                  <Sparkle className="h-4 w-4 text-white fill-white animate-spin" />
                  MÉTRICAS ACTUALIZADAS AUTOMÁTICAMENTE EN TIEMPO REAL
                </p>
              </div>
            </div>

            {/* Grid right */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-8 rounded-[15px] text-center space-y-2 hover:border-white/25 transition-all duration-300">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">5,000+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Exalumnos Activos</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-8 rounded-[15px] text-center space-y-2 hover:border-white/25 transition-all duration-300">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Coffee className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">12,000+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Horas de Mentoría</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-8 rounded-[15px] text-center space-y-2 hover:border-white/25 transition-all duration-300">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">₡15M+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Fondos Recaudados</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-8 rounded-[15px] text-center space-y-2 hover:border-white/25 transition-all duration-300">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">350+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Becas Concedidas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 lg:py-28 w-full bg-ucr-gris-fondo dark:bg-ucr-negro border-b border-slate-200/40 dark:border-slate-800/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative">
          {/* Centered background watermark */}
          <UCRSlantedBarElement color="#006AD3" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-28 opacity-80 dark:opacity-50 pointer-events-none z-0" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">TESTIMONIOS</h2>
            <h3 className="text-3xl sm:text-4xl font-medium tracking-tight font-display text-ucr-texto-oscuro dark:text-white leading-tight uppercase">
              NUESTRA RED EN LA VOZ DE SUS PROTAGONISTAS
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Conoce cómo la plataforma está transformando el desarrollo profesional en la comunidad de la U.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonios.map((t, idx) => (
            <Card key={idx} className="p-8 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950/80 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-ucr-amarillo">
                  <Sparkles className="h-4 w-4 fill-ucr-amarillo" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-body">Historia Recomendada</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic font-body">
                  "{t.texto}"
                </p>
              </div>

              <div className="pt-8 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${t.color} text-white font-extrabold text-sm flex items-center justify-center font-body`}>
                  {t.iniciales}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white font-display leading-tight">{t.nombre}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5 font-body">{t.rol}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-gradient-to-br from-ucr-esmeralda to-ucr-celeste text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-10 bg-cover bg-bottom mix-blend-overlay pointer-events-none"></div>
        
        {/* Centered background watermark */}
        <UCRFlowerElement className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-80 pointer-events-none z-0 animate-[spin_240s_linear_infinite]" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-medium font-display leading-tight text-white uppercase">
            ¿LISTO PARA FORMAR PARTE DE LA RED DE IMPACTO DE LA U?
          </h2>
          <p className="text-sm sm:text-base text-slate-200/80 max-w-xl mx-auto leading-relaxed font-medium font-body">
            Ya seas estudiante en busca de impulso o exalumno con el deseo de guiar a nuevos talentos, tu lugar está aquí.
          </p>
          <div className="pt-4 flex justify-center gap-4 flex-wrap">
            <Link href="/registro">
              <Button size="lg" className="h-14 px-8 rounded-[10px] bg-[#006AD3] hover:bg-[#0056ab] text-white font-bold shadow-md transition-all border-none">
                CREAR CUENTA
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 rounded-[10px] bg-[#F34B26] hover:bg-[#d73b1d] text-white font-bold shadow-md transition-all border-none">
                INICIAR SESIÓN
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-ucr-footer-bg text-slate-400 py-12 border-t border-slate-900 transition-colors relative overflow-hidden">
        {/* Solid brand slanted bar in Celeste on the right background */}
        <UCRSlantedBarElement color="#4BA5D9" className="absolute -right-16 -bottom-16 w-80 h-44 opacity-40 lg:opacity-50 transition-opacity duration-300 z-0" />

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo U" 
              className="h-10 w-auto object-contain brightness-90 dark:brightness-110"
            />
            <div>
              <span className="text-sm font-medium tracking-tight text-white font-display block">La Universidad</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-0.5 font-body">Fundación Exalumnos U</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-xs font-semibold font-body">
            <a href="#" className="hover:text-white transition-colors">CONTACTO</a>
            <a href="#" className="hover:text-white transition-colors">TÉRMINOS</a>
            <a href="#" className="hover:text-white transition-colors">PRIVACIDAD</a>
          </div>

          <div className="text-center md:text-right text-[10px] font-semibold text-slate-600 font-body">
            © {new Date().getFullYear()} Fundación Exalumnos U. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
