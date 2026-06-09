"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Ocultar sidebar en rutas de login y registro
  const isAuthRoute = pathname === "/login" || pathname?.startsWith("/registro");

  if (isAuthRoute) {
    return <main className="flex-1 flex flex-col min-h-screen">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc]">
      <AppSidebar />
      <main className="flex-1 ml-64 flex flex-col">{children}</main>
    </div>
  );
}
