<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eb5beac0152f186cdb87739bed4e533272a779fc
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
    <div className="flex min-h-screen bg-ucr-gris-fondo dark:bg-ucr-negro font-body relative overflow-hidden">
      {/* Background (Left panel with image and right-edge gradient fade) */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[50%] z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-[30%_center]"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        {/* Transparent esmeralda color overlay over the image */}
        <div className="absolute inset-0 bg-ucr-esmeralda/20 dark:bg-ucr-esmeralda/35" />
        {/* Smooth horizontal gradient fade: Blends the image's right edge into the solid gris-fondo background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ucr-gris-fondo/10 via-[60%] to-ucr-gris-fondo dark:via-ucr-negro/10 dark:via-[60%] dark:to-ucr-negro" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
        {/* Panel Izquierdo Content (Text floating over left side) */}
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-between px-16 py-20 text-white min-h-screen">
          <div className="pt-8">
            <h1 className="text-4xl md:text-5xl font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-display leading-[1.1] uppercase">
              Fundación Exalumnos<br/>UCR
            </h1>
          </div>
          <div className="pb-8">
            <p className="text-lg md:text-xl text-sky-100 max-w-lg font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-relaxed font-body">
              Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
            </p>
          </div>
        </div>

        {/* Panel Derecho (Forms sitting over the blended background with watermark) */}
        <div className="w-full lg:w-[50%] flex items-center justify-center p-8 sm:p-12 min-h-screen relative bg-ucr-gris-fondo dark:bg-ucr-negro lg:bg-transparent">
          <Link href="/" className="absolute top-8 right-8 sm:top-10 sm:right-10 lg:right-16 z-50 flex items-center gap-2 text-slate-500 hover:text-ucr-naranja transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
          </Link>
          
          {/* Watermark pattern overlay */}
          <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-[0.12] dark:opacity-[0.05] bg-cover bg-bottom mix-blend-multiply dark:mix-blend-overlay pointer-events-none z-0"></div>
          
          <div className="w-full max-w-md relative z-10 py-12">
            <div className="text-center mb-10">
              <img src="/logo.png" alt="Escudo UCR" className="w-24 h-24 mx-auto mb-6 object-contain" />
              <h2 className="text-3xl font-medium tracking-tight text-[#333333] dark:text-white font-display mb-3 uppercase">
                Bienvenido de vuelta
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium font-body">
                Ingresa a la plataforma de Exalumnos UCR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-800 dark:text-slate-200">Correo Electrónico</Label>
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
                    className="pl-11 h-14 rounded-[10px] border-slate-200 dark:border-slate-800 focus:ring-ucr-celeste focus:border-ucr-celeste bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-bold text-slate-800 dark:text-slate-200">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-ucr-celeste hover:text-sky-500 hover:underline transition-colors font-body">
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
                    className="pl-11 h-14 rounded-[10px] border-slate-200 dark:border-slate-800 focus:ring-ucr-celeste focus:border-ucr-celeste bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base rounded-[10px] bg-ucr-naranja hover:bg-[#d73b1d] text-white font-bold shadow-lg transition-all border-none"
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

            <div className="mt-10 text-center text-slate-500 font-medium font-body">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-bold text-ucr-celeste hover:text-sky-500 hover:underline transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======
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
  };  return (
    <div className="flex min-h-screen bg-ucr-gris-fondo dark:bg-ucr-negro font-body relative overflow-hidden">
      {/* Background (Left panel with image and right-edge gradient fade) */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[50%] z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-[30%_center]"
          style={{ backgroundImage: "url('/pretilUCR.png')" }}
        />
        {/* Transparent esmeralda color overlay over the image */}
        <div className="absolute inset-0 bg-ucr-esmeralda/20 dark:bg-ucr-esmeralda/35" />
        {/* Smooth horizontal gradient fade: Blends the image's right edge into the solid gris-fondo background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ucr-gris-fondo/10 via-[60%] to-ucr-gris-fondo dark:via-ucr-negro/10 dark:via-[60%] dark:to-ucr-negro" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
        {/* Panel Izquierdo Content (Text floating over left side) */}
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-between px-16 py-20 text-white min-h-screen">
          <div className="pt-8">
            <h1 className="text-4xl md:text-5xl font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-display leading-[1.1] uppercase">
              Fundación Exalumnos<br/>UCR
            </h1>
          </div>
          <div className="pb-8">
            <p className="text-lg md:text-xl text-sky-100 max-w-lg font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-relaxed font-body">
              Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
            </p>
          </div>
        </div>

        {/* Panel Derecho (Forms sitting over the blended background with watermark) */}
        <div className="w-full lg:w-[50%] flex items-center justify-center p-8 sm:p-12 min-h-screen relative bg-ucr-gris-fondo dark:bg-ucr-negro lg:bg-transparent">
          <Link href="/" className="absolute top-8 right-8 sm:top-10 sm:right-10 lg:right-16 z-50 flex items-center gap-2 text-slate-500 hover:text-ucr-naranja transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
          </Link>
          
          {/* Watermark pattern overlay */}
          <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-[0.12] dark:opacity-[0.05] bg-cover bg-bottom mix-blend-multiply dark:mix-blend-overlay pointer-events-none z-0"></div>
          
          <div className="w-full max-w-md relative z-10 py-12">
            <div className="text-center mb-10">
              <img src="/logo.png" alt="Escudo UCR" className="w-24 h-24 mx-auto mb-6 object-contain" />
              <h2 className="text-3xl font-medium tracking-tight text-[#333333] dark:text-white font-display mb-3 uppercase">
                Bienvenido de vuelta
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium font-body">
                Ingresa a la plataforma de Exalumnos UCR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-800 dark:text-slate-200">Correo Electrónico</Label>
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
                    className="pl-11 h-14 rounded-[10px] border-slate-200 dark:border-slate-800 focus:ring-ucr-celeste focus:border-ucr-celeste bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-bold text-slate-800 dark:text-slate-200">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-ucr-celeste hover:text-sky-500 hover:underline transition-colors font-body">
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
                    className="pl-11 h-14 rounded-[10px] border-slate-200 dark:border-slate-800 focus:ring-ucr-celeste focus:border-ucr-celeste bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base rounded-[10px] bg-ucr-naranja hover:bg-[#d73b1d] text-white font-bold shadow-lg transition-all border-none"
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

            <div className="mt-10 text-center text-slate-500 font-medium font-body">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-bold text-ucr-celeste hover:text-sky-500 hover:underline transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 514f28a76f1080c2d17b05e0e813c228388c47e9
=======
>>>>>>> eb5beac0152f186cdb87739bed4e533272a779fc
