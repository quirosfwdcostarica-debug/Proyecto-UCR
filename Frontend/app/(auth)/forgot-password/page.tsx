"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await forgotPasswordAction(email);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      toast({ title: "Solicitud procesada", description: result.message });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center shadow-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#0f4c81]">Revisa tu correo</CardTitle>
            <CardDescription className="text-base mt-2">
              Si existe una cuenta asociada a <strong>{email}</strong>, recibirás una contraseña temporal para ingresar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
              <p className="font-semibold mb-1">Pasos a seguir:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abre el correo y copia la contraseña temporal.</li>
                <li>Inicia sesión con esa contraseña.</li>
                <li>Ve a <strong>Configuración → Cambiar contraseña</strong> para elegir una nueva.</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4 mt-2">
            <Link href="/login" className="flex items-center text-sm font-semibold text-[#0f4c81] hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ir a inicio de sesión
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#0f4c81]">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas ingresar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white" disabled={isLoading || !email}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Enviar contraseña temporal"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <Link href="/login" className="flex items-center text-sm font-semibold text-[#0f4c81] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
