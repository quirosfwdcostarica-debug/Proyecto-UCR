"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
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
  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estado de filtros
  const [nombre, setNombre] = useState("");
  const [carrera, setCarrera] = useState("");
  const [areaProyecto, setAreaProyecto] = useState("");
  const [apoyoBuscado, setApoyoBuscado] = useState("");

  const fetchEstudiantes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nombre) params.set("nombre", nombre);
      if (carrera) params.set("carrera", carrera);
      if (areaProyecto) params.set("areaProyecto", areaProyecto);
      if (apoyoBuscado) params.set("apoyoBuscado", apoyoBuscado);

      const res = await fetch(`/api/estudiantes?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar el directorio");
      const data: EstudianteItem[] = await res.json();
      setEstudiantes(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [nombre, carrera, areaProyecto, apoyoBuscado]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEstudiantes();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchEstudiantes]);

  const clearFilters = () => {
    setNombre("");
    setCarrera("");
    setAreaProyecto("");
    setApoyoBuscado("");
  };

  const hasFilters = nombre || carrera || areaProyecto || apoyoBuscado;

  const getFaseLabel = (progreso: number) => {
    if (progreso < 30) return "Fase Inicial";
    if (progreso > 80) return "Fase Final";
    return "En Desarrollo";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      <TopBar title="Directorio" />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">
            Directorio de estudiantes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base">
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
                ? "bg-[#0f4c81] text-white hover:bg-[#0b3a63]"
                : "border-slate-300 text-slate-700"
            }`}
          >
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filtros {hasFilters && `(activos)`}
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 px-4 border-slate-300 text-slate-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
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
                className="w-full h-9 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 dark:bg-slate-950 px-2 outline-none focus:border-[#0f4c81]"
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
                className="w-full h-9 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 dark:bg-slate-950 px-2 outline-none focus:border-[#0f4c81]"
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
                className="w-full h-9 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 dark:bg-slate-950 px-2 outline-none focus:border-[#0f4c81]"
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error} —{" "}
            <button onClick={fetchEstudiantes} className="underline font-medium">
              Reintentar
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-sky-400 animate-spin" />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl">
              🎓
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No se encontraron estudiantes
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Intenta cambiar los filtros o ampliar la búsqueda.
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-[#0f4c81] text-sm font-medium hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {estudiantes.length} estudiante{estudiantes.length !== 1 ? "s" : ""} encontrado{estudiantes.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estudiantes.map((student) => (
                <Card
                  key={student.id}
                  className="p-6 border-border dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col h-full hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 mb-5">
                    <div className="h-14 w-14 rounded-md bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                      <img
                        src={
                          student.user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            student.user.name || "E"
                          )}&background=0f4c81&color=fff`
                        }
                        alt={student.user.name || "Estudiante"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground leading-tight">
                          {student.user.name || "Estudiante UCR"}
                        </h3>
                        {student.user.proyectoFinalizado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Finalizado
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#0f4c81] dark:text-sky-400 mt-0.5 truncate">
                        {student.carrera}
                      </p>
                    </div>
                  </div>

                  {student.areaProyecto && (
                    <div className="bg-blue-50/50 dark:bg-slate-800/50 p-3 rounded-md mb-5 border-l-2 border-[#0f4c81] dark:border-sky-500">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Área del Proyecto
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                        {student.areaProyecto}
                      </p>
                    </div>
                  )}

                  <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">
                        {getFaseLabel(student.avanceProyecto)}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {student.avanceProyecto}%
                      </span>
                    </div>
                    <Progress
                      value={student.avanceProyecto}
                      className="h-1.5 bg-slate-100 dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {student.apoyoBuscado.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400 rounded text-[10px] font-bold tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white">
                    <HeartIcon className="mr-2 h-4 w-4" />
                    Ofrecer Apoyo
                  </Button>
                </Card>
              ))}
            </div>
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
