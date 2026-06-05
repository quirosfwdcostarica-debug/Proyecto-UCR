"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function NuevaPosicionPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación del Server Action de Prisma
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Vacante Publicada",
        description: "La posición ha sido publicada exitosamente en la bolsa de empleo.",
      });
      // Redirect o reset form
    }, 1500);
  };

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center min-h-[80vh] items-center">
      <Card className="w-full max-w-2xl glass border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mb-4">
            💼
          </div>
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Publicar Nueva Posición
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Abre las puertas de tu empresa al talento UCR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="min-h-[120px]" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Habilidades Requeridas (separadas por coma)</Label>
                <Input placeholder="React, TypeScript, Figma" required />
              </div>
              <div className="space-y-2">
                <Label>Fecha Límite de Aplicación</Label>
                <Input type="date" required />
                <p className="text-xs text-muted-foreground mt-1">La posición se cerrará automáticamente en esta fecha.</p>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]">
              {isSubmitting ? "Publicando..." : "Publicar Vacante"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
