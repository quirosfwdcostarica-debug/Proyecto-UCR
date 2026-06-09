"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2 } from "lucide-react";

<<<<<<< HEAD
const registerSchema = z.object({
=======
const registerObjectSchema = z.object({
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
  carrera: z.string().min(3, "Indica la carrera de la cual te graduaste"),
  escuela_facultad: z.string().min(3, "Indica la escuela o facultad"),
  anio_graduacion: z.coerce.number().min(1940, "Año inválido").max(new Date().getFullYear(), "Año inválido"),
<<<<<<< HEAD
}).refine((data) => data.password === data.confirmPassword, {
=======
});

const registerSchema = registerObjectSchema.refine((data) => data.password === data.confirmPassword, {
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

<<<<<<< HEAD
type RegisterFormValues = z.infer<typeof registerSchema>;
=======
type RegisterFormValues = z.infer<typeof registerObjectSchema>;
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b

export function ExalumnoRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      carrera: "",
      escuela_facultad: "",
      anio_graduacion: new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/alumni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          carrera: data.carrera,
          escuela_facultad: data.escuela_facultad,
          anio_graduacion: data.anio_graduacion,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Registro exitoso",
          description: "Tu perfil ha sido creado y está pendiente de aprobación por parte de la Fundación.",
        });
        router.push("/login"); // Redirige a login tras registro
      } else {
        toast({
          title: "Error en el registro",
          description: result.message || "Ocurrió un error al registrarse.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
<<<<<<< HEAD
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-6">
=======
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-6">
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
        
        <div className="md:col-span-2 mb-2 border-b pb-2">
          <h3 className="text-lg font-medium text-[#0f4c81]">Datos de Cuenta</h3>
        </div>

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Carlos Mendoza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico (Personal o Profesional)</FormLabel>
              <FormControl>
                <Input placeholder="correo@ejemplo.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 mt-6 mb-2 border-b pb-2">
          <h3 className="text-lg font-medium text-[#0f4c81]">Datos Universitarios</h3>
        </div>

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="carrera"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Ingeniería Industrial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="escuela_facultad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escuela / Facultad</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Facultad de Ingeniería" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
<<<<<<< HEAD
          control={form.control}
=======
          control={form.control as any}
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          name="anio_graduacion"
          render={({ field }) => (
            <FormItem className="md:col-span-2 w-1/2 pr-3">
              <FormLabel>Año de Graduación</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 2018" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 pt-4">
          <Button type="submit" disabled={isLoading} className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white py-2">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
            ) : (
              "Crear cuenta y solicitar aprobación"
            )}
          </Button>
<<<<<<< HEAD
          <div className="text-center mt-4 text-sm text-slate-600">
            ¿Ya tienes cuenta? <Link href="/login" className="text-[#0f4c81] hover:underline font-medium">Volver al login</Link>
          </div>
=======
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
          <p className="text-xs text-center text-slate-500 mt-4">
            Al registrarte, tu perfil entrará en estado pendiente y será verificado por el equipo de la Fundación.
          </p>
        </div>
      </form>
    </Form>
  );
}
