"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, FolderOpen, Pencil, Trash2, CheckCircle2,
  DollarSign, Lightbulb, Briefcase, Users, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Proyecto {
  carnet_ucr?: string;
  carrera?: string;
  sede?: string;
  nivel_academico?: string;
  proyecto_titulo?: string;
  proyecto_tipo?: string;
  proyecto_descripcion?: string;
  proyecto_porcentaje_avance?: number;
  busca_financiamiento?: boolean;
  busca_mentoria?: boolean;
  busca_empleo?: boolean;
  busca_pasantia?: boolean;
  visible_en_directorio?: boolean;
  user?: { nombre?: string; foto_url?: string };
}

const UCR = {
  blue: "#005da4",
  sky: "#00c0f3",
  orange: "#f37021",
  yellow: "#fdb912",
};

function ApoyoBadge({ label, icon: Icon, active }: { label: string; icon: any; active: boolean }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#005da4]/10 text-[#005da4] border border-[#005da4]/20">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export default function MiProyectoVerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    const tipo = (session?.user as any)?.tipo;
    if (tipo !== "ESTUDIANTE") { router.replace("/"); return; }

    fetch("/api/proyectos")
      .then((r) => r.json())
      .then(setProyecto)
      .catch(() => setProyecto(null))
      .finally(() => setLoading(false));
  }, [status, session, router]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/proyectos", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleted(true);
      setProyecto(null);
      setConfirmDelete(false);
    } catch {
      alert("Error al eliminar el proyecto.");
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center py-24 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: UCR.blue }} />
      </div>
    );
  }

  if (deleted || !proyecto?.proyecto_titulo) {
    return (
      <div className="min-h-screen flex-1 bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center py-24 text-center px-4 transition-colors duration-300">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: `${UCR.blue}15` }}>
          <FolderOpen className="w-10 h-10" style={{ color: UCR.blue }} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          {deleted ? "Proyecto eliminado" : "No tienes un proyecto publicado aún"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm mb-6">
          {deleted
            ? "Tu proyecto ha sido eliminado exitosamente."
            : "Crea y publica tu proyecto académico para que exalumnos y donantes puedan conocerlo."}
        </p>
        <Link href="/proyectos/nuevo">
          <Button className="text-white" style={{ background: UCR.blue }}>
            {deleted ? "Crear nuevo proyecto" : "Iniciar mi proyecto"}
          </Button>
        </Link>
      </div>
    );
  }

  const avance = proyecto.proyecto_porcentaje_avance ?? 0;
  const nombre = proyecto.user?.nombre ?? "Estudiante";
  const initials = nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex-1 bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color: UCR.sky }}>Mi Proyecto</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vista Previa</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/proyectos/nuevo">
              <Button variant="outline" className="border-[#005da4] text-[#005da4] hover:bg-[#005da4]/5 text-sm">
                <Pencil className="w-4 h-4 mr-1.5" /> Editar
              </Button>
            </Link>
            <Button
              onClick={() => setConfirmDelete(true)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
            </Button>
          </div>
        </div>

        {/* Confirm delete */}
        {confirmDelete && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between gap-4">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              ¿Eliminar este proyecto permanentemente? No se puede deshacer.
            </p>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} className="text-xs">Cancelar</Button>
              <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        )}

        {/* Project card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Color bar */}
          <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${UCR.blue}, ${UCR.sky})` }} />

          <div className="p-6">
            {/* Student info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              {proyecto.user?.foto_url ? (
                <img src={proyecto.user.foto_url} alt={nombre} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow" style={{ background: UCR.blue }}>
                  {initials}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">{nombre}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{proyecto.carrera ?? "Carrera no especificada"}</p>
                {proyecto.sede && <p className="text-xs text-slate-400">{proyecto.sede}</p>}
              </div>
              {proyecto.visible_en_directorio && (
                <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Publicado
                </div>
              )}
            </div>

            {/* Project title + type */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{proyecto.proyecto_titulo}</h2>
              {proyecto.proyecto_tipo && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: UCR.orange }}>
                  {proyecto.proyecto_tipo}
                </span>
              )}
            </div>

            {/* Description */}
            {proyecto.proyecto_descripcion && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                {proyecto.proyecto_descripcion}
              </p>
            )}

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Estado de avance</span>
                <span style={{ color: UCR.blue }}>{avance}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avance}%`, background: `linear-gradient(90deg, ${UCR.blue}, ${UCR.sky})` }} />
              </div>
            </div>

            {/* Support needed */}
            <div className="flex flex-wrap gap-2">
              <ApoyoBadge label="Financiamiento" icon={DollarSign} active={!!proyecto.busca_financiamiento} />
              <ApoyoBadge label="Mentoría" icon={Lightbulb} active={!!proyecto.busca_mentoria} />
              <ApoyoBadge label="Empleo" icon={Users} active={!!proyecto.busca_empleo} />
              <ApoyoBadge label="Pasantía" icon={Briefcase} active={!!proyecto.busca_pasantia} />
            </div>
          </div>
        </div>

        {!proyecto.visible_en_directorio && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
            <strong>Borrador:</strong> Este proyecto no es visible para exalumnos aún. Ve a{" "}
            <Link href="/proyectos/nuevo" className="underline font-semibold">Editar proyecto</Link> y haz clic en "Publicar" para que aparezca en el directorio.
          </div>
        )}
      </div>
    </div>
  );
}
