"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { CATALOGO_AREAS, TIPOS_APOYO } from "@/lib/constants";
import { ofrecerApoyo, getMatchesForExalumno, rechazarMatch } from "@/actions/matching.actions";

interface EstudianteItem {
  id: string;
  carrera: string;
  avanceProyecto: number;
  areaProyecto: string | null;
  apoyoBuscado: string[];
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    proyectoFinalizado: boolean;
  };
}

export default function DirectorioEstudiantes() {
  const { data: session } = useSession();
  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // studentId → matchId para ofertas ya enviadas (persiste entre sesiones)
  const [offeredMatches, setOfferedMatches] = useState<Record<string, string>>({});
  // studentIds en cuenta regresiva (antes de enviar)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  // cuenta regresiva por studentId
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Estado de filtros
  const [nombre, setNombre] = useState("");
  const [carrera, setCarrera] = useState("");
  const [areaProyecto, setAreaProyecto] = useState("");
  const [apoyoBuscado, setApoyoBuscado] = useState("");

  const fetchEstudiantes = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nombre) params.set("nombre", nombre);
      if (carrera) params.set("carrera", carrera);
      if (areaProyecto) params.set("area_tematica", areaProyecto);
      if (apoyoBuscado) params.set("tipo_apoyo", apoyoBuscado);
      params.set("page", String(currentPage));

      const res = await fetch(`/api/estudiantes?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar el directorio");
      const json = await res.json();
      setEstudiantes(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
      setPage(currentPage);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [nombre, carrera, areaProyecto, apoyoBuscado]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEstudiantes(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchEstudiantes]);

  const clearFilters = () => {
    setNombre("");
    setCarrera("");
    setAreaProyecto("");
    setApoyoBuscado("");
  };

  // Cargar ofertas existentes desde la BD al montar el componente
  useEffect(() => {
    if (!session?.user?.id) return;
    getMatchesForExalumno().then((matches: any[]) => {
      const offered: Record<string, string> = {};
      for (const m of matches) {
        if (m.estado === "CONTACTADO" && m.initiated_by === "exalumno") {
          offered[m.estudiante_id] = m.id;
        }
      }
      setOfferedMatches(offered);
    }).catch(() => {});
  }, [session?.user?.id]);

  // Limpiar timeouts/intervals al desmontar
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // Click en "Ofrecer Apoyo": inicia cuenta regresiva de 5s antes de enviar
  const handleOfrecerApoyo = (studentId: string) => {
    if (pendingIds.has(studentId) || offeredMatches[studentId]) return;

    setPendingIds(prev => new Set(Array.from(prev).concat(studentId)));
    setCountdowns(prev => ({ ...prev, [studentId]: 5 }));

    intervalsRef.current[studentId] = setInterval(() => {
      setCountdowns(prev => {
        const remaining = (prev[studentId] ?? 1) - 1;
        if (remaining <= 0) {
          clearInterval(intervalsRef.current[studentId]);
          delete intervalsRef.current[studentId];
        }
        return { ...prev, [studentId]: remaining };
      });
    }, 1000);

    timeoutsRef.current[studentId] = setTimeout(async () => {
      delete timeoutsRef.current[studentId];
      try {
        const result = await ofrecerApoyo(studentId);
        if (result.success) {
          setOfferedMatches(prev => ({ ...prev, [studentId]: result.matchId }));
        }
      } catch (err: any) {
        alert(err.message || "Error al ofrecer apoyo");
      } finally {
        setPendingIds(prev => { const s = new Set(prev); s.delete(studentId); return s; });
        setCountdowns(prev => { const { [studentId]: _, ...rest } = prev; return rest; });
      }
    }, 5000);
  };

  // Cancelar durante la cuenta regresiva (no llama API, no envía correo)
  const handleCancelarPendiente = (studentId: string) => {
    clearTimeout(timeoutsRef.current[studentId]);
    clearInterval(intervalsRef.current[studentId]);
    delete timeoutsRef.current[studentId];
    delete intervalsRef.current[studentId];
    setPendingIds(prev => { const s = new Set(prev); s.delete(studentId); return s; });
    setCountdowns(prev => { const { [studentId]: _, ...rest } = prev; return rest; });
  };

  // Cancelar una oferta ya enviada (llama al backend para revertir el match)
  const handleCancelarOferta = async (studentId: string) => {
    const matchId = offeredMatches[studentId];
    if (!matchId) return;
    try {
      await rechazarMatch(matchId, "exalumno");
      setOfferedMatches(prev => { const { [studentId]: _, ...rest } = prev; return rest; });
    } catch (err: any) {
      alert(err.message || "Error al cancelar la oferta");
    }
  };

  const hasFilters = nombre || carrera || areaProyecto || apoyoBuscado;

  const getFaseLabel = (progreso: number) => {
    if (progreso < 30) return "Fase Inicial";
    if (progreso > 80) return "Fase Final";
    return "En Desarrollo";
  };

  return (
    <div className="min-h-full bg-ucr-gris-fondo dark:bg-slate-950 transition-colors duration-300">

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ucr-celeste-medium dark:text-sky-400 mb-2 font-display uppercase">
            Directorio de Proyectos Estudiantiles
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base font-medium">
            Conectando el talento emergente de la UCR con nuestra red global de exalumnos.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              type="text"
              placeholder="Buscar por nombre de estudiante..."
              className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-base dark:text-slate-100"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "default" : "outline"}
            className={`h-12 px-6 ${
              showFilters
                ? "bg-ucr-celeste-medium text-white hover:bg-ucr-celeste-medium/90 border-none"
                : "border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filtros {hasFilters && `(activos)`}
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 px-4 border-slate-300 text-slate-500 hover:bg-slate-50 dark:text-slate-400"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              Filtros combinados con AND lógico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                Carrera
              </label>
              <select
                value={carrera}
                onChange={(e) => setCarrera(e.target.value)}
                className="w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-sm text-slate-700 dark:text-slate-300 px-2 outline-none focus:border-ucr-celeste-medium"
              >
                <option value="">Todas las carreras</option>
                {CATALOGO_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                Área de proyecto
              </label>
              <select
                value={areaProyecto}
                onChange={(e) => setAreaProyecto(e.target.value)}
                className="w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-sm text-slate-700 dark:text-slate-300 px-2 outline-none focus:border-ucr-celeste-medium"
              >
                <option value="">Todas las áreas</option>
                {CATALOGO_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                Apoyo buscado
              </label>
              <select
                value={apoyoBuscado}
                onChange={(e) => setApoyoBuscado(e.target.value)}
                className="w-full h-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-sm text-slate-700 dark:text-slate-300 px-2 outline-none focus:border-ucr-celeste-medium"
              >
                <option value="">Todos los tipos</option>
                {TIPOS_APOYO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/55 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error} —{" "}
            <button onClick={() => fetchEstudiantes(page)} className="underline font-medium">
              Reintentar
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-ucr-celeste-medium dark:text-sky-400 animate-spin" />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-3xl">
              🎓
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No se encontraron estudiantes
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Intenta cambiar los filtros o ampliar la búsqueda.
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-ucr-celeste-medium hover:text-ucr-celeste-medium/80 text-sm font-semibold hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
              <span className="font-bold text-slate-700 dark:text-slate-300">{total}</span> estudiante{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estudiantes.map((student) => (
                <Card
                  key={student.id}
                  className="p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-celeste-medium transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  
                  <div className="flex gap-4 mb-5">
                    <div className="h-14 w-14 rounded-md bg-slate-200 dark:bg-slate-900 overflow-hidden shrink-0 border dark:border-slate-800">
                      <img
                        src={
                          student.user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            student.user.name || "E"
                          )}&background=006AD3&color=fff`
                        }
                        alt={student.user.name || "Estudiante"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">
                          {student.user.name || "Estudiante UCR"}
                        </h3>
                        {student.user.proyectoFinalizado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Finalizado
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-ucr-celeste-medium dark:text-sky-400 mt-0.5 truncate">
                        {student.carrera}
                      </p>
                    </div>
                  </div>

                  {student.areaProyecto && (
                    <div className="bg-blue-50/50 p-3 rounded-md mb-5 border-l-2 border-[#0f4c81]">
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        Área / Escuela
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                        {student.areaProyecto}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-md mb-5 border-l-2 border-slate-300">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Detalles del Proyecto
                    </p>
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {student.user.bio || "No especificado"}
                    </p>
                  </div>

                  <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">
                        {getFaseLabel(student.avanceProyecto)}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {student.avanceProyecto}%
                      </span>
                    </div>
                    <Progress
                      value={student.avanceProyecto}
                      className="h-1.5 bg-slate-100 dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {student.apoyoBuscado.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-ucr-celeste-tint dark:bg-green-900/40 text-ucr-celeste-medium dark:text-green-400 rounded text-[10px] font-bold tracking-wide uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {offeredMatches[student.id] ? (
                    <Button
                      onClick={() => handleCancelarOferta(student.id)}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 font-bold tracking-wide transition-all"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar Oferta
                    </Button>
                  ) : pendingIds.has(student.id) ? (
                    <Button
                      onClick={() => handleCancelarPendiente(student.id)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wide transition-all shadow-md"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar ({countdowns[student.id] ?? 5}s)
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOfrecerApoyo(student.id)}
                      className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 dark:bg-ucr-celeste dark:hover:bg-ucr-celeste/90 text-white dark:text-slate-950 font-bold tracking-wide transition-all shadow-md"
                    >
                      <HeartIcon className="mr-2 h-4 w-4" />
                      Ofrecer Apoyo
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => fetchEstudiantes(page - 1)}
                  disabled={page <= 1 || loading}
                  className="h-9 px-3 border-slate-300"
                >
                  ← Anterior
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchEstudiantes(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="h-9 px-3 border-slate-300"
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
