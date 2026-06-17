"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { aceptarMatch, cerrarMatch } from "@/actions/matching.actions";
import { Loader2, CheckCircle2, Clock, Handshake, XCircle, Sparkles, BookOpen } from "lucide-react";

type MatchStatus = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

interface Match {
  id: string;
  afinidad: number;
  status: MatchStatus;
  estudiante: {
    user: { name?: string | null };
    carrera: string;
    avanceProyecto: number;
    apoyoBuscado: string[];
  };
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; Icon: any }> = {
  SUGERIDO:   { label: "Sugerido",   color: "bg-blue-100 text-blue-700 border-blue-200",    Icon: Sparkles   },
  CONTACTADO: { label: "Te contactó",color: "bg-yellow-100 text-yellow-700 border-yellow-200", Icon: Clock   },
  ACTIVO:     { label: "Activo",     color: "bg-green-100 text-green-700 border-green-200",  Icon: Handshake  },
  CERRADO:    { label: "Cerrado",    color: "bg-gray-100 text-gray-500 border-gray-200",     Icon: XCircle    },
};

const FILTER_TABS: { key: MatchStatus | "TODOS"; label: string }[] = [
  { key: "TODOS",      label: "Todos"       },
  { key: "CONTACTADO", label: "Pendientes"  },
  { key: "ACTIVO",     label: "Activos"     },
  { key: "SUGERIDO",   label: "Sugeridos"   },
  { key: "CERRADO",    label: "Cerrados"    },
];

export default function MatchesExalumnoClient({ matches: initial }: { matches: Match[] }) {
  const [matches, setMatches]   = useState<Match[]>(initial);
  const [filter, setFilter]     = useState<MatchStatus | "TODOS">("TODOS");
  const [loadingId, setLoading] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const visible = filter === "TODOS" ? matches : matches.filter(m => m.status === filter);
  const counts  = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "TODOS" ? matches.length : matches.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  // Highlight pendientes
  const pendientes = matches.filter(m => m.status === "CONTACTADO").length;

  async function handleAction(matchId: string, action: "aceptar" | "cerrar") {
    setLoading(matchId);
    setError(null);
    try {
      const updated = action === "aceptar"
        ? await aceptarMatch(matchId)
        : await cerrarMatch(matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: updated.status as MatchStatus } : m));
    } catch (e: any) {
      setError(e.message ?? "Error al actualizar el match");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Mis Matches
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Estudiantes que la plataforma sugirió como compatibles con tu perfil.
        </p>
        {pendientes > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-2 text-sm font-medium dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300">
            <Clock size={14} />
            {pendientes} estudiante{pendientes > 1 ? "s" : ""} esperando tu respuesta
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === tab.key
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-muted-foreground border-border hover:border-primary/50 dark:bg-muted dark:text-muted-foreground"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === tab.key ? "bg-white/20" : "bg-muted"}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No hay matches en este estado aún.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map(match => {
            const cfg       = STATUS_CONFIG[match.status];
            const isLoading = loadingId === match.id;
            const isClosed  = match.status === "CERRADO";

            return (
              <Card
                key={match.id}
                className={`relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-primary/10 ${isClosed ? "opacity-60" : ""} ${match.status === "CONTACTADO" ? "ring-2 ring-yellow-300/60" : ""}`}
              >
                {/* Score */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg shadow-lg">
                  {match.afinidad}
                </div>

                <CardHeader className="pr-16">
                  <CardTitle className="text-xl">{match.estudiante.user.name ?? "Estudiante"}</CardTitle>
                  <CardDescription className="text-sm">{match.estudiante.carrera}</CardDescription>
                </CardHeader>

                <CardContent>
                  <Badge variant="outline" className={`px-3 py-1 flex w-fit items-center gap-1.5 mb-4 ${cfg.color}`}>
                    <cfg.Icon size={12} /> {cfg.label}
                  </Badge>

                  {/* Progreso proyecto */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <BookOpen size={11} /> Avance proyecto
                      </span>
                      <span className="text-xs font-bold">{match.estudiante.avanceProyecto}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                        style={{ width: `${match.estudiante.avanceProyecto}%` }}
                      />
                    </div>
                  </div>

                  {/* Apoyo buscado */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Busca:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.estudiante.apoyoBuscado.map(apoyo => (
                        <Badge key={apoyo} variant="secondary" className="bg-muted text-xs">{apoyo}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
                  {match.status === "SUGERIDO" && (
                    <p className="w-full text-center text-sm text-muted-foreground">Esperando que el estudiante contacte</p>
                  )}
                  {match.status === "CONTACTADO" && (
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={isLoading}
                        onClick={() => handleAction(match.id, "aceptar")}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-gray-500 hover:text-red-600 hover:border-red-300"
                        disabled={isLoading}
                        onClick={() => handleAction(match.id, "cerrar")}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                        Rechazar
                      </Button>
                    </div>
                  )}
                  {match.status === "ACTIVO" && (
                    <div className="flex gap-2 w-full">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <Handshake size={16} className="mr-2" /> Ver conversación
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-500 hover:text-red-600 hover:border-red-300"
                        disabled={isLoading}
                        onClick={() => handleAction(match.id, "cerrar")}
                        title="Cerrar match"
                      >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      </Button>
                    </div>
                  )}
                  {match.status === "CERRADO" && (
                    <p className="w-full text-center text-sm text-muted-foreground">Match cerrado</p>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
