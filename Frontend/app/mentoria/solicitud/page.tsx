"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, ArrowLeft, CheckCircle2, Coffee } from "lucide-react";
import Link from "next/link";

const MODALIDADES = ["Virtual (videollamada)", "Presencial", "Híbrida"];
const DURACIONES = ["30 minutos", "45 minutos", "1 hora", "1.5 horas"];

function SolicitudForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mentorNombre = searchParams.get("mentor") ?? "Mentor no especificado";

  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    motivo: "",
    fecha: "",
    duracion: "",
    modalidad: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se conectaría con el backend
    setEnviado(true);
    setTimeout(() => router.push("/"), 2500);
  };

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Solicitar Café Virtual" />

      <div className="p-8 max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#0f4c81] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tablero
          </Link>
          <span>/</span>
          <span className="text-[#0f4c81] font-medium">Solicitar Café Virtual</span>
        </div>

        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
            <Coffee className="h-6 w-6 text-[#0f4c81]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Solicitar Café Virtual
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Agenda una sesión de mentoría con un exalumno UCR.
            </p>
          </div>
        </div>

        {/* Tarjeta mentor seleccionado */}
        <Card className="p-5 border-border shadow-sm bg-white flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <UserCircle className="h-10 w-10 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Mentor seleccionado
            </p>
            <h2 className="text-lg font-bold text-[#0f4c81]">{mentorNombre}</h2>
          </div>
        </Card>

        {/* Formulario */}
        <Card className="p-8 border-border shadow-sm bg-white">
          {enviado ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="text-xl font-bold text-foreground">
                ¡Solicitud enviada exitosamente!
              </h2>
              <p className="text-slate-500 text-sm text-center">
                {mentorNombre} recibirá tu solicitud y te contactará pronto.
                <br />
                Redirigiendo al tablero...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Motivo */}
              <div className="space-y-2">
                <label
                  htmlFor="motivo"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Motivo de la reunión{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="motivo"
                  name="motivo"
                  required
                  placeholder="Describe brevemente el propósito de la reunión con el mentor..."
                  value={form.motivo}
                  onChange={handleChange}
                  className="border-slate-200 focus-visible:ring-[#0f4c81] min-h-[110px]"
                />
              </div>

              {/* Fecha sugerida */}
              <div className="space-y-2">
                <label
                  htmlFor="fecha"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Fecha sugerida <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  required
                  value={form.fecha}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="border-slate-200 focus-visible:ring-[#0f4c81]"
                />
              </div>

              {/* Duración */}
              <div className="space-y-2">
                <label
                  htmlFor="duracion"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Duración <span className="text-red-500">*</span>
                </label>
                <select
                  id="duracion"
                  name="duracion"
                  required
                  value={form.duracion}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] focus-visible:ring-offset-2 text-foreground"
                >
                  <option value="" disabled>
                    Selecciona una duración...
                  </option>
                  {DURACIONES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modalidad */}
              <div className="space-y-2">
                <label
                  htmlFor="modalidad"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Modalidad <span className="text-red-500">*</span>
                </label>
                <select
                  id="modalidad"
                  name="modalidad"
                  required
                  value={form.modalidad}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] focus-visible:ring-offset-2 text-foreground"
                >
                  <option value="" disabled>
                    Selecciona una modalidad...
                  </option>
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Acciones */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white px-8"
                >
                  Enviar Solicitud
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline" className="border-slate-300">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function SolicitudPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Cargando...</div>}>
      <SolicitudForm />
    </Suspense>
  );
}
