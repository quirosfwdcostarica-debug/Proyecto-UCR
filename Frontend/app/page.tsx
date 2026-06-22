"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { CheckCircle2, Circle, Sparkles, Building2, Users, UserCircle, Coffee, Calendar, Clock, Send, Briefcase, Heart, DollarSign } from "lucide-react";
import Image from "next/image";
import { IntroVideo } from "@/components/layout/IntroVideo";
import Link from "next/link";
import { WelcomeCarousel } from "@/components/layout/WelcomeCarousel";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LandingPage from "@/components/landing/LandingPage";

export default function RootPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-t-[#00C0F3] border-r-transparent border-b-transparent border-l-transparent animate-spin border-[#00C0F3]/20" />
          <p className="text-white dark:text-slate-300 text-sm font-semibold tracking-wide animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard />;
}

function Dashboard() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const role = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";
  const isEstudiante = role === "ESTUDIANTE";
  const userName = session?.user?.name || "Usuario";

  // Profile data from API
  const [profile, setProfile] = useState<any>(null);
  const [mentorCount, setMentorCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch own profile for real data
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => { if (d?.id) setProfile(d); })
      .catch(() => {});

    // Fetch mentor count
    fetch("/api/exalumnos")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setMentorCount(d.length); })
      .catch(() => {});
  }, []);

  // Student profile fields (with sensible fallbacks)
  const proyectoTitulo  = profile?.estudiante?.proyecto_titulo  || "Proyecto de Graduación";
  const carrera         = profile?.estudiante?.carrera          || "Carrera UCR";
  const matchesActivos  = profile?.matchesActivos  ?? 0;
  const matchesPendientes = profile?.matchesPendientes ?? 0;

  // Beca Modal States
  const [isBecaOpen, setIsBecaOpen] = useState(false);
  const [becaJustification, setBecaJustification] = useState("");
  const [becaMonto] = useState("¢450,000");

  // Coffee Modal States
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<{ name: string; role: string } | null>(null);
  const [coffeeDate, setCoffeeDate] = useState("");
  const [coffeeTime, setCoffeeTime] = useState("");
  const [coffeeMessage, setCoffeeMessage] = useState("");

  const handleApplyBeca = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBecaOpen(false);
    setBecaJustification("");
    toast({
      title: "Solicitud de Beca Enviada",
      description: `Tu postulación al fondo de Excelencia de Exalumnos por ${becaMonto} ha sido recibida con éxito y está en revisión.`
    });
  };

  const handleScheduleCoffee = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCoffeeOpen(false);
    setCoffeeDate("");
    setCoffeeTime("");
    setCoffeeMessage("");
    toast({
      title: "Café Virtual Solicitado",
      description: `Se ha enviado la solicitud a ${selectedMentor?.name} para el día ${coffeeDate} a las ${coffeeTime}. Recibirás un correo de confirmación.`
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 relative flex flex-col">
      {/* Portada Superior (Hero con Carrusel) */}
      <div className="relative overflow-hidden bg-slate-950 h-[480px] w-full border-b border-white/10 flex flex-col justify-between">
        <WelcomeCarousel className="absolute inset-0 w-full h-full z-0 bg-slate-950" />
        <IntroVideo />
        <div id="dashboard-main-content" className="relative z-10 h-full flex flex-col justify-between">
          <div className="px-8 pb-6 mt-auto">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">
              {isEstudiante ? "Comunidad Exalumnos UCR" : "Portal de Mentoría y Filantropía"}
            </h1>
            <p className="text-xs text-white/80 drop-shadow-sm font-medium">
              {isEstudiante 
                ? "Conectando generaciones de la Universidad de Costa Rica" 
                : "Apoya a la comunidad estudiantil y comparte tu experiencia profesional"}
            </p>
          </div>
        </div>
      </div>

      {/* Sección Inferior (Contenido con Fondo Sólido) */}
      <div className="p-8 max-w-7xl mx-auto space-y-6 w-full flex-1">
        
        {isEstudiante ? (
          <>
            {/* VISTA ESTUDIANTE */}
            {/* Top Section - Tarjetas Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              
              {/* Main Welcome Card */}
              <Card className="lg:col-span-2 p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex relative overflow-hidden">
                <div className="w-full relative z-10 text-foreground flex flex-col justify-center min-h-[200px]">
                  <p className="text-sm font-semibold tracking-wider text-[#0f4c81] dark:text-sky-400 mb-2 uppercase">Bienvenido de nuevo, {userName}</p>
                  <h1 className="text-4xl font-extrabold text-foreground mb-4 leading-tight">
                    {proyectoTitulo !== "Proyecto de Graduación" ? (
                      <>{proyectoTitulo}<br/><span className="text-[#22c55e]">{carrera}</span></>
                    ) : (
                      <>Tu comunidad de Exalumnos UCR<br/><span className="text-[#22c55e]">te espera.</span></>
                    )}
                  </h1>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed max-w-md">
                    {matchesActivos > 0
                      ? `Tienes ${matchesActivos} match${matchesActivos > 1 ? "es" : ""} activo${matchesActivos > 1 ? "s" : ""}. Continúa conectando con la red de exalumnos.`
                      : matchesPendientes > 0
                        ? `Tienes ${matchesPendientes} match${matchesPendientes > 1 ? "es" : ""} sugerido${matchesPendientes > 1 ? "s" : ""}. ¡Revísalos y conecta con exalumnos!`
                        : "Explora el directorio de exalumnos y conecta con mentores que te ayudarán a avanzar en tu carrera."}
                  </p>
                  <div className="flex gap-4">
                    <Link href="/proyecto/hitos">
                      <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white border-0">Ver Hitos</Button>
                    </Link>
                    <Link href="/proyecto/bitacora">
                      <Button variant="outline" className="border-slate-300 dark:border-slate-700">Bitácora</Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Project Status */}
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-foreground">Estado del Proyecto</h3>
                  <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0">EN CAMINO</Badge>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{proyectoTitulo}</span>
                    <span className="text-[#0f4c81] dark:text-sky-400 text-sm font-semibold">{carrera}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {matchesActivos > 0 ? `${matchesActivos} mentor${matchesActivos > 1 ? "es" : ""} activo${matchesActivos > 1 ? "s" : ""}` : "Sin matches activos aún"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 line-through">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Revisión de Literatura</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 line-through">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Fase de Recolección de Datos</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                    <span className="text-sm">Análisis Final y Reporte</span>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              

              {/* Support & Resources */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">Apoyo y Recursos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-[#0f4c81] flex items-center justify-center text-white mb-4">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">Fondos de Beca</p>
                    <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">¢450,000</h4>
                    <p className="text-xs font-semibold text-green-600">+12% desde el ciclo anterior</p>
                  </Card>
                  <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-green-700 flex items-center justify-center text-white mb-4">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">Mentorías Activas</p>
                    <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">
                      {mentorCount === null ? "..." : `${mentorCount} Mentor${mentorCount !== 1 ? "es" : ""}`}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">Exalumnos en la plataforma</p>
                  </Card>
                </div>
                <Card className="p-5 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-between shadow-md">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#0f4c81] dark:text-sky-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground">Beca de Carrera Disponible</h5>
                      <p className="text-sm text-slate-500">Tu perfil califica para el fondo de Excelencia de Exalumnos.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsBecaOpen(true)}
                    variant="outline" 
                    className="border-[#0f4c81] text-[#0f4c81] dark:border-sky-400 dark:text-sky-400"
                  >
                    Aplicar Ahora
                  </Button>
                </Card>
              </div>
            </div>


          </>
        ) : (
          <>
            {/* VISTA EXALUMNO */}
            {/* Top Section - Tarjetas Exalumno */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              
              {/* Welcome Exalumno Card */}
              <Card className="lg:col-span-2 p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex relative overflow-hidden">
                <div className="w-full relative z-10 text-foreground flex flex-col justify-center min-h-[200px]">
                  <p className="text-sm font-semibold tracking-wider text-[#0f4c81] dark:text-sky-400 mb-2 uppercase">Tablero del Exalumno</p>
                  <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                    Hola de nuevo, {session?.user?.name || "Graduado"}. <br/>
                    <span className="text-[#0f4c81] dark:text-sky-400">Tu red está activa.</span>
                  </h1>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed max-w-md">
                    Gracias por apoyar al talento de la UCR. Tienes 3 solicitudes de café virtual de estudiantes esperando tu respuesta esta semana.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/directorio/estudiantes">
                      <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white border-0">Ver Estudiantes</Button>
                    </Link>
                    <Link href="/posiciones">
                      <Button variant="outline" className="border-slate-300 dark:border-slate-700">Publicar Empleo</Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Impact Card */}
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-foreground">Tu Impacto</h3>
                    <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0">FILÁNTROPO UCR</Badge>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-sm text-slate-500 block mb-1">Donación Total Acumulada</span>
                      <span className="text-3xl font-extrabold text-[#0f4c81] dark:text-sky-400">¢950,000</span>
                    </div>
                    
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Proyectos Patrocinados</span>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Energía Renovable (Gabriel)</span>
                            <span className="font-bold text-[#0f4c81] dark:text-sky-400">75%</span>
                          </div>
                          <Progress value={75} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Plataforma Inclusiva (María)</span>
                            <span className="font-bold text-[#0f4c81] dark:text-sky-400">40%</span>
                          </div>
                          <Progress value={40} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Middle Section - Exalumno */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              



            </div>


          </>
        )}
      </div>
    
    {/* Modal Beca */}
    <Dialog open={isBecaOpen} onOpenChange={setIsBecaOpen}>
      <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0f4c81] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
            Aplicar a Beca de Excelencia
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Estás postulando para el fondo especial de exalumnos por un monto total de <span className="font-semibold text-slate-700">{becaMonto}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleApplyBeca} className="space-y-4 my-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Nombre del Solicitante</Label>
            <Input value={userName} disabled className="text-xs bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Proyecto de Graduación</Label>
            <Input value={proyectoTitulo} disabled className="text-xs bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="beca-justificacion" className="text-xs font-bold text-slate-700">Justificación de la Solicitud</Label>
            <Textarea 
              id="beca-justificacion" 
              placeholder="Explica brevemente en qué se utilizarán los fondos de beca y cómo beneficiará el desarrollo de tu proyecto..." 
              className="text-xs min-h-[90px]"
              value={becaJustification}
              onChange={(e) => setBecaJustification(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white text-xs font-semibold">
              Enviar Postulación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Modal Café Virtual */}
    <Dialog open={isCoffeeOpen} onOpenChange={setIsCoffeeOpen}>
      <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0f4c81] flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-700" />
            Agendar Café Virtual
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Solicita una sesión informal de mentoría de 30 minutos con <span className="font-semibold text-slate-700">{selectedMentor?.name}</span> ({selectedMentor?.role}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleScheduleCoffee} className="space-y-4 my-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="coffee-date" className="text-xs font-bold text-slate-700">Fecha Propuesta</Label>
              <Input 
                id="coffee-date" 
                type="date" 
                className="text-xs"
                value={coffeeDate}
                onChange={(e) => setCoffeeDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="coffee-time" className="text-xs font-bold text-slate-700">Hora Propuesta</Label>
              <Input 
                id="coffee-time" 
                type="time" 
                className="text-xs"
                value={coffeeTime}
                onChange={(e) => setCoffeeTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="coffee-msg" className="text-xs font-bold text-slate-700">Mensaje para el Mentor</Label>
            <Textarea 
              id="coffee-msg" 
              placeholder="Hola, me gustaría conversar sobre..." 
              className="text-xs min-h-[90px]"
              value={coffeeMessage}
              onChange={(e) => setCoffeeMessage(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white text-xs font-semibold gap-2">
              <Send className="h-3 w-3" />
              Confirmar Solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </div>
  );
}
