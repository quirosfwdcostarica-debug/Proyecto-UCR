"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
<<<<<<< HEAD
  // Rutas donde NO queremos mostrar el sidebar
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/registro") || pathname?.startsWith("/verificar-correo") || pathname?.startsWith("/forgot-password");

  if (isAuthRoute) {
    return <main className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">{children}</main>;
=======
  // Ocultar sidebar en rutas de login y registro
  const isAuthRoute = pathname === "/login" || pathname?.startsWith("/registro");

  if (isAuthRoute) {
    return <main className="flex-1 flex flex-col min-h-screen">{children}</main>;
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc]">
      <AppSidebar />
      <main className="flex-1 ml-64 flex flex-col">{children}</main>
    </div>
  );
}
