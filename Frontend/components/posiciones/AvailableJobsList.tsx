"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building2, CalendarDays } from "lucide-react";

import { getJobPositions } from "@/actions/dashboard.actions";

export function AvailableJobsList() {
  const { toast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobPositions();
        setJobs(data);
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "El CV no debe pesar más de 5MB.", variant: "destructive" });
        return;
      }
      if (selected.type !== "application/pdf") {
        toast({ title: "Error", description: "Solo se permiten archivos PDF para el CV.", variant: "destructive" });
        return;
      }
      setFile(selected);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedJobId) return;

    setIsApplying(true);
    
    // Simulación del Server Action de postulación
    setTimeout(() => {
      setIsApplying(false);
      toast({
        title: "Aplicación Enviada",
        description: "Tu CV ha sido enviado exitosamente al exalumno encargado de esta vacante.",
      });
      setFile(null);
      setSelectedJobId(null); // Cerrar formulario
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-primary mb-2">Bolsa de Empleo</h2>
        <p className="text-lg text-muted-foreground">Explora oportunidades laborales y de pasantía publicadas por la red de exalumnos UCR.</p>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-10">Cargando empleos...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No hay vacantes disponibles en este momento.</div>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="w-full glass shadow-md border-primary/10 overflow-hidden transition-all hover:shadow-lg dark:bg-slate-900/40 dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-primary dark:text-sky-400 font-bold">{job.titulo}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      {job.empresa || "Empresa Confidencial"}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                    {job.tipo === "EMPLEO" ? "Tiempo Completo" : "Pasantía"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-5">
                <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm leading-relaxed">{job.descripcion || "Descripción de la posición"}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-slate-100 mb-1">Modalidad / Jornada</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium">
                        {job.modalidad || "No especificada"}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium">
                        {job.jornada || "No especificada"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                      <CalendarDays className="w-4 h-4" />
                      <span>Cierra: {job.fecha_limite ? new Date(job.fecha_limite).toLocaleDateString() : "Sin fecha"}</span>
                    </div>
                  </div>
                </div>

              {/* Formulario de Aplicación Expandible */}
              {selectedJobId === job.id ? (
                <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Aplicar a esta posición</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Sube tu Curriculum Vitae en formato PDF. Asegúrate de resaltar las habilidades requeridas.
                  </p>
                  
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Curriculum Vitae (PDF)</Label>
                      <Input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange} 
                        required 
                        className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 cursor-pointer bg-white"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Máximo 5MB.</p>
                    </div>

                    {file && (
                      <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mt-4">
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">Resumen de Aplicación</h5>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                          <li><span className="font-semibold text-slate-700 dark:text-slate-300">Posición seleccionada:</span> {job.titulo}</li>
                          <li><span className="font-semibold text-slate-700 dark:text-slate-300">CV que será enviado:</span> {file.name}</li>
                        </ul>
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                          Una vez enviada tu aplicación, el exalumno podrá revisar tu perfil profesional y CV.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setSelectedJobId(null)}>Cancelar</Button>
                      <Button type="submit" disabled={isApplying || !file} className="bg-primary text-white">
                        {isApplying ? "Enviando..." : "Enviar Aplicación"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="bg-white dark:bg-slate-900/40 pt-0 pb-4 justify-end">
              {selectedJobId !== job.id && (
                <Button onClick={() => setSelectedJobId(job.id)} variant="default" className="bg-[#0f4c81] hover:bg-[#0b3a63]">
                  Aplicar Ahora
                </Button>
              )}
            </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
