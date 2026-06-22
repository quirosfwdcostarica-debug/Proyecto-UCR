"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, Mail } from "lucide-react";

interface MatchItem {
  id: string;
  afinidad: number;
  status: "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";
  initiated_by: string;
  exalumno_id: string;
  estudiante_id: string;
  exalumno?: {
    carrera: string;
    sector: string;
    apoyoOfrecido: string[];
    user: { name: string | null; image: string | null; email: string | null };
  };
  estudiante?: {
    carrera: string;
    avanceProyecto: number;
    areaProyecto: string | null;
    apoyoBuscado: string[];
    user: { name: string | null; image: string | null; email: string | null };
  };
}

const STATUS_COLORS: Record<string, string> = {
  SUGERIDO:   "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTADO: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ACTIVO:     "bg-green-100 text-green-700 border-green-200",
  CERRADO:    "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  SUGERIDO:   "Sugerido",
  CONTACTADO: "Contactado",
  ACTIVO:     "Activo",
  CERRADO:    "Cerrado",
};

const SCORE_SOLID: Record<string, string> = {
  alto:  "bg-emerald-600",
  medio: "bg-amber-500",
  bajo:  "bg-slate-400",
};

type Action = "CONTACTAR" | "ACEPTAR" | "RECHAZAR" | "CERRAR";

export default function MisMatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches]       = useState<MatchItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
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
      setMatches(await res.json());
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchMatches();
  }, [session]);

  const handleAction = async (matchId: string, action: Action) => {
    setActionLoading(matchId + action);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar match");

      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== matchId) return m;
          if (action === "CONTACTAR") return { ...m, status: "CONTACTADO", initiated_by: m.estudiante_id };
          if (action === "ACEPTAR")   return { ...m, status: "ACTIVO" };
          if (action === "RECHAZAR" || action === "CERRAR") return { ...m, status: "CERRADO" };
          return m;
        })
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getScoreSolid = (score: number) =>
    score >= 70 ? SCORE_SOLID.alto : score >= 40 ? SCORE_SOLID.medio : SCORE_SOLID.bajo;

  if (!session) {
    return (
      <div className="min-h-full bg-[#f8fafc] flex items-center justify-center py-24">
        <p className="text-slate-500">Inicia sesión para ver tus matches.</p>
      </div>
    );
  }

  const openMatches   = matches.filter((m) => m.status !== "CERRADO");
  const closedMatches = matches.filter((m) => m.status === "CERRADO");

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#005da4]">Mis Matches</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            {role === "EXALUMNO"
              ? "Conexiones con estudiantes UCR ordenadas por afinidad."
              : "Exalumnos sugeridos según tu perfil y necesidades, ordenados por afinidad."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#005da4] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error} —{" "}
            <button onClick={fetchMatches} className="underline font-medium">Reintentar</button>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Sin matches aún</h3>
            <p className="text-slate-500 max-w-sm">
              {role === "ADMIN"
                ? "Ve al panel admin para generar matches automáticamente."
                : "Completa tu perfil para mejorar tus posibilidades de matching."}
            </p>
          </div>
        ) : (
          <>
            {openMatches.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {openMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    role={role}
                    actionLoading={actionLoading}
                    handleAction={handleAction}
                    getScoreSolid={getScoreSolid}
                  />
                ))}
              </div>
            )}

            {closedMatches.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-3">
                  <span className="flex-1 h-px bg-slate-200" />
                  Conexiones cerradas ({closedMatches.length})
                  <span className="flex-1 h-px bg-slate-200" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {closedMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      role={role}
                      actionLoading={actionLoading}
                      handleAction={handleAction}
                      getScoreSolid={getScoreSolid}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── MatchCard ─────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  role,
  actionLoading,
  handleAction,
  getScoreSolid,
}: {
  match: MatchItem;
  role: string;
  actionLoading: string | null;
  handleAction: (id: string, action: Action) => void;
  getScoreSolid: (score: number) => string;
}) {
  const persona      = role === "EXALUMNO" ? match.estudiante : match.exalumno;
  const personaNombre = persona?.user?.name || "Usuario";
  const isClosed     = match.status === "CERRADO";
  const anyLoading   = !!actionLoading?.startsWith(match.id);
  const isLoading    = (action: Action) => actionLoading === match.id + action;

  const exalumnoInitiated  = match.initiated_by === match.exalumno_id;
  // Exalumno initiated → student responds; Student initiated → exalumno responds
  const studentCanRespond  = role === "ESTUDIANTE" && match.status === "CONTACTADO" && exalumnoInitiated;
  const exalumnoCanRespond = role === "EXALUMNO"   && match.status === "CONTACTADO" && !exalumnoInitiated;

  return (
    <Card
      className={`relative overflow-hidden border border-slate-200 bg-white transition-all ${
        !isClosed ? "hover:shadow-xl hover:-translate-y-1" : ""
      }`}
    >
      {/* Score circle */}
      <div
        className={`absolute top-4 right-4 flex items-center justify-center w-11 h-11 rounded-full font-bold text-base text-white shadow ${
          isClosed ? "bg-slate-300" : getScoreSolid(match.afinidad)
        }`}
      >
        {match.afinidad}
      </div>

      <CardHeader className="pr-16">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
            <img
              src={
                persona?.user?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(personaNombre)}&background=006AD3&color=fff`
              }
              alt={personaNombre}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-base leading-tight">{personaNombre}</CardTitle>
            {role === "ESTUDIANTE" && match.exalumno && (
              <CardDescription className="text-xs mt-0.5">
                {match.exalumno.carrera}
                {match.exalumno.sector ? ` • ${match.exalumno.sector}` : ""}
              </CardDescription>
            )}
            {role === "EXALUMNO" && match.estudiante && (
              <CardDescription className="text-xs mt-0.5">{match.estudiante.carrera}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="mb-3">
          <Badge variant="outline" className={`px-2.5 py-0.5 text-xs ${STATUS_COLORS[match.status]}`}>
            {STATUS_LABELS[match.status]}
          </Badge>
        </div>

        {role === "ESTUDIANTE" && match.exalumno && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Ofrece:</p>
            <div className="flex flex-wrap gap-1">
              {match.exalumno.apoyoOfrecido.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
              ))}
            </div>
          </div>
        )}

        {role === "EXALUMNO" && match.estudiante && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">Busca:</p>
            <div className="flex flex-wrap gap-1">
              {match.estudiante.apoyoBuscado.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-[#005da4] h-1.5 rounded-full"
                  style={{ width: `${match.estudiante.avanceProyecto}%` }}
                />
              </div>
              <span>{match.estudiante.avanceProyecto}%</span>
            </div>
          </div>
        )}

        {/* Contact email visible only when ACTIVO */}
        {match.status === "ACTIVO" && persona?.user?.email && (
          <div className="mt-3 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <Mail className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <a
              href={`mailto:${persona.user.email}`}
              className="text-xs font-medium text-green-700 truncate hover:underline"
            >
              {persona.user.email}
            </a>
          </div>
        )}
      </CardContent>

      <CardContent className="bg-slate-50 pt-3 pb-3 border-t border-slate-100">
        {/* SUGERIDO — student initiates */}
        {role === "ESTUDIANTE" && match.status === "SUGERIDO" && (
          <Button
            className="w-full bg-[#005da4] hover:bg-[#005da4]/90 text-white text-sm"
            disabled={anyLoading}
            onClick={() => handleAction(match.id, "CONTACTAR")}
          >
            {isLoading("CONTACTAR") && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Contactar
          </Button>
        )}

        {/* SUGERIDO — exalumno waits */}
        {role === "EXALUMNO" && match.status === "SUGERIDO" && (
          <p className="text-xs text-slate-400 text-center py-1">
            El estudiante aún no ha iniciado contacto
          </p>
        )}

        {/* CONTACTADO — student waiting (they initiated) */}
        {role === "ESTUDIANTE" && match.status === "CONTACTADO" && !exalumnoInitiated && (
          <Button disabled variant="outline" className="w-full text-sm text-slate-400">
            Esperando respuesta del exalumno…
          </Button>
        )}

        {/* CONTACTADO — student responds (exalumno initiated) */}
        {studentCanRespond && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
              disabled={anyLoading}
              onClick={() => handleAction(match.id, "ACEPTAR")}
            >
              {isLoading("ACEPTAR") && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Aceptar
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm"
              disabled={anyLoading}
              onClick={() => handleAction(match.id, "RECHAZAR")}
            >
              {isLoading("RECHAZAR") && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Rechazar
            </Button>
          </div>
        )}

        {/* CONTACTADO — exalumno responds (student initiated) */}
        {exalumnoCanRespond && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
              disabled={anyLoading}
              onClick={() => handleAction(match.id, "ACEPTAR")}
            >
              {isLoading("ACEPTAR") && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Aceptar
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm"
              disabled={anyLoading}
              onClick={() => handleAction(match.id, "RECHAZAR")}
            >
              {isLoading("RECHAZAR") && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Rechazar
            </Button>
          </div>
        )}

        {/* CONTACTADO — exalumno waiting (they initiated) */}
        {role === "EXALUMNO" && match.status === "CONTACTADO" && exalumnoInitiated && (
          <Button disabled variant="outline" className="w-full text-sm text-slate-400">
            Esperando respuesta del estudiante…
          </Button>
        )}

        {/* ACTIVO — close button */}
        {match.status === "ACTIVO" && (
          <Button
            variant="outline"
            className="w-full border-slate-200 text-slate-600 hover:bg-slate-100 text-sm mt-2"
            disabled={anyLoading}
            onClick={() => {
              if (confirm("¿Cerrar esta conexión? Esta acción no se puede deshacer.")) {
                handleAction(match.id, "CERRAR");
              }
            }}
          >
            {isLoading("CERRAR") && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Cerrar Conexión
          </Button>
        )}

        {/* CERRADO — history only */}
        {match.status === "CERRADO" && (
          <p className="text-xs text-slate-400 text-center py-1">Conexión cerrada</p>
        )}
      </CardContent>
    </Card>
  );
}
