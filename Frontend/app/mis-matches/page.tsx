"use client";

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
import { Loader2, GraduationCap, Briefcase } from "lucide-react";

interface MatchItem {
  id: string;
  afinidad: number;
  status: "SUGERIDO" | "CONTACTADO" | "ACTIVO";
  // Para ESTUDIANTE: datos del exalumno
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
  // Para EXALUMNO: datos del estudiante
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
    }
  };

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

      // Actualizar la lista local
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
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Mis Matches" />
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f4c81] to-blue-500">
            Mis Matches
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            {role === "EXALUMNO"
              ? "Estudiantes que han solicitado conectar contigo, ordenados por afinidad."
              : "Exalumnos sugeridos basados en tu perfil y necesidades, ordenados por afinidad."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error} —{" "}
            <button onClick={fetchMatches} className="underline font-medium">
              Reintentar
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4">
              🤝
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Sin matches aún
            </h3>
            <p className="text-slate-500 max-w-sm">
              {role === "ADMIN"
                ? "Ve al panel admin para generar matches automáticamente."
                : "Completa tu perfil para mejorar tus posibilidades de matching."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const persona = role === "EXALUMNO" ? match.estudiante : match.exalumno;
              const personaNombre = persona?.user?.name || "Usuario";
              const isLoading = actionLoading?.startsWith(match.id);

              return (
                <Card
                  key={match.id}
                  className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-200 bg-white"
                >
                  {/* Score Badge */}
                  <div
                    className={`absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getScoreGradient(
                      match.afinidad
                    )} text-white font-bold text-lg shadow-lg`}
                  >
                    {match.afinidad}
                  </div>

                  <CardHeader className="pr-16">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
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
                              className="bg-[#0f4c81] h-1.5 rounded-full"
                              style={{ width: `${match.estudiante.avanceProyecto}%` }}
                            />
                          </div>
                          <span>{match.estudiante.avanceProyecto}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="bg-slate-50 pt-4 border-t border-slate-100">
                    {/* Acciones para ESTUDIANTE */}
                    {role === "ESTUDIANTE" && match.status === "SUGERIDO" && (
                      <Button
                        className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white"
                        disabled={!!isLoading}
                        onClick={() => handleAction(match.id, "CONTACTADO")}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
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

                    {/* Acciones para EXALUMNO */}
                    {role === "EXALUMNO" && match.status === "CONTACTADO" && (
                      <div className="flex gap-2 w-full">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                          disabled={!!isLoading}
                          onClick={() => handleAction(match.id, "ACTIVO")}
                        >
                          {actionLoading === match.id + "ACTIVO" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : null}
                          Aceptar
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm"
                          disabled={!!isLoading}
                          onClick={() => handleAction(match.id, "RECHAZADO")}
                        >
                          {actionLoading === match.id + "RECHAZADO" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : null}
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
        )}
      </div>
    </div>
  );
}
