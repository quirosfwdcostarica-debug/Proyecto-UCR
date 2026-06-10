"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  GraduationCap,
  UserPlus,
  Briefcase,
  X,
  Loader2,
} from "lucide-react";
import { CATALOGO_AREAS, TIPOS_APOYO, SECTORES } from "@/lib/constants";

interface ExalumnoItem {
  id: string;
  carrera: string;
  sector: string;
  areasInteres: string[];
  apoyoOfrecido: string[];
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  };
}

const BG_COLORS = [
  "bg-[#0b3a63]",
  "bg-slate-900",
  "bg-green-700",
  "bg-indigo-700",
  "bg-teal-700",
  "bg-purple-800",
];

export default function DirectorioExalumnos() {
  const [exalumnos, setExalumnos] = useState<ExalumnoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de filtros
  const [nombre, setNombre] = useState("");
  const [carrera, setCarrera] = useState("");
  const [sector, setSector] = useState("");
  const [apoyo, setApoyo] = useState("");

  const fetchExalumnos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nombre) params.set("nombre", nombre);
      if (carrera) params.set("carrera", carrera);
      if (sector) params.set("sector", sector);
      if (apoyo) params.set("apoyo", apoyo);

      const res = await fetch(`/api/exalumnos?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar el directorio");
      const data: ExalumnoItem[] = await res.json();
      setExalumnos(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [nombre, carrera, sector, apoyo]);

  // Debounce para búsqueda por nombre
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExalumnos();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchExalumnos]);

  const clearFilters = () => {
    setNombre("");
    setCarrera("");
    setSector("");
    setApoyo("");
  };

  const hasFilters = nombre || carrera || sector || apoyo;

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Directorio" />

      <div className="p-8 max-w-7xl mx-auto flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-64 shrink-0 space-y-6">
          <div className="bg-white border border-border p-5 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground tracking-wide text-sm">FILTROS</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#0f4c81] hover:underline font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpiar
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Búsqueda por nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">
                  Nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="h-9 text-sm pl-8"
                  />
                </div>
              </div>

              {/* Filtro Carrera */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">
                  Área de interés
                </label>
                <select
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded text-sm text-slate-700 px-2 outline-none focus:border-[#0f4c81]"
                >
                  <option value="">Todas las áreas</option>
                  {CATALOGO_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Sector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded text-sm text-slate-700 px-2 outline-none focus:border-[#0f4c81]"
                >
                  <option value="">Todos los sectores</option>
                  {SECTORES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Tipo de Apoyo */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">
                  Tipo de apoyo
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_APOYO.map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setApoyo(apoyo === tipo ? "" : tipo)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        apoyo === tipo
                          ? "bg-[#0f4c81] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f4c81] text-white p-5 rounded-lg shadow-sm">
            <h4 className="font-bold mb-2">Sé un Mentor</h4>
            <p className="text-sm text-blue-100 mb-4">
              Comparte tu experiencia con las nuevas generaciones de la UCR.
            </p>
            <Button className="w-full bg-white text-[#0f4c81] hover:bg-slate-100">
              Actualizar Perfil
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Directorio de Exalumnos</h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? "Cargando..." : `${exalumnos.length} profesionales encontrados`}
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error} —{" "}
              <button onClick={fetchExalumnos} className="underline font-medium">
                Reintentar
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
            </div>
          ) : exalumnos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                🔍
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                No se encontraron exalumnos
              </h3>
              <p className="text-slate-500 text-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exalumnos.map((alumni, i) => (
                <Card
                  key={alumni.id}
                  className="overflow-hidden border-border shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow"
                >
                  <div className={`h-24 ${BG_COLORS[i % BG_COLORS.length]}`} />
                  <div className="px-5 pb-5 flex-1 flex flex-col relative pt-12">
                    <div className="absolute -top-10 left-5 h-20 w-20 rounded-md border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img
                        src={
                          alumni.user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            alumni.user.name || "A"
                          )}&background=0f4c81&color=fff`
                        }
                        alt={alumni.user.name || "Exalumno"}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <h3 className="font-bold text-lg text-foreground leading-tight">
                      {alumni.user.name || "Exalumno UCR"}
                    </h3>
                    {alumni.user.bio && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {alumni.user.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 mb-1">
                      <GraduationCap className="h-4 w-4 shrink-0" />
                      <span className="truncate">{alumni.carrera}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      <span className="truncate">{alumni.sector}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {alumni.apoyoOfrecido.slice(0, 3).map((apoyo, j) => (
                        <span
                          key={apoyo}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                            j === 0
                              ? "bg-[#dcfce7] text-[#166534]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {apoyo}
                        </span>
                      ))}
                      {alumni.apoyoOfrecido.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                          +{alumni.apoyoOfrecido.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button className="flex-1 bg-[#0f4c81] hover:bg-[#0b3a63] text-white text-sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Conectar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
