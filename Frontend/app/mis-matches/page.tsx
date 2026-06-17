"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader2, User as UserIcon, Calendar, Briefcase, Handshake, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useSession } from "next-auth/react";

export default function MisMatchesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const role = (session?.user as any)?.tipo;
  const isEstudiante = role === "ESTUDIANTE";

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches/mis-matches");
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        }
      } catch (error) {
        console.error("Error fetching matches", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchMatches();
  }, [session]);

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status: updated.status } : m)));
      } else {
        const err = await res.json();
        alert(err.message || "Error al realizar la acción");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUGERIDO":
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Sugerido</Badge>;
      case "CONTACTADO":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendiente de Aprobación</Badge>;
      case "ACTIVO":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>;
      case "RECHAZADO":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rechazado</Badge>;
      case "CERRADO":
        return <Badge className="bg-slate-200 text-slate-500 border-slate-300">Cerrado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredMatches = matches.filter((m) => filter === "TODOS" || m.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <TopBar title="Mis Matches" />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f4c81]">Mis Matches</h1>
          <p className="text-slate-500 mt-2">
            Descubre y gestiona tus conexiones profesionales dentro de la comunidad UCR.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {["TODOS", "SUGERIDO", "CONTACTADO", "ACTIVO", "CERRADO"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#0f4c81] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {filteredMatches.length === 0 ? (
          <Card className="bg-white border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Handshake className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Aún no hay matches</h3>
              <p className="text-slate-500 mt-2 max-w-md">
                No hemos encontrado perfiles que coincidan con tus preferencias actuales en este estado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMatches.map((match) => {
              const otherUser = isEstudiante ? match.exalumno : match.estudiante;
              const userData = otherUser.user;
              const isContactado = match.status === "CONTACTADO";
              const imInitiator = match.initiatedBy === session?.user?.id;

              return (
                <Card key={match.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {userData.image ? (
                            <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{userData.name || "Usuario UCR"}</h3>
                          <p className="text-sm text-slate-500">{otherUser.carrera || "Carrera no especificada"}</p>
                        </div>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Afinidad</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                              style={{ width: `${match.afinidad}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{match.afinidad}%</span>
                        </div>
                      </div>

                      {match.matchReasons && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-800 mb-1">Por qué coinciden:</p>
                          <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                            {match.matchReasons.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#0f4c81] text-[#0f4c81] hover:bg-blue-50"
                        onClick={() => router.push(`/mis-matches/${match.id}`)}
                      >
                        Ver Perfil
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>

                      {match.status === "SUGERIDO" && (
                        <Button
                          className="flex-1 bg-[#0f4c81] hover:bg-[#0b3a63] text-white"
                          disabled={actionLoading === match.id}
                          onClick={() => handleAction(match.id, "CONTACTAR")}
                        >
                          {actionLoading === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Contactar"}
                        </Button>
                      )}

                      {isContactado && !imInitiator && (
                        <>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionLoading === match.id}
                            onClick={() => handleAction(match.id, "ACEPTAR")}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Aceptar
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            disabled={actionLoading === match.id}
                            onClick={() => handleAction(match.id, "RECHAZAR")}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Rechazar
                          </Button>
                        </>
                      )}

                      {isContactado && imInitiator && (
                        <div className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-500 rounded-lg text-sm text-center">
                          Esperando respuesta
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
