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
      <aside className="fixed top-0 left-0 h-screen w-20 bg-[#005da4] dark:bg-slate-950 border-none flex flex-col z-30 shadow-2xl">
        <div className="px-4 pt-5 pb-4 flex items-center justify-center border-b border-white/10">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
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
    { labelKey: "sidebar.matches",            href: "/mis-matches/exalumno",    icon: Handshake },
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

  const colorfulTextBase = "bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 font-extrabold";
  const colorfulTextHover = "group-hover/item:bg-clip-text group-hover/item:text-transparent group-hover/item:bg-gradient-to-r group-hover/item:from-cyan-500 group-hover/item:via-purple-500 group-hover/item:to-pink-500 group-hover/item:font-extrabold";

  const linkCls =
    "flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-sky-100 dark:text-slate-400 hover:bg-white hover:shadow-lg hover:text-[#005da4] dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-300 w-full group/item";
  const activeCls = "bg-white text-[#005da4] dark:bg-slate-800 dark:text-white shadow-lg";

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 hover:w-64 bg-[#005da4] dark:bg-slate-950 border-none flex flex-col z-30 transition-all duration-300 ease-in-out group shadow-2xl">
      {/* Logo */}
      <div className="px-4 group-hover:px-6 pt-5 pb-4 flex flex-col items-center group-hover:items-start gap-2 group-hover:gap-0 transition-all duration-300 border-b border-white/10 dark:border-slate-900/50">
        <img
          src="/logo.png"
          alt="Logo U"
          className="h-10 group-hover:h-14 w-auto object-contain transition-all duration-300 brightness-0 invert"
        />
        <div className="mt-0 group-hover:mt-2 text-center group-hover:text-left transition-all duration-300 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap">
          {role === "ADMIN" ? (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-white dark:text-red-400">ADMIN UCR</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-white/70 dark:text-red-400/70">Panel Administrativo</p>
            </>
          ) : (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-white dark:text-sky-400">EXALUMNOS U</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-sky-100 dark:text-sky-400/80">Impacto y Legado</p>
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
                  <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${anyChildActive || isSubmenuOpen ? "text-purple-500" : "group-hover/item:text-purple-500"}`} />
                  <span className={`opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 text-left ${(anyChildActive || isSubmenuOpen) ? colorfulTextBase : colorfulTextHover}`}>
                    {displayLabel}
                  </span>
                  <ChevronDown
                    className={`opacity-0 group-hover:opacity-100 w-3.5 h-3.5 shrink-0 transition-all duration-200 ${isSubmenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSubmenuOpen && (
                  <div className="opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden transition-all duration-300 ml-4 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                    {item.children.map((child) => {
                      const childLabel = child.label ?? t(child.labelKey!);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block text-xs font-semibold py-1.5 px-2 rounded-md whitespace-nowrap transition-colors group/subitem ${pathname === child.href ? "bg-white shadow-md" : "text-sky-100 hover:bg-white hover:shadow-md dark:hover:bg-slate-800"}`}
                        >
                          <span className={pathname === child.href ? colorfulTextBase : "group-hover/subitem:bg-clip-text group-hover/subitem:text-transparent group-hover/subitem:bg-gradient-to-r group-hover/subitem:from-cyan-500 group-hover/subitem:via-purple-500 group-hover/subitem:to-pink-500 group-hover/subitem:font-extrabold"}>
                            {childLabel}
                          </span>
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
              <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-purple-500" : "group-hover/item:text-purple-500"}`} />
              <span className={`opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden ${isActive ? colorfulTextBase : colorfulTextHover}`}>
                {displayLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="p-3 group-hover:p-4 space-y-2 border-t border-white/10 dark:border-slate-800 mt-auto transition-all duration-300">
        <Link href="/ajustes" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-sky-100 dark:text-slate-400 hover:bg-white hover:shadow-lg hover:text-[#005da4] dark:hover:bg-slate-800 dark:hover:text-white px-2 group-hover:px-3 group/item">
            <Settings className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover/item:text-purple-500" />
            <span className={`opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden ${colorfulTextHover}`}>
              {t("sidebar.settings")}
            </span>
          </Button>
        </Link>
        <Link href="/ajustes?tab=help" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-sky-100 dark:text-slate-400 hover:bg-white hover:shadow-lg hover:text-[#005da4] dark:hover:bg-slate-800 dark:hover:text-white px-2 group-hover:px-3 group/item">
            <HelpCircle className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover/item:text-purple-500" />
            <span className={`opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden ${colorfulTextHover}`}>
              {t("sidebar.help")}
            </span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
