"use client";

import { useState, useEffect } from "react";
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

  // Limpiar cookies de sesión previas al cargar la página de login
  // para evitar el error 431 causado por cookies infladas con tokens grandes
  useEffect(() => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const name = cookie.split("=")[0].trim();
      if (name.startsWith("authjs.") || name.startsWith("__Secure-authjs.") || name.startsWith("next-auth.")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`;
      }
    }
  }, []);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Mapeo de códigos de error de NextAuth v5 a mensajes en español
  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      "CredentialsSignin": "Correo o contraseña incorrectos.",
      "Credenciales inválidas": "Correo o contraseña incorrectos.",
      "Configuration": "Error de configuración del servidor. Intenta de nuevo.",
      "AccessDenied": "Acceso denegado. Tu cuenta puede estar pendiente de verificación.",
      "Email no verificado": "Debes verificar tu correo antes de iniciar sesión.",
    };
    return messages[errorCode] || errorCode || "Error al iniciar sesión.";
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
        const errorMessage = getErrorMessage(result.error);
        const isEmailNotVerified = /verificar|verificado/i.test(errorMessage);

        toast({
          title: "Error de autenticación" + (isEmailNotVerified ? " (Correo no verificado)" : ""),
          description: errorMessage,
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
    <div className="min-h-screen w-full relative overflow-hidden bg-ucr-gris-fondo dark:bg-ucr-negro font-body flex flex-col md:flex-row">


      {/* Background igual que inscribirse - imagen solo en panel izquierdo */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[50%] z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-[30%_center]"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        {/* Overlay de color esmeralda transparente */}
        <div className="absolute inset-0 bg-ucr-esmeralda/20 dark:bg-ucr-esmeralda/35" />
        {/* Fade horizontal suave hacia el panel derecho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ucr-gris-fondo/10 via-[60%] to-ucr-gris-fondo dark:via-ucr-negro/10 dark:via-[60%] dark:to-ucr-negro" />
      </div>

      {/* Sombra vertical suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/60 z-10 pointer-events-none md:hidden" />


      {/* Lado Izquierdo: Solo Tagline (visible en md y superior) */}
      <div className="hidden md:flex md:w-[50%] min-h-screen flex-col justify-end p-6 lg:p-8 relative z-20">
        <div className="max-w-md mb-4">
          <p className="text-sm lg:text-base text-white/90 font-bold leading-relaxed font-body drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
          </p>
        </div>
      </div>

      {/* Lado Derecho: Panel blanco igual que registro */}
      <div 
        className="w-full md:w-[50%] min-h-screen flex items-center justify-center p-8 sm:p-12 relative z-20 bg-ucr-gris-fondo dark:bg-ucr-negro md:bg-transparent"
      >
        <div className="w-full max-w-[440px]">
          {/* Botón de volver al Dashboard */}
          <Link 
            href="/" 
            className="absolute top-8 right-8 z-50 flex items-center gap-2 text-slate-500 hover:text-ucr-naranja transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>

          <div className="text-center mb-8 flex flex-col items-center">
            {/* Logo de Alumni */}
            <img 
              src="/logo.png" 
              alt="Logo Alumni UCR" 
              className="w-16 h-16 object-contain mb-1" 
            />
            {/* El texto ALUMNI en mayúsculas debajo */}
            <span className="text-[10px] font-bold tracking-[0.25em] text-slate-500 dark:text-slate-400 font-display uppercase mb-6">
              ALUMNI
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display mb-2 uppercase">
              BIENVENIDO DE VUELTA
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold font-body leading-relaxed">
              Inicia tu sesión para conectar con la comunidad.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Correo Electrónico */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wide uppercase">
                Correo Electrónico
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exalumno@ucr.ac.cr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-11 h-12 rounded-[14px] border border-gray-200/80 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/30 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 orange-focus transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wide uppercase">
                  Contraseña
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-semibold text-[#006AD3] dark:text-sky-400 hover:text-sky-500 hover:underline transition-colors font-body"
                >
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
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-11 h-12 rounded-[14px] border border-gray-200/80 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/30 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 orange-focus transition-all"
                />
              </div>
            </div>

            {/* Botón de Ingresar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-sm rounded-[14px] bg-[#E8522A] hover:bg-[#d1431d] text-white font-bold shadow-[0_6px_20px_rgba(232,82,42,0.35)] hover:shadow-[0_8px_24px_rgba(232,82,42,0.45)] transition-all border-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          {/* Enlace de Registro */}
          <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-xs font-medium font-body">
            ¿No tienes cuenta?{" "}
            <Link 
              href="/registro" 
              className="font-bold text-[#006AD3] dark:text-sky-400 hover:text-sky-500 hover:underline transition-colors"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
