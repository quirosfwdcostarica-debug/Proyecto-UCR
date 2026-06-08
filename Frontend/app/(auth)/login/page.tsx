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
import { Loader2, Mail } from "lucide-react";
import Image from "next/image";

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
    <div className="min-h-screen flex w-full bg-ucr-gris-1">
      {/* Columna Izquierda: Decorativa */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-ucr-azul-1 to-ucr-azul-2 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.ucr.ac.cr/medios/fotos/2021/girasoles-ucr.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        {/* Patrón Decorativo Glassmorphism */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-ucr-celeste rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-ucr-azul-1 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 p-12 text-center text-ucr-blanco">
          <img 
            src="/logo.png" 
            alt="Logo UCR Blanco" 
            className="h-28 w-auto mx-auto mb-8 brightness-0 invert mix-blend-screen"
          />
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ucr-blanco">
            Fundación Exalumnos UCR
          </h1>
          <p className="text-lg text-ucr-blanco/80 max-w-md mx-auto">
            Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.
          </p>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Círculo decorativo azul brillante detrás del form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ucr-celeste/20 rounded-full blur-[100px] -z-10"></div>

        <div className="w-full max-w-md glass p-10 rounded-3xl shadow-2xl bg-ucr-blanco/70 backdrop-blur-xl border border-white/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-ucr-azul-2 mb-2">Bienvenido de vuelta</h2>
            <p className="text-sm text-ucr-gris-2">
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
                    <FormLabel className="text-ucr-azul-1 font-semibold">Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2" />
                        <Input 
                          placeholder="juan.perez@ucr.ac.cr" 
                          {...field} 
                          className="pl-10 h-12 bg-white/80 border-gray-200 focus:border-ucr-celeste focus:ring-ucr-celeste transition-all shadow-sm"
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
                className="w-full h-12 bg-gradient-to-r from-ucr-azul-2 to-ucr-azul-1 hover:from-ucr-azul-1 hover:to-ucr-azul-1 text-ucr-blanco text-base font-semibold shadow-lg hover:shadow-ucr-azul-2/30 transition-all rounded-xl"
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

          <div className="mt-8 text-center text-sm text-ucr-gris-2">
            ¿No tienes cuenta?{" "}
            <a href="/registro/estudiante" className="text-ucr-celeste hover:text-ucr-azul-2 font-semibold transition-colors">
              Regístrate aquí
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
