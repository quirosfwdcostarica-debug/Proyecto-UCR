"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Briefcase, Heart, UserCircle,
  Settings, HelpCircle, ShieldCheck, GitMerge, LogOut,
  GraduationCap, Building2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Definición de ítems de navegación por rol
const navItemsByRole: Record<string, { label: string; href: string; icon: any }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Panel Admin", href: "/admin", icon: ShieldCheck },
    { label: "Estudiantes", href: "/directorio/estudiantes", icon: GraduationCap },
    { label: "Exalumnos", href: "/directorio/exalumnos", icon: Building2 },
    { label: "Posiciones", href: "/posiciones/nueva", icon: Briefcase },
    { label: "Donaciones", href: "/donaciones", icon: Heart },
  ],
  EXALUMNO: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Dir. Estudiantes", href: "/directorio/estudiantes", icon: GraduationCap },
    { label: "Dir. Exalumnos", href: "/directorio/exalumnos", icon: Building2 },
    { label: "Publicar Posición", href: "/posiciones/nueva", icon: Briefcase },
    { label: "Donaciones", href: "/donaciones", icon: Heart },
    { label: "Mi Perfil (CV)", href: "/cv", icon: UserCircle },
  ],
  ESTUDIANTE: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Dir. Exalumnos", href: "/directorio/exalumnos", icon: Building2 },
    { label: "Mis Matches", href: "/mis-matches", icon: GitMerge },
    { label: "Bolsa de Empleo", href: "/posiciones/nueva", icon: Briefcase },
    { label: "Mi CV", href: "/cv", icon: UserCircle },
  ],
};

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = (session?.user as any)?.role ?? "ESTUDIANTE";
  const navItems = navItemsByRole[role] ?? navItemsByRole["ESTUDIANTE"];

  const userName = session?.user?.name ?? session?.user?.email ?? "Usuario";
  const userEmail = session?.user?.email ?? "";

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-border flex flex-col z-20 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-extrabold tracking-tight text-[#0f4c81]">EXALUMNOS UCR</h1>
        <p className="text-xs text-muted-foreground mt-1">Red de Impacto y Legado</p>
      </div>

      {/* Rol badge */}
      {session?.user && (
        <div className="px-5 py-3 bg-slate-50 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#0f4c81] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-700 truncate">{userName}</p>
              <span className={cn(
                "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                role === "ADMIN" ? "bg-red-100 text-red-700" :
                role === "EXALUMNO" ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"
              )}>
                {role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#0f4c81] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 space-y-1 border-t border-border mt-auto">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:bg-slate-100 text-sm h-9">
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </Button>
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:bg-slate-100 text-sm h-9">
          <HelpCircle className="mr-2 h-4 w-4" />
          Ayuda
        </Button>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 text-sm h-9"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
