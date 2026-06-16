"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Mail, 
  Linkedin, 
  Github, 
  Globe, 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  ArrowLeft,
  Calendar,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProfileDetailsClientProps {
  exalumno: any;
  currentUser: any;
  accessToken?: string;
  apiUrl: string;
}

export function ProfileDetailsClient({ exalumno, currentUser, accessToken, apiUrl }: ProfileDetailsClientProps) {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<string>(exalumno.connectionStatus || "none");
  const [connectionId, setConnectionId] = useState<string | null>(exalumno.connectionId || null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const user = exalumno.User || {};
  const isOwnProfile = currentUser?.id === user.id;

// Define the type for support tags
interface SupportType {
  label: string;
  color: string;
}

// Map offers of support to tags
const supportTypes: SupportType[] = [];
if (exalumno.ofrece_mentoria) supportTypes.push({ label: "Mentorship", color: "bg-blue-50 text-blue-700 border-blue-200" });
if (exalumno.ofrece_empleo) supportTypes.push({ label: "Hiring", color: "bg-emerald-50 text-emerald-700 border-emerald-200" });
  if (exalumno.ofrece_guest_speaking) supportTypes.push({ label: "Guest Speaking", color: "bg-purple-50 text-purple-700 border-purple-200" });
  if (exalumno.ofrece_volunteering) supportTypes.push({ label: "Volunteering", color: "bg-amber-50 text-amber-700 border-amber-200" });
  if (exalumno.ofrece_career_advice) supportTypes.push({ label: "Career Advice", color: "bg-indigo-50 text-indigo-700 border-indigo-200" });
  if (exalumno.ofrece_networking) supportTypes.push({ label: "Networking", color: "bg-rose-50 text-rose-700 border-rose-200" });

  // Parse structured data safely
  const parseJsonData = (data: any) => {
    if (!data) return [];
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  };

  const experiences = parseJsonData(exalumno.experiencia_laboral);
  const skills = parseJsonData(exalumno.habilidades);
  const certifications = parseJsonData(exalumno.certificaciones);

  // Manage Connection Request Flow
  const handleConnectAction = async () => {
    if (!currentUser) {
      // User is not authenticated: Show sweet alert warning and redirect
      Swal.fire({
        title: "¡Autenticación requerida!",
        text: "Debes iniciar sesión para conectar con otros exalumnos.",
        icon: "warning",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#0f4c81",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#64748b"
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/login?callbackUrl=/perfil/${user.id}`);
        }
      });
      return;
    }

    if (isActionLoading) return;
    setIsActionLoading(true);

    try {
      if (connectionStatus === "none" || connectionStatus === "cancelled" || connectionStatus === "rejected") {
        // Send a request
        const res = await fetch(`${apiUrl}/connections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ receiver_id: user.id })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Error al enviar la solicitud.");
        }

        setConnectionStatus("pending");
        setConnectionId(data.id);

        Swal.fire({
          title: "¡Solicitud Enviada!",
          text: `Se ha enviado tu solicitud de contacto a ${user.nombre}.`,
          icon: "success",
          confirmButtonColor: "#0f4c81"
        });
      } else if (connectionStatus === "pending") {
        // If pending, we can cancel it
        if (!connectionId) return;

        // Verify if we are the sender
        const isSender = exalumno.connectionSenderId ? exalumno.connectionSenderId === currentUser.id : true;

        if (isSender) {
          const res = await fetch(`${apiUrl}/connections/${connectionId}/cancel`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al cancelar la solicitud.");
          }

          setConnectionStatus("cancelled");
          Swal.fire({
            title: "Solicitud Cancelada",
            text: "La solicitud de conexión ha sido cancelada.",
            icon: "info",
            confirmButtonColor: "#0f4c81"
          });
        } else {
          // We are the receiver: Accept it directly!
          const res = await fetch(`${apiUrl}/connections/${connectionId}/accept`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al aceptar la solicitud.");
          }

          setConnectionStatus("accepted");
          Swal.fire({
            title: "¡Conexión Aceptada!",
            text: `Ahora estás conectado con ${user.nombre}.`,
            icon: "success",
            confirmButtonColor: "#0f4c81"
          });
        }
      } else if (connectionStatus === "accepted") {
        // Delete/Disconnect
        if (!connectionId) return;

        Swal.fire({
          title: "¿Eliminar conexión?",
          text: `¿Estás seguro de que quieres eliminar a ${user.nombre} de tus conexiones?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          confirmButtonColor: "#dc2626",
          cancelButtonText: "Cancelar",
          cancelButtonColor: "#64748b"
        }).then(async (result) => {
          if (result.isConfirmed) {
            setIsActionLoading(true);
            try {
              const res = await fetch(`${apiUrl}/connections/${connectionId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });

              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al eliminar la conexión.");
              }

              setConnectionStatus("none");
              setConnectionId(null);
              Swal.fire({
                title: "Conexión Eliminada",
                text: "Has eliminado esta conexión.",
                icon: "success",
                confirmButtonColor: "#0f4c81"
              });
            } catch (err: any) {
              Swal.fire({
                title: "Error",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#0f4c81"
              });
            } finally {
              setIsActionLoading(false);
            }
          }
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message || "Ocurrió un error al procesar tu solicitud.",
        icon: "error",
        confirmButtonColor: "#0f4c81"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Render the connect button states
  const renderConnectButton = () => {
    if (isOwnProfile) {
      return (
        <Button disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200">
          Tu Perfil
        </Button>
      );
    }

    if (isActionLoading) {
      return (
        <Button disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0f4c81]" />
          Procesando...
        </Button>
      );
    }

    const isSender = exalumno.connectionSenderId ? exalumno.connectionSenderId === currentUser?.id : true;

    switch (connectionStatus) {
      case "accepted":
        return (
          <Button onClick={handleConnectAction} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all">
            <Check className="mr-2 h-4 w-4" />
            Conectado
          </Button>
        );
      case "pending":
        return (
          <Button onClick={handleConnectAction} variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold transition-all">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSender ? "Pendiente (Cancelar)" : "Aceptar Conexión"}
          </Button>
        );
      case "rejected":
        return (
          <Button onClick={handleConnectAction} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all">
            <X className="mr-2 h-4 w-4" />
            Solicitud Rechazada (Reintentar)
          </Button>
        );
      case "cancelled":
        return (
          <Button onClick={handleConnectAction} className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white font-semibold transition-all">
            <UserPlus className="mr-2 h-4 w-4" />
            Conectar
          </Button>
        );
      default:
        return (
          <Button onClick={handleConnectAction} className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white font-semibold transition-all">
            <UserPlus className="mr-2 h-4 w-4" />
            Connect
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Top Banner and Back button */}
      <div className="bg-[#0f4c81] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-200 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al directorio
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Perfil de Exalumno</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Card: Main Details */}
        <div className="w-full lg:w-1/3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#0b3a63] to-[#0f4c81]"></div>
            
            <div className="h-32 w-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md mt-8 z-10 relative">
              <img 
                src={user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || "Exalumno")}&background=random`} 
                alt={user.nombre} 
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mt-4 leading-tight">{user.nombre}</h1>
            <p className="text-sm font-semibold text-[#0f4c81] mt-1">{exalumno.cargo_actual || "Profesional"} en {exalumno.empresa_actual || "Empresa"}</p>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pb-4 border-b border-slate-100 w-full justify-center">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <span>{exalumno.carrera} ({exalumno.anio_graduacion})</span>
            </div>

            <div className="w-full space-y-3 mt-4 text-left text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>{exalumno.pais_ciudad || "Costa Rica"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full mt-6 space-y-3">
              {renderConnectButton()}
              
              <div className="flex gap-3 justify-center pt-2">
                {exalumno.linkedin_url && (
                  <a href={exalumno.linkedin_url} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-[#0077b5] hover:bg-slate-50 transition-all">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {exalumno.github_url && (
                  <a href={exalumno.github_url} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-[#24292e] hover:bg-slate-50 transition-all">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {exalumno.website_url && (
                  <a href={exalumno.website_url} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-[#0f4c81] hover:bg-slate-50 transition-all">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Supports Card */}
          {supportTypes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mt-6">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide mb-4 uppercase">Tipos de apoyo que ofrece</h3>
              <div className="flex flex-wrap gap-2.5">
                {supportTypes.map((sup, idx) => (
                  <span key={idx} className={`px-3 py-1.5 border rounded-full text-xs font-semibold ${sup.color}`}>
                    {sup.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Detailed professional info */}
        <div className="flex-1 space-y-6">
          
          {/* Biography */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-4">Biografía Profesional</h2>
            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
              {exalumno.biografia || "El exalumno no ha registrado una biografía profesional todavía."}
            </p>
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#0f4c81]" />
              Experiencia Laboral
            </h2>
            
            {experiences.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Sin experiencia laboral registrada.</p>
            ) : (
              <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
                {experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#0f4c81]"></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{exp.cargo || exp.titulo}</h4>
                        <p className="text-sm font-semibold text-slate-500">{exp.empresa || exp.organizacion}</p>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold self-start md:self-auto flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {exp.anio_inicio || exp.periodo || "N/A"} {exp.anio_fin ? `- ${exp.anio_fin}` : ""}
                      </span>
                    </div>
                    {exp.descripcion && (
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">{exp.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skills */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-4">Habilidades</h3>
              {skills.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Sin habilidades registradas.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 py-1.5 px-3 rounded-lg text-xs font-semibold">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#0f4c81]" />
                Certificaciones
              </h3>
              {certifications.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Sin certificaciones registradas.</p>
              ) : (
                <div className="space-y-4">
                  {certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="p-1.5 bg-blue-50 rounded-lg text-[#0f4c81] shrink-0 mt-0.5">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{cert.nombre}</h4>
                        <p className="text-xs text-slate-500">{cert.institucion} {cert.anio ? `(${cert.anio})` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
