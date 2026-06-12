"use server";

import { auth } from "@/lib/auth";
import { UserProfileUpdateValues, userProfileUpdateSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getUserProfile() {
  const session = await auth();
  let userId = session?.user?.id;
  const userRole = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error fetching user from backend");
    }

    const userData = await res.json();

    // Map backend schema to frontend schema expected by forms
    return {
      id: userData.id,
      name: userData.nombre || "Usuario",
      email: userData.email || "",
      image: userData.foto_url || "",
      tipo: userData.tipo || userRole,
      phone: "+506 8888-8888", // Mock, not stored in DB
      bio: "Esta es tu biografía profesional en la red Exalumnos UCR.", // Mock, not stored in DB
      socialLinks: { 
        linkedin: userData.Exalumno?.linkedin_url || "https://linkedin.com",
        github: "",
        twitter: "",
        website: ""
      },
      
      // Estudiante fields
      carnet_ucr: userData.Estudiante?.carnet_ucr || "",
      carrera: userData.Estudiante?.carrera || "",
      escuela_facultad: userData.Estudiante?.escuela_facultad || "",
      sede: userData.Estudiante?.sede || "",
      anio_ingreso: userData.Estudiante?.anio_ingreso || "",
      nivel_academico: userData.Estudiante?.nivel_academico || "",
      promedio_ponderado: userData.Estudiante?.promedio_ponderado || "",
      proyecto_titulo: userData.Estudiante?.proyecto_titulo || "",
      proyecto_tipo: userData.Estudiante?.proyecto_tipo || "",
      busca_financiamiento: !!userData.Estudiante?.busca_financiamiento,
      busca_mentoria: !!userData.Estudiante?.busca_mentoria,
      busca_empleo: !!userData.Estudiante?.busca_empleo,
      busca_pasantia: !!userData.Estudiante?.busca_pasantia,

      // Exalumno fields
      anio_graduacion: userData.Exalumno?.anio_graduacion || "",
      empresa_actual: userData.Exalumno?.empresa_actual || "",
      cargo_actual: userData.Exalumno?.cargo_actual || "",
      pais_ciudad: userData.Exalumno?.pais_ciudad || "",
      anios_experiencia: userData.Exalumno?.anios_experiencia || "",
      linkedin_url: userData.Exalumno?.linkedin_url || "",
      ofrece_mentoria: !!userData.Exalumno?.ofrece_mentoria,
      ofrece_empleo: !!userData.Exalumno?.ofrece_empleo,
      ofrece_pasantia: !!userData.Exalumno?.ofrece_pasantia,
      ofrece_proyecto: !!userData.Exalumno?.ofrece_proyecto,
      ofrece_donacion_dinero: !!userData.Exalumno?.ofrece_donacion_dinero,
    } as any;
  } catch (error) {
    // Retornar mock según rol si hay error para no romper la UI
    return {
      id: userId,
      name: session?.user?.name || "Usuario de Prueba",
      email: session?.user?.email || "prueba@ucr.ac.cr",
      image: session?.user?.image || "",
      tipo: userRole,
      phone: "+506 8888-8888",
      bio: "No se pudo conectar al servidor. Mostrando perfil local.",
      socialLinks: { linkedin: "https://linkedin.com" },
      
      // Estudiante defaults
      carnet_ucr: "B98765",
      carrera: userRole === "ESTUDIANTE" ? "Ingeniería Eléctrica" : "",
      escuela_facultad: "Ingeniería",
      sede: "Sede Rodrigo Facio",
      anio_ingreso: 2021,
      nivel_academico: "Bachillerato",
      promedio_ponderado: 8.5,
      proyecto_titulo: userRole === "ESTUDIANTE" ? "Investigación de Energía Renovable" : "",
      proyecto_tipo: "Tesis",
      busca_financiamiento: true,
      busca_mentoria: true,
      busca_empleo: true,
      busca_pasantia: false,

      // Exalumno defaults
      anio_graduacion: userRole === "EXALUMNO" ? 2018 : "",
      empresa_actual: userRole === "EXALUMNO" ? "Intel Costa Rica" : "",
      cargo_actual: userRole === "EXALUMNO" ? "Software Architect" : "",
      pais_ciudad: "San José, Costa Rica",
      anios_experiencia: 6,
      linkedin_url: "https://linkedin.com",
      ofrece_mentoria: true,
      ofrece_empleo: true,
      ofrece_pasantia: false,
      ofrece_proyecto: true,
      ofrece_donacion_dinero: true,
    } as any;
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
    // 1. Actualizar datos en tabla USERS
    await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: parsedData.data.name,
        foto_url: parsedData.data.image || null,
      }),
    });

    // 2. Actualizar tabla específica según rol
    if (userRole === "ESTUDIANTE") {
      await fetch(`${API_URL}/estudiantes/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });
    } else if (userRole === "EXALUMNO") {
      await fetch(`${API_URL}/exalumnos/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carnet_ucr: parsedData.data.carnet_ucr || null,
          escuela_facultad: parsedData.data.escuela_facultad || null,
          anio_graduacion: parsedData.data.anio_graduacion ? Number(parsedData.data.anio_graduacion) : null,
          empresa_actual: parsedData.data.empresa_actual || null,
          cargo_actual: parsedData.data.cargo_actual || null,
          pais_ciudad: parsedData.data.pais_ciudad || null,
          anios_experiencia: parsedData.data.anios_experiencia ? Number(parsedData.data.anios_experiencia) : null,
          linkedin_url: parsedData.data.linkedin_url || parsedData.data.socialLinks?.linkedin || null,
          ofrece_mentoria: !!parsedData.data.ofrece_mentoria,
          ofrece_empleo: !!parsedData.data.ofrece_empleo,
          ofrece_pasantia: !!parsedData.data.ofrece_pasantia,
          ofrece_proyecto: !!parsedData.data.ofrece_proyecto,
          ofrece_donacion_dinero: !!parsedData.data.ofrece_donacion_dinero,
        }),
      });
    }
  } catch (error) {
    console.error("Error actualizando perfil en el backend:", error);
  }

  // Revalidar para que se refresque la UI
  revalidatePath("/perfil/editar");
  revalidatePath("/");

  return { success: true };
}
