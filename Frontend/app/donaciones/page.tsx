"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  status: "PENDIENTE" | "APROBADA" | "RECHAZADA";
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
    if (!archivo) {
      setError("Debes adjuntar el comprobante de pago.");
      return;
    }

    setUploading(true);
    try {
      // 1. Subir comprobante a Supabase Storage
      const ext = archivo.name.split(".").pop();
      const fileName = `${exalumnoId}-${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("comprobantes")
        .upload(fileName, archivo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw new Error(`Error al subir el comprobante: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("comprobantes").getPublicUrl(fileName);

      // 2. Registrar la donación en la API
      const res = await fetch("/api/donaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exalumnoId,
          monto: montoNum,
          comprobanteUrl: publicUrl,
          destino: proyecto.nombre,
          metodoPago: metodo,
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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">¡Donación enviada!</h3>
          <p className="text-slate-500 text-sm mb-6">
            Tu comprobante está en revisión. Recibirás un email de confirmación cuando sea aprobado. Gracias por apoyar el talento UCR.
          </p>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-sm px-4 py-2">
            <Clock className="w-4 h-4 mr-1.5" />
            Estado: En revisión
          </Badge>
          <Button onClick={onClose} className="w-full mt-6 bg-[#0f4c81] hover:bg-[#0b3a63] text-white">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Realizar Donación</h3>
            <p className="text-sm text-slate-500 mt-0.5">Proyecto: {proyecto.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Monto a donar (₡)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-semibold text-sm">₡</span>
              <Input
                type="number"
                min="1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="pl-8 h-11 text-lg font-semibold"
                required
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodo("SINPE")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  metodo === "SINPE"
                    ? "border-[#0f4c81] bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Smartphone className={`w-6 h-6 ${metodo === "SINPE" ? "text-[#0f4c81]" : "text-slate-400"}`} />
                <span className={`text-sm font-semibold ${metodo === "SINPE" ? "text-[#0f4c81]" : "text-slate-600"}`}>
                  SINPE Móvil
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMetodo("TRANSFERENCIA")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  metodo === "TRANSFERENCIA"
                    ? "border-[#0f4c81] bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <CreditCard className={`w-6 h-6 ${metodo === "TRANSFERENCIA" ? "text-[#0f4c81]" : "text-slate-400"}`} />
                <span className={`text-sm font-semibold ${metodo === "TRANSFERENCIA" ? "text-[#0f4c81]" : "text-slate-600"}`}>
                  Transferencia
                </span>
              </button>
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            {metodo === "SINPE" ? (
              <>
                <p className="text-sm font-bold text-[#0f4c81] flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Datos para SINPE Móvil
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Número</span>
                  <span className="font-bold text-slate-800 font-mono">{SINPE_NUMERO}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Concepto</span>
                  <span className="font-medium text-slate-700">Donación Alumni UCR</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[#0f4c81] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Datos para Transferencia
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Banco</span>
                  <span className="font-medium text-slate-700">{BANCO_DESTINO}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">IBAN</span>
                  <span className="font-mono text-xs font-bold text-slate-800 break-all">{IBAN_DESTINO}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Beneficiario</span>
                  <span className="font-medium text-slate-700">Fundación UCR</span>
                </div>
              </>
            )}
            <p className="text-xs text-slate-500 pt-1">
              Realiza el pago primero, luego adjunta el comprobante.
            </p>
          </div>

          {/* Comprobante */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comprobante de pago *
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                archivo ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-[#0f4c81] hover:bg-blue-50/30"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {archivo ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{archivo.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setArchivo(null); }}
                    className="ml-1 p-0.5 hover:bg-green-200 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 py-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-[#0f4c81]">Seleccionar archivo</span>{" "}
                    o arrastra aquí
                  </p>
                  <p className="text-xs text-slate-400">JPG, PNG, WEBP o PDF · Máx. 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading}
            className="w-full h-12 bg-[#0f4c81] hover:bg-[#0b3a63] text-white font-semibold text-base"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Enviar Donación
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
const PROYECTOS_EJEMPLO: ProyectoEstudiantil[] = [
  {
    id: "p1",
    nombre: "Sistema de Alerta Temprana para Inundaciones",
    carrera: "Ingeniería en Computación",
    descripcion: "Plataforma IoT que detecta y alerta sobre inundaciones en zonas de riesgo usando sensores de bajo costo.",
    avance: 65,
  },
  {
    id: "p2",
    nombre: "Bioplásticos con Residuos Agrícolas",
    carrera: "Biología",
    descripcion: "Investigación para desarrollar materiales biodegradables a partir de desechos de caña y palma.",
    avance: 40,
  },
  {
    id: "p3",
    nombre: "App de Telemedicina Rural",
    carrera: "Ingeniería Industrial",
    descripcion: "Solución móvil para conectar pacientes en zonas rurales con especialistas médicos.",
    avance: 80,
  },
];

export default function DonacionesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;
  const userName = session?.user?.name || "Usuario";

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ProyectoEstudiantil | null>(null);
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);

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
  }, [userId, role]);

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Donaciones y Apoyo" />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ====== VISTA PARA ESTUDIANTES ====== */}
        {(!session || role === "ESTUDIANTE") && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
              🎓
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0f4c81] to-blue-500">
              Impulsa tu Proyecto de Graduación
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Hola {userName}, los exalumnos están dispuestos a apoyar el talento de la UCR.
              Postula tu proyecto para recibir apoyo financiero.
            </p>
          </div>
        )}

        {/* ====== VISTA PARA EXALUMNOS ====== */}
        {(role === "EXALUMNO" || role === "ADMIN") && (
          <>
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-[#0f4c81]">Apoya Proyectos Estudiantiles</h1>
              <p className="text-slate-500 mt-1">
                Tu donación impulsa el talento y la investigación de la UCR.
              </p>
            </div>

            {/* Grid de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROYECTOS_EJEMPLO.map((proyecto) => (
                <Card key={proyecto.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800 leading-snug">
                          {proyecto.nombre}
                        </CardTitle>
                        <p className="text-xs text-[#0f4c81] font-semibold mt-1">{proyecto.carrera}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500 line-clamp-2">{proyecto.descripcion}</p>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Avance del proyecto</span>
                        <span className="font-bold text-[#0f4c81]">{proyecto.avance}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-[#0f4c81] h-1.5 rounded-full transition-all"
                          style={{ width: `${proyecto.avance}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => setProyectoSeleccionado(proyecto)}
                      className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Donar a este proyecto
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Historial de donaciones */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0f4c81]" />
                Mis Donaciones
              </h2>

              {loadingDonaciones ? (
                <div className="flex items-center gap-2 text-slate-500 py-6">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando historial...
                </div>
              ) : donaciones.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                    📋
                  </div>
                  <p className="text-slate-500 text-sm">
                    Aún no has realizado donaciones. ¡Apoya un proyecto estudiantil!
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Monto</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Destino</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {donaciones.map((d) => {
                          const statusInfo = BADGE_STATUS[d.status];
                          return (
                            <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800">
                                ₡{d.monto.toLocaleString("es-CR")}
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                                {d.destino}
                              </td>
                              <td className="px-4 py-3 text-slate-500">
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
