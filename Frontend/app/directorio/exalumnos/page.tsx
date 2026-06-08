"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, UserPlus, GraduationCap, LayoutGrid, List, Loader2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Exalumno {
  id: string;
  user_id: string;
  escuela_facultad: string;
  anio_graduacion: number;
  sector: string;
  areas_interes: string[];
  apoyo_ofrecido: string[];
  User: {
    nombre: string;
    email: string;
    foto_url: string;
  };
}

export default function DirectorioExalumnos() {
  const [exalumnos, setExalumnos] = useState<Exalumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const loadExalumnos = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI(`/exalumnos?search=${search}`);
      setExalumnos(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar",
        description: error.message || "No se pudo conectar con el servidor",
        variant: "destructive",
      });
      setExalumnos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadExalumnos();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Directorio" />
      
      <div className="p-8 max-w-7xl mx-auto flex gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-64 shrink-0 space-y-6">
          <div className="bg-white border border-border p-5 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground tracking-wide text-sm">FILTROS</h3>
              <button className="text-xs text-[#0f4c81] hover:underline font-medium">Limpiar</button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Búsqueda Rápida</label>
                <Input 
                  placeholder="Nombre o facultad..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Carrera UCR</label>
                <select className="w-full h-9 border border-slate-200 rounded text-sm text-slate-700 px-2 outline-none focus:border-[#0f4c81]">
                  <option>Todas las carreras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Industria</label>
                <div className="space-y-2">
                  {["Tecnología", "Finanzas", "Educación", "Sostenibilidad"].map((ind) => (
                    <label key={ind} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-[#0f4c81] focus:ring-[#0f4c81]" />
                      <span className="text-sm text-slate-700">{ind}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f4c81] text-white p-5 rounded-lg shadow-sm">
            <h4 className="font-bold mb-2">Sé un Mentor</h4>
            <p className="text-sm text-blue-100 mb-4">Comparte tu experiencia con las nuevas generaciones de la UCR.</p>
            <Button className="w-full bg-white text-[#0f4c81] hover:bg-slate-100">Actualizar Perfil</Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Directorio de Exalumnos</h1>
              <p className="text-slate-500 text-sm mt-1">
                Encontrados: {loading ? "..." : exalumnos.length} profesionales conectados
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white border border-border rounded-md p-1">
              <button className="p-1.5 bg-[#0f4c81] text-white rounded"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><List className="w-4 h-4" /></button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-[#0f4c81]" />
            </div>
          ) : exalumnos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">No se encontraron exalumnos con esos criterios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exalumnos.map((alumni, i) => (
                <Card key={alumni.id || i} className="overflow-hidden border-border shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow">
                  <div className="h-24 bg-[#0f4c81]"></div>
                  <div className="px-5 pb-5 flex-1 flex flex-col relative pt-12">
                    <div className="absolute -top-10 left-5 h-20 w-20 rounded-md border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img 
                        src={alumni.User?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.User?.nombre || "U")}&background=0f4c81&color=fff`} 
                        alt={alumni.User?.nombre} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    
                    <h3 className="font-bold text-lg text-foreground leading-tight">{alumni.User?.nombre}</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{alumni.sector || "Sector no definido"}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 mb-4">
                      <GraduationCap className="h-4 w-4" />
                      {alumni.escuela_facultad || "Facultad"}, {alumni.anio_graduacion}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {alumni.apoyo_ofrecido && alumni.apoyo_ofrecido.length > 0 ? (
                        alumni.apoyo_ofrecido.map((tag: string, j: number) => (
                          <span key={tag} className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${j === 0 ? 'bg-[#dcfce7] text-[#166534]' : 'bg-slate-100 text-slate-600'}`}>
                            {tag.toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold tracking-wide">
                          SIN APOYO DEFINIDO
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button className="flex-1 bg-[#0f4c81] hover:bg-[#0b3a63] text-white">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Conectar
                      </Button>
                      <Button variant="outline" className="px-3 border-slate-300">
                        <Mail className="h-4 w-4 text-slate-600" />
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
