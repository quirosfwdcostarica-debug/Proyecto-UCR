"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { userProfileUpdateSchema, type UserProfileUpdateValues } from "@/lib/validations/profile";
import { updateUserProfile } from "@/actions/profile.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, ImageIcon, LinkIcon, Save, Briefcase } from "lucide-react";
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
    },
  });

  const onSubmit = (data: UserProfileUpdateValues) => {
    startTransition(async () => {
      try {
        const result = await updateUserProfile(data);
        if (result.success) {
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">Correo Electrónico</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input placeholder="correo@ucr.ac.cr" {...field} className="pl-10 h-12 bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1">URL Foto de Perfil</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input placeholder="https://..." {...field} className="pl-10 h-12 bg-ucr-gris-1/50 border-transparent focus:border-ucr-celeste focus:bg-white focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
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
