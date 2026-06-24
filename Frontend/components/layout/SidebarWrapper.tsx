"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useSession } from "next-auth/react";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Rutas donde NO queremos mostrar el sidebar
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/registro") || pathname?.startsWith("/verificar-correo") || pathname?.startsWith("/forgot-password");

  const isHome = pathname === "/";

  // Mostrar el sidebar solo si el usuario está autenticado y no está en ruta de autenticación
  const showSidebar = !!session && !isAuthRoute;

  if (!showSidebar) {
    return <main className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] dark:bg-slate-900">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppSidebar />
      <main className={`flex-1 ml-20 flex flex-col ${isHome ? "bg-transparent" : "bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300"}`}>
        <TopBar />
        {children}
      </main>
    </div>
  );
}
