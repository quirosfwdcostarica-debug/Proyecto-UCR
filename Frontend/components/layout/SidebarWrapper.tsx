"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Rutas donde NO queremos mostrar el sidebar
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/registro") || pathname?.startsWith("/verificar-correo") || pathname?.startsWith("/forgot-password");

  const isHome = pathname === "/";

  if (isAuthRoute) {
    return <main className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppSidebar />
      <main className={`flex-1 ml-64 flex flex-col ${isHome ? "bg-transparent" : "bg-[#f8fafc]"}`}>
        {children}
      </main>
    </div>
  );
}
