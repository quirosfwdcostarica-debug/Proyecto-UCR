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
<<<<<<< HEAD
import { Loader2 } from "lucide-react";
=======
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sunburst } from "@/components/brand/Sunburst";
import { Isotipo } from "@/components/brand/Isotipo";

const loginSchema = z.object({
  email: z.string().email("Por favor, ingresa un correo válido."),
});

type LoginFormValues = z.infer<typeof loginSchema>;
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b

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
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-[#0f4c81] h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
=======
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
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0f4c81]">Bienvenido de vuelta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa a la plataforma de Exalumnos UCR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
<<<<<<< HEAD
                type="email"
                placeholder="nombre@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-slate-300 focus:ring-[#0f4c81] focus:border-[#0f4c81]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-[#0f4c81] hover:text-[#0b3a63] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="border-slate-300 focus:ring-[#0f4c81] focus:border-[#0f4c81]"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white py-2"
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm border-t border-border pt-4 text-slate-500">
          <div>
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="font-semibold text-[#0f4c81] hover:text-[#0b3a63] hover:underline">
=======
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
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
