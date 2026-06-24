"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useDialog } from "@/hooks/useDialog";
import {
  Loader2,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Handshake,
} from "lucide-react";

export default function MatchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showAlert, showConfirm } = useDialog();

  const role = (session?.user as any)?.tipo;
  const isEstudiante = role === "ESTUDIANTE";

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/matches/${id}`);
        if (res.ok) {
          setMatch(await res.json());
        } else {
          router.push("/mis-matches");
        }
      } catch (error) {
        console.error("Error fetching match", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchMatch();
  }, [id, session, router]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMatch({ ...match, ...updated });
      } else {
        const err = await res.json();
        await showAlert(err.message || "Error al procesar la acción", { title: "Error", variant: "error" });
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
      </div>
    );
  }

  if (!match) return null;

  const otherUser = isEstudiante ? match.exalumno : match.estudiante;
  const userData = otherUser.user;
  const isContactado = match.status === "CONTACTADO";
  const imInitiator = match.initiatedBy === session?.user?.id;
  const isActivo = match.status === "ACTIVO";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Button variant="ghost" className="mb-4 pl-0 text-slate-500 hover:text-slate-800" onClick={() => router.push("/mis-matches")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Mis Matches
        </Button>

        {/* Status Banner */}
        {match.status === "CERRADO" && (
          <div className="bg-slate-200 text-slate-700 p-4 rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <p className="font-medium">Este match ha sido cerrado y ya no admite interacciones.</p>
          </div>
        )}
        {match.status === "RECHAZADO" && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <XCircle className="w-5 h-5" />
            <p className="font-medium">La solicitud de conexión no pudo concretarse.</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Columna Izquierda: Perfil */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden text-center">
              <div className="bg-gradient-to-br from-[#0f4c81] to-[#1a7abf] h-24" />
              <div className="px-6 pb-6">
                <div className="w-24 h-24 rounded-full border-4 border-white mx-auto -mt-12 bg-white flex items-center justify-center overflow-hidden">
                  {userData.image ? (
                    <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mt-4">{userData.name}</h2>
                <p className="text-sm text-slate-500 mb-4">{otherUser.carrera}</p>

                {isActivo ? (
                  <div className="space-y-3 pt-4 border-t border-slate-100 text-left">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Información de Contacto</p>
                    {userData.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="w-4 h-4 text-[#0f4c81]" />
                        <a href={`mailto:${userData.email}`} className="hover:underline">{userData.email}</a>
                      </div>
                    )}
                    {userData.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-[#0f4c81]" />
                        <a href={`tel:${userData.phone}`} className="hover:underline">{userData.phone}</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100">
                    <Badge variant="outline" className="bg-slate-50 text-slate-500">
                      Contacto Oculto
                    </Badge>
                    <p className="text-xs text-slate-400 mt-2">La información de contacto se mostrará cuando el match esté Activo.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            {match.status === "SUGERIDO" && (
              <Button
                className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white py-6 text-lg"
                disabled={actionLoading === "CONTACTAR"}
                onClick={() => handleAction("CONTACTAR")}
              >
                {actionLoading === "CONTACTAR" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Contactar"}
              </Button>
            )}

            {isContactado && !imInitiator && (
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  disabled={!!actionLoading}
                  onClick={() => handleAction("ACEPTAR")}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Aceptar Solicitud
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 py-6 text-lg"
                  disabled={!!actionLoading}
                  onClick={() => handleAction("RECHAZAR")}
                >
                  <XCircle className="w-5 h-5 mr-2" /> Rechazar
                </Button>
              </div>
            )}

            {isContactado && imInitiator && (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-center border border-yellow-200">
                <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="font-medium">Solicitud Enviada</p>
                <p className="text-sm mt-1">Esperando la respuesta de la otra parte.</p>
              </div>
            )}

            {isActivo && (
              <Button
                variant="outline"
                className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                disabled={actionLoading === "CERRAR"}
                onClick={async () => {
                  const ok = await showConfirm("¿Cerrar este match? Ya no podrás interactuar con él.", {
                    title: "Cerrar match",
                    confirmLabel: "Cerrar match",
                    variant: "warning",
                  });
                  if (ok) handleAction("CERRAR");
                }}
              >
                {actionLoading === "CERRAR" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cerrar Match"}
              </Button>
            )}
          </div>

          {/* Columna Derecha: Detalles de Afinidad */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Afinidad Calculada</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-extrabold text-[#0f4c81]">{match.afinidad}%</div>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="currentColor" strokeWidth="4"
                        />
                        <path
                          className="text-[#0f4c81]"
                          strokeDasharray={`${match.afinidad}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="currentColor" strokeWidth="4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {match.matchReasons?.map((reason: string, index: number) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm md:text-base">{reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Detalles Profesionales</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {otherUser.sector && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Sector</span>
                      </div>
                      <p className="text-slate-800 font-medium">{otherUser.sector}</p>
                    </div>
                  )}
                  {otherUser.areaProyecto && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Área Temática</span>
                      </div>
                      <p className="text-slate-800 font-medium">{otherUser.areaProyecto}</p>
                    </div>
                  )}
                  {otherUser.areasInteres && otherUser.areasInteres.length > 0 && (
                    <div className="sm:col-span-2 space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Áreas de Interés</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {otherUser.areasInteres.map((area: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(otherUser.apoyoOfrecido?.length > 0 || otherUser.apoyoBuscado?.length > 0) && (
                    <div className="sm:col-span-2 space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Handshake className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">
                          {isEstudiante ? "Apoyo Ofrecido" : "Apoyo Buscado"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(otherUser.apoyoOfrecido || otherUser.apoyoBuscado).map((apoyo: string, i: number) => (
                          <Badge key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100">
                            {apoyo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
