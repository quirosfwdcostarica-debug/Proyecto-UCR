"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function NewJobModal() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación del Server Action de Prisma
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      toast({
        title: "Vacante Publicada",
        description: "La posición ha sido publicada exitosamente en la bolsa de empleo.",
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-6 px-8 text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]">
          Publicar Nueva Posición
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Publicar Nueva Posición</DialogTitle>
          <DialogDescription>
            Abre las puertas de tu empresa al talento UCR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Título de la Vacante</Label>
              <Input placeholder="Ej. Desarrollador Frontend Junior" required />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Posición</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLEO">Empleo a Tiempo Completo</SelectItem>
                  <SelectItem value="PASANTIA">Pasantía / Práctica Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción y Requisitos</Label>
            <Textarea
              placeholder="Detalla las responsabilidades y el perfil buscado..."
              className="min-h-[120px] resize-none overflow-hidden"
              required
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Habilidades Requeridas (separadas por coma)</Label>
              <Input placeholder="Introduzca aquí las habilidades requeridas" required />
            </div>
            <div className="space-y-2">
              <Label>Fecha Límite de Aplicación</Label>
              <Input type="date" required />
              <p className="text-xs text-muted-foreground mt-1">La posición se cerrará automáticamente en esta fecha.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar Vacante"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
