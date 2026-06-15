"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchAPI } from "@/lib/api";

export default function DirectorioEstudiantes() {
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Proyectos requeridos fijos
  const mandatoryProjects = [
    {
      name: "Ana Martínez",
      carrera: "Biología",
      sede: "Sede Rodrigo Facio",
      proyecto: "Desarrollo de Bioplásticos con Residuos Agrícolas",
      progreso: 10,
      tags: ["PASANTÍA", "MONETARIA", "MENTORÍA TÉCNICA"]
    },
    {
      name: "Diego Castro",
      carrera: "Informática Empresarial",
      sede: "Sede del Pacífico",
      proyecto: "Sistema de Alerta Temprana para Inundaciones (IoT)",
      progreso: 90,
      tags: ["MONETARIA", "EQUIPO TÉCNICO"]
    }
  ];

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await fetchAPI("/estudiantes");
        if (Array.isArray(data)) {
          // Mapear los estudiantes de la base de datos
          const mapped = data
            .filter((est) => est.proyecto_titulo) // Solo estudiantes con proyecto registrado
            .map((est) => {
              const tags = [];
              if (est.busca_financiamiento) tags.push("MONETARIA");
              if (est.busca_mentoria) tags.push("MENTORÍA");
              if (est.busca_empleo) tags.push("EMPLEO");
              if (est.busca_pasantia) tags.push("PASANTÍA");

              return {
                name: est.User?.nombre || "Estudiante UCR",
                carrera: est.carrera || "Carrera No Especificada",
                sede: est.sede || "Sede Universitaria",
                proyecto: est.proyecto_titulo,
                progreso: 50, // Progreso por defecto
                tags: tags.length > 0 ? tags : ["APOYO GENERAL"]
              };
            });
          setDbStudents(mapped);
        }
      } catch (error) {
        console.error("Error fetching estudiantes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, []);

  // Unimos los fijos con los de la base de datos
  const allStudents = [...mandatoryProjects, ...dbStudents];

  // Búsqueda por coincidencia parcial en el nombre (y alternativamente en carrera/proyecto)
  const filteredStudents = allStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.carrera.toLowerCase().includes(query) ||
      student.proyecto.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Directory" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f4c81] mb-2">Directorio de Proyectos Estudiantiles</h1>
          <p className="text-slate-600 max-w-2xl text-base">
            Conectando el talento emergente de la UCR con nuestra red global de exalumnos. Descubre proyectos innovadores que necesitan tu apoyo, desde etapas iniciales hasta fases finales.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Buscar estudiante por nombre, carrera o proyecto..." 
              className="pl-10 h-12 bg-white border-slate-200 shadow-sm text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-12 px-6 bg-[#0a192f] hover:bg-[#061121] text-white">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filtros Avanzados
          </Button>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Cargando proyectos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, i) => (
                <Card key={i} className="p-6 border-border shadow-sm bg-white flex flex-col h-full hover:shadow-md transition-shadow">
                  
                  <div className="flex gap-4 mb-5">
                    <div className="h-14 w-14 rounded-md bg-slate-200 overflow-hidden shrink-0">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} alt={student.name} className="h-full w-full object-cover" />
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
                      <span className="text-slate-500">
                        {student.progreso < 30 ? "Fase Inicial" : student.progreso > 80 ? "Fase Final" : "En Desarrollo"}
                      </span>
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
                    Ofrecer Apoyo
                  </Button>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500 text-lg">No se encontraron estudiantes que coincidan con la búsqueda.</p>
              </div>
            )}
          </div>
        )}

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
