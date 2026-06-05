"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estudianteProfileSchema, EstudianteProfileFormValues } from "@/lib/validations/profile";
import { TIPOS_APOYO } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function EstudianteProfileForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  const form = useForm<EstudianteProfileFormValues>({
    resolver: zodResolver(estudianteProfileSchema),
    defaultValues: {
      carrera: "",
      avanceProyecto: 0,
      apoyoBuscado: [],
      nivelBeca: "",
    },
  });

  const onSubmit = async (data: EstudianteProfileFormValues) => {
    // Aquí invocaremos un Server Action para guardar en Prisma
    toast({
      title: "Perfil completado",
      description: "Tus datos han sido guardados exitosamente.",
    });
    console.log("Datos de Estudiante:", data);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["carrera", "avanceProyecto"]);
    }
    if (isValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-2xl mx-auto glass p-8 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "50%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Completá tu Perfil de Estudiante</h2>
          <p className="text-muted-foreground mt-2">Paso {step} de 2</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="carrera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera Actual</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Ingeniería en Computación" {...field} className="transition-all focus:scale-[1.01]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avanceProyecto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avance del Proyecto de Graduación (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} onChange={e => field.onChange(Number(e.target.value))} className="transition-all focus:scale-[1.01]" />
                    </FormControl>
                    <FormDescription>Si aún no has iniciado, indicá 0.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nivelBeca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Beca UCR (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Beca 5" {...field} className="transition-all focus:scale-[1.01]" />
                    </FormControl>
                    <FormDescription className="text-xs text-primary/80">Este dato es ESTRICTAMENTE PRIVADO y nunca se mostrará públicamente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep} className="group transition-all hover:pr-4">
                  Siguiente 
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="apoyoBuscado"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">¿Qué tipo de apoyo buscas?</FormLabel>
                      <FormDescription>
                        Seleccioná todas las opciones en las que necesites ayuda de un exalumno.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {TIPOS_APOYO.map((apoyo) => (
                        <FormField
                          key={apoyo}
                          control={form.control}
                          name="apoyoBuscado"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={apoyo}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(apoyo)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, apoyo])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== apoyo
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  {apoyo}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevStep}>
                  ← Atrás
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all">
                  Completar Perfil
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
