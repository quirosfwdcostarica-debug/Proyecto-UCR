import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MisMatchesClient from "./MisMatchesClient";

<<<<<<< HEAD
<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TopBar } from "@/components/layout/TopBar";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  GraduationCap,
  Briefcase,
  LayoutGrid,
  TableProperties,
  Download,
  Search,
  Filter,
} from "lucide-react";

interface MatchItem {
  id: string;
  afinidad: number;
  status: "SUGERIDO" | "CONTACTADO" | "ACTIVO";
  exalumno?: {
    carrera: string;
    sector: string;
    apoyoOfrecido: string[];
    user: {
      name: string | null;
      image: string | null;
      email: string | null;
      bio: string | null;
    };
  };
  estudiante?: {
    carrera: string;
    avanceProyecto: number;
    areaProyecto: string | null;
    apoyoBuscado: string[];
    user: {
      name: string | null;
      image: string | null;
      email: string | null;
      proyectoFinalizado: boolean;
    };
  };
}

const STATUS_COLORS: Record<string, string> = {
  SUGERIDO: "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTADO: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ACTIVO: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  SUGERIDO: "Sugerido",
  CONTACTADO: "Contactado",
  ACTIVO: "Activo",
};

const SCORE_GRADIENT: Record<string, string> = {
  alto: "from-green-500 to-emerald-600",
  medio: "from-yellow-500 to-amber-600",
  bajo: "from-slate-400 to-slate-500",
};

export default function MisMatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
<<<<<<< HEAD

  // Filter States
  const [activeTab, setActiveTab] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [minAffinity, setMinAffinity] = useState(0);
  const [careerFilter, setCareerFilter] = useState("TODOS");
=======
>>>>>>> eb5beac0152f186cdb87739bed4e533272a779fc

  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/matches/mis-matches");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al cargar matches");
      }
      const data: MatchItem[] = await res.json();
      setMatches(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
=======
=======
type Desglose = { C: number; I: number; A: number; S: number };

function parseDesglose(tipoApoyo: string | null): Desglose | null {
  if (!tipoApoyo || !tipoApoyo.startsWith("C:")) return null;
  const obj: Record<string, number> = {};
  tipoApoyo.split(",").forEach(p => {
    const idx = p.indexOf(":");
    if (idx > 0) obj[p.slice(0, idx)] = parseInt(p.slice(idx + 1), 10) || 0;
  });
  return { C: obj.C ?? 0, I: obj.I ?? 0, A: obj.A ?? 0, S: obj.S ?? 0 };
}

>>>>>>> 536d699f309e5f3adcf36b069fad3bf79afbe40f
export default async function MisMatchesPage() {
  let matches: any[] = [];

  try {
    const session = await auth();
<<<<<<< HEAD
    userId = session?.user?.id;
    if (userId) {
      matches = await getMatchesForEstudiante(userId);
>>>>>>> 90eec3fe0d45ab796ae19a62cf4a9674f0db6290
    }
  } catch (e) {
    // Sin BD: mostrar UI con datos mock
  }

<<<<<<< HEAD
  useEffect(() => {
    if (session) {
      fetchMatches();
    }
  }, [session]);

  const handleAction = async (matchId: string, newStatus: string) => {
    setActionLoading(matchId + newStatus);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar match");

      if (newStatus === "RECHAZADO") {
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
      } else {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, status: newStatus as MatchItem["status"] } : m
          )
        );
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return SCORE_GRADIENT.alto;
    if (score >= 40) return SCORE_GRADIENT.medio;
    return SCORE_GRADIENT.bajo;
  };

  // Client-side filtering
  const filteredMatches = matches.filter((match) => {
    const target = role === "EXALUMNO" ? match.estudiante : match.exalumno;
    const name = target?.user?.name || "";
    const career = target?.carrera || "";

    const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "TODOS" || match.status === statusFilter;
    const affinityMatch = match.afinidad >= minAffinity;
    const careerMatch = careerFilter === "TODOS" || career === careerFilter;

    return nameMatch && statusMatch && affinityMatch && careerMatch;
  });

  const careers = Array.from(
    new Set(
      matches
        .map((m) => (role === "EXALUMNO" ? m.estudiante?.carrera : m.exalumno?.carrera))
        .filter(Boolean)
    )
  );

  const exportToCSV = () => {
    const headers = [
      "ID Match",
      "Nombre",
      "Carrera",
      "Afinidad (%)",
      "Estado",
      role === "EXALUMNO" ? "Apoyo Buscado" : "Apoyo Ofrecido",
    ];

    const rows = filteredMatches.map((match) => {
      const target = role === "EXALUMNO" ? match.estudiante : match.exalumno;
      const details =
        role === "EXALUMNO"
          ? match.estudiante?.apoyoBuscado.join(" | ")
          : match.exalumno?.apoyoOfrecido.join(" | ");

      return [
        match.id,
        target?.user?.name || "N/A",
        target?.carrera || "N/A",
        match.afinidad,
        match.status,
        details || "N/A",
      ];
    });

    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
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

  if (!session) {
    return (
      <div className="min-h-full bg-[#f8fafc]">
        <TopBar title="Mis Matches" />
        <div className="flex items-center justify-center py-24">
          <p className="text-slate-500">Inicia sesión para ver tus matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] pb-12">
      <TopBar title="Mis Matches" />
<<<<<<< HEAD

      <div className="container mx-auto py-10 px-6">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-200/50 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f4c81] to-blue-500">
              Mis Matches
            </h1>
            <p className="mt-2 text-slate-500 text-base max-w-xl">
              {role === "EXALUMNO"
                ? "Estudiantes que han solicitado conectar contigo, ordenados por afinidad."
                : "Exalumnos sugeridos basados en tu perfil y necesidades, ordenados por afinidad."}
            </p>
          </div>

          {/* View Toggle Controls */}
          <div className="flex bg-slate-100 p-1 rounded-lg self-stretch md:self-auto justify-center border border-slate-200/50">
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "cards"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Tarjetas
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "table"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TableProperties className="w-4 h-4" />
              Gestión (Tabla)
            </button>
          </div>
=======
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-ucr-celeste-medium to-blue-500">
            Mis Matches
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            {role === "EXALUMNO"
              ? "Estudiantes que han solicitado conectar contigo, ordenados por afinidad."
              : "Exalumnos sugeridos basados en tu perfil and necesidades, ordenados por afinidad."}
          </p>
>>>>>>> b5ea57c9397d4278347aad692b616f3b45702065
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-[#0f4c81]" />
            Filtros de Búsqueda
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search by Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-8 h-9 text-sm bg-slate-50/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Estado del Match</label>
              <select
                className="w-full h-9 border border-slate-200 rounded px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Afinidad Mínima ({minAffinity}%)
              </label>
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
                className="w-full h-9 border border-slate-200 rounded px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                value={careerFilter}
                onChange={(e) => setCareerFilter(e.target.value)}
              >
                <option value="TODOS">Todas las carreras</option>
                {careers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              onClick={exportToCSV}
              disabled={filteredMatches.length === 0}
              className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white flex items-center gap-2 h-9 text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
<<<<<<< HEAD
            <Loader2 className="w-12 h-12 text-[#0f4c81] animate-spin" />
=======
            <Loader2 className="w-8 h-8 text-ucr-celeste-medium animate-spin" />
>>>>>>> b5ea57c9397d4278347aad692b616f3b45702065
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error} —{" "}
            <button onClick={fetchMatches} className="underline font-medium">
              Reintentar
            </button>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl p-10">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4">
              🤝
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Sin matches encontrados</h3>
            <p className="text-slate-500 max-w-sm">
              {role === "ADMIN"
                ? "No se han encontrado registros en la base de datos."
                : "Completa tu perfil para que nuestro algoritmo de afinidad te proponga sugerencias."}
            </p>
          </div>
        ) : activeTab === "cards" ? (
          /* Grid Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => {
              const persona = role === "EXALUMNO" ? match.estudiante : match.exalumno;
              const personaNombre = persona?.user?.name || "Usuario UCR";
              const isLoading = actionLoading?.startsWith(match.id);

              return (
                <Card
                  key={match.id}
                  className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-200 bg-white flex flex-col justify-between"
                >
                  <div>
                    {/* Score Badge */}
                    <div
                      className={`absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getScoreGradient(
                        match.afinidad
                      )} text-white font-bold text-lg shadow-md`}
                    >
                      {match.afinidad}
                    </div>

                    <CardHeader className="pr-16">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                          <img
                            src={
                              persona?.user?.image ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                personaNombre
                              )}&background=0f4c81&color=fff`
                            }
                            alt={personaNombre}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg leading-tight">{personaNombre}</CardTitle>
                          <CardDescription className="text-xs mt-0.5 truncate max-w-[150px]">
                            {persona?.carrera || "Graduado"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="mb-4">
                        <Badge
                          variant="outline"
                          className={`px-3 py-1 font-semibold ${STATUS_COLORS[match.status]}`}
                        >
                          {STATUS_LABELS[match.status]}
                        </Badge>
                      </div>

                      {role === "ESTUDIANTE" && match.exalumno && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Apoyo ofrecido:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {match.exalumno.apoyoOfrecido.slice(0, 3).map((apoyo) => (
                              <Badge key={apoyo} variant="secondary" className="text-xs">
                                {apoyo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {role === "EXALUMNO" && match.estudiante && (
                        <div className="space-y-3">
                          {match.estudiante.areaProyecto && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate">{match.estudiante.areaProyecto}</span>
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Apoyo solicitado:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {match.estudiante.apoyoBuscado.slice(0, 3).map((apoyo) => (
                                <Badge key={apoyo} variant="secondary" className="text-xs">
                                  {apoyo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>

<<<<<<< HEAD
                  <CardFooter className="bg-slate-50/80 pt-4 border-t border-slate-100 mt-4">
=======
                  <CardHeader className="pr-16">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <img
                          src={
                            persona?.user?.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              personaNombre
                            )}&background=006AD3&color=fff`
                          }
                          alt={personaNombre}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">
                          {personaNombre}
                        </CardTitle>
                        {role === "ESTUDIANTE" && match.exalumno && (
                          <CardDescription className="text-xs mt-0.5">
                            {match.exalumno.carrera} • {match.exalumno.sector}
                          </CardDescription>
                        )}
                        {role === "EXALUMNO" && match.estudiante && (
                          <CardDescription className="text-xs mt-0.5">
                            {match.estudiante.carrera}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-3">
                      <Badge
                        variant="outline"
                        className={`px-3 py-1 ${STATUS_COLORS[match.status]}`}
                      >
                        {STATUS_LABELS[match.status]}
                      </Badge>
                    </div>

                    {role === "ESTUDIANTE" && match.exalumno && (
                      <div>
                        <p className="text-sm font-semibold mb-2 text-slate-600">Ofrece:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {match.exalumno.apoyoOfrecido.slice(0, 3).map((apoyo) => (
                            <Badge key={apoyo} variant="secondary" className="text-xs">
                              {apoyo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {role === "EXALUMNO" && match.estudiante && (
                      <div className="space-y-2">
                        {match.estudiante.areaProyecto && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span>{match.estudiante.areaProyecto}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          <p className="text-xs font-semibold text-slate-500 w-full">Busca:</p>
                          {match.estudiante.apoyoBuscado.slice(0, 3).map((apoyo) => (
                            <Badge key={apoyo} variant="secondary" className="text-xs">
                              {apoyo}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-ucr-celeste-medium h-1.5 rounded-full"
                              style={{ width: `${match.estudiante.avanceProyecto}%` }}
                            />
                          </div>
                          <span>{match.estudiante.avanceProyecto}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardContent className="bg-slate-50 pt-4 border-t border-slate-100">
                    {/* Acciones para ESTUDIANTE */}
>>>>>>> b5ea57c9397d4278347aad692b616f3b45702065
                    {role === "ESTUDIANTE" && match.status === "SUGERIDO" && (
                      <Button
                        className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white"
                        disabled={!!isLoading}
                        onClick={() => handleAction(match.id, "CONTACTADO")}
                      >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Contactar
                      </Button>
                    )}
                    {role === "ESTUDIANTE" && match.status === "CONTACTADO" && (
                      <Button disabled variant="outline" className="w-full">
                        Esperando Respuesta...
                      </Button>
                    )}
                    {match.status === "ACTIVO" && (
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Ver Conversación
                      </Button>
                    )}

                    {role === "EXALUMNO" && match.status === "CONTACTADO" && (
                      <div className="flex gap-2 w-full">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                          disabled={!!isLoading}
                          onClick={() => handleAction(match.id, "ACTIVO")}
                        >
                          {actionLoading === match.id + "ACTIVO" && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          )}
                          Aceptar
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                          disabled={!!isLoading}
                          onClick={() => handleAction(match.id, "RECHAZADO")}
                        >
                          {actionLoading === match.id + "RECHAZADO" && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          )}
                          Rechazar
                        </Button>
                      </div>
                    )}
                    {role === "EXALUMNO" && match.status === "SUGERIDO" && (
                      <Button disabled variant="outline" className="w-full">
                        Pendiente de contacto
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
<<<<<<< HEAD
        ) : (
          /* Table Management View */
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Carrera
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Afinidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {role === "EXALUMNO" ? "Apoyo Buscado" : "Apoyo Ofrecido"}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredMatches.map((match) => {
                    const persona = role === "EXALUMNO" ? match.estudiante : match.exalumno;
                    const personaNombre = persona?.user?.name || "Usuario UCR";
                    const isLoading = actionLoading?.startsWith(match.id);

                    const details =
                      role === "EXALUMNO"
                        ? match.estudiante?.apoyoBuscado
                        : match.exalumno?.apoyoOfrecido;

                    return (
                      <tr key={match.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900 text-sm">
                          {personaNombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-sm">
                          {persona?.carrera || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <span className="inline-block px-2.5 py-1 bg-gradient-to-br from-[#0f4c81] to-blue-600 text-white font-bold text-xs rounded-full shadow-sm">
                            {match.afinidad}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge
                            variant="outline"
                            className={`px-2.5 py-0.5 ${STATUS_COLORS[match.status]}`}
                          >
                            {STATUS_LABELS[match.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                            {details?.map((apoyo) => (
                              <Badge
                                key={apoyo}
                                variant="secondary"
                                className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-100"
                              >
                                {apoyo}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {role === "ESTUDIANTE" && match.status === "SUGERIDO" && (
                            <Button
                              size="sm"
                              disabled={!!isLoading}
                              onClick={() => handleAction(match.id, "CONTACTADO")}
                              className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white"
                            >
                              Contactar
                            </Button>
                          )}
                          {role === "ESTUDIANTE" && match.status === "CONTACTADO" && (
                            <Button disabled size="sm" variant="outline">
                              Pendiente
                            </Button>
                          )}
                          {role === "EXALUMNO" && match.status === "CONTACTADO" && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                disabled={!!isLoading}
                                onClick={() => handleAction(match.id, "ACTIVO")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Aceptar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!!isLoading}
                                onClick={() => handleAction(match.id, "RECHAZADO")}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                          {match.status === "ACTIVO" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Ver Chat
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
=======
>>>>>>> eb5beac0152f186cdb87739bed4e533272a779fc
        )}
      </div>
    </div>
=======
  // Datos mock para que la UI se vea sin BD configurada
  if (matches.length === 0) {
    matches = [
      {
        id: "m1", afinidad: 95, status: "SUGERIDO",
        exalumno: { user: { name: "Sofía Cerdas" }, carrera: "Ingeniería Industrial", sector: "Sector Privado", apoyoOfrecido: ["Mentoría Profesional", "Revisión de CV"] }
      },
      {
        id: "m2", afinidad: 82, status: "CONTACTADO",
        exalumno: { user: { name: "David Rojas" }, carrera: "Administración de Negocios", sector: "Emprendimiento / Startup", apoyoOfrecido: ["Oportunidad Laboral", "Networking"] }
      },
      {
        id: "m3", afinidad: 100, status: "ACTIVO",
        exalumno: { user: { name: "Laura Montero" }, carrera: "Ingeniería en Computación", sector: "Sector Privado", apoyoOfrecido: ["Apoyo para Proyecto de Graduación", "Mentoría Profesional"] }
      },
      {
        id: "m4", afinidad: 71, status: "CERRADO",
        exalumno: { user: { name: "Marco Solano" }, carrera: "Derecho", sector: "Sector Público", apoyoOfrecido: ["Networking", "Mentoría Profesional"] }
      },
    ];
=======
    if (session?.user?.id) {
      const userId = session.user.id;

      const rawMatches = await prisma.match.findMany({
        where: { estudiante_id: userId },
        orderBy: { score_match: "desc" },
        include: {
          exalumno: {
            include: {
              user: { select: { nombre: true, foto_url: true } },
            },
          },
        },
      });

      matches = rawMatches.map((m) => ({
        id: m.id,
        afinidad: m.score_match ?? 0,
        desglose: parseDesglose(m.tipo_apoyo),
        status: m.estado as string,
        initiated_by: m.initiated_by ?? "sistema",
        exalumno: {
          user: { name: m.exalumno?.user?.nombre ?? null },
          carrera: m.exalumno?.escuela_facultad ?? "",
          sector: m.exalumno?.empresa_actual ?? m.exalumno?.cargo_actual ?? "",
          apoyoOfrecido: [
            m.exalumno?.ofrece_mentoria         ? "Mentoría"        : null,
            m.exalumno?.ofrece_empleo           ? "Empleo"          : null,
            m.exalumno?.ofrece_pasantia         ? "Pasantía"        : null,
            m.exalumno?.ofrece_donacion_dinero  ? "Financiamiento"  : null,
            m.exalumno?.ofrece_guest_speaking   ? "Guest Speaking"  : null,
            m.exalumno?.ofrece_networking       ? "Networking"      : null,
          ].filter(Boolean) as string[],
        },
      }));
    }
  } catch (e) {
    console.error("[MisMatchesPage]", e);
>>>>>>> 536d699f309e5f3adcf36b069fad3bf79afbe40f
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando matches...</div>}>
      <MisMatchesClient matches={matches} />
    </Suspense>
>>>>>>> 90eec3fe0d45ab796ae19a62cf4a9674f0db6290
  );
}