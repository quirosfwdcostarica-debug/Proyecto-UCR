"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, MapPin, Video, Layers, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { getTalleresAprobados, postularseATaller } from "@/actions/taller.actions";

interface Taller {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_hora: string | null;
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  modalidad: "ONLINE" | "PRESENCIAL" | "HIBRIDO";
  facilitador_nombre: string;
  facilitador_foto: string | null;
  ya_inscrito: boolean;
}

const MODALIDAD_CFG: Record<string, { label: string; icon: any; className: string }> = {
  ONLINE: { label: "Online", icon: Video, className: "bg-blue-50 text-blue-700 border-blue-200" },
  PRESENCIAL: { label: "Presencial", icon: MapPin, className: "bg-orange-50 text-orange-700 border-orange-200" },
  HIBRIDO: { label: "Híbrido", icon: Layers, className: "bg-purple-50 text-purple-700 border-purple-200" },
};

function fdt(iso: string | null) {
  if (!iso) return "Fecha por confirmar";
  return new Date(iso).toLocaleString("es-CR", { dateStyle: "long", timeStyle: "short" });
}

export default function TalleresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [postulando, setPostulando] = useState<string | null>(null);

  const role = (session?.user as any)?.tipo;
  const isEstudiante = role === "ESTUDIANTE";

  const load = () => {
    setLoading(true);
    getTalleresAprobados()
      .then((data) => setTalleres(data as Taller[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const handlePostularse = async (tallerId: string) => {
    setPostulando(tallerId);
    try {
      await postularseATaller(tallerId);
      toast({ title: "¡Cupo confirmado!", description: "Te llegará un correo con los detalles del taller." });
      load();
    } catch (err: any) {
      toast({ title: "No se pudo completar la postulación", description: err.message, variant: "destructive" });
      load();
    } finally {
      setPostulando(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#005da4]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-xs font-bold text-[#005da4] tracking-wider uppercase mb-1">Comunidad UCR</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Talleres</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Capacitaciones gratuitas facilitadas por exalumnos de la UCR.
          </p>
        </div>

        {talleres.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center text-slate-400">
            <Users className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">Todavía no hay talleres publicados.</p>
            <p className="text-sm mt-1">Vuelve pronto — la red de exalumnos está preparando nuevas capacitaciones.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {talleres.map((t) => {
              const modCfg = MODALIDAD_CFG[t.modalidad] ?? MODALIDAD_CFG.ONLINE;
              const ModIcon = modCfg.icon;
              const cuposLlenos = t.cupos_disponibles <= 0;
              const isPostulando = postulando === t.id;
              return (
                <Card key={t.id} className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      {t.facilitador_foto ? (
                        <img src={t.facilitador_foto} alt={t.facilitador_nombre} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-bold">
                          {t.facilitador_nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Facilitado por</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{t.facilitador_nombre}</p>
                    </div>
                    <Badge variant="outline" className={`ml-auto text-[10px] font-bold gap-1 shrink-0 ${modCfg.className}`}>
                      <ModIcon className="w-3 h-3" /> {modCfg.label}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1.5">{t.titulo}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{t.descripcion}</p>

                  <div className="space-y-1.5 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {fdt(t.fecha_hora)}</p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {cuposLlenos ? "Cupos llenos" : `${t.cupos_disponibles} de ${t.cupos_totales} cupos disponibles`}
                    </p>
                  </div>

                  {isEstudiante ? (
                    t.ya_inscrito ? (
                      <Button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Ya estás inscrito
                      </Button>
                    ) : cuposLlenos ? (
                      <Button disabled className="w-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                        Cupos llenos
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePostularse(t.id)}
                        disabled={isPostulando}
                        className="w-full bg-[#005da4] hover:bg-[#004a83] text-white"
                      >
                        {isPostulando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isPostulando ? "Postulando..." : "Postularme"}
                      </Button>
                    )
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-2.5 border-t border-slate-100 dark:border-slate-800">
                      Solo los estudiantes pueden postularse a los talleres.
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
