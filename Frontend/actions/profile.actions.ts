"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserProfileUpdateValues, userProfileUpdateSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const session = await auth();
  
  let userId = session?.user?.id;
  
  if (!userId) {
    // Si no hay sesión (modo desarrollo/testing), buscar el primer usuario disponible
    if (process.env.NODE_ENV !== "production") {
      if (process.env.DATABASE_URL) {
        try {
          const firstUser = await prisma.user.findFirst();
          if (firstUser) {
            userId = firstUser.id;
          }
        } catch (e) {
          console.warn("No se pudo conectar a la base de datos.");
        }
      }
    }
  }

  if (!userId && !process.env.DATABASE_URL) {
    // Retornar datos falsos para que pueda ver la UI si no hay BD configurada
    return {
      id: "mock-id",
      name: "Usuario de Prueba",
      email: "prueba@ucr.ac.cr",
      image: "",
      phone: "+506 8888-8888",
      bio: "Esta es una biografía de prueba porque no hay base de datos conectada.",
      socialLinks: { linkedin: "https://linkedin.com" },
    } as any;
  }

  if (!userId) {
    throw new Error("No estás autenticado y no hay usuarios de prueba.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      bio: true,
      socialLinks: true,
    }
  });

  return user;
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
    // Modo desarrollo: actualizar al primer usuario
    if (process.env.NODE_ENV !== "production") {
      if (process.env.DATABASE_URL) {
        try {
          const firstUser = await prisma.user.findFirst();
          if (firstUser) {
            userId = firstUser.id;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }

  if (!userId && !process.env.DATABASE_URL) {
    // Simular que se guardó correctamente si no hay BD configurada
    await new Promise((resolve) => setTimeout(resolve, 1000));
    revalidatePath("/perfil/editar");
    return { success: true };
  }

  if (!userId) {
    throw new Error("No estás autenticado.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsedData.data.name,
      email: parsedData.data.email,
      phone: parsedData.data.phone || null,
      image: parsedData.data.image || null,
      bio: parsedData.data.bio || null,
      socialLinks: parsedData.data.socialLinks ? (parsedData.data.socialLinks as any) : null,
    }
  });

  // Revalidar para que se refresque la UI
  revalidatePath("/perfil/editar");
  revalidatePath("/");

  return { success: true };
}
