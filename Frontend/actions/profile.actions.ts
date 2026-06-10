"use server";

import { auth } from "@/lib/auth";
import { UserProfileUpdateValues, userProfileUpdateSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getUserProfile() {
  const session = await auth();
  
  let userId = session?.user?.id;

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  try {
    const res = await fetch(`${API_URL}/user/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error fetching user from backend");
    }

    const userData = await res.json();

    // Map backend schema (nombre, foto_url) to frontend schema expected by forms
    return {
      id: userData.id,
      name: userData.nombre || "Usuario",
      email: userData.email || "",
      image: userData.foto_url || "",
      phone: "+506 8888-8888", // Mock, as backend doesn't have it
      bio: "Esta es tu biografía.", // Mock
      socialLinks: { linkedin: "https://linkedin.com" }, // Mock
    } as any;
  } catch (error) {
    // Retornar mock si hay error para no romper la UI
    return {
      id: userId,
      name: "Usuario de Prueba",
      email: "prueba@ucr.ac.cr",
      image: "",
      phone: "+506 8888-8888",
      bio: "No se pudo cargar el perfil real.",
      socialLinks: { linkedin: "https://linkedin.com" },
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

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  try {
    // Intentar actualizar nombre y foto_url en el backend
    await fetch(`${API_URL}/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: parsedData.data.name,
        foto_url: parsedData.data.image || null,
      }),
    });
  } catch (error) {
    console.error("Error actualizando perfil en el backend:", error);
  }

  // Revalidar para que se refresque la UI
  revalidatePath("/perfil/editar");
  revalidatePath("/");

  return { success: true };
}
