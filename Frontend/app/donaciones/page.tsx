"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { fetchAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DonacionesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [destino, setDestino] = useState("fondo_general");
  const [monto, setMonto] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "El archivo no debe pesar más de 5MB.", variant: "destructive" });
        return;
      }
      if (selected.type !== "application/pdf" && selected.type !== "image/jpeg") {
        toast({ title: "Error", description: "Solo se permiten archivos PDF o JPG.", variant: "destructive" });
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    if (!session?.user) {
      toast({ title: "Acceso denegado", description: "Debes iniciar sesión para hacer una donación", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. Subir a Supabase Storage (requiere bucket público o autenticado llamado 'comprobantes')
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = `donaciones/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Error subiendo comprobante: ${uploadError.message}`);
      }

      // Obtener URL pública (asumiendo bucket público o firmar URL)
      const { data: { publicUrl } } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(filePath);

      // 2. Crear registro en BD
      await fetchAPI('/donaciones', {
        method: 'POST',
        body: JSON.stringify({
          exalumno_id: session.user.id,
          monto: parseFloat(monto),
          destino,
          estado: 'PENDIENTE',
          comprobante_url: publicUrl,
        }),
      });

      toast({
        title: "Comprobante Enviado",
        description: "Tu donación está en estado Pendiente. ¡Gracias por tu aporte!",
      });
      
      // Reset form
      setFile(null);
      setMonto("");
      
      // Reset file input visual state
      const fileInput = document.getElementById('comprobante-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast({
        title: "Error en donación",
        description: error.message || "No se pudo procesar la donación",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center min-h-[80vh] items-center">
      <Card className="w-full max-w-lg glass border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
            💚
          </div>
          <CardTitle className="text-3xl font-extrabold text-[#0f4c81]">
            Módulo de Donaciones
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Tu apoyo transforma el futuro de nuestros estudiantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Destino de la Donación</Label>
              <Select value={destino} onValueChange={setDestino} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fondo_general">Fondo General de Becas</SelectItem>
                  <SelectItem value="proyecto_graduacion">Fondo de Proyectos de Graduación</SelectItem>
                  <SelectItem value="emergencia">Fondo de Emergencia Estudiantil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monto (CRC)</Label>
              <Input 
                type="number" 
                min="1000" 
                placeholder="Ej. 10000" 
                required 
                className="text-lg font-mono" 
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Comprobante de Transferencia (SINPE/Banco)</Label>
              <Input 
                id="comprobante-input"
                type="file" 
                accept=".pdf, .jpg, .jpeg" 
                onChange={handleFileChange} 
                required 
                className="file:bg-[#0f4c81] file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">Formatos permitidos: PDF o JPG. Máximo 5MB.</p>
            </div>

            <Button type="submit" disabled={isUploading || !file} className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white py-6 text-lg rounded-xl shadow-lg transition-all">
              {isUploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Subiendo comprobante...</> : "Enviar Comprobante"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            Las donaciones quedan en estado <span className="font-bold">Pendiente</span> hasta ser verificadas por la administración. SLA de respuesta: 48 horas.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
