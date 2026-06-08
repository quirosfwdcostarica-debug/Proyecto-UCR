"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Search, SlidersHorizontal, HeartIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Estudiante {
  id: string;
  user_id: string;
  carrera: string;
  sede: string;
  avance_proyecto: number;
  apoyo_buscado: string[];
  User: {
    nombre: string;
    email: string;
    foto_url: string;
  };
}

export default function DirectorioEstudiantes() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      // Usa el endpoint real
      const data = await fetchAPI(`/estudiantes?search=${search}`);
      setEstudiantes(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar",
        description: error.message || "No se pudo conectar con el servidor",
        variant: "destructive",
      });
      // Fallback temporal si la DB no está conectada pero el REST api funciona (o mock data temporal)
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadEstudiantes();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Directorio" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f4c81] mb-2">Directorio de Estudiantes</h1>
          <p className="text-slate-600 max-w-2xl text-base">
            Conectando el talento emergente de la UCR con nuestra red global de exalumnos. Descubre proyectos innovadores y ofrece tu mentoría.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Buscar por nombre o carrera..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white border-slate-200 shadow-sm text-base"
            />
          </div>
          <Button className="h-12 px-6 bg-[#0a192f] hover:bg-[#061121] text-white">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Ver Filtros Avanzados
          </Button>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "CARRERA", value: "Todas las carreras" },
            { label: "SEDE", value: "Todas las sedes" },
            { label: "APOYO REQUERIDO", value: "Cualquier tipo" },
            { label: "HABILIDADES", value: "Todas" }
          ].map(filter => (
            <div key={filter.label}>
              <label className="block text-xs font-semibold text-slate-500 tracking-wide mb-1.5">{filter.label}</label>
              <select className="w-full h-10 border-slate-200 rounded-md bg-white text-sm text-slate-700 shadow-sm px-3 focus:border-[#0f4c81] focus:ring-1 focus:ring-[#0f4c81] outline-none appearance-none">
                <option>{filter.value}</option>
              </select>
            </div>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#0f4c81]" />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No se encontraron estudiantes con esos criterios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estudiantes.map((estudiante, i) => (
              <Card key={estudiante.id || i} className="p-6 border-border shadow-sm bg-white flex flex-col h-full hover:shadow-md transition-shadow">
                
                <div className="flex gap-4 mb-5">
                  <div className="h-14 w-14 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img 
                      src={estudiante.User?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(estudiante.User?.nombre || "U")}&background=0f4c81&color=fff`} 
                      alt={estudiante.User?.nombre} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight">{estudiante.User?.nombre}</h3>
                    <p className="text-sm font-semibold text-[#0f4c81] mt-0.5">{estudiante.carrera || "Sin carrera asignada"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{estudiante.sede || "Sede Rodrigo Facio"}</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-md mb-5 border-l-2 border-[#0f4c81]">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Proyecto de Graduación</p>
                  <p className="text-sm font-medium text-slate-800 leading-snug">
                    {/* Placeholder si no hay proyecto definido en la DB */}
                    "Proyecto en etapa de definición"
                  </p>
                </div>

                <div className="mb-4 mt-auto">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-500">Progreso del Proyecto</span>
                    <span className="text-green-600 font-bold">{estudiante.avance_proyecto || 0}%</span>
                  </div>
                  <Progress value={estudiante.avance_proyecto || 0} className="h-1.5 bg-slate-100" />
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {estudiante.apoyo_buscado && estudiante.apoyo_buscado.length > 0 ? (
                    estudiante.apoyo_buscado.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-[#dcfce7] text-[#166534] rounded text-[10px] font-bold tracking-wide">
                        {tag.toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold tracking-wide">
                      SIN APOYO ESPECÍFICO
                    </span>
                  )}
                </div>

                <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white">
                  <HeartIcon className="mr-2 h-4 w-4" />
                  Ofrecer Apoyo
                </Button>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
