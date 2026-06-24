"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { contactarMatch, cerrarMatch, aceptarMatch, rechazarMatch } from "@/actions/matching.actions";
import { Loader2, UserCheck, Clock, Handshake, XCircle, Sparkles, CheckCircle2, MessageCircle } from "lucide-react";

type MatchStatus = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

type Desglose = { C: number; I: number; A: number; S: number };

interface Match {
  id: string;
  afinidad: number;
  desglose: Desglose | null;
  status: MatchStatus;
  initiated_by?: string;
  exalumno: {
    user: { name?: string | null };
    carrera: string;
    sector: string;
    apoyoOfrecido: string[];
  };
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; Icon: any }> = {
  SUGERIDO:   { label: "Sugerido",    color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",      Icon: Sparkles   },
  CONTACTADO: { label: "Contactado",  color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300", Icon: Clock      },
  ACTIVO:     { label: "Activo",      color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",   Icon: Handshake  },
  CERRADO:    { label: "Cerrado",     color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400",        Icon: XCircle    },
};

const FILTER_TABS: { key: MatchStatus | "TODOS"; label: string }[] = [
  { key: "TODOS",      label: "Todos"      },
  { key: "SUGERIDO",   label: "Sugeridos"  },
  { key: "CONTACTADO", label: "Contactados"},
  { key: "ACTIVO",     label: "Activos"    },
  { key: "CERRADO",    label: "Cerrados"   },
];

export default function MisMatchesClient({ matches: initial }: { matches: Match[] }) {
  const router = useRouter();
  const [matches, setMatches]   = useState<Match[]>(initial);
  const [filter, setFilter]     = useState<MatchStatus | "TODOS">("TODOS");
  const [loadingId, setLoading] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [, startTransition]     = useTransition();

  const visible = filter === "TODOS" ? matches : matches.filter(m => m.status === filter);

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "TODOS" ? matches.length : matches.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  async function handleAction(
    matchId: string,
    action: "contactar" | "cerrar" | "aceptar" | "rechazar"
  ) {
    setLoading(matchId);
    setError(null);
    try {
      if (matchId.startsWith("m")) {
        // Datos mock: simular localmente
        await new Promise(resolve => setTimeout(resolve, 500));
        const statusMap: Record<string, MatchStatus> = {
          contactar: "CONTACTADO",
          cerrar: "CERRADO",
          aceptar: "ACTIVO",
          rechazar: "CERRADO",
        };
        setMatches(prev => prev.map(m =>
          m.id === matchId ? { ...m, status: statusMap[action] } : m
        ));
        setLoading(null);
        return;
      }

      let updated: any;
      if (action === "contactar") updated = await contactarMatch(matchId);
      else if (action === "cerrar")   updated = await cerrarMatch(matchId);
      else if (action === "aceptar")  updated = await aceptarMatch(matchId);
      else                            updated = await rechazarMatch(matchId, "estudiante");

      setMatches(prev => prev.map(m =>
        m.id === matchId ? { ...m, status: updated.estado as MatchStatus } : m
      ));

      if (action === "aceptar") {
        router.push(`/mensajes?matchId=${matchId}`);
      }
    } catch (e: any) {
      setError(e.message ?? "Error al actualizar el match");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
      <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Mis Matches
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Exalumnos sugeridos por la plataforma según tu perfil y necesidades.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
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
            // El exalumno ofreció ayuda: el estudiante debe aceptar/rechazar
            const exalumnoOfrece =
              match.status === "CONTACTADO" && match.initiated_by === "exalumno";

            return (
              <Card
                key={match.id}
                className={`relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-primary/10
                  ${isClosed ? "opacity-60" : ""}
                  ${exalumnoOfrece ? "ring-2 ring-yellow-300/60" : ""}
                `}
              >
                {/* Score con tooltip de desglose */}
                <div className="absolute top-4 right-4 group/score z-20">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg shadow-lg cursor-help select-none">
                    {match.afinidad}
                  </div>
                  {match.desglose && (
                    <div className="absolute top-0 right-full mr-2 hidden group-hover/score:block w-48 bg-slate-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-2xl pointer-events-none">
                      <p className="font-semibold text-slate-300 mb-1.5 text-[11px]">Puntuación</p>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Carrera UCR</span>
                          <span className={match.desglose.C > 0 ? "text-green-400 font-bold" : "text-slate-500"}>{match.desglose.C}/30</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Intereses</span>
                          <span className={match.desglose.I > 0 ? "text-green-400 font-bold" : "text-slate-500"}>{match.desglose.I}/30</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Área proyecto</span>
                          <span className={match.desglose.A > 0 ? "text-green-400 font-bold" : "text-slate-500"}>{match.desglose.A}/20</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tipo apoyo</span>
                          <span className={match.desglose.S > 0 ? "text-green-400 font-bold" : "text-slate-500"}>{match.desglose.S}/20</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-700 flex justify-between">
                        <span className="text-slate-300 font-semibold">Total</span>
                        <span className="text-white font-bold">{match.afinidad}/100</span>
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pr-16">
                  <CardTitle className="text-xl">{match.exalumno.user.name ?? "Exalumno"}</CardTitle>
                  <CardDescription className="text-sm">
                    {match.exalumno.carrera} • {match.exalumno.sector}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <Badge variant="outline" className={`px-3 py-1 flex w-fit items-center gap-1.5 ${cfg.color}`}>
                      <cfg.Icon size={12} />
                      {exalumnoOfrece ? "Te ofrece apoyo" : cfg.label}
                    </Badge>
                  </div>

                  {/* Flujo de estados */}
                  <div className="flex items-center gap-1 mb-4">
                    {(["SUGERIDO", "CONTACTADO", "ACTIVO", "CERRADO"] as MatchStatus[]).map((s, i) => {
                      const steps = ["SUGERIDO", "CONTACTADO", "ACTIVO", "CERRADO"] as MatchStatus[];
                      const currentIdx = steps.indexOf(match.status);
                      const stepIdx    = steps.indexOf(s);
                      const done       = stepIdx <= currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${done ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          {i < 3 && <div className={`h-px flex-1 ${stepIdx < currentIdx ? "bg-primary" : "bg-muted-foreground/20"}`} />}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Ofrece:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.exalumno.apoyoOfrecido.map(apoyo => (
                        <Badge key={apoyo} variant="secondary" className="bg-muted text-xs">{apoyo}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
                  {/* SUGERIDO: estudiante contacta al exalumno */}
                  {match.status === "SUGERIDO" && (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white shadow-md"
                      disabled={isLoading}
                      onClick={() => handleAction(match.id, "contactar")}
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <UserCheck size={16} className="mr-2" />}
                      Contactar
                    </Button>
                  )}

                  {/* CONTACTADO: estudiante inició → espera respuesta del exalumno */}
                  {match.status === "CONTACTADO" && !exalumnoOfrece && (
                    <Button disabled variant="outline" className="w-full text-yellow-600 border-yellow-300">
                      <Clock size={16} className="mr-2" /> Esperando respuesta...
                    </Button>
                  )}

                  {/* CONTACTADO: exalumno ofreció → estudiante acepta o rechaza */}
                  {exalumnoOfrece && (
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
                        onClick={() => handleAction(match.id, "rechazar")}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {/* ACTIVO: chat disponible */}
                  {match.status === "ACTIVO" && (
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => router.push(`/mensajes?matchId=${match.id}`)}
                      >
                        <MessageCircle size={16} className="mr-2" /> Ver conversación
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
    </div>
  );
}
