"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = cookies();
  
  // Borrar cookies de sesión de NextAuth / Auth.js
  cookieStore.set("authjs.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("__Secure-authjs.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  
  // Redirigir a la página de login
  redirect("/login");
}
