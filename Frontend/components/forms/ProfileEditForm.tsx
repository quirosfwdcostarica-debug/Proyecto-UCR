"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { userProfileUpdateSchema, type UserProfileUpdateValues } from "@/lib/validations/profile";
import { updateUserProfile } from "@/actions/profile.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Loader2, User, Phone, ImageIcon, LinkIcon, Save, Briefcase, GraduationCap, BookOpen, Heart } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProfileEditFormProps {
  initialData: any;
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();

  const isEstudiante = initialData?.tipo?.toUpperCase() === "ESTUDIANTE";

  const form = useForm<UserProfileUpdateValues>({
    resolver: zodResolver(userProfileUpdateSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      image: initialData?.image || "",
      phone: initialData?.phone || "",
      bio: initialData?.bio || "",
      socialLinks: {
        linkedin: initialData?.socialLinks?.linkedin || "",
        github: initialData?.socialLinks?.github || "",
        twitter: initialData?.socialLinks?.twitter || "",
        website: initialData?.socialLinks?.website || "",
      },
      
      // Estudiante fields
      carnet_ucr: initialData?.carnet_ucr || "",
      carrera: initialData?.carrera || "",
      escuela_facultad: initialData?.escuela_facultad || "",
      sede: initialData?.sede || "",
      anio_ingreso: initialData?.anio_ingreso || "",
      nivel_academico: initialData?.nivel_academico || "",
      promedio_ponderado: initialData?.promedio_ponderado || "",
      proyecto_titulo: initialData?.proyecto_titulo || "",
      proyecto_tipo: initialData?.proyecto_tipo || "",
      busca_financiamiento: !!initialData?.busca_financiamiento,
      busca_mentoria: !!initialData?.busca_mentoria,
      busca_empleo: !!initialData?.busca_empleo,
      busca_pasantia: !!initialData?.busca_pasantia,
      nivel_beca: initialData?.nivel_beca || "",

      // Exalumno fields
      anio_graduacion: initialData?.anio_graduacion || "",
      empresa_actual: initialData?.empresa_actual || "",
      cargo_actual: initialData?.cargo_actual || "",
      pais_ciudad: initialData?.pais_ciudad || "",
      anios_experiencia: initialData?.anios_experiencia || "",
      linkedin_url: initialData?.linkedin_url || "",
      ofrece_mentoria: !!initialData?.ofrece_mentoria,
      ofrece_empleo: !!initialData?.ofrece_empleo,
      ofrece_pasantia: !!initialData?.ofrece_pasantia,
      ofrece_proyecto: !!initialData?.ofrece_proyecto,
      ofrece_donacion_dinero: !!initialData?.ofrece_donacion_dinero,
    },
  });

  const onSubmit = (data: UserProfileUpdateValues) => {
    startTransition(async () => {
      try {
        const result = await updateUserProfile(data);
        if (result.success) {
          if (data.image) {
            await update({ user: { image: data.image } });
          }
          toast({
            title: "¡Perfil actualizado!",
            description: "Tus datos se han guardado correctamente.",
            className: "bg-ucr-azul-1 text-white border-none",
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Hubo un error",
          description: error.message || "No pudimos actualizar tu perfil.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        
        {/* Tarjeta 1: Información Personal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ucr-azul-2">Información Personal</h2>
              <p className="text-sm text-ucr-gris-2">Los datos básicos para identificarte en la plataforma.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">Nombre Completo</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input placeholder="Juan Pérez" {...field} className="pl-10 h-12 bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">Teléfono</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input placeholder="+506 8888-8888" {...field} className="pl-10 h-12 bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">Foto de Perfil</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Simulamos la subida convirtiendo el archivo en un Blob URL
                            const url = URL.createObjectURL(file);
                            onChange(url);
                          }
                        }}
                        {...fieldProps}
                        className="pl-10 h-12 pt-2.5 bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0f4c81] file:text-white hover:file:bg-[#0b3a63] cursor-pointer" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tarjeta 2: Biografía */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ucr-azul-2">Perfil Profesional</h2>
              <p className="text-sm text-ucr-gris-2">Cuéntale a la comunidad sobre tu trayectoria.</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Escribe una breve descripción profesional..." 
                    className="min-h-[150px] resize-none bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl text-base p-4"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-right text-ucr-gris-2 font-medium mt-2">
                  {field.value?.length || 0} / 500 caracteres
                </p>
              </FormItem>
            )}
          />
        </div>

        {/* Tarjeta de Datos según Rol */}
        {isEstudiante ? (
          <>
            {/* DATOS DE ESTUDIANTE */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-[#0f4c81]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Información Académica</h2>
                  <p className="text-sm text-slate-500">Tus datos como estudiante activo de la UCR.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="carnet_ucr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Carné UCR</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. B98765" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Carrera</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Ingeniería Eléctrica" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Escuela / Facultad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Facultad de Ingeniería" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Sede</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Sede Rodrigo Facio" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Año de Ingreso</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej. 2021" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Nivel Académico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Bachillerato" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Promedio Ponderado</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej. 8.50" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nivel_beca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Nivel de Beca UCR</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Beca 5" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PROYECTO DE GRADUACIÓN */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-[#0f4c81]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Proyecto de Graduación</h2>
                  <p className="text-sm text-slate-500">Detalles sobre tu trabajo final o tesis actual.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="proyecto_titulo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-semibold text-slate-700">Título del Proyecto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Investigación de Energía Renovable" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proyecto_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Tipo de Proyecto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Tesis, Proyecto Eléctrico" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* APOYO BUSCADO */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-[#0f4c81]">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Intereses y Apoyo Buscado</h2>
                  <p className="text-sm text-slate-500">¿En qué áreas te gustaría recibir apoyo de la red de exalumnos?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "busca_financiamiento", label: "Busco Financiamiento / Apoyo Económico" },
                  { name: "busca_mentoria", label: "Busco Mentoría Profesional / Guía" },
                  { name: "busca_empleo", label: "Busco Oportunidades de Empleo" },
                  { name: "busca_pasantia", label: "Busco Pasantías / Prácticas" }
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-semibold text-slate-700 cursor-pointer">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* DATOS DE EXALUMNO */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-[#0f4c81]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Información de Graduado</h2>
                  <p className="text-sm text-slate-500">Tus credenciales académicas e información laboral.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="carnet_ucr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Carné UCR (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. A81234" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
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
                      <FormLabel className="font-semibold text-slate-700">Facultad / Escuela de Graduación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Ingeniería" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anio_graduacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Año de Graduación</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej. 2018" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="empresa_actual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Empresa Actual</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Intel Costa Rica" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargo_actual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Cargo Actual</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Arquitecto de Software" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pais_ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Ciudad / País de Residencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. San José, Costa Rica" {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anios_experiencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Años de Experiencia Profesional</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej. 5" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">URL de LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value || ""} className="h-12 bg-slate-50 border-transparent focus:border-[#0f4c81] focus:bg-white focus:ring-2 focus:ring-[#0f4c81]/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* APOYO OFRECIDO */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-[#0f4c81]">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Contribución y Apoyo Ofrecido</h2>
                  <p className="text-sm text-slate-500">¿Cómo deseas contribuir y apoyar a la comunidad estudiantil de la UCR?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "ofrece_mentoria", label: "Ofrezco Mentoría / Guía Profesional" },
                  { name: "ofrece_empleo", label: "Ofrezco Oportunidades Laborales / Empleo" },
                  { name: "ofrece_pasantia", label: "Ofrezco Oportunidades de Pasantía" },
                  { name: "ofrece_proyecto", label: "Ofrezco Apoyo / Financiamiento a Proyectos" },
                  { name: "ofrece_donacion_dinero", label: "Ofrezco Donaciones al Fondo de Becas" }
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-semibold text-slate-700 cursor-pointer">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tarjeta 3: Redes Sociales */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ucr-azul-2">Conexiones y Redes</h2>
              <p className="text-sm text-ucr-gris-2">Enlaces a tus perfiles profesionales para facilitar el contacto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/..." {...field} className="h-12 bg-ucr-gris-1/50 border-transparent focus:border-[#0A66C2] focus:bg-white focus:ring-2 focus:ring-[#0A66C2]/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">GitHub</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." {...field} className="h-12 bg-ucr-gris-1/50 border-transparent focus:border-gray-800 focus:bg-white focus:ring-2 focus:ring-gray-800/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">Twitter / X</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/..." {...field} className="h-12 bg-ucr-gris-1/50 border-transparent focus:border-black focus:bg-white focus:ring-2 focus:ring-black/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">Sitio Web Personal</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="h-12 bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botón de Guardado (Barra Inferior Flotante) */}
        <div className="sticky bottom-8 z-50 flex justify-end mt-8">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-gray-200 flex items-center justify-between w-full md:w-auto md:min-w-[400px]">
            <p className="text-sm text-ucr-gris-2 font-medium px-4 hidden md:block">
              Revisa tus cambios antes de guardar.
            </p>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full md:w-auto h-14 bg-gradient-to-r from-ucr-azul-2 to-ucr-azul-1 hover:from-ucr-azul-1 hover:to-ucr-azul-1 text-ucr-blanco shadow-lg hover:shadow-ucr-azul-2/30 transition-all px-10 rounded-2xl font-bold text-lg group"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

      </form>
    </Form>
  );
}
