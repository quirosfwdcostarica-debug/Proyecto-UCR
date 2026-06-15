"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Search, Mail, UserPlus, GraduationCap, LayoutGrid, List } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function DirectorioExalumnos() {
  const [dbAlumni, setDbAlumni] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mocks originales para complementar
  const mockAlumni = [
    { name: "Ana María Rodríguez", role: "Director of Engineering at FinTech Global", grad: "Ingeniería Eléctrica, 2012", tags: ["MENTORSHIP", "HIRING"], bg: "bg-[#0b3a63]" },
    { name: "Luis Fernando Soto", role: "Senior Legal Counsel, United Nations", grad: "Derecho, 2008", tags: ["POLICY ADVICE", "PUBLIC SPEAKING"], bg: "bg-slate-900" },
    { name: "Karla Jiménez", role: "Sustainability Lead at EcoCorp", grad: "Administración, 2015", tags: ["MENTORSHIP", "VOLUNTEERING"], bg: "bg-green-700" }
  ];

  useEffect(() => {
    async function loadAlumni() {
      try {
        const data = await fetchAPI("/exalumnos");
        if (Array.isArray(data)) {
          const mapped = data.map((alumni) => {
            const tags = [];
            if (alumni.ofrece_mentoria) tags.push("MENTORÍA");
            if (alumni.ofrece_empleo) tags.push("EMPLEO");
            if (alumni.ofrece_pasantia) tags.push("PASANTÍA");
            if (alumni.ofrece_proyecto) tags.push("PROYECTO");
            if (alumni.ofrece_donacion_dinero) tags.push("DONACIÓN");

            return {
              name: alumni.User?.nombre || "Exalumno UCR",
              role: `${alumni.cargo_actual || "Profesional"} en ${alumni.empresa_actual || "UCR"}`,
              grad: `${alumni.escuela_facultad || "Graduado UCR"}, ${alumni.anio_graduacion || ""}`,
              tags: tags.length > 0 ? tags : ["MENTORÍA"],
              bg: "bg-[#0b3a63]"
            };
          });
          setDbAlumni(mapped);
        }
      } catch (error) {
        console.error("Error fetching exalumnos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlumni();
  }, []);

  const allAlumni = [...mockAlumni, ...dbAlumni];

  // Búsqueda por coincidencia parcial en el nombre (y alternativamente cargo/graduación)
  const filteredAlumni = allAlumni.filter((alumni) => {
    const query = searchQuery.toLowerCase();
    return (
      alumni.name.toLowerCase().includes(query) ||
      alumni.role.toLowerCase().includes(query) ||
      alumni.grad.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Directory" />
      
      <div className="p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white border border-border p-5 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground tracking-wide text-sm">FILTROS</h3>
              <button onClick={() => setSearchQuery("")} className="text-xs text-[#0f4c81] hover:underline font-medium">Limpiar</button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Carrera UCR</label>
                <select className="w-full h-9 border border-slate-200 rounded text-sm text-slate-700 px-2 outline-none focus:border-[#0f4c81] bg-white">
                  <option>Todas las carreras</option>
                  <option>Ingeniería Eléctrica</option>
                  <option>Derecho</option>
                  <option>Administración</option>
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Tipo de Apoyo</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#0f4c81] text-white rounded-full text-xs cursor-pointer">Mentoría</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs cursor-pointer">Empleo</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs cursor-pointer">Proyectos</span>
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
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Directorio de Exalumnos</h1>
              <p className="text-slate-500 text-sm mt-1">Conectando a {allAlumni.length} profesionales de la red UCR</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white border border-border rounded-md p-1 self-stretch sm:self-auto justify-end">
              <button className="p-1.5 bg-[#0f4c81] text-white rounded"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><List className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <select className="border-0 bg-transparent text-sm font-medium outline-none pr-2 text-slate-700">
                <option>Relevancia</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Buscar exalumno por nombre o profesión..." 
              className="pl-10 h-12 bg-white border-slate-200 shadow-sm text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">Cargando directorio...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.length > 0 ? (
                filteredAlumni.map((alumni, i) => (
                  <Card key={i} className="overflow-hidden border-border shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow">
                    <div className={`h-24 ${alumni.bg}`}></div>
                    <div className="px-5 pb-5 flex-1 flex flex-col relative pt-12">
                      <div className="absolute -top-10 left-5 h-20 w-20 rounded-md border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.name)}&background=random`} alt={alumni.name} className="h-full w-full object-cover" />
                      </div>
                      
                      <h3 className="font-bold text-lg text-foreground leading-tight">{alumni.name}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{alumni.role}</p>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 mb-4">
                        <GraduationCap className="h-4 w-4" />
                        {alumni.grad}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {alumni.tags.map((tag, j) => (
                          <span key={tag} className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${j === 0 ? 'bg-[#dcfce7] text-[#166534]' : 'bg-slate-100 text-slate-600'}`}>
                            {tag}
                          </span>
                        ))}
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
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500 text-lg">No se encontraron exalumnos que coincidan con la búsqueda.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Button variant="outline" className="border-[#0f4c81] text-[#0f4c81] hover:bg-blue-50 px-8">
              Cargar más exalumnos
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
