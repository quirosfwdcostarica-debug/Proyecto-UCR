"use client";
import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/Card";

export default function NuevaPosicionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [jornada, setJornada] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [fecha_limite, setFecha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = (session?.user as any)?.tipo;
  if (status === "authenticated" && role !== "EXALUMNO" && role !== "ADMIN") {
    router.replace("/posiciones");
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/posiciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, tipo, modalidad, jornada, empresa, fecha_limite: fecha_limite || null }),
    });
    if (res.ok) {
      router.push("/mis-posiciones");
    } else {
      const d = await res.json();
      setError(d.message || "Error al crear la posición.");
    }
    setLoading(false);
  }

  if (status === "loading") return (
    <div className="min-h-full bg-[#f8fafc] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/mis-posiciones" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver a mis posiciones
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">Exalumno</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Nueva Posición</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Publica una oportunidad laboral o de pasantía para estudiantes UCR.
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Título del puesto <span className="text-red-500">*</span>
              </label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="ej. Desarrollador Full-Stack, Pasante de Marketing..."
                required
              />
            </div>

            {/* Tipo y Modalidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de posición
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg text-sm px-3 outline-none focus:border-[#0f4c81] bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <option value="">Seleccionar...</option>
                  <option value="EMPLEO">Empleo</option>
                  <option value="PASANTIA">Pasantía</option>
                  <option value="PRACTICA">Práctica profesional</option>
                  <option value="VOLUNTARIADO">Voluntariado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Modalidad
                </label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg text-sm px-3 outline-none focus:border-[#0f4c81] bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
            </div>

            {/* Jornada y Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jornada
                </label>
                <select
                  value={jornada}
                  onChange={(e) => setJornada(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg text-sm px-3 outline-none focus:border-[#0f4c81] bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Por horas">Por horas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Empresa / Organización
                </label>
                <Input
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Nombre de la empresa..."
                />
              </div>
            </div>

            {/* Fecha límite */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha límite de aplicación
              </label>
              <Input
                type="date"
                value={fecha_limite}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/mis-posiciones">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 mr-2" /> Publicar posición
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
