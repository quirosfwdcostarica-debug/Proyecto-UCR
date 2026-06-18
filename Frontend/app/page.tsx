"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  CheckCircle2, Circle, Sparkles, Building2, Users,
  UserCircle, Coffee, Send, Briefcase, Heart,
} from "lucide-react";
import { IntroVideo } from "@/components/layout/IntroVideo";
import Link from "next/link";
import { WelcomeCarousel } from "@/components/layout/WelcomeCarousel";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/providers/LanguageContext";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LandingPage from "@/components/landing/LandingPage";
import { motion } from "framer-motion";

/* ── Animated card: fade+slide up on scroll ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1 },
};

function AnimCard({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Hover lift wrapper for cards ── */
function HoverCard({
  children, className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, scale: 1.012, boxShadow: "0 20px 48px -8px rgba(0,0,0,0.14)" }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
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

  if (!session) return <LandingPage />;
  return <Dashboard />;
}

/* ════════════════════════════════════════════════════════ */
function Dashboard() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { data: session } = useSession();

  const role = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";
  const isEstudiante = role === "ESTUDIANTE";

  /* Beca Modal */
  const [isBecaOpen, setIsBecaOpen] = useState(false);
  const [becaJustification, setBecaJustification] = useState("");
  const [becaMonto] = useState("¢450,000");

  /* Coffee Modal */
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<{ name: string; role: string } | null>(null);
  const [coffeeDate, setCoffeeDate] = useState("");
  const [coffeeTime, setCoffeeTime] = useState("");
  const [coffeeMessage, setCoffeeMessage] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleApplyBeca = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBecaOpen(false);
    setBecaJustification("");
    toast({ title: "Solicitud de Beca Enviada", description: `Tu postulación al fondo de Excelencia de Exalumnos por ${becaMonto} ha sido recibida con éxito y está en revisión.` });
  };

  const handleScheduleCoffee = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCoffeeOpen(false);
    setCoffeeDate(""); setCoffeeTime(""); setCoffeeMessage("");
    toast({ title: "Café Virtual Solicitado", description: `Se ha enviado la solicitud a ${selectedMentor?.name} para el día ${coffeeDate} a las ${coffeeTime}. Recibirás un correo de confirmación.` });
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 relative flex flex-col">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-slate-950 h-[480px] w-full border-b border-white/10 flex flex-col justify-between">
        <WelcomeCarousel className="absolute inset-0 w-full h-full z-0 bg-slate-950" />
        <IntroVideo />
        <div id="dashboard-main-content" className="relative z-10 h-full flex flex-col justify-between">
          <TopBar title={t("sidebar.dashboard")} />

          <motion.div
            className="px-8 pb-6 mt-auto"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <motion.h1
              className="text-2xl font-bold text-white drop-shadow-md"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
            >
              {isEstudiante ? t("dashboard.title.student") : t("dashboard.title.exalumno")}
            </motion.h1>
            <motion.p
              className="text-xs text-white/80 drop-shadow-sm font-medium"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            >
              {isEstudiante ? t("dashboard.subtitle.student") : t("dashboard.subtitle.exalumno")}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="p-8 max-w-7xl mx-auto space-y-8 w-full flex-1">
        
        {/* ── Global Network Stats ── */}
        <AnimCard delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: language === "es" ? "Exalumnos en la red" : "Alumni in network", value: "5,000+", desc: language === "es" ? "+120 esta semana" : "+120 this week", color: "from-[#0f4c81] to-blue-500", grad: "to-blue-500/5 dark:to-blue-500/10" },
              { label: language === "es" ? "Estudiantes apoyados" : "Supported students", value: "1,250+", desc: language === "es" ? "Proyectos activos" : "Active projects", color: "from-emerald-600 to-green-400", grad: "to-emerald-500/5 dark:to-emerald-500/10" },
              { label: language === "es" ? "Matches de mentoría" : "Mentorship matches", value: "480+", desc: language === "es" ? "Conexiones activas" : "Active connections", color: "from-purple-600 to-indigo-400", grad: "to-indigo-500/5 dark:to-indigo-500/10" },
              { label: language === "es" ? "Fondo de Excelencia" : "Excelence Funds", value: "₡12.5M+", desc: language === "es" ? "Meta anual: ₡20M" : "Annual goal: ₡20M", color: "from-orange-600 to-yellow-400", grad: "to-yellow-500/5 dark:to-yellow-500/10" }
            ].map((stat, i) => (
              <HoverCard key={i}>
                <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative overflow-hidden flex flex-col justify-between h-full group backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0f4c81] opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">{stat.label}</span>
                    <h3 className="text-3xl font-extrabold text-foreground group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors duration-300">{stat.value}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    {stat.desc}
                  </p>
                </Card>
              </HoverCard>
            ))}
          </div>
        </AnimCard>

        {isEstudiante ? (
          <>
            {/* Top grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimCard delay={0} className="lg:col-span-2">
                <HoverCard className="h-full">
                  <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex relative overflow-hidden h-full backdrop-blur-md">
                    <div className="w-full relative z-10 text-foreground flex flex-col justify-center min-h-[200px]">
                      <p className="text-sm font-semibold tracking-wider text-[#0f4c81] dark:text-sky-400 mb-2 uppercase">{t("dashboard.welcome.student")}</p>
                      <h1 className="text-4xl font-extrabold text-foreground mb-4 leading-tight">
                        {t("dashboard.welcome.title.student")} <br />
                        <span className="text-[#22c55e]">75% {language === "es" ? "completado" : language === "en" ? "completed" : language === "pt" ? "completado" : "complété"}.</span>
                      </h1>
                      <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed max-w-md">{t("dashboard.welcome.desc.student")}</p>
                      <div className="flex gap-4">
                        <Link href="/proyecto/hitos"><Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white border-0">{t("dashboard.welcome.btn.milestones")}</Button></Link>
                        <Link href="/proyecto/bitacora"><Button variant="outline" className="border-slate-300 dark:border-slate-700">{t("dashboard.welcome.btn.logbook")}</Button></Link>
                      </div>
                    </div>
                  </Card>
                </HoverCard>
              </AnimCard>

              <AnimCard delay={0.15}>
                <HoverCard>
                  <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md backdrop-blur-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-foreground">{t("dashboard.status.title")}</h3>
                      <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0">{t("dashboard.status.ontrack")}</Badge>
                    </div>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-slate-700 dark:text-slate-300">
                          {language === "es" ? "Investigación de Energía Renovable" : language === "en" ? "Renewable Energy Research" : language === "pt" ? "Pesquisa de Energia Renovável" : "Recherche sur les Énergies Renouvelables"}
                        </span>
                        <span className="text-[#0f4c81] dark:text-sky-400 text-lg font-bold">75%</span>
                      </div>
                      <Progress value={75} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-400 line-through">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm">{language === "es" ? "Revisión de Literatura" : language === "en" ? "Literature Review" : language === "pt" ? "Revisão de Literatura" : "Revue de la Littérature"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 line-through">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm">{language === "es" ? "Fase de Recolección de Datos" : language === "en" ? "Data Collection Phase" : language === "pt" ? "Fase de Coleta de Dados" : "Phase de Collecte de Données"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                        <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                        <span className="text-sm">{language === "es" ? "Análisis Final y Reporte" : language === "en" ? "Final Analysis and Report" : language === "pt" ? "Análise Final e Relatório" : "Analyse Finale et Rapport"}</span>
                      </div>
                    </div>
                  </Card>
                </HoverCard>
              </AnimCard>
            </div>

            {/* Middle grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimCard delay={0}>
                <HoverCard>
                  <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md backdrop-blur-md">
                    <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-foreground">{t("dashboard.applications.title")}</h3>
                      <Link href="/posiciones"><button className="text-sm font-semibold text-[#0f4c81] dark:text-sky-400">{t("dashboard.applications.viewall")}</button></Link>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3">{language === "es" ? "Empresa" : language === "en" ? "Company" : language === "pt" ? "Empresa" : "Entreprise"}</th>
                            <th className="px-6 py-3">{language === "es" ? "Posición" : language === "en" ? "Position" : language === "pt" ? "Cargo" : "Poste"}</th>
                            <th className="px-6 py-3 text-right">{language === "es" ? "Estado" : language === "en" ? "Status" : language === "pt" ? "Status" : "Statut"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { abbr: "TCH", name: "TechCorp Global", color: "bg-blue-50 text-[#0f4c81]", pos: { es: "Pasante de Software", en: "Software Intern", pt: "Estagiário de Software", fr: "Stagiaire Logiciel" }, badge: "bg-green-100 text-green-700", status: { es: "Entrevistando", en: "Interviewing", pt: "Entrevistando", fr: "En entretien" } },
                            { abbr: "SST", name: "SustainSystems", color: "bg-indigo-50 text-indigo-700", pos: { es: "Analista de Datos", en: "Data Analyst", pt: "Analista de Dados", fr: "Analyste de Données" }, badge: "bg-blue-50 text-blue-700", status: { es: "En Revisión", en: "Under Review", pt: "Em Revisão", fr: "En cours d'examen" } },
                            { abbr: "LBC", name: "LibreConsult", color: "bg-slate-50 text-slate-600", pos: { es: "Asistente de Proyecto", en: "Project Assistant", pt: "Assistente de Projeto", fr: "Assistant de Projet" }, badge: "bg-red-50 text-red-700", status: { es: "Cerrado", en: "Closed", pt: "Fechado", fr: "Fermé" } },
                          ].map((row, i) => (
                            <motion.tr
                              key={i}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-default"
                              whileHover={{ x: 3 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className={`h-8 w-8 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold ${row.color}`}>{row.abbr}</div>
                                <span className="font-semibold text-foreground">{row.name}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{(row.pos as any)[language] || row.pos.es}</td>
                              <td className="px-6 py-4 text-right"><Badge className={`${row.badge} hover:${row.badge} border-0`}>{(row.status as any)[language] || row.status.es}</Badge></td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </HoverCard>
              </AnimCard>

              <AnimCard delay={0.12}>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground">{t("dashboard.support.title")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <HoverCard>
                      <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md backdrop-blur-md">
                        <div className="h-10 w-10 rounded-lg bg-[#0f4c81] flex items-center justify-center text-white mb-4"><Building2 className="h-5 w-5" /></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">{t("dashboard.support.funds")}</p>
                        <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">¢450,000</h4>
                        <p className="text-xs font-semibold text-green-600">+12% {language === "es" ? "desde el ciclo anterior" : language === "en" ? "since last cycle" : language === "pt" ? "desde o ciclo anterior" : "depuis le dernier cycle"}</p>
                      </Card>
                    </HoverCard>
                    <HoverCard>
                      <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md backdrop-blur-md">
                        <div className="h-10 w-10 rounded-lg bg-green-700 flex items-center justify-center text-white mb-4"><Users className="h-5 w-5" /></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">{t("dashboard.support.mentorships")}</p>
                        <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">2 {language === "es" ? "Mentores" : language === "en" ? "Mentors" : language === "pt" ? "Mentores" : "Mentors"}</h4>
                        <p className="text-xs font-medium text-slate-500">{language === "es" ? "Última sesión: hace 2 días" : language === "en" ? "Last session: 2 days ago" : language === "pt" ? "Última sessão: 2 dias atrás" : "Dernière session : il y a 2 jours"}</p>
                      </Card>
                    </HoverCard>
                  </div>
                  <Card className="p-5 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900 shadow-md flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Sparkles className="h-5 w-5 text-[#0f4c81] dark:text-sky-400" /></div>
                      <div>
                        <h5 className="font-bold text-foreground">{t("dashboard.support.available")}</h5>
                        <p className="text-sm text-slate-500">{t("dashboard.support.available.desc")}</p>
                      </div>
                    </div>
                    <Button onClick={() => setIsBecaOpen(true)} variant="outline" className="border-[#0f4c81] text-[#0f4c81] dark:border-sky-400 dark:text-sky-400">{t("dashboard.support.apply")}</Button>
                  </Card>
                </div>
              </AnimCard>
            </div>

            {/* Mentors */}
            <AnimCard delay={0}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-bold text-foreground">{t("dashboard.mentors.title")}</h3>
                  <Badge className="bg-[#0f4c81] text-white hover:bg-[#0f4c81] border-0 text-xs px-2 py-0.5">{t("dashboard.mentors.ia")}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { name: "Ing. Maria Valverde", role: "Ing. Principal @ Intel CR", tags: ["Semicond.", "Liderazgo"], match: "98% Coincidencia" },
                    { name: "Dr. Roberto Solís", role: "Científico Principal", tags: ["BioTech", "I+D"], match: "92% Coincidencia" },
                    { name: "Lic. Elena Mora", role: "Estratega de Producto", tags: ["Startups", "UX"], match: "85% Coincidencia" },
                  ].map((mentor, i) => (
                    <AnimCard key={i} delay={i * 0.08}>
                      <HoverCard className="h-full">
                        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col h-full backdrop-blur-md">
                          <div className="h-48 bg-slate-200 dark:bg-slate-900 relative">
                            <div className="absolute inset-0 bg-slate-300 dark:bg-slate-800 grayscale flex justify-center items-end">
                              <UserCircle className="h-32 w-32 text-slate-400 dark:text-slate-600 mb-[-1rem]" />
                            </div>
                            <Badge className="absolute bottom-3 right-3 bg-green-600 text-white hover:bg-green-600 border-0">
                              {language === "es" ? mentor.match : language === "en" ? mentor.match.replace("Coincidencia", "Match") : language === "pt" ? mentor.match.replace("Coincidencia", "Compatibilidade") : mentor.match.replace("Coincidencia", "Correspondance")}
                            </Badge>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h4 className="font-bold text-base text-foreground mb-1">{mentor.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{mentor.role}</p>
                            <div className="flex gap-2 mb-6">
                              {mentor.tags.map(tag => <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">{tag}</span>)}
                            </div>
                            <Button onClick={() => { setSelectedMentor(mentor); setIsCoffeeOpen(true); }} className="w-full mt-auto bg-blue-50 text-[#0f4c81] hover:bg-blue-100 font-semibold border-0">{t("dashboard.mentors.coffee")}</Button>
                          </div>
                        </Card>
                      </HoverCard>
                    </AnimCard>
                  ))}

                  <AnimCard delay={0.24}>
                    <HoverCard className="h-full">
                  <Card className="overflow-hidden border-dashed border-2 border-slate-300 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-6 text-center shadow-md h-full">
                        <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4"><Users className="h-6 w-6 text-[#0f4c81] dark:text-sky-400" /></div>
                        <h4 className="font-bold text-base text-[#0f4c81] dark:text-sky-400 mb-2">{t("dashboard.mentors.find")}</h4>
                        <p className="text-sm text-slate-500 mb-6">{t("dashboard.mentors.find.desc")}</p>
                        <Link href="/directorio/exalumnos" className="w-full"><Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white">{t("dashboard.mentors.explore")}</Button></Link>
                      </Card>
                    </HoverCard>
                  </AnimCard>
                </div>
              </div>
            </AnimCard>
          </>

        ) : (
          <>
            {/* ── EXALUMNO VIEW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimCard delay={0} className="lg:col-span-2">
                <HoverCard className="h-full">
                  <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex relative overflow-hidden h-full backdrop-blur-md">
                    <div className="w-full relative z-10 text-foreground flex flex-col justify-center min-h-[200px]">
                      <p className="text-sm font-semibold tracking-wider text-[#0f4c81] dark:text-sky-400 mb-2 uppercase">{t("dashboard.welcome.exalumno")}</p>
                      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                        {language === "es" ? "Hola de nuevo" : language === "en" ? "Hello again" : language === "pt" ? "Olá de novo" : "Bonjour à nouveau"}, {session?.user?.name || "Graduado"}. <br />
                        <span className="text-[#0f4c81] dark:text-sky-400">{t("dashboard.welcome.title.exalumno")}</span>
                      </h1>
                      <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed max-w-md">{t("dashboard.welcome.desc.exalumno")}</p>
                      <div className="flex gap-4">
                        <Link href="/directorio/estudiantes"><Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white border-0">{t("dashboard.welcome.btn.students")}</Button></Link>
                        <Link href="/posiciones"><Button variant="outline" className="border-slate-300 dark:border-slate-700">{t("dashboard.welcome.btn.postJob")}</Button></Link>
                      </div>
                    </div>
                  </Card>
                </HoverCard>
              </AnimCard>

              <AnimCard delay={0.15}>
                <HoverCard>
                  <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between backdrop-blur-md">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-foreground">{t("dashboard.impact.title")}</h3>
                        <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0">{t("dashboard.impact.badge")}</Badge>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <span className="text-sm text-slate-500 block mb-1">{t("dashboard.impact.total")}</span>
                          <span className="text-3xl font-extrabold text-[#0f4c81] dark:text-sky-400">¢950,000</span>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">{t("dashboard.impact.sponsored")}</span>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{language === "es" ? "Energía Renovable (Gabriel)" : language === "en" ? "Renewable Energy (Gabriel)" : language === "pt" ? "Energia Renovável (Gabriel)" : "Énergie Renouvelable (Gabriel)"}</span>
                                <span className="font-bold text-[#0f4c81] dark:text-sky-400">75%</span>
                              </div>
                              <Progress value={75} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{language === "es" ? "Plataforma Inclusiva (María)" : language === "en" ? "Inclusive Platform (María)" : language === "pt" ? "Plataforma Inclusiva (María)" : "Plateforme Inclusive (María)"}</span>
                                <span className="font-bold text-[#0f4c81] dark:text-sky-400">40%</span>
                              </div>
                              <Progress value={40} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </HoverCard>
              </AnimCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimCard delay={0}>
                <HoverCard>
                  <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md backdrop-blur-md">
                    <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-foreground">{t("dashboard.applicants.title")}</h3>
                      <Link href="/posiciones"><button className="text-sm font-semibold text-[#0f4c81] dark:text-sky-400">{t("dashboard.applicants.viewall")}</button></Link>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3">{language === "es" ? "Estudiante" : language === "en" ? "Student" : language === "pt" ? "Estudante" : "Étudiant"}</th>
                          <th className="px-6 py-3">{language === "es" ? "Carrera" : language === "en" ? "Career" : language === "pt" ? "Curso" : "Filière"}</th>
                          <th className="px-6 py-3 text-right">{language === "es" ? "Estado" : language === "en" ? "Status" : language === "pt" ? "Status" : "Statut"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { initials: "GS", name: "Gabriel Solano", color: "bg-blue-100 text-blue-800", career: { es: "Ingeniería Eléctrica", en: "Electrical Engineering", pt: "Engenharia Elétrica", fr: "Génie Électrique" }, badge: "bg-green-100 text-green-700", status: { es: "Entrevistando", en: "Interviewing", pt: "Entrevistando", fr: "En entretien" } },
                          { initials: "MR", name: "Mariana Rodríguez", color: "bg-indigo-100 text-indigo-800", career: { es: "Computación", en: "Computer Science", pt: "Ciência da Computação", fr: "Informatique" }, badge: "bg-blue-50 text-blue-700", status: { es: "En Revisión", en: "Under Review", pt: "Em Revisão", fr: "En cours d'examen" } },
                        ].map((row, i) => (
                          <motion.tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30" whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${row.color}`}>{row.initials}</div>
                              <span className="font-semibold text-foreground">{row.name}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{(row.career as any)[language] || row.career.es}</td>
                            <td className="px-6 py-4 text-right"><Badge className={`${row.badge} border-0`}>{(row.status as any)[language] || row.status.es}</Badge></td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </HoverCard>
              </AnimCard>

              <AnimCard delay={0.12}>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground">{t("dashboard.projects.title")}</h3>
                  <HoverCard>
                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between backdrop-blur-md">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-foreground">{language === "es" ? "Robot Recolector de Plástico" : language === "en" ? "Plastic Collector Robot" : language === "pt" ? "Robô Coletor de Plástico" : "Robot Collecteur de Plastique"}</h4>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">{language === "es" ? "Beca" : language === "en" ? "Scholarship" : language === "pt" ? "Bolsa" : "Bourse"} 4</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{language === "es" ? "Estudiante: Carlos Arguedas. Construcción de un robot automatizado para limpiar residuos plásticos en el campus de la UCR." : language === "en" ? "Student: Carlos Arguedas. Construction of an automated robot to clean plastic waste on the UCR campus." : language === "pt" ? "Estudante: Carlos Arguedas. Construção de um robô automatizado para limpar resíduos plásticos no campus da UCR." : "Étudiant : Carlos Arguedas. Construction d'un robot automatisé pour nettoyer les déchets plastiques sur le campus de l'UCR."}</p>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>{language === "es" ? "Financiamiento requerido" : language === "en" ? "Funding required" : language === "pt" ? "Financiamento requerido" : "Financement requis"}: ¢200,000</span>
                          <span className="text-[#0f4c81] dark:text-sky-400">55% {language === "es" ? "completado" : language === "en" ? "completed" : language === "pt" ? "completado" : "complété"}</span>
                        </div>
                        <Progress value={55} className="h-2 bg-slate-100 dark:bg-slate-800 mb-4" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Link href="/donaciones"><Button size="sm" className="bg-[#0f4c81] text-white hover:bg-[#0b3a63]">{t("dashboard.projects.details")}</Button></Link>
                      </div>
                    </Card>
                  </HoverCard>
                </div>
              </AnimCard>
            </div>

            {/* Students grid */}
            <AnimCard delay={0}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-bold text-foreground">{t("dashboard.students.title")}</h3>
                  <Badge className="bg-[#0f4c81] text-white hover:bg-[#0f4c81] border-0 text-xs px-2 py-0.5">{t("dashboard.mentors.ia")}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Gabriel Solano", career: "Bach. Ingeniería Eléctrica", match: "98% Coincidencia", tags: ["Semicond.", "Hardware", "Energía"] },
                    { name: "Andrea Gómez", career: "Lic. Computación e Informática", match: "92% Coincidencia", tags: ["AI", "Software", "Web"] },
                    { name: "Carlos Arguedas", career: "Bach. Ingeniería Mecánica", match: "88% Coincidencia", tags: ["Mecatrónica", "Robótica", "CAD"] },
                  ].map((student, i) => (
                    <AnimCard key={i} delay={i * 0.08}>
                      <HoverCard className="h-full">
                        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col h-full backdrop-blur-md">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-base text-foreground">{student.name}</h4>
                              <p className="text-xs text-slate-500">{language === "es" ? student.career : language === "en" ? student.career.replace("Ingeniería Eléctrica", "Electrical Engineering").replace("Computación e Informática", "Computer Science").replace("Ingeniería Mecánica", "Mechanical Engineering") : student.career}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{language === "es" ? student.match : language === "en" ? student.match.replace("Coincidencia", "Match") : language === "pt" ? student.match.replace("Coincidencia", "Compatibilidade") : student.match.replace("Coincidencia", "Correspondance")}</Badge>
                          </div>
                          <div className="flex gap-2 mb-6">
                            {student.tags.map(tag => <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">{tag}</span>)}
                          </div>
                          <Button
                            onClick={() => toast({ title: language === "es" ? "Propuesta de Mentoría Enviada" : language === "en" ? "Mentoring Proposal Sent" : language === "pt" ? "Proposta de Mentoria Enviada" : "Proposition de Mentorat Envoyée", description: language === "es" ? `Se ha enviado tu invitación de mentoría a ${student.name}. Recibirás una notificación cuando acepte.` : `Your mentoring invitation has been sent to ${student.name}.` })}
                            className="w-full mt-auto bg-blue-50 text-[#0f4c81] hover:bg-blue-100 font-semibold border-0"
                          >
                            {t("dashboard.students.offer")}
                          </Button>
                        </Card>
                      </HoverCard>
                    </AnimCard>
                  ))}
                </div>
              </div>
            </AnimCard>
          </>
        )}
      </div>

      {/* ── Modal Beca ── */}
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
            <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Nombre del Solicitante</Label><Input value="Gabriel Solano" disabled className="text-xs bg-slate-50 text-slate-500" /></div>
            <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Proyecto de Graduación</Label><Input value="Investigación de Energía Renovable" disabled className="text-xs bg-slate-50 text-slate-500" /></div>
            <div className="space-y-1">
              <Label htmlFor="beca-justificacion" className="text-xs font-bold text-slate-700">Justificación de la Solicitud</Label>
              <Textarea id="beca-justificacion" placeholder="Explica brevemente en qué se utilizarán los fondos de beca..." className="text-xs min-h-[90px]" value={becaJustification} onChange={e => setBecaJustification(e.target.value)} required />
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild><Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button></DialogClose>
              <Button type="submit" className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white text-xs font-semibold">Enviar Postulación</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Café ── */}
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
              <div className="space-y-1"><Label htmlFor="coffee-date" className="text-xs font-bold text-slate-700">Fecha Propuesta</Label><Input id="coffee-date" type="date" className="text-xs" value={coffeeDate} onChange={e => setCoffeeDate(e.target.value)} required /></div>
              <div className="space-y-1"><Label htmlFor="coffee-time" className="text-xs font-bold text-slate-700">Hora Propuesta</Label><Input id="coffee-time" type="time" className="text-xs" value={coffeeTime} onChange={e => setCoffeeTime(e.target.value)} required /></div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="coffee-msg" className="text-xs font-bold text-slate-700">Mensaje para el Mentor</Label>
              <Textarea id="coffee-msg" placeholder="Hola, me gustaría conversar sobre..." className="text-xs min-h-[90px]" value={coffeeMessage} onChange={e => setCoffeeMessage(e.target.value)} required />
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild><Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button></DialogClose>
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
