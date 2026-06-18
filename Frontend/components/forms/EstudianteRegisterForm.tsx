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

const registerSchema = z.object({
  tipo_identificacion: z.string().min(1, "Seleccione un tipo de identificación"),
  cedula: z.string().min(9, "La identificación debe tener al menos 9 caracteres"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido"),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida"),
  genero: z.string().min(1, "Género es requerido"),
  // --- Nuevos campos de Información Académica ---
  carnet_ucr: z.string().min(6, "Carné inválido"),
  carrera: z.string().min(3, "Carrera es requerida"),
  escuela_facultad: z.string().min(3, "Escuela/Facultad es requerida"),
  sede: z.string().min(3, "Sede es requerida"),
  anio_ingreso: z.string().min(4, "Año de ingreso inválido"),
  nivel_academico: z.string().min(2, "Nivel académico es requerido"),
  promedio_ponderado: z.string().min(1, "Promedio es requerido"),
  // ---------------------------------------------
  password: z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function EstudianteRegisterForm() {
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
      fechaNacimiento: "",
      genero: "",
      carnet_ucr: "",
      carrera: "",
      escuela_facultad: "",
      sede: "",
      anio_ingreso: "",
      nivel_academico: "",
      promedio_ponderado: "",
      password: "",
      confirmPassword: "",
    },
  });

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
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          cedula: data.cedula,
          fecha_nacimiento: data.fechaNacimiento,
          genero: data.genero,
          carnet_ucr: data.carnet_ucr,
          carrera: data.carrera,
          escuela_facultad: data.escuela_facultad,
          sede: data.sede,
          anio_ingreso: parseInt(data.anio_ingreso),
          nivel_academico: data.nivel_academico,
          promedio_ponderado: parseFloat(data.promedio_ponderado)
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Registro exitoso",
          description: "Revisa tu correo para verificar tu cuenta.",
        });
        router.push(`/verificar-correo?email=${encodeURIComponent(data.email)}`);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto">
        
        {/* SECCIÓN: Información Personal */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
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
                    <Input placeholder="Ej. Mariana Rodríguez" {...field} />
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
                  <FormLabel>Correo Institucional</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre.apellido@ucr.ac.cr" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN: Información Académica */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Información Académica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <FormField
              control={form.control}
              name="carnet_ucr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carné UCR</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. B98765" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carrera"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrera</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Ingeniería Eléctrica" {...field} />
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
              name="sede"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sede</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Sede Rodrigo Facio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anio_ingreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año de Ingreso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 2021" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivel_academico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel Académico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Bachillerato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promedio_ponderado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promedio Ponderado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 8.50" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN: Seguridad */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Seguridad</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
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
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white py-2">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
          ) : (
            "Crear cuenta"
          )}
        </Button>
        <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta? <Link href="/login" className="text-ucr-celeste-medium dark:text-ucr-celeste hover:underline font-medium">Volver al login</Link>
        </div>
      </form>
    </Form>
  );
}
