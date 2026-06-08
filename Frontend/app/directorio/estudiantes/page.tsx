import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DirectorioEstudiantes() {
  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Directory" />
      
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
              placeholder="Buscar por nombre, carrera o proyecto..." 
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {[
            { 
              name: "Maria Gonzalez", carrera: "Ingeniería de Software", sede: "Sede Rodrigo Facio", 
              proyecto: "Plataforma de IA para Diagnóstico Rural", progreso: 75,
              tags: ["MENTORÍA TÉCNICA", "CLOUD CREDITS"]
            },
            { 
              name: "Carlos Mora", carrera: "Arquitectura", sede: "Sede de Occidente", 
              proyecto: "Vivienda Sostenible Modulada", progreso: 40,
              tags: ["MODELADO 3D", "MATERIALES"]
            },
            { 
              name: "Elena Solano", carrera: "Medicina", sede: "Sede Rodrigo Facio", 
              proyecto: "Análisis de Datos en Salud Pública", progreso: 90,
              tags: ["PASANTÍA CLÍNICA", "RED CONTACTOS"]
            }
          ].map((student, i) => (
            <Card key={i} className="p-6 border-border shadow-sm bg-white flex flex-col h-full">
              
              <div className="flex gap-4 mb-5">
                <div className="h-14 w-14 rounded-md bg-slate-200 overflow-hidden shrink-0">
                  <img src={`https://i.pravatar.cc/150?u=${student.name}`} alt={student.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground leading-tight">{student.name}</h3>
                  <p className="text-sm font-semibold text-[#0f4c81] mt-0.5">{student.carrera}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{student.sede}</p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-md mb-5 border-l-2 border-[#0f4c81]">
                <p className="text-xs font-semibold text-slate-500 mb-1">Proyecto de Graduación</p>
                <p className="text-sm font-medium text-slate-800 leading-snug">{student.proyecto}</p>
              </div>

              <div className="mb-4 mt-auto">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-500">Progreso del Proyecto</span>
                  <span className="text-green-600 font-bold">{student.progreso}%</span>
                </div>
                <Progress value={student.progreso} className="h-1.5 bg-slate-100" />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {student.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[#dcfce7] text-[#166534] rounded text-[10px] font-bold tracking-wide">{tag}</span>
                ))}
              </div>

              <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white">
                <HeartIcon className="mr-2 h-4 w-4" />
                Offer Support
              </Button>
            </Card>
          ))}

        </div>

        <div className="flex justify-center mt-10">
          <Button variant="outline" className="border-[#0f4c81] text-[#0f4c81] hover:bg-blue-50 px-8">
            Cargar más estudiantes
          </Button>
        </div>

      </div>
    </div>
  );
}

function HeartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}
