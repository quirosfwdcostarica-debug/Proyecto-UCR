"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sunburst } from "@/components/brand/Sunburst";
import { Isotipo } from "@/components/brand/Isotipo";

const loginSchema = z.object({
  email: z.string().email("Por favor, ingresa un correo válido."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    try {
      const res = await signIn("resend", {
        email: data.email,
        redirect: false,
        callbackUrl: "/",
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      toast({
        title: "¡Enlace enviado!",
        description: "Revisa tu bandeja de entrada para iniciar sesión.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: "No pudimos enviar el enlace. Intenta nuevamente.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-ucr-gris-1 relative">
      {/* Botón flotante para volver al Dashboard */}
      <Link href="/">
        <Button variant="ghost" className="absolute top-6 right-6 z-30 font-body text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white/70 hover:bg-white border border-slate-200 shadow-sm rounded-full px-4 h-10 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Button>
      </Link>

      {/* Columna Izquierda: Decorativa */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        {/* Imagen de fondo del edificio de Estudios Generales (Mural Girasol) */}
        <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center"></div>
        
        {/* Overlay degradado oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-ucr-azul2/40 to-ucr-azul1/80 z-10"></div>
        
        {/* Patrones decorativos sutiles detrás del texto */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-ucr-celeste rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob z-0"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-ucr-azul1 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000 z-0"></div>

        <div className="relative z-20 p-12 text-center text-ucr-blanco">
          <img 
            src="/escudo-ucr.png" 
            alt="Escudo UCR" 
            className="h-28 w-auto mx-auto mb-8 drop-shadow-xl object-contain"
          />
          <h1 className="text-5xl font-black tracking-wide mb-4 text-ucr-blanco drop-shadow-lg font-display">
            Fundación Exalumnos UCR
          </h1>
          <p className="text-lg text-ucr-blanco/95 max-w-md mx-auto drop-shadow-md font-body font-light leading-relaxed">
            Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
          </p>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden bg-slate-50/40">
        {/* Imagen de fondo patrón de graduación y UCR */}
        <div className="absolute inset-0 opacity-40 pointer-events-none z-0 select-none bg-cover bg-center" style={{ backgroundImage: "url('/login-pattern.png')" }}></div>

        {/* Círculo decorativo azul brillante detrás del form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-ucr-celeste/25 to-ucr-azul2/15 rounded-full blur-[100px] z-0"></div>

        <div className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 hover:border-ucr-celeste/30 transition-all duration-500 z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-[#0f4c81] mb-3 font-display tracking-tight bg-gradient-to-r from-ucr-azul1 via-ucr-azul2 to-[#1a75d2] bg-clip-text text-transparent">Bienvenido de vuelta</h2>
            <p className="text-sm text-slate-500 font-body leading-relaxed max-w-xs mx-auto">
              Ingresa tu correo para recibir un enlace mágico de acceso seguro. Sin contraseñas.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0f4c81] font-semibold font-body text-sm">Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2" />
                        <Input 
                          placeholder="juan.perez@ucr.ac.cr" 
                          {...field} 
                          className="pl-10 h-12 bg-white/80 border-gray-200 focus:border-ucr-celeste focus:ring-ucr-celeste transition-all shadow-sm font-body text-base"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-[#0b3a63] via-ucr-azul2 to-[#0f4c81] hover:brightness-110 text-ucr-blanco text-base font-bold shadow-lg hover:shadow-[#0f4c81]/30 transition-all rounded-xl font-body tracking-wide"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  "Enviar Enlace Mágico"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-slate-500 font-body">
            ¿No tienes cuenta?{" "}
            <a href="/registro/estudiante" className="text-[#00C0F3] hover:text-[#02477B] font-bold transition-colors hover:underline">
              Regístrate aquí
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
