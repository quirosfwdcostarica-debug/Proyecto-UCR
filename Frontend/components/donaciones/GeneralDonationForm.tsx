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
import { Loader2, Copy, Check, Smartphone, Landmark } from "lucide-react";

export function GeneralDonationForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [destino, setDestino] = useState("fondo_general");
  const [monto, setMonto] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({
      title: "¡Copiado!",
      description: `${label} copiado al portapapeles.`,
    });
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "El archivo no debe pesar más de 5MB.", variant: "destructive" });
        return;
      }
      if (selected.type !== "application/pdf" && selected.type !== "image/jpeg" && selected.type !== "image/png") {
        toast({ title: "Error", description: "Solo se permiten archivos PDF, JPG o PNG.", variant: "destructive" });
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
      // 1. Subir a Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "imagenes");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dd69q4ba3";

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error subiendo comprobante a Cloudinary");
      }

      const uploadData = await res.json();
      const publicUrl = uploadData.secure_url;

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
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border bg-white p-2 sm:p-6">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#0f4c81]">
          Módulo de Donaciones Generales
        </CardTitle>
        <CardDescription className="text-base sm:text-lg mt-2">
          Tu apoyo transforma el futuro de nuestros estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Tarjeta Informativa de Cuentas / SINPE */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Landmark className="w-4 h-4 text-[#0f4c81]" />
            Cuentas para Transferencia / SINPE Móvil
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* SINPE Móvil Card */}
            <div className="bg-white border border-slate-100 p-3 rounded-lg flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold text-[#0f4c81] flex items-center gap-1 mb-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  SINPE Móvil
                </span>
                <p className="font-semibold text-slate-800 text-base">8888-8888</p>
                <p className="text-xs text-slate-500">Fundación Exalumnos UCR</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-xs flex items-center gap-1 h-8"
                onClick={() => handleCopy("88888888", "SINPE")}
              >
                {copiedText === "88888888" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar Número
              </Button>
            </div>

            {/* Cédula Jurídica Card */}
            <div className="bg-white border border-slate-100 p-3 rounded-lg flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold text-[#0f4c81] mb-1 block">Cédula Jurídica</span>
                <p className="font-semibold text-slate-800 text-base">3-008-765432</p>
                <p className="text-xs text-slate-500">Fundación UCR</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-xs flex items-center gap-1 h-8"
                onClick={() => handleCopy("3-008-765432", "Cédula Jurídica")}
              >
                {copiedText === "3-008-765432" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar Cédula
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* BN Account */}
            <div className="bg-white border border-slate-100 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-sm text-xs">
              <div>
                <p className="font-bold text-slate-700">Banco Nacional de Costa Rica (BNCR)</p>
                <p className="font-mono text-slate-600 mt-0.5">IBAN: CR12015100010020030040</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex items-center gap-1 h-8 self-end sm:self-auto"
                onClick={() => handleCopy("CR12015100010020030040", "IBAN BNCR")}
              >
                {copiedText === "CR12015100010020030040" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar IBAN
              </Button>
            </div>

            {/* BCR Account */}
            <div className="bg-white border border-slate-100 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-sm text-xs">
              <div>
                <p className="font-bold text-slate-700">Banco de Costa Rica (BCR)</p>
                <p className="font-mono text-slate-600 mt-0.5">IBAN: CR15015200010020030041</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex items-center gap-1 h-8 self-end sm:self-auto"
                onClick={() => handleCopy("CR15015200010020030041", "IBAN BCR")}
              >
                {copiedText === "CR15015200010020030041" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar IBAN
              </Button>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Destino de la Donación</Label>
            <Select value={destino} onValueChange={setDestino} required>
              <SelectTrigger className="bg-white">
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
              className="text-lg font-mono bg-white" 
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Comprobante de Transferencia (SINPE/Banco)</Label>
            <Input 
              id="comprobante-input"
              type="file" 
              accept=".pdf, .jpg, .jpeg, .png" 
              onChange={handleFileChange} 
              required 
              className="file:bg-[#0f4c81] file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 cursor-pointer bg-white"
            />
            <p className="text-xs text-muted-foreground mt-1">Formatos permitidos: PDF, JPG o PNG. Máximo 5MB.</p>
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
  );
}
