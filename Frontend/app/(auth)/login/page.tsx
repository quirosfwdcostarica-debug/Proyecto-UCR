"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        console.log("el error es", result?.error);  
        toast({
          title: "Error de autenticación " + (result.error === "Email no verificado" ? "(Correo no verificado)" : ""),
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Redirigiendo a tu panel...",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      {/* Panel Izquierdo (Imagen y Texto) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        <div className="absolute inset-0 bg-[#02477B]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02477B]/90 via-[#02477B]/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 py-16">
          <div className="absolute top-16 left-0 right-0 flex justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg font-display leading-tight text-center">
              Fundación Exalumnos<br/>UCR
            </h1>
          </div>
          <p className="text-lg md:text-xl text-sky-100 max-w-lg font-medium drop-shadow-md text-center mt-10">
            Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
          </p>
        </div>
      </div>

      {/* Panel Derecho (Formulario) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 sm:top-10 sm:left-10 z-50 flex items-center gap-2 text-slate-500 hover:text-[#0f4c81] transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Volver al Dashboard</span>
        </Link>
        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-30 bg-cover bg-bottom mix-blend-multiply pointer-events-none"></div>
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">
          <div className="text-center mb-10">
            <img src="/escudo-ucr.png" alt="Escudo UCR" className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display mb-3">
              Bienvenido de vuelta
            </h2>
            <p className="text-slate-500 font-medium">
              Ingresa a la plataforma de Exalumnos UCR
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-800">Correo Electrónico</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="juan.perez@ucr.ac.cr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-11 h-14 rounded-xl border-slate-200 focus:ring-[#0f4c81] focus:border-[#0f4c81] bg-slate-50/50 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-slate-800">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm font-semibold text-[#00c0f3] hover:text-[#00a0cc] hover:underline transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-11 h-14 rounded-xl border-slate-200 focus:ring-[#0f4c81] focus:border-[#0f4c81] bg-slate-50/50 text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base rounded-xl bg-gradient-to-r from-[#02477B] to-[#005eb8] hover:from-[#01355e] hover:to-[#004a94] text-white font-bold shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-900/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-10 text-center text-slate-500 font-medium">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-bold text-[#00c0f3] hover:text-[#00a0cc] hover:underline transition-colors">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
