"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, TableProperties, Download, Search, Filter } from "lucide-react";

export default function MisMatchesPage() {
  const [activeTab, setActiveTab] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [minAffinity, setMinAffinity] = useState(0);
  const [careerFilter, setCareerFilter] = useState("TODOS");

  const matchesMock = [
    {
      id: "m1",
      afinidad: 95,
      status: "SUGERIDO",
      exalumno: {
        user: { name: "Sofía Cerdas" },
        carrera: "Ingeniería Industrial",
        sector: "Sector Privado",
        apoyoOfrecido: ["Mentoría Profesional", "Revisión de CV"]
      }
    },
    {
      id: "m2",
      afinidad: 82,
      status: "CONTACTADO",
      exalumno: {
        user: { name: "David Rojas" },
        carrera: "Administración de Negocios",
        sector: "Emprendimiento / Startup",
        apoyoOfrecido: ["Oportunidad Laboral", "Networking"]
      }
    },
    {
      id: "m3",
      afinidad: 100,
      status: "ACTIVO",
      exalumno: {
        user: { name: "Laura Montero" },
        carrera: "Ingeniería en Computación",
        sector: "Sector Privado",
        apoyoOfrecido: ["Apoyo para Proyecto de Graduación", "Mentoría Profesional"]
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "SUGERIDO": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      case "CONTACTADO": return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "ACTIVO": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300";
      default: return "";
    }
  };

  // Filtrado de matches en cliente
  const filteredMatches = matchesMock.filter(match => {
    const nameMatch = match.exalumno.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "TODOS" || match.status === statusFilter;
    const affinityMatch = match.afinidad >= minAffinity;
    const careerMatch = careerFilter === "TODOS" || match.exalumno.carrera === careerFilter;

    return nameMatch && statusMatch && affinityMatch && careerMatch;
  });

  // Exportar datos de matches a CSV
  const exportToCSV = () => {
    // Definir cabeceras
    const headers = ["ID Match", "Nombre Exalumno", "Carrera", "Sector", "Afinidad (%)", "Estado", "Apoyo Ofrecido"];
    
    // Mapear filas
    const rows = filteredMatches.map(match => [
      match.id,
      match.exalumno.user.name,
      match.exalumno.carrera,
      match.exalumno.sector,
      match.afinidad,
      match.status,
      match.exalumno.apoyoOfrecido.join(" | ")
    ]);

    // Ensamblar CSV con BOM para soporte de tildes en Excel
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `matches_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const careers = Array.from(new Set(matchesMock.map(m => m.exalumno.carrera)));

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Mis Matches
          </h1>
          <p className="mt-2 text-muted-foreground text-base max-w-xl">
            Exalumnos sugeridos por la Inteligencia de la Plataforma basados en tu perfil y necesidades académicas.
          </p>
        </div>

        {/* View Toggle Controls */}
        <div className="flex bg-muted p-1 rounded-lg self-stretch md:self-auto justify-center">
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "cards" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Tarjetas
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "table" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <TableProperties className="w-4 h-4" />
            Gestión (Tabla)
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border p-6 rounded-xl shadow-sm mb-8 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wide">
          <Filter className="w-4 h-4 text-[#0f4c81]" />
          Filtros de Búsqueda
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search by Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre exalumno</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-8 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Estado del Match</label>
            <select
              className="w-full h-9 border border-input rounded px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="SUGERIDO">Sugerido</option>
              <option value="CONTACTADO">Contactado</option>
              <option value="ACTIVO">Activo</option>
            </select>
          </div>

          {/* Filter by Affinity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Afinidad Mínima ({minAffinity}%)</label>
            <div className="pt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f4c81]"
                value={minAffinity}
                onChange={(e) => setMinAffinity(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Filter by Career */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Carrera</label>
            <select
              className="w-full h-9 border border-input rounded px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ring"
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
            >
              <option value="TODOS">Todas las carreras</option>
              {careers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button 
            onClick={exportToCSV}
            className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white flex items-center gap-2 h-9 text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "cards" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => (
              <Card key={match.id} className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 glass border-primary/10 bg-white">
                {/* Score Badge */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg shadow-lg">
                  {match.afinidad}
                </div>

                <CardHeader className="pr-16">
                  <CardTitle className="text-xl">{match.exalumno.user.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {match.exalumno.carrera} • {match.exalumno.sector}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(match.status)}`}>
                      Estado: {match.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Ofrece:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.exalumno.apoyoOfrecido.map(apoyo => (
                        <Badge key={apoyo} variant="secondary" className="bg-muted">
                          {apoyo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
                  {match.status === "SUGERIDO" && (
                    <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white shadow-md transition-all">
                      Contactar
                    </Button>
                  )}
                  {match.status === "CONTACTADO" && (
                    <Button disabled variant="outline" className="w-full">
                      Esperando Respuesta...
                    </Button>
                  )}
                  {match.status === "ACTIVO" && (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Ver Conversación
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">No hay matches que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table Management View */
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Carrera</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Afinidad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Apoyo Ofrecido</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map(match => (
                    <tr key={match.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900 text-sm">{match.exalumno.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-sm">{match.exalumno.carrera}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm">{match.exalumno.sector}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <span className="inline-block px-2.5 py-1 bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-xs rounded-full shadow-sm">
                          {match.afinidad}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className={`px-2.5 py-0.5 ${getStatusColor(match.status)}`}>
                          {match.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                          {match.exalumno.apoyoOfrecido.map(apoyo => (
                            <Badge key={apoyo} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-100">
                              {apoyo}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {match.status === "SUGERIDO" && (
                          <Button size="sm" className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white">
                            Contactar
                          </Button>
                        )}
                        {match.status === "CONTACTADO" && (
                          <Button disabled size="sm" variant="outline">
                            Pendiente
                          </Button>
                        )}
                        {match.status === "ACTIVO" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Ver Chat
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No hay matches que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
