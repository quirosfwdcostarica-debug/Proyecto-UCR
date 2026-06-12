"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const CATEGORIAS = [
  "Ingeniería de Software",
  "Inteligencia Artificial",
  "Energías Renovables",
  "Biotecnología",
  "Ciencias Sociales",
  "Economía y Negocios",
  "Educación",
  "Salud Pública",
  "Otro",
];

export default function NuevoProyecto() {
  const router = useRouter();
  const [guardado, setGuardado] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    objetivos: "",
    estado: "Iniciando",
  });
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState("");
  const [errorCategoriaPersonalizada, setErrorCategoriaPersonalizada] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Al cambiar de categoría, limpiar el campo personalizado
    if (name === "categoria" && value !== "Otro") {
      setCategoriaPersonalizada("");
      setErrorCategoriaPersonalizada(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar campo personalizado cuando la categoría es "Otro"
    if (form.categoria === "Otro" && categoriaPersonalizada.trim() === "") {
      setErrorCategoriaPersonalizada(true);
      return;
    }
    // La categoría final a guardar
    const categoriaFinal =
      form.categoria === "Otro" ? categoriaPersonalizada.trim() : form.categoria;
    // Aquí se conectaría con el backend, usando categoriaFinal
    console.log({ ...form, categoria: categoriaFinal });
    setGuardado(true);
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Crear Nuevo Proyecto" />

      <div className="p-8 max-w-3xl mx-auto space-y-6">
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
          <span className="text-[#0f4c81] font-medium">Nuevo Proyecto</span>
        </div>

        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#0f4c81] flex items-center justify-center text-white shadow-sm">
            <FolderPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Crear Nuevo Proyecto
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Completa los datos para registrar tu proyecto de graduación.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card className="p-8 border-border shadow-sm bg-white">
          {guardado ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="text-xl font-bold text-foreground">
                ¡Proyecto guardado exitosamente!
              </h2>
              <p className="text-slate-500 text-sm">
                Redirigiendo al tablero...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label
                  htmlFor="nombre"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Nombre del Proyecto{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej. Sistema de Gestión de Energía Solar"
                  value={form.nombre}
                  onChange={handleChange}
                  className="border-slate-200 focus-visible:ring-[#0f4c81]"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label
                  htmlFor="descripcion"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Descripción <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  required
                  placeholder="Describe brevemente de qué trata tu proyecto..."
                  value={form.descripcion}
                  onChange={handleChange}
                  className="border-slate-200 focus-visible:ring-[#0f4c81] min-h-[100px]"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label
                  htmlFor="categoria"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  required
                  value={form.categoria}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] focus-visible:ring-offset-2 text-foreground"
                >
                  <option value="" disabled>
                    Selecciona una categoría...
                  </option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Campo personalizado — visible solo cuando se elige "Otro" */}
                {form.categoria === "Otro" && (
                  <div className="space-y-1 pt-1">
                    <label
                      htmlFor="categoriaPersonalizada"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Especifique la categoría{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="categoriaPersonalizada"
                      name="categoriaPersonalizada"
                      type="text"
                      value={categoriaPersonalizada}
                      onChange={(e) => {
                        setCategoriaPersonalizada(e.target.value);
                        if (e.target.value.trim() !== "") {
                          setErrorCategoriaPersonalizada(false);
                        }
                      }}
                      placeholder="Ingrese la categoría de su proyecto"
                      className={`border-slate-200 focus-visible:ring-[#0f4c81] ${
                        errorCategoriaPersonalizada
                          ? "border-red-400 focus-visible:ring-red-400"
                          : ""
                      }`}
                    />
                    {errorCategoriaPersonalizada && (
                      <p className="text-xs text-red-500 font-medium pt-0.5">
                        Debe especificar una categoría.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label
                  htmlFor="estado"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Estado del Proyecto <span className="text-red-500">*</span>
                </label>
                <select
                  id="estado"
                  name="estado"
                  required
                  value={form.estado}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] focus-visible:ring-offset-2 text-foreground"
                >
                  <option value="Iniciando">Iniciando</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              {/* Objetivos */}
              <div className="space-y-2">
                <label
                  htmlFor="objetivos"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Objetivos <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="objetivos"
                  name="objetivos"
                  required
                  placeholder="Lista los objetivos principales del proyecto (uno por línea)..."
                  value={form.objetivos}
                  onChange={handleChange}
                  className="border-slate-200 focus-visible:ring-[#0f4c81] min-h-[120px]"
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white px-8"
                >
                  Guardar Proyecto
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
