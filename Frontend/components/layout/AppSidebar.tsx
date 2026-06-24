"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Briefcase, Heart, UserCircle,
  Settings, HelpCircle, FolderOpen, ChevronDown, Handshake,
  FileBarChart2, Receipt, ClipboardList, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useLanguage, TranslationKeys } from "@/components/providers/LanguageContext";

interface NavSubItem {
  labelKey?: TranslationKeys;
  label?: string;
  href: string;
}

interface NavItem {
  labelKey?: TranslationKeys;
  label?: string;
  href?: string;
  icon: any;
  children?: NavSubItem[];
}

export function AppSidebar() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const tipo = (session?.user as any)?.tipo ?? (session?.user as any)?.role;
  const role = typeof tipo === "string" ? tipo.toUpperCase() : null;

  function toggleSubmenu(key: string) {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  }

  if (status === "loading" || role === null) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-20 bg-white dark:bg-slate-950 border-r border-border dark:border-slate-800 flex flex-col z-30 shadow-lg">
        <div className="px-4 pt-5 pb-4 flex items-center justify-center border-b border-slate-50 dark:border-slate-900/50">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
        </div>
        <nav className="flex-1 px-3 mt-6 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </nav>
      </aside>
    );
  }

  // ── NAV ITEMS ────────────────────────────────────────────────────────────────

  const adminNav: NavItem[] = [
    { label: "Panel Principal",    href: "/admin",            icon: LayoutDashboard },
    { label: "Usuarios",           href: "/admin/usuarios",   icon: Users },
    { label: "Gestión de Matches", href: "/admin/matches",    icon: Handshake },
    { label: "Cola Donaciones",    href: "/admin/donaciones", icon: Heart },
    { label: "Reportes",           href: "/admin/reportes",   icon: FileBarChart2 },
  ];

  const exalumnoNav: NavItem[] = [
    { labelKey: "sidebar.dashboard",          href: "/",                       icon: LayoutDashboard },
    { labelKey: "sidebar.directory.student",  href: "/directorio/estudiantes", icon: Users },
    { labelKey: "sidebar.positions.own",      href: "/mis-posiciones",          icon: Briefcase },
    { labelKey: "sidebar.donations.exalumno", href: "/donaciones",              icon: Heart },
    { labelKey: "sidebar.donations.history",  href: "/mis-donaciones",          icon: Receipt },
    { labelKey: "sidebar.matches",            href: "/mis-matches",             icon: Handshake },
    { labelKey: "sidebar.profile.exalumno",   href: "/perfil/editar",           icon: UserCircle },
  ];

  const estudianteNav: NavItem[] = [
    { labelKey: "sidebar.dashboard",            href: "/",                     icon: LayoutDashboard },
    { labelKey: "sidebar.directory.exalumno",   href: "/directorio/exalumnos", icon: Users },
    { labelKey: "sidebar.positions.student",    href: "/posiciones",            icon: Briefcase },
    { labelKey: "sidebar.applications.student", href: "/mis-aplicaciones",      icon: ClipboardList },
    { labelKey: "sidebar.donations.student",    href: "/mis-donaciones",        icon: Heart },
    { labelKey: "sidebar.matches",              href: "/mis-matches",           icon: Handshake },
    {
      labelKey: "sidebar.project.student",
      icon: FolderOpen,
      children: [
        { labelKey: "sidebar.project.new",  href: "/proyectos/nuevo" },
        { labelKey: "sidebar.project.view", href: "/proyectos/ver" },
      ],
    },
    { labelKey: "sidebar.cv",              href: "/mi-curriculum",             icon: FileText },
    { labelKey: "sidebar.profile.student", href: "/perfil/editar",             icon: UserCircle },
  ];

  const navItems: NavItem[] =
    role === "ADMIN" ? adminNav :
    role === "EXALUMNO" ? exalumnoNav :
    estudianteNav;

  // ── CLASSES ──────────────────────────────────────────────────────────────────

  const linkCls =
    "flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 w-full";
  const activeCls = "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100";

  // Admin accent color
  const accentCls = role === "ADMIN"
    ? "bg-red-600/10 dark:bg-red-900/30 border-b border-red-100 dark:border-red-900/40"
    : "border-b border-slate-50 dark:border-slate-900/50";

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 hover:w-64 bg-white dark:bg-slate-950 border-r border-border dark:border-slate-800 flex flex-col z-30 transition-all duration-300 ease-in-out group shadow-lg hover:shadow-2xl">
      {/* Logo */}
      <div className={`px-4 group-hover:px-6 pt-5 pb-4 flex flex-col items-center group-hover:items-start gap-2 group-hover:gap-0 transition-all duration-300 ${accentCls}`}>
        <img
          src="/logo.png"
          alt="Logo U"
          className="h-10 group-hover:h-14 w-auto object-contain transition-all duration-300 dark:brightness-110"
        />
        <div className="mt-0 group-hover:mt-2 text-center group-hover:text-left transition-all duration-300 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap">
          {role === "ADMIN" ? (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-red-600 dark:text-red-400">ADMIN UCR</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-red-600/70 dark:text-red-400/70">Panel Administrativo</p>
            </>
          ) : (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-[#1a75d2] dark:text-sky-400">EXALUMNOS U</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-[#1a75d2]/80 dark:text-sky-400/80">Impacto y Legado</p>
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 group-hover:px-4 space-y-1 mt-6 overflow-y-auto">
        {navItems.map((item) => {
          const itemKey = item.label ?? (item.labelKey as string) ?? "";
          const isActive = item.href ? pathname === item.href : false;
          const isSubmenuOpen = openSubmenu === itemKey;
          const displayLabel = item.label ?? t(item.labelKey!);

          if (item.children) {
            const anyChildActive = item.children.some((c) => pathname.startsWith(c.href));
            return (
              <div key={itemKey}>
                <button
                  onClick={() => toggleSubmenu(itemKey)}
                  className={`${linkCls} ${anyChildActive || isSubmenuOpen ? activeCls : ""}`}
                >
                  <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 text-left">
                    {displayLabel}
                  </span>
                  <ChevronDown
                    className={`opacity-0 group-hover:opacity-100 w-3.5 h-3.5 shrink-0 transition-all duration-200 ${isSubmenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSubmenuOpen && (
                  <div className="opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 ml-4 mt-1 space-y-1 border-l-2 border-[#005da4]/20 pl-3">
                    {item.children.map((child) => {
                      const childLabel = child.label ?? t(child.labelKey!);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block text-xs font-semibold py-1.5 px-2 rounded-md whitespace-nowrap transition-colors ${pathname === child.href ? "bg-[#005da4]/10 text-[#005da4] dark:bg-sky-900/30 dark:text-sky-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        >
                          {childLabel}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={itemKey || item.href}
              href={item.href!}
              className={`${linkCls} ${isActive ? activeCls : ""}`}
            >
              <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden">
                {displayLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="p-3 group-hover:p-4 space-y-2 border-t border-border dark:border-slate-800 mt-auto transition-all duration-300">
        <Link href="/ajustes" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 px-2 group-hover:px-3">
            <Settings className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden">
              {t("sidebar.settings")}
            </span>
          </Button>
        </Link>
        <Link href="/ajustes?tab=help" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 px-2 group-hover:px-3">
            <HelpCircle className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden">
              {t("sidebar.help")}
            </span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
