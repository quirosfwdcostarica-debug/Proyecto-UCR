"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z.object({
  tipo_identificacion: z.string().min(1, "Seleccione un tipo de identificación"),
  cedula: z.string().min(9, "La identificación debe tener al menos 9 caracteres"),
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
  ya_graduado: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function ExalumnoRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      tipo_identificacion: "01",
      cedula: "",
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      carrera: "",
      escuela_facultad: "",
      anio_graduacion: new Date().getFullYear(),
      ya_graduado: true,
    },
  });

  const emailValue = form.watch("email");
  const isUCREmail = emailValue?.toLowerCase().endsWith("@ucr.ac.cr");

  const handleCedulaBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cedula = e.target.value;
    if (cedula.length >= 9) {
      try {
        const response = await fetch(`https://api.hacienda.go.cr/fe/ae?identificacion=${cedula}`);
        if (response.ok) {
          const data = await response.json();
          if (data.nombre) {
            form.setValue("nombre", data.nombre, { shouldValidate: true });
          }
        }
      } catch (error) {
        console.error("Error fetching name from Hacienda API:", error);
      }
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (isUCREmail && !data.ya_graduado) {
      toast({
        title: "Registro de Estudiante",
        description: "Al no estar graduado, por favor regístrate como estudiante.",
      });
      router.push("/registro/estudiante");
      return;
    }

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
          cedula: data.cedula,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6">
        
        <div className="md:col-span-2 mb-2 border-b pb-2">
          <h3 className="text-lg font-medium text-ucr-celeste-medium">Datos de Cuenta</h3>
        </div>

        <FormField
          control={form.control}
          name="tipo_identificacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Identificación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="01">Cédula Física</SelectItem>
                  <SelectItem value="02">Cédula Jurídica</SelectItem>
                  <SelectItem value="03">DIMEX</SelectItem>
                  <SelectItem value="04">NITE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cedula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 101110111" {...field} onBlur={(e) => {
                  field.onBlur();
                  handleCedulaBlur(e);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Carlos Mendoza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Correo Electrónico (Personal o Profesional)</FormLabel>
              <FormControl>
                <Input placeholder="correo@ejemplo.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isUCREmail && (
          <FormField
            control={form.control}
            name="ya_graduado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm md:col-span-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>¿Ya te graduaste?</FormLabel>
                  <p className="text-sm text-slate-500">
                    Al usar un correo @ucr.ac.cr, necesitamos confirmar tu estado de graduación.
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
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
          control={form.control}
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
          <h3 className="text-lg font-medium text-ucr-celeste-medium">Datos Universitarios</h3>
        </div>

        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          <Button type="submit" disabled={isLoading} className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white py-2">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
            ) : (
              "Crear cuenta y solicitar aprobación"
            )}
          </Button>
          <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
            ¿Ya tienes cuenta? <Link href="/login" className="text-ucr-celeste-medium dark:text-ucr-celeste hover:underline font-medium">Volver al login</Link>
          </div>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
            Al registrarte, tu perfil entrará en estado pendiente y será verificado por el equipo de la Fundación.
          </p>
        </div>
      </form>
    </Form>
  );
}
