"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getStudentProjects } from "@/actions/dashboard.actions";
import { StudentApplicationModal } from "@/components/donaciones/StudentApplicationModal";
import { MyApplicationsList } from "@/components/donaciones/MyApplicationsList";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Upload,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Smartphone,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ============================================================
// Constantes de pago (configurables)
// ============================================================
const SINPE_NUMERO = "8888-8888"; // Número SINPE destino
const IBAN_DESTINO = "CR21015200009003651111"; // IBAN UCR
const BANCO_DESTINO = "Banco Nacional de Costa Rica";

// ============================================================
// Tipos
// ============================================================
interface Donacion {
  id: string;
  monto: number;
  destino: string;
  status: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "CONFIRMADA";
  comprobanteUrl: string;
  createdAt: string;
}

interface ProyectoEstudiantil {
  id: string;
  nombre: string;
  carrera: string;
  descripcion: string;
  avance: number;
}

type MetodoPago = "SINPE" | "TRANSFERENCIA";

const BADGE_STATUS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDIENTE: {
    label: "En revisión",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  APROBADA: {
    label: "Aprobada",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  CONFIRMADA: {
    label: "Confirmada",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  RECHAZADA: {
    label: "Rechazada",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

// ============================================================
// Modal de donación
// ============================================================
function DonacionModal({
  proyecto,
  exalumnoId,
  onClose,
  onSuccess,
}: {
  proyecto: ProyectoEstudiantil;
  exalumnoId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("SINPE");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Solo se permiten imágenes (JPG, PNG, WEBP) o PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar 5MB.");
      return;
    }
    setError(null);
    setArchivo(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto.replace(/,/g, ""));
    if (!montoNum || montoNum <= 0) {
      setError("Ingresa un monto válido mayor a ₡0.");
      return;
    }
    setUploading(true);
    try {
      // Registrar la solicitud de donación en la API
      const publicUrl = ""; // Sin comprobante inicialmente

      // 2. Registrar la donación en la API
      const res = await fetch("/api/donaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exalumnoId,
          monto: montoNum,
          comprobanteUrl: publicUrl,
          destino: `${proyecto.nombre}${motivo.trim() ? ` - Motivo: ${motivo.trim()}` : ""}`,
          metodoPago: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al registrar la donación");
      }

      setEnviado(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setUploading(false);
    }
  };

  if (enviado) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">¡Solicitud enviada!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Tu solicitud de donación ha sido enviada al administrador para su revisión y aprobación. Pronto recibirás las instrucciones de pago.
          </p>
          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50 text-sm px-4 py-2">
            <Clock className="w-4 h-4 mr-1.5" />
            Estado: En revisión
          </Badge>
          <Button onClick={onClose} className="w-full mt-6 bg-[#0f4c81] dark:bg-sky-600 hover:bg-[#0b3a63] dark:hover:bg-sky-700 text-white">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Solicitar Donación</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Proyecto: {proyecto.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Monto a donar (₡)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 font-semibold text-sm">₡</span>
              <Input
                type="number"
                min="1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="pl-8 h-11 text-lg font-semibold bg-white dark:bg-slate-950 dark:border-slate-800"
                required
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ¿Por qué te gustaría donar a este proyecto? (Opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Me parece una excelente iniciativa y quiero apoyar..."
              className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800"
              rows={3}
            />
          </div>

          {/* El usuario solo solicita el monto. El método de pago y comprobante se pedirán después de la aprobación. */}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading}
            className="w-full h-12 bg-[#0f4c81] dark:bg-sky-600 hover:bg-[#0b3a63] dark:hover:bg-sky-700 text-white font-semibold text-base"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Solicitar Donación
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Página principal
// ============================================================


export default function DonacionesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;
  const userName = session?.user?.name || "Usuario";

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ProyectoEstudiantil | null>(null);
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  const [proyectos, setProyectos] = useState<ProyectoEstudiantil[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const fetchDonaciones = async () => {
    if (!userId || (role !== "EXALUMNO" && role !== "ADMIN")) return;
    setLoadingDonaciones(true);
    try {
      const res = await fetch("/api/donaciones/mis-donaciones");
      if (res.ok) {
        const data: Donacion[] = await res.json();
        setDonaciones(data);
      }
    } catch (err) {
      console.error("Error al cargar donaciones:", err);
    } finally {
      setLoadingDonaciones(false);
    }
  };

  useEffect(() => {
    fetchDonaciones();
    async function loadProyectos() {
      try {
        const data = await getStudentProjects();
        setProyectos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProyectos(false);
      }
    }
    loadProyectos();
  }, [userId, role]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ====== VISTA PARA ESTUDIANTES ====== */}
        {(!session || role === "ESTUDIANTE") && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
              🎓
            </div>
            <h1 className="text-4xl font-extrabold text-[#0f4c81]">
              Impulsa tu Proyecto de Graduación
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Hola {userName}, los exalumnos están dispuestos a apoyar el talento de la UCR.
              Postula tu proyecto para recibir apoyo financiero.
            </p>
            <div className="pt-4">
              <StudentApplicationModal />
            </div>
            <MyApplicationsList />
          </div>
        )}

        {/* ====== VISTA PARA EXALUMNOS ====== */}
        {(role === "EXALUMNO" || role === "ADMIN") && (
          <>
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-[#0f4c81] dark:text-sky-400">Apoya Proyectos Estudiantiles</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Tu donación impulsa el talento y la investigación de la UCR.
              </p>
            </div>

            {/* Grid de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProyectos ? (
                <div className="col-span-full text-center py-10 text-slate-500">Cargando proyectos...</div>
              ) : proyectos.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500">No hay proyectos buscando financiamiento en este momento.</div>
              ) : proyectos.map((proyecto) => (
                <Card key={proyecto.id} className="bg-white dark:bg-slate-900 border-border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                          {proyecto.nombre}
                        </CardTitle>
                        <p className="text-xs text-[#0f4c81] dark:text-sky-400 font-semibold mt-1">{proyecto.carrera}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{proyecto.descripcion}</p>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400 dark:text-slate-500">Avance del proyecto</span>
                        <span className="font-bold text-[#0f4c81] dark:text-sky-400">{proyecto.avance}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-[#0f4c81] dark:bg-sky-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${proyecto.avance}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => setProyectoSeleccionado(proyecto)}
                      className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Solicitar donar a este proyecto
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Historial de donaciones */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0f4c81] dark:text-sky-400" />
                Historial de donaciones del exalumno
              </h2>

              {loadingDonaciones ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-6">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando historial...
                </div>
              ) : donaciones.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                    📋
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Aún no has realizado donaciones. ¡Apoya un proyecto estudiantil!
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Monto</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Destino</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Fecha</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {donaciones.map((d) => {
                          const statusInfo = BADGE_STATUS[d.status];
                          return (
                            <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                                ₡{d.monto.toLocaleString("es-CR")}
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                                {d.destino}
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                {new Date(d.createdAt).toLocaleDateString("es-CR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className={`inline-flex items-center gap-1 ${statusInfo.className}`}
                                >
                                  {statusInfo.icon}
                                  {statusInfo.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <a
                                  href={d.comprobanteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0f4c81] hover:underline text-xs font-medium"
                                >
                                  Ver →
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de donación */}
      {proyectoSeleccionado && userId && (
        <DonacionModal
          proyecto={proyectoSeleccionado}
          exalumnoId={userId}
          onClose={() => setProyectoSeleccionado(null)}
          onSuccess={() => {
            setProyectoSeleccionado(null);
            fetchDonaciones();
          }}
        />
      )}
    </div>
  );
}
