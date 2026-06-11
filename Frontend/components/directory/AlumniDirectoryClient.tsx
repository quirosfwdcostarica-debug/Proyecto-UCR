"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { GraduationCap, Mail, UserPlus, Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

interface AlumniDirectoryClientProps {
  initialAlumni: any[];
}

export function AlumniDirectoryClient({ initialAlumni }: AlumniDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCarrera, setSelectedCarrera] = useState("Todas las carreras");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSupports, setSelectedSupports] = useState<string[]>([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Relevancia");

  // Get unique list of careers dynamically
  const careers = useMemo(() => {
    const list = new Set<string>();
    initialAlumni.forEach(al => {
      if (al.carrera) list.add(al.carrera);
    });
    return ["Todas las carreras", ...Array.from(list)];
  }, [initialAlumni]);

  // Unique list of industries/sectors dynamically
  const industries = useMemo(() => {
    const list = new Set<string>();
    initialAlumni.forEach(al => {
      if (al.sector) list.add(al.sector);
    });
    // Add default mock ones if empty to keep design beautiful
    if (list.size === 0) {
      return ["Tecnología", "Finanzas", "Educación", "Sostenibilidad"];
    }
    return Array.from(list);
  }, [initialAlumni]);

  // Support categories mapping
  const supportCategories = [
    { key: "mentoria", label: "Mentorship" },
    { key: "empleo", label: "Hiring" },
    { key: "guest_speaking", label: "Guest Speaking" },
    { key: "volunteering", label: "Volunteering" },
    { key: "career_advice", label: "Career Advice" },
    { key: "networking", label: "Networking" }
  ];

  const handleIndustryChange = (ind: string) => {
    setSelectedIndustries(prev => 
      prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind]
    );
  };

  const handleSupportClick = (sup: string) => {
    setSelectedSupports(prev => 
      prev.includes(sup) ? prev.filter(x => x !== sup) : [...prev, sup]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCarrera("Todas las carreras");
    setSelectedIndustries([]);
    setSelectedSupports([]);
    setLocationQuery("");
  };

  // Filter exalumnos in memory
  const filteredAlumni = useMemo(() => {
    return initialAlumni.filter(al => {
      const user = al.User || {};
      const name = user.nombre || "";
      const email = user.email || "";
      const role = al.cargo_actual || "";
      const company = al.empresa_actual || "";
      const career = al.carrera || "";
      const location = al.pais_ciudad || "";

      // 1. Text Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText = 
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          role.toLowerCase().includes(query) ||
          company.toLowerCase().includes(query) ||
          career.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      // 2. Career Filter
      if (selectedCarrera !== "Todas las carreras") {
        if (career.toLowerCase() !== selectedCarrera.toLowerCase()) return false;
      }

      // 3. Location Filter
      if (locationQuery) {
        const locQuery = locationQuery.toLowerCase();
        if (!location.toLowerCase().includes(locQuery)) return false;
      }

      // 4. Industry/Sector Filter
      if (selectedIndustries.length > 0) {
        if (!al.sector || !selectedIndustries.includes(al.sector)) return false;
      }

      // 5. Support Type Filter
      if (selectedSupports.length > 0) {
        const matchesSupport = selectedSupports.every(sup => {
          if (sup === "mentoria") return al.ofrece_mentoria;
          if (sup === "empleo") return al.ofrece_empleo;
          if (sup === "guest_speaking") return al.ofrece_guest_speaking;
          if (sup === "volunteering") return al.ofrece_volunteering;
          if (sup === "career_advice") return al.ofrece_career_advice;
          if (sup === "networking") return al.ofrece_networking;
          return true;
        });
        if (!matchesSupport) return false;
      }

      return true;
    });
  }, [initialAlumni, searchQuery, selectedCarrera, locationQuery, selectedIndustries, selectedSupports]);

  // Help generate support tags to render on cards
  const getAlumniSupportTags = (al: any) => {
    const tags = [];
    if (al.ofrece_mentoria) tags.push("MENTORSHIP");
    if (al.ofrece_empleo) tags.push("HIRING");
    if (al.ofrece_guest_speaking) tags.push("GUEST SPEAKING");
    if (al.ofrece_volunteering) tags.push("VOLUNTEERING");
    if (al.ofrece_career_advice) tags.push("CAREER ADVICE");
    if (al.ofrece_networking) tags.push("NETWORKING");
    
    // Fallback if none is checked to make UI look complete
    if (tags.length === 0) tags.push("NETWORKING");
    return tags;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 tracking-wide text-sm">FILTROS</h3>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-[#0f4c81] hover:underline font-medium"
            >
              Limpiar
            </button>
          </div>
          
          <div className="space-y-5">
            {/* Career Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Carrera UCR</label>
              <select 
                value={selectedCarrera}
                onChange={(e) => setSelectedCarrera(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded text-sm text-slate-700 px-2 outline-none focus:border-[#0f4c81]"
              >
                {careers.map((car, idx) => (
                  <option key={idx} value={car}>{car}</option>
                ))}
              </select>
            </div>

            {/* Industry Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Industria</label>
              <div className="space-y-2">
                {industries.map((ind) => (
                  <label key={ind} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedIndustries.includes(ind)}
                      onChange={() => handleIndustryChange(ind)}
                      className="rounded border-slate-300 text-[#0f4c81] focus:ring-[#0f4c81]" 
                    />
                    <span className="text-sm text-slate-700">{ind}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type of Support Badges */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Tipo de Apoyo</label>
              <div className="flex flex-wrap gap-2">
                {supportCategories.map((sup) => {
                  const isChecked = selectedSupports.includes(sup.key);
                  return (
                    <span 
                      key={sup.key}
                      onClick={() => handleSupportClick(sup.key)}
                      className={`px-3 py-1 rounded-full text-xs cursor-pointer font-medium border transition-colors ${
                        isChecked 
                          ? "bg-[#0f4c81] text-white border-[#0f4c81]" 
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {sup.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">País / Ubicación</label>
              <Input 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Ej. Costa Rica, USA..." 
                className="h-9 text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="bg-[#0f4c81] text-white p-5 rounded-xl shadow-sm">
          <h4 className="font-bold mb-2">Sé un Mentor</h4>
          <p className="text-sm text-blue-100 mb-4">Comparte tu experiencia con las nuevas generaciones de la UCR.</p>
          <Link href="/perfil/editar">
            <Button className="w-full bg-white text-[#0f4c81] hover:bg-slate-100 border-0">Actualizar Perfil</Button>
          </Link>
        </div>
      </div>

      {/* Main Directory Area */}
      <div className="flex-1">
        
        {/* Directory Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Directorio de Exalumnos</h1>
            <p className="text-slate-500 text-sm mt-1">
              Encontrados: <span className="font-bold text-slate-700">{filteredAlumni.length}</span> profesionales conectados
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-md p-1 self-start sm:self-auto shadow-sm">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-[#0f4c81] text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-[#0f4c81] text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-0 bg-transparent text-sm font-medium outline-none pr-2 text-slate-700"
            >
              <option>Relevancia</option>
            </select>
          </div>
        </div>

        {/* Local Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo, carrera, cargo o empresa..." 
            className="pl-10 h-11 bg-white border-slate-200 shadow-sm text-sm"
          />
        </div>

        {/* Directory Grid */}
        {filteredAlumni.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <p className="text-slate-500 text-lg">No se encontraron exalumnos con los filtros seleccionados.</p>
            <Button onClick={handleClearFilters} className="mt-4 bg-[#0f4c81] hover:bg-[#0b3a63]">
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
          }>
            {filteredAlumni.map((alumni) => {
              const u = alumni.User || {};
              const name = u.nombre || "Usuario";
              const role = alumni.cargo_actual || "Exalumno";
              const company = alumni.empresa_actual || "UCR";
              const grad = alumni.carrera ? `${alumni.carrera}, ${alumni.anio_graduacion}` : "Exalumno UCR";
              const tags = getAlumniSupportTags(alumni);
              
              // Colors mapping for top cover design to keep it premium and aesthetic
              const bgColors = ["bg-[#0b3a63]", "bg-slate-900", "bg-[#0b5c43]", "bg-[#4a154b]", "bg-[#5c0b0b]"];
              const bgCover = bgColors[name.charCodeAt(0) % bgColors.length];

              if (viewMode === "list") {
                return (
                  <Card key={alumni.user_id} className="p-4 border-slate-200 hover:border-[#0f4c81]/30 transition-all shadow-sm bg-white flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-16 w-16 rounded-md bg-slate-200 overflow-hidden shrink-0 border shadow-sm">
                      <img 
                        src={u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} 
                        alt={name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h3 className="font-bold text-lg text-slate-800 truncate leading-snug">{name}</h3>
                      <p className="text-sm text-slate-500 truncate">{role} en {company}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{grad}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center sm:justify-start max-w-xs">
                      {tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                      <Link href={`/perfil/${alumni.user_id}`} className="flex-1 sm:flex-none">
                        <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white py-2 px-4 text-xs font-semibold h-9">
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                          Connect
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              }

              return (
                <Card key={alumni.user_id} className="overflow-hidden border-slate-200 hover:border-[#0f4c81]/30 transition-all shadow-sm hover:shadow-md flex flex-col bg-white">
                  <div className={`h-20 ${bgCover} w-full`}></div>
                  <div className="px-5 pb-5 flex-1 flex flex-col relative pt-10">
                    <div className="absolute -top-8 left-5 h-16 w-16 rounded-md border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img 
                        src={u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} 
                        alt={name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    
                    <h3 className="font-bold text-base text-slate-800 leading-tight mt-1 truncate">{name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{role} en {company}</p>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 mb-3">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{grad}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                      {tags.slice(0, 3).map((tag, j) => (
                        <span 
                          key={tag} 
                          className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide ${
                            j === 0 ? 'bg-[#dcfce7] text-[#166534]' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/perfil/${alumni.user_id}`} className="flex-1">
                        <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white text-xs h-9">
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                          Connect
                        </Button>
                      </Link>
                      <a href={`mailto:${u.email}`} className="shrink-0">
                        <Button variant="outline" className="px-2.5 border-slate-200 h-9">
                          <Mail className="h-4 w-4 text-slate-500" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
