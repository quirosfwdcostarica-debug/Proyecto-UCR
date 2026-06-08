"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exalumnoProfileSchema, ExalumnoProfileFormValues } from "@/lib/validations/profile";
import { CATALOGO_AREAS, SECTORES, TIPOS_APOYO } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function ExalumnoProfileForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  const form = useForm<ExalumnoProfileFormValues>({
    resolver: zodResolver(exalumnoProfileSchema),
    defaultValues: {
      carrera: "",
      sector: undefined,
      areasInteres: [],
      apoyoOfrecido: [],
    },
  });

  const onSubmit = async (data: ExalumnoProfileFormValues) => {
    // Aquí invocaremos un Server Action para guardar en Prisma
    toast({
      title: "Perfil completado",
      description: "¡Gracias por unirte a la red de Exalumnos UCR!",
    });
    console.log("Datos de Exalumno:", data);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["carrera", "sector"]);
    } else if (step === 2) {
      isValid = await form.trigger(["areasInteres"]);
    }
    if (isValid) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-2xl mx-auto glass p-8 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "33%" }}
            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
            Perfil de Exalumno UCR
          </h2>
          <p className="text-muted-foreground mt-2">Paso {step} de 3</p>
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
                    <FormLabel>Carrera de la que te graduaste</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Arquitectura" {...field} className="transition-all focus:scale-[1.01]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector Laboral Actual</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="transition-all focus:scale-[1.01]">
                          <SelectValue placeholder="Seleccioná un sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTORES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="areasInteres"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Tus Áreas de Interés y Expertise</FormLabel>
                      <FormDescription>
                        Seleccioná los campos en los que te desarrollás profesionalmente.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1 pr-2 custom-scrollbar">
                      {CATALOGO_AREAS.map((area) => (
                        <FormField
                          key={area}
                          control={form.control}
                          name="areasInteres"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={area}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(area)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, area])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== area
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm flex-1 leading-snug">
                                  {area}
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
                <Button type="button" onClick={nextStep} className="group transition-all hover:pr-4">
                  Siguiente 
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="apoyoOfrecido"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">¿Cómo te gustaría apoyar?</FormLabel>
                      <FormDescription>
                        Seleccioná las formas en las que estás dispuesto/a a ayudar a la comunidad estudiantil.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {TIPOS_APOYO.map((apoyo) => (
                        <FormField
                          key={apoyo}
                          control={form.control}
                          name="apoyoOfrecido"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={apoyo}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors cursor-pointer"
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
                  Guardar Perfil
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
