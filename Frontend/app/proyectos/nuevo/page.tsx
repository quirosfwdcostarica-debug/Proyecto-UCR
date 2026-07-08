"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2, Loader2, ChevronRight, ChevronLeft,
  Rocket, BookOpen, HeartHandshake, Eye, Info,
  DollarSign, Briefcase, GraduationCap, Lightbulb,
  Tag, X, Save, Zap, Users,
} from "lucide-react";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { SunflowerImage } from "@/components/fu/SunflowerImage";

// ──────────────────────────────────────────────
// UCR color palette
// #005da4  dark blue (primary)
// #00c0f3  sky blue
// #f37021  orange
// #fdb912  yellow
// #ffe06a  soft yellow
// #f99d1c  amber
// #e9c31e  golden
// ──────────────────────────────────────────────

const UCR = {
  blue: "#005da4",
  sky: "#00c0f3",
  orange: "#f37021",
  yellow: "#fdb912",
  softYellow: "#ffe06a",
  amber: "#f99d1c",
  golden: "#e9c31e",
};

const AREAS_TEMATICAS = [
  "Tecnologías de la Información",
  "Inteligencia Artificial",
  "Energías Renovables",
  "Biotecnología",
  "Ciencias Sociales",
  "Economía y Negocios",
  "Educación",
  "Salud Pública",
  "Derecho",
  "Ingeniería Civil",
  "Ingeniería Eléctrica",
  "Arquitectura",
  "Artes y Humanidades",
  "Agronomía",
  "Otro",
];

const AREAS_MENTORIA = [
  "Diseño Técnico", "Plan de Negocios", "Marco Legal",
  "Investigación Académica", "Redacción Científica", "Presentaciones",
  "Gestión de Proyectos", "Financiamiento", "Emprendimiento",
  "Redes Profesionales", "Metodología", "Estadística",
];

const ESTADOS_AVANCE = [
  { label: "Iniciando (0–20%)", value: 10 },
  { label: "En Desarrollo (20–50%)", value: 35 },
  { label: "Avanzado (50–75%)", value: 62 },
  { label: "Casi Finalizado (75–90%)", value: 82 },
  { label: "Finalizado (90–100%)", value: 95 },
];

const HORAS_MENTORIA = ["1-2 horas", "3-5 horas", "5-10 horas", "Más de 10 horas"];
const DISPONIBILIDAD = ["Tiempo completo (40h)", "Medio tiempo (20h)", "Por horas (< 20h)"];

// ── Interfaces ──────────────────────────────────────────────
interface EstudianteInfo {
  carnet_ucr: string | null;
  carrera: string | null;
  escuela_facultad: string | null;
  sede: string | null;
  anio_ingreso: number | null;
  nivel_academico: string | null;
  user: { nombre: string; foto_url: string | null };
  // existing project
  proyecto_titulo: string | null;
  proyecto_tipo: string | null;
  proyecto_descripcion: string | null;
  proyecto_necesidades: any;
  proyecto_porcentaje_avance: number | null;
  busca_financiamiento: boolean;
  busca_mentoria: boolean;
  busca_empleo: boolean;
  busca_pasantia: boolean;
  visible_en_directorio: boolean;
}

interface Necesidades {
  financiero?: { monto: string; fecha_limite: string; desglose: string };
  mentoria?: { areas: string[]; horas: string; perfil_mentor: string };
  empleabilidad?: { disponibilidad: string; interes_contratacion: string };
}

// ── Step indicator ──────────────────────────────────────────
const STEPS = [
  { label: "Información Académica", icon: GraduationCap },
  { label: "Detalles del Proyecto", icon: BookOpen },
  { label: "Apoyo Buscado", icon: HeartHandshake },
  { label: "Vista Previa", icon: Eye },
];

function StepSidebar({ current, completed }: { current: number; completed: boolean[] }) {
  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col gap-2">
      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="px-5 py-4" style={{ background: UCR.blue }}>
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Publicación de Proyecto</p>
          <p className="text-lg font-extrabold text-white mt-0.5">Nueva Posición</p>
        </div>
        <div className="p-4 space-y-1">
          {STEPS.map((s, i) => {
            const done = completed[i];
            const active = current === i;
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? "text-white font-bold shadow-sm"
                    : done
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
                style={active ? { background: UCR.sky } : done ? { background: "#f0fdf4" } : {}}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: active ? "#fff" : done ? "#22c55e" : "#e2e8f0",
                    color: active ? UCR.sky : done ? "#fff" : "#94a3b8",
                  }}
                >
                  {done && !active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm leading-tight">{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="px-4 pb-4">
          <div className="w-full rounded-full h-1.5 bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / 4) * 100}%`, background: `linear-gradient(90deg, ${UCR.blue}, ${UCR.sky})` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-center">Paso {current + 1} de 4</p>
        </div>
      </div>
    </aside>
  );
}

// ── Chip Tags ────────────────────────────────────────────────
function ChipTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border"
      style={{ background: UCR.softYellow, color: UCR.blue, borderColor: UCR.yellow }}>
      {label}
      <button type="button" onClick={onRemove} className="ml-1 hover:opacity-70">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function PublicarProyectoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([false, false, false, false]);
  const [info, setInfo] = useState<EstudianteInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 fields
  const [titulo, setTitulo] = useState("");
  const [areaTematica, setAreaTematica] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [porcentajeAvance, setPorcentajeAvance] = useState(35);
  const [buscaFinanciamiento, setBuscaFinanciamiento] = useState(false);
  const [buscaMentoria, setBuscaMentoria] = useState(false);
  const [buscaPasantia, setBuscaPasantia] = useState(false);
  const [buscaEmpleo, setBuscaEmpleo] = useState(false);

  // Step 3 fields — Financiero
  const [montoRequerido, setMontoRequerido] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [desgloseGastos, setDesgloseGastos] = useState("");

  // Step 3 fields — Mentoría
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<string[]>([]);
  const [horasMentoria, setHorasMentoria] = useState("1-2 horas");
  const [perfilMentor, setPerfilMentor] = useState("");

  // Step 3 fields — Empleabilidad
  const [disponibilidad, setDisponibilidad] = useState("Medio tiempo (20h)");
  const [interesContratacion, setInteresContratacion] = useState("A discutir");

  const role = (session?.user as any)?.tipo;

  // Redirect if not student
  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated" && role && role !== "ESTUDIANTE") {
      router.replace("/");
    }
  }, [status, role]);

  // Load existing project data
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/proyectos")
      .then((r) => r.json())
      .then((d: EstudianteInfo) => {
        setInfo(d);
        if (d.proyecto_titulo) setTitulo(d.proyecto_titulo);
        if (d.proyecto_tipo) setAreaTematica(d.proyecto_tipo);
        if (d.proyecto_descripcion) setDescripcion(d.proyecto_descripcion);
        if (d.proyecto_porcentaje_avance) setPorcentajeAvance(d.proyecto_porcentaje_avance);
        setBuscaFinanciamiento(d.busca_financiamiento);
        setBuscaMentoria(d.busca_mentoria);
        setBuscaPasantia(d.busca_pasantia);
        setBuscaEmpleo(d.busca_empleo);
        const nec = d.proyecto_necesidades as Necesidades | null;
        if (nec?.financiero) {
          setMontoRequerido(nec.financiero.monto);
          setFechaLimite(nec.financiero.fecha_limite);
          setDesgloseGastos(nec.financiero.desglose);
        }
        if (nec?.mentoria) {
          setAreasSeleccionadas(nec.mentoria.areas || []);
          setHorasMentoria(nec.mentoria.horas || "1-2 horas");
          setPerfilMentor(nec.mentoria.perfil_mentor || "");
        }
        if (nec?.empleabilidad) {
          setDisponibilidad(nec.empleabilidad.disponibilidad || "Medio tiempo (20h)");
          setInteresContratacion(nec.empleabilidad.interes_contratacion || "A discutir");
        }
      })
      .finally(() => setLoadingInfo(false));
  }, [status]);

  function buildNecesidades(): Necesidades {
    const nec: Necesidades = {};
    if (buscaFinanciamiento) nec.financiero = { monto: montoRequerido, fecha_limite: fechaLimite, desglose: desgloseGastos };
    if (buscaMentoria) nec.mentoria = { areas: areasSeleccionadas, horas: horasMentoria, perfil_mentor: perfilMentor };
    if (buscaPasantia || buscaEmpleo) nec.empleabilidad = { disponibilidad, interes_contratacion: interesContratacion };
    return nec;
  }

  async function guardarBorrador() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/proyectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proyecto_titulo: titulo,
        proyecto_tipo: areaTematica,
        proyecto_descripcion: descripcion,
        proyecto_porcentaje_avance: porcentajeAvance,
        proyecto_necesidades: buildNecesidades(),
        busca_financiamiento: buscaFinanciamiento,
        busca_mentoria: buscaMentoria,
        busca_empleo: buscaEmpleo,
        busca_pasantia: buscaPasantia,
      }),
    });
    if (!res.ok) setError("No se pudo guardar el borrador.");
    setSaving(false);
  }

  async function publicarProyecto() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/proyectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proyecto_titulo: titulo,
        proyecto_tipo: areaTematica,
        proyecto_descripcion: descripcion,
        proyecto_porcentaje_avance: porcentajeAvance,
        proyecto_necesidades: buildNecesidades(),
        busca_financiamiento: buscaFinanciamiento,
        busca_mentoria: buscaMentoria,
        busca_empleo: buscaEmpleo,
        busca_pasantia: buscaPasantia,
        publicar: true,
      }),
    });
    if (res.ok) {
      setPublished(true);
    } else {
      setError("No se pudo publicar el proyecto.");
    }
    setSaving(false);
  }

  function nextStep() {
    setCompleted((prev) => { const c = [...prev]; c[step] = true; return c; });
    setStep((s) => Math.min(s + 1, 3));
  }
  function prevStep() { setStep((s) => Math.max(s - 1, 0)); }

  if (status === "loading" || loadingInfo) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: UCR.blue }} />
    </div>
  );

  if (published) return (
    <ParallaxBackground className="min-h-screen flex items-center justify-center py-16">
      <div className="fu-card p-10 text-center max-w-md mx-4 animate-fu-fade-up">
        <div className="flex justify-center">
          <SunflowerImage size={220} />
        </div>
        <h2 className="text-2xl font-extrabold mt-4 mb-2 fu-text-gradient">¡Proyecto Publicado!</h2>
        <p className="fu-text-2 mb-6 text-sm">Tu proyecto ya es visible para la red de exalumnos, mentores y donantes de la UCR.</p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: `linear-gradient(135deg, ${UCR.blue}, ${UCR.sky})` }}
        >
          Ir al Tablero
        </button>
      </div>
    </ParallaxBackground>
  );

  const infoNombreCorto = info?.user?.nombre?.split(" ")[0] ?? "Estudiante";

  return (
    <ParallaxBackground className="min-h-screen">
      {/* Mobile step indicator */}
      <div className="md:hidden flex items-center gap-2 px-4 pt-4 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        {STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i <= step ? UCR.blue : "#e2e8f0" }} />
        ))}
        <span className="text-xs font-semibold text-slate-500 ml-2 shrink-0">
          {step + 1}/4
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex gap-8">
        <StepSidebar current={step} completed={completed} />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* ── STEP 1: Información Académica ─────────────── */}
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Banner */}
              <div className="rounded-2xl p-4 flex items-start gap-3 text-sm font-medium"
                style={{ background: `${UCR.sky}18`, border: `1.5px solid ${UCR.sky}50` }}>
                <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: UCR.sky }} />
                <p style={{ color: UCR.blue }}>
                  <span className="font-bold">Revisa tu información antes de publicar.</span>{" "}
                  Una vez publicado, tu proyecto será visible para la red de exalumnos, mentores y posibles donantes de la Universidad de Costa Rica.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-extrabold mb-1" style={{ color: UCR.blue }}>
                  Paso 1: Información Académica
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Esta información proviene de tu perfil. Verifica que esté actualizada.
                </p>

                {/* Student card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-6 flex flex-col sm:flex-row gap-5">
                  {info?.user?.foto_url ? (
                    <Image src={info.user.foto_url} alt={info.user.nombre} width={72} height={72}
                      className="rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-18 h-18 shrink-0 rounded-full flex items-center justify-center text-2xl font-extrabold"
                      style={{ background: UCR.softYellow, color: UCR.blue, width: 72, height: 72 }}>
                      {info?.user?.nombre?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-lg" style={{ color: UCR.blue }}>{info?.user?.nombre}</p>
                    {info?.carnet_ucr && <p className="text-sm text-slate-500">Carné: {info.carnet_ucr}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {info?.carrera && (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{ background: UCR.softYellow, color: UCR.blue }}>
                          {info.carrera}
                        </span>
                      )}
                      {info?.nivel_academico && (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{ background: "#e0f2fe", color: "#0369a1" }}>
                          {info.nivel_academico}
                        </span>
                      )}
                      {info?.sede && (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{ background: "#f0fdf4", color: "#15803d" }}>
                          {info.sede}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Carné", value: info?.carnet_ucr ?? "—" },
                    { label: "Año Ingreso", value: info?.anio_ingreso ? String(info.anio_ingreso) : "—" },
                    { label: "Facultad", value: info?.escuela_facultad ?? "—" },
                    { label: "Sede", value: info?.sede ?? "—" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3 text-center border border-slate-100"
                      style={{ background: "#fafafa" }}>
                      <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 mt-4">
                  ¿Datos incorrectos?{" "}
                  <a href="/perfil/editar" className="underline font-semibold hover:opacity-80" style={{ color: UCR.blue }}>
                    Actualiza tu perfil
                  </a>
                </p>
              </div>

              <StepNav step={step} onPrev={prevStep} onNext={nextStep} onSave={guardarBorrador} saving={saving} />
            </div>
          )}

          {/* ── STEP 2: Detalles del Proyecto ─────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-extrabold mb-1" style={{ color: UCR.blue }}>
                  Paso 2: Detalles del Proyecto
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Describe los aspectos fundamentales de tu trabajo final de graduación para conectar con posibles socios.
                </p>

                <div className="space-y-5">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: UCR.blue }}>
                      Título del Proyecto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej. Desarrollo de un sistema de monitoreo hídrico basado en IoT"
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      style={{ borderColor: titulo ? UCR.sky : "#e2e8f0", boxShadow: titulo ? `0 0 0 3px ${UCR.sky}20` : "" }}
                    />
                  </div>

                  {/* Área Temática */}
                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: UCR.blue }}>
                      Área Temática
                    </label>
                    <select
                      value={areaTematica}
                      onChange={(e) => setAreaTematica(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      <option value="">Seleccionar área...</option>
                      {AREAS_TEMATICAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: UCR.blue }}>
                      Descripción del Proyecto <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value.slice(0, 2000))}
                      placeholder="Describe los objetivos, metodología e impacto esperado..."
                      rows={6}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      style={{ borderColor: "#e2e8f0" }}
                    />
                    <p className="text-xs text-right text-slate-400 mt-1">{descripcion.length} / 2000 caracteres</p>
                  </div>

                  {/* Estado de Avance */}
                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: UCR.blue }}>
                      Estado de Avance
                    </label>
                    <select
                      value={porcentajeAvance}
                      onChange={(e) => setPorcentajeAvance(Number(e.target.value))}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      {ESTADOS_AVANCE.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                    {/* Progress bar */}
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${porcentajeAvance}%`, background: `linear-gradient(90deg, ${UCR.sky}, ${UCR.blue})` }} />
                    </div>
                    <p className="text-xs text-right font-bold mt-1" style={{ color: UCR.blue }}>{porcentajeAvance}%</p>
                  </div>

                  {/* Tipo de Apoyo Necesario */}
                  <div>
                    <label className="block text-sm font-bold mb-3" style={{ color: UCR.blue }}>
                      Tipo de Apoyo Necesario
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "financiamiento", label: "Financiamiento", desc: "Recursos económicos para materiales o ejecución.", icon: DollarSign, val: buscaFinanciamiento, set: setBuscaFinanciamiento },
                        { key: "mentoria", label: "Mentoría", desc: "Guía técnica de expertos en el sector real.", icon: Lightbulb, val: buscaMentoria, set: setBuscaMentoria },
                        { key: "pasantia", label: "Pasantía", desc: "Validación de resultados en entorno profesional.", icon: Briefcase, val: buscaPasantia, set: setBuscaPasantia },
                        { key: "empleo", label: "Empleabilidad", desc: "Posibilidades laborales al finalizar el proyecto.", icon: Users, val: buscaEmpleo, set: setBuscaEmpleo },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => item.set(!item.val)}
                            className="relative text-left p-4 rounded-xl border-2 transition-all duration-200"
                            style={{
                              borderColor: item.val ? UCR.blue : "#e2e8f0",
                              background: item.val ? `${UCR.blue}08` : "#fff",
                              boxShadow: item.val ? `0 0 0 3px ${UCR.sky}25` : "",
                            }}
                          >
                            {item.val && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: UCR.blue }}>
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <Icon className="w-6 h-6 mb-2" style={{ color: item.val ? UCR.blue : "#94a3b8" }} />
                            <p className="font-bold text-sm" style={{ color: item.val ? UCR.blue : "#374151" }}>{item.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {error && <ErrorBanner msg={error} />}
              <StepNav step={step} onPrev={prevStep} onNext={nextStep} onSave={guardarBorrador} saving={saving}
                nextDisabled={!titulo.trim() || !descripcion.trim()} />
            </div>
          )}

          {/* ── STEP 3: Apoyo Buscado ─────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Matching banner */}
              <div className="rounded-2xl p-4 flex items-start gap-3 text-sm"
                style={{ background: `${UCR.blue}08`, border: `1.5px solid ${UCR.blue}25` }}>
                <Zap className="w-5 h-5 mt-0.5 shrink-0" style={{ color: UCR.amber }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: UCR.blue }}>Optimizando el Matching</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Nuestro algoritmo analiza tu desglose de gastos y perfil de mentoría para sugerir tu proyecto a egresados con intereses específicos y capacidad de aporte verificada.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-8">
                <div>
                  <h2 className="text-xl font-extrabold mb-1" style={{ color: UCR.blue }}>
                    Paso 3: Detalles del Apoyo Necesitado
                  </h2>
                  <p className="text-sm text-slate-500">
                    Defina los recursos y el acompañamiento que requiere para llevar su proyecto al siguiente nivel.
                  </p>
                </div>

                {/* Apoyo Financiero */}
                {buscaFinanciamiento && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5" style={{ color: UCR.orange }} />
                      <h3 className="text-base font-extrabold" style={{ color: UCR.blue }}>Apoyo Financiero</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Monto Estimado Requerido (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input type="number" value={montoRequerido} onChange={(e) => setMontoRequerido(e.target.value)}
                            placeholder="0.00" className="w-full border rounded-xl pl-7 pr-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            style={{ borderColor: "#e2e8f0" }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Fecha Límite de Recaudación</label>
                        <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)}
                          className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          style={{ borderColor: "#e2e8f0" }} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Desglose de Gastos</label>
                      <textarea value={desgloseGastos} onChange={(e) => setDesgloseGastos(e.target.value)}
                        placeholder="Ej: Adquisición de materiales (40%), Pago de servicios externos (30%), Logística (30%)..."
                        rows={4} className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        style={{ borderColor: "#e2e8f0" }} />
                      <p className="text-xs text-slate-400 mt-1 italic">Sea específico para aumentar la confianza del donante.</p>
                    </div>
                  </section>
                )}

                {/* Mentoría */}
                {buscaMentoria && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <HeartHandshake className="w-5 h-5" style={{ color: UCR.sky }} />
                      <h3 className="text-base font-extrabold" style={{ color: UCR.blue }}>Mentoría</h3>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-600 mb-2">Áreas Específicas de Guía</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {areasSeleccionadas.map((a) => (
                          <ChipTag key={a} label={a}
                            onRemove={() => setAreasSeleccionadas(areasSeleccionadas.filter((x) => x !== a))} />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AREAS_MENTORIA.filter((a) => !areasSeleccionadas.includes(a)).map((a) => (
                          <button key={a} type="button"
                            onClick={() => setAreasSeleccionadas([...areasSeleccionadas, a])}
                            className="text-xs px-3 py-1.5 rounded-full border font-semibold transition-all hover:border-sky-400 hover:text-sky-700"
                            style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                            + {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Horas Sugeridas al Mes</label>
                        <select value={horasMentoria} onChange={(e) => setHorasMentoria(e.target.value)}
                          className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          style={{ borderColor: "#e2e8f0" }}>
                          {HORAS_MENTORIA.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Perfil de Mentor Ideal</label>
                      <textarea value={perfilMentor} onChange={(e) => setPerfilMentor(e.target.value)}
                        placeholder="Describa la experiencia previa que esperaría de un mentor para este proyecto..."
                        rows={4} className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        style={{ borderColor: "#e2e8f0" }} />
                    </div>
                  </section>
                )}

                {/* Pasantía / Empleo */}
                {(buscaPasantia || buscaEmpleo) && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5" style={{ color: UCR.amber }} />
                      <h3 className="text-base font-extrabold" style={{ color: UCR.blue }}>Pasantía / Empleo</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Disponibilidad Horaria</label>
                        <select value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)}
                          className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          style={{ borderColor: "#e2e8f0" }}>
                          {DISPONIBILIDAD.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Interés en Contratación Post-Proyecto</label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {["Sí", "No", "A discutir"].map((opt) => (
                            <label key={opt} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                              <input type="radio" name="contratacion" value={opt}
                                checked={interesContratacion === opt}
                                onChange={() => setInteresContratacion(opt)}
                                className="accent-current" style={{ accentColor: UCR.blue }} />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {!buscaFinanciamiento && !buscaMentoria && !buscaPasantia && !buscaEmpleo && (
                  <div className="py-8 text-center text-slate-400">
                    <HeartHandshake className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No seleccionaste ningún tipo de apoyo.</p>
                    <button type="button" onClick={() => setStep(1)}
                      className="mt-2 text-sm underline font-semibold hover:opacity-80"
                      style={{ color: UCR.blue }}>
                      Volver a seleccionar apoyo
                    </button>
                  </div>
                )}
              </div>

              {error && <ErrorBanner msg={error} />}
              <StepNav step={step} onPrev={prevStep} onNext={nextStep} onSave={guardarBorrador} saving={saving} />
            </div>
          )}

          {/* ── STEP 4: Vista Previa ─────────────── */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Banner */}
              <div className="rounded-2xl p-4 flex items-start gap-3 text-sm font-medium"
                style={{ background: `${UCR.sky}18`, border: `1.5px solid ${UCR.sky}50` }}>
                <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: UCR.sky }} />
                <p style={{ color: UCR.blue }}>
                  <span className="font-bold">Revisa tu información antes de publicar.</span>{" "}
                  Una vez publicado, tu proyecto será visible para la red de exalumnos, mentores y posibles donantes de la Universidad de Costa Rica.
                </p>
              </div>

              {/* Preview card — internal */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="text-xl font-extrabold" style={{ color: UCR.blue }}>Vista Previa del Proyecto</h2>
                  <button type="button" onClick={() => setStep(1)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 hover:opacity-80"
                    style={{ borderColor: UCR.sky, color: UCR.blue }}>
                    <Zap className="w-3.5 h-3.5" /> Modo Edición
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {/* Left - project info */}
                  <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Título del Proyecto</p>
                    <h3 className="text-xl font-extrabold leading-snug mb-3 break-words" style={{ color: UCR.blue }}>
                      {titulo || "Sin título aún"}
                    </h3>
                    {areaTematica && (
                      <span className="inline-block text-xs px-2.5 py-1 rounded-full font-bold mb-3"
                        style={{ background: UCR.softYellow, color: UCR.blue }}>
                        {areaTematica}
                      </span>
                    )}
                    {descripcion && (
                      <>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Descripción</p>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-5">{descripcion}</p>
                      </>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${porcentajeAvance}%`, background: `linear-gradient(90deg, ${UCR.sky}, ${UCR.blue})` }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: UCR.blue }}>{porcentajeAvance}%</span>
                    </div>

                    {/* Support badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {buscaFinanciamiento && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
                          style={{ background: "#fef3c7", color: UCR.orange, border: `1px solid ${UCR.yellow}` }}>
                          <DollarSign className="w-3 h-3" />
                          {montoRequerido ? `$${Number(montoRequerido).toLocaleString()} USD` : "Apoyo Financiero"}
                        </span>
                      )}
                      {buscaMentoria && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
                          style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>
                          <Lightbulb className="w-3 h-3" /> Mentoría
                        </span>
                      )}
                      {buscaPasantia && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
                          style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                          <Briefcase className="w-3 h-3" /> Pasantía
                        </span>
                      )}
                      {buscaEmpleo && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
                          style={{ background: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff" }}>
                          <Users className="w-3 h-3" /> Empleo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right - student info */}
                  <div className="rounded-xl border border-slate-200 p-5 flex flex-col items-center text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Estudiante Responsable</p>
                    {info?.user?.foto_url ? (
                      <Image src={info.user.foto_url} alt={info.user.nombre} width={72} height={72}
                        className="rounded-full object-cover mb-2" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold mb-2"
                        style={{ background: UCR.softYellow, color: UCR.blue }}>
                        {info?.user?.nombre?.charAt(0)}
                      </div>
                    )}
                    <p className="font-extrabold" style={{ color: UCR.blue }}>{info?.user?.nombre}</p>
                    {info?.carnet_ucr && <p className="text-xs text-slate-400">Carné: {info.carnet_ucr}</p>}
                    {info?.carrera && <p className="text-xs text-slate-500 mt-1">{info.carrera}</p>}
                    {info?.nivel_academico && <p className="text-xs text-slate-500">{info.nivel_academico}</p>}
                    {info?.sede && (
                      <p className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full"
                        style={{ background: UCR.softYellow, color: UCR.blue }}>
                        {info.sede}
                      </p>
                    )}
                    <a href={`/perfil/${(session?.user as any)?.id}`}
                      className="mt-3 text-xs px-4 py-1.5 rounded-lg border font-bold hover:opacity-80 transition-all"
                      style={{ borderColor: UCR.blue, color: UCR.blue }}>
                      Ver Perfil Completo
                    </a>
                  </div>
                </div>

                {/* Apoyo sections in preview */}
                <div className="grid sm:grid-cols-3 gap-4 mt-5">
                  {buscaFinanciamiento && (
                    <div className="rounded-xl border p-4" style={{ borderColor: UCR.yellow, background: "#fffbeb" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4" style={{ color: UCR.orange }} />
                        <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: UCR.orange }}>Apoyo Financiero</p>
                      </div>
                      {montoRequerido && <p className="text-lg font-extrabold" style={{ color: UCR.blue }}>${Number(montoRequerido).toLocaleString()} USD</p>}
                      {fechaLimite && <p className="text-xs text-slate-500 mt-1">Fecha Límite: {new Date(fechaLimite).toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })}</p>}
                      {desgloseGastos && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{desgloseGastos}</p>}
                    </div>
                  )}
                  {buscaMentoria && (
                    <div className="rounded-xl border p-4" style={{ borderColor: "#bae6fd", background: "#f0f9ff" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <HeartHandshake className="w-4 h-4 text-sky-500" />
                        <p className="text-xs font-extrabold uppercase tracking-wide text-sky-700">Mentoría</p>
                      </div>
                      {areasSeleccionadas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {areasSeleccionadas.slice(0, 3).map((a) => (
                            <span key={a} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                              style={{ background: UCR.sky, color: "#fff" }}>{a}</span>
                          ))}
                        </div>
                      )}
                      {perfilMentor && <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">"{perfilMentor}"</p>}
                    </div>
                  )}
                  {(buscaPasantia || buscaEmpleo) && (
                    <div className="rounded-xl border p-4" style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-extrabold uppercase tracking-wide text-green-700">Empleabilidad</p>
                      </div>
                      {buscaPasantia && <p className="text-xs text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Disponible para Pasantía</p>}
                      {buscaEmpleo && <p className="text-xs text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Interés en Contratación</p>}
                      <p className="text-xs text-slate-500 mt-1">Disponibilidad: {disponibilidad}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Public preview card */}
              <div className="space-y-2">
                <p className="text-sm font-bold flex items-center gap-2" style={{ color: UCR.blue }}>
                  <Eye className="w-4 h-4" /> Vista Pública (Así lo verán otros)
                </p>
                <div className="rounded-2xl border-2 overflow-hidden shadow-md" style={{ borderColor: "#e2e8f0" }}>
                  <div className="flex flex-col sm:flex-row">
                    {/* Left accent */}
                    <div className="w-full sm:w-2 h-2 sm:h-auto shrink-0"
                      style={{ background: `linear-gradient(180deg, ${UCR.sky}, ${UCR.blue})` }} />
                    <div className="p-5 flex-1 bg-white">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          {areaTematica && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest"
                              style={{ background: UCR.sky, color: "#fff" }}>
                              {areaTematica}
                            </span>
                          )}
                          <h3 className="text-lg font-extrabold mt-1 leading-snug break-words" style={{ color: UCR.blue }}>
                            {titulo || "Título del Proyecto"}
                          </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                          style={{ background: UCR.softYellow, color: UCR.blue }}>
                          ⭐ Top Match
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{descripcion || "Descripción del proyecto..."}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
                            style={{ background: UCR.softYellow, color: UCR.blue }}>
                            {info?.user?.nombre?.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{infoNombreCorto}</span>
                        </div>
                        {buscaFinanciamiento && montoRequerido && (
                          <div className="ml-auto text-right">
                            <p className="text-xs text-slate-400">Donación requerida</p>
                            <p className="text-base font-extrabold" style={{ color: UCR.blue }}>
                              ${Number(montoRequerido).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && <ErrorBanner msg={error} />}

              {/* Final actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button type="button" onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all hover:bg-slate-50"
                  style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={guardarBorrador} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all hover:bg-slate-50"
                    style={{ borderColor: UCR.sky, color: UCR.blue }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Borrador
                  </button>
                  <button type="button" onClick={publicarProyecto} disabled={saving || !titulo.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${UCR.blue}, ${UCR.sky})` }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    Publicar Proyecto
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ParallaxBackground>
  );
}

// ── Shared sub-components ────────────────────────────────────
function StepNav({
  step, onPrev, onNext, onSave, saving, nextDisabled = false,
}: {
  step: number;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  saving: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
      {step > 0 ? (
        <button type="button" onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-all"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
      ) : <div />}
      <div className="flex gap-3">
        <button type="button" onClick={onSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-all"
          style={{ borderColor: UCR.sky, color: UCR.blue }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Borrador
        </button>
        <button type="button" onClick={onNext} disabled={nextDisabled || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
          style={{ background: `linear-gradient(135deg, ${UCR.blue}, ${UCR.sky})` }}>
          Siguiente Paso <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
      {msg}
    </div>
  );
}
