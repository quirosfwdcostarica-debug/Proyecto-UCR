"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { TopBar } from "@/components/layout/TopBar";
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
      description: "Tu postulación al fondo de Excelencia de Exalumnos por ¢450,000 ha sido recibida con éxito y está en revisión."
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
          <TopBar title="Tablero" />
          
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
                  <p className="text-sm font-semibold tracking-wider text-[#0f4c81] dark:text-sky-400 mb-2 uppercase">Bienvenido de nuevo, Gabriel</p>
                  <h1 className="text-4xl font-extrabold text-foreground mb-4 leading-tight">
                    Tu camino a la graduación está <br/>
                    <span className="text-[#22c55e]">75% completado.</span>
                  </h1>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed max-w-md">
                    Sigue con el excelente trabajo en tu Proyecto de Graduación. Tienes 2 revisiones pendientes de tu mentor esta semana.
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
                    <span className="text-slate-700 dark:text-slate-300">Investigación de Energía Renovable</span>
                    <span className="text-[#0f4c81] dark:text-sky-400 text-lg font-bold">75%</span>
                  </div>
                  <Progress value={75} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
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
              
              {/* Recent Applications */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-foreground">Postulaciones Recientes</h3>
                  <button className="text-sm font-semibold text-[#0f4c81] dark:text-sky-400">Ver Todas</button>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Empresa</th>
                        <th className="px-6 py-3">Posición</th>
                        <th className="px-6 py-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded border border-slate-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[10px] font-bold text-[#0f4c81] dark:text-sky-300">TCH</div>
                          <span className="font-semibold text-foreground">TechCorp Global</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Pasante de Software</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 border-0">Entrevistando</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded border border-slate-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">SST</div>
                          <span className="font-semibold text-foreground">SustainSystems</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Analista de Datos</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/60 border-0">En Revisión</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">LBC</div>
                          <span className="font-semibold text-foreground">LibreConsult</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Asistente de Proyecto</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/60 border-0">Cerrado</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

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
                    <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">2 Mentores</h4>
                    <p className="text-xs font-medium text-slate-500">Última sesión: hace 2 días</p>
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

            {/* Recommended Mentors */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-foreground">Mentores Recomendados</h3>
                <Badge className="bg-[#0f4c81] text-white hover:bg-[#0f4c81] border-0 text-xs px-2 py-0.5">⚡ EMPAREJAMIENTO IA</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {[
                  { name: "Ing. Maria Valverde", role: "Ing. Principal @ Intel CR", tags: ["Semicond.", "Liderazgo"], match: "98% Coincidencia" },
                  { name: "Dr. Roberto Solís", role: "Científico Principal", tags: ["BioTech", "I+D"], match: "92% Coincidencia" },
                  { name: "Lic. Elena Mora", role: "Estratega de Producto", tags: ["Startups", "UX"], match: "85% Coincidencia" }
                ].map((mentor, i) => (
                  <Card key={i} className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300">
                    <div className="h-48 bg-slate-200 dark:bg-slate-900 relative">
                      {/* Grayscale image placeholder */}
                      <div className="absolute inset-0 bg-slate-300 dark:bg-slate-800 grayscale flex justify-center items-end">
                         <UserCircle className="h-32 w-32 text-slate-400 dark:text-slate-600 mb-[-1rem]"/>
                      </div>
                      <Badge className="absolute bottom-3 right-3 bg-green-600 text-white hover:bg-green-600 border-0">{mentor.match}</Badge>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-base text-foreground mb-1">{mentor.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{mentor.role}</p>
                      <div className="flex gap-2 mb-6">
                        {mentor.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">{tag}</span>
                        ))}
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedMentor(mentor);
                          setIsCoffeeOpen(true);
                        }}
                        className="w-full mt-auto bg-blue-50 dark:bg-blue-900/40 text-[#0f4c81] dark:text-sky-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-semibold border-0"
                      >
                        Solicitar Café Virtual
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Find More Mentors Card */}
                <Card className="overflow-hidden border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center shadow-md">
                  <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#0f4c81] dark:text-sky-400" />
                  </div>
                  <h4 className="font-bold text-base text-[#0f4c81] dark:text-sky-400 mb-2">Encontrar Más Mentores</h4>
                  <p className="text-sm text-slate-500 mb-6">Explora nuestra base de datos con más de 5,000 exalumnos verificados.</p>
                  <Link href="/directorio/exalumnos" className="w-full">
                    <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white">Explorar Directorio</Button>
                  </Link>
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
              
              {/* Job Applicants Card */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-foreground">Postulantes a tus Vacantes</h3>
                  <Link href="/posiciones">
                    <button className="text-sm font-semibold text-[#0f4c81] dark:text-sky-400">Ver Todas</button>
                  </Link>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Estudiante</th>
                        <th className="px-6 py-3">Carrera</th>
                        <th className="px-6 py-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold">GS</div>
                          <span className="font-semibold text-foreground">Gabriel Solano</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Ingeniería Eléctrica</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 border-0">Entrevistando</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">MR</div>
                          <span className="font-semibold text-foreground">Mariana Rodríguez</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Computación</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/60 border-0">En Revisión</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Student Projects Seeking Funding */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">Proyectos Estudiantiles buscando Apoyo</h3>
                <div className="space-y-4">
                  <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground">Robot Recolector de Plástico</h4>
                        <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-0">Beca 4</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        Estudiante: Carlos Arguedas. Construcción de un robot automatizado para limpiar residuos plásticos en el campus de la UCR.
                      </p>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>Financiamiento requerido: ¢200,000</span>
                        <span className="text-[#0f4c81] dark:text-sky-400">55% completado</span>
                      </div>
                      <Progress value={55} className="h-2 bg-slate-100 dark:bg-slate-800 mb-4" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Link href="/donaciones">
                        <Button size="sm" className="bg-[#0f4c81] text-white hover:bg-[#0b3a63]">Ver Detalles y Donar</Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Bottom Section - Recommended Students to Mentor */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-foreground">Estudiantes Sugeridos para Mentoría</h3>
                <Badge className="bg-[#0f4c81] text-white hover:bg-[#0f4c81] border-0 text-xs px-2 py-0.5">⚡ EMPAREJAMIENTO IA</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {[
                  { name: "Gabriel Solano", career: "Bach. Ingeniería Eléctrica", match: "98% Coincidencia", tags: ["Semicond.", "Hardware", "Energía"] },
                  { name: "Andrea Gómez", career: "Lic. Computación e Informática", match: "92% Coincidencia", tags: ["AI", "Software", "Web"] },
                  { name: "Carlos Arguedas", career: "Bach. Ingeniería Mecánica", match: "88% Coincidencia", tags: ["Mecatrónica", "Robótica", "CAD"] }
                ].map((student, i) => (
                  <Card key={i} className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-base text-foreground">{student.name}</h4>
                        <p className="text-xs text-slate-500">{student.career}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{student.match}</Badge>
                    </div>
                    <div className="flex gap-2 mb-6">
                      {student.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Propuesta de Mentoría Enviada",
                          description: `Se ha enviado tu invitación de mentoría a ${student.name}. Recibirás una notificación cuando acepte.`
                        });
                      }}
                      className="w-full mt-auto bg-blue-50 text-[#0f4c81] hover:bg-blue-100 font-semibold border-0"
                    >
                      Ofrecer Mentoría
                    </Button>
                  </Card>
                ))}
              </div>
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
            <Input value="Gabriel Solano" disabled className="text-xs bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Proyecto de Graduación</Label>
            <Input value="Investigación de Energía Renovable" disabled className="text-xs bg-slate-50 text-slate-500" />
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
