"use server";

import { auth } from "@/lib/auth";
import { UserProfileUpdateValues, userProfileUpdateSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getUserProfile() {
  const session = await auth();
  let userId = session?.user?.id;
  const userRole = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: userData, error: userError } = await supabase
      .from('USERS')
      .select(`
        id, nombre, email, foto_url, tipo,
        EXALUMNOS (*),
        ESTUDIANTES (*)
      `)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error("Usuario no encontrado en la base de datos.");
    }

    const exalumnoData = Array.isArray(userData.EXALUMNOS) ? userData.EXALUMNOS[0] : userData.EXALUMNOS;
    const estudianteData = Array.isArray(userData.ESTUDIANTES) ? userData.ESTUDIANTES[0] : userData.ESTUDIANTES;

    return {
      id: userData.id,
      name: userData.nombre || "Usuario",
      email: userData.email || "",
      image: userData.foto_url || "",
      tipo: userData.tipo || userRole,
      phone: "+506 8888-8888",
      bio: exalumnoData?.biografia || estudianteData?.biografia || "",
      socialLinks: { 
        linkedin: exalumnoData?.linkedin_url || "",
        github: "",
        twitter: "",
        website: ""
      },
      
      // Estudiante fields
      carnet_ucr: estudianteData?.carnet_ucr || "",
      carrera: estudianteData?.carrera || exalumnoData?.carrera || "",
      escuela_facultad: estudianteData?.escuela_facultad || exalumnoData?.escuela_facultad || "",
      sede: estudianteData?.sede || "",
      anio_ingreso: estudianteData?.anio_ingreso || "",
      nivel_academico: estudianteData?.nivel_academico || "",
      promedio_ponderado: estudianteData?.promedio_ponderado || "",
      proyecto_titulo: estudianteData?.proyecto_titulo || "",
      proyecto_tipo: estudianteData?.proyecto_tipo || "",
      busca_financiamiento: !!estudianteData?.busca_financiamiento,
      busca_mentoria: !!estudianteData?.busca_mentoria,
      busca_empleo: !!estudianteData?.busca_empleo,
      busca_pasantia: !!estudianteData?.busca_pasantia,
      nivel_beca: estudianteData?.nivel_beca || "",

      // Exalumno fields
      anio_graduacion: exalumnoData?.anio_graduacion || "",
      empresa_actual: exalumnoData?.empresa_actual || "",
      cargo_actual: exalumnoData?.cargo_actual || "",
      pais_ciudad: exalumnoData?.pais_ciudad || "",
      anios_experiencia: exalumnoData?.anios_experiencia || "",
      linkedin_url: exalumnoData?.linkedin_url || "",
      ofrece_mentoria: !!exalumnoData?.ofrece_mentoria,
      ofrece_empleo: !!exalumnoData?.ofrece_empleo,
      ofrece_pasantia: !!exalumnoData?.ofrece_pasantia,
      ofrece_proyecto: !!exalumnoData?.ofrece_proyecto,
      ofrece_donacion_dinero: !!exalumnoData?.ofrece_donacion_dinero,
    } as any;
  } catch (error) {
    console.error("[getUserProfile error]", error);
    throw error;
  }
}

export async function updateUserProfile(data: UserProfileUpdateValues) {
  // Validar datos
  const parsedData = userProfileUpdateSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Datos de perfil inválidos");
  }

  const session = await auth();
  let userId = session?.user?.id;
  const userRole = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // 1. Actualizar datos en tabla USERS
    const { error: userError } = await supabase
      .from('USERS')
      .update({
        nombre: parsedData.data.name,
        foto_url: parsedData.data.image || null,
      })
      .eq('id', userId);

    if (userError) throw userError;

    // 2. Actualizar tabla específica según rol
    if (userRole === "ESTUDIANTE") {
      const { error: estError } = await supabase
        .from('ESTUDIANTES')
        .update({
          carnet_ucr: parsedData.data.carnet_ucr || null,
          carrera: parsedData.data.carrera || null,
          escuela_facultad: parsedData.data.escuela_facultad || null,
          sede: parsedData.data.sede || null,
          anio_ingreso: parsedData.data.anio_ingreso ? Number(parsedData.data.anio_ingreso) : null,
          nivel_academico: parsedData.data.nivel_academico || null,
          promedio_ponderado: parsedData.data.promedio_ponderado ? Number(parsedData.data.promedio_ponderado) : null,
          proyecto_titulo: parsedData.data.proyecto_titulo || null,
          proyecto_tipo: parsedData.data.proyecto_tipo || null,
          busca_financiamiento: !!parsedData.data.busca_financiamiento,
          busca_mentoria: !!parsedData.data.busca_mentoria,
          busca_empleo: !!parsedData.data.busca_empleo,
          busca_pasantia: !!parsedData.data.busca_pasantia,
          nivel_beca: parsedData.data.nivel_beca || null,
          biografia: parsedData.data.bio || null,
        })
        .eq('user_id', userId);
        
      if (estError) throw estError;

    } else if (userRole === "EXALUMNO") {
      const { error: exError } = await supabase
        .from('EXALUMNOS')
        .update({
          carnet_ucr: parsedData.data.carnet_ucr || null,
          carrera: parsedData.data.carrera || null,
          escuela_facultad: parsedData.data.escuela_facultad || null,
          anio_graduacion: parsedData.data.anio_graduacion ? Number(parsedData.data.anio_graduacion) : null,
          empresa_actual: parsedData.data.empresa_actual || null,
          cargo_actual: parsedData.data.cargo_actual || null,
          pais_ciudad: parsedData.data.pais_ciudad || null,
          anios_experiencia: parsedData.data.anios_experiencia ? Number(parsedData.data.anios_experiencia) : null,
          linkedin_url: parsedData.data.linkedin_url || parsedData.data.socialLinks?.linkedin || null,
          biografia: parsedData.data.bio || null,
          ofrece_mentoria: !!parsedData.data.ofrece_mentoria,
          ofrece_empleo: !!parsedData.data.ofrece_empleo,
          ofrece_pasantia: !!parsedData.data.ofrece_pasantia,
          ofrece_proyecto: !!parsedData.data.ofrece_proyecto,
          ofrece_donacion_dinero: !!parsedData.data.ofrece_donacion_dinero,
        })
        .eq('user_id', userId);
        
      if (exError) throw exError;
    }
  } catch (error) {
    console.error("Error actualizando perfil en el backend:", error);
  }

  // Revalidar para que se refresque la UI
  revalidatePath("/perfil/editar");
  revalidatePath("/");

  return { success: true };
}

export async function getPublicProfile(id: string) {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: exalumno, error: exError } = await supabase
      .from('EXALUMNOS')
      .select('*, user:USERS!inner(id, nombre, foto_url)')
      .eq('user_id', id)
      .maybeSingle();

    if (exalumno) {
      return {
        id: exalumno.user.id,
        nombre: exalumno.user.nombre,
        foto_url: exalumno.user.foto_url,
        tipo: "EXALUMNO",
        ...exalumno
      };
    }

    const { data: estudiante, error: estError } = await supabase
      .from('ESTUDIANTES')
      .select('*, user:USERS!inner(id, nombre, foto_url)')
      .eq('user_id', id)
      .maybeSingle();

    if (estudiante) {
      return {
        id: estudiante.user.id,
        nombre: estudiante.user.nombre,
        foto_url: estudiante.user.foto_url,
        tipo: "ESTUDIANTE",
        ...estudiante
      };
    }

    throw new Error("User not found");
  } catch (error) {
    console.error("[getPublicProfile error]", error);
    throw error;
  }
}
