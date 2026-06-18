"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, Heart, UserCircle, Settings, HelpCircle, ShieldAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useLanguage, TranslationKeys } from "@/components/providers/LanguageContext";

interface NavItem {
  labelKey: TranslationKeys;
  href: string;
  icon: any;
}

export function AppSidebar() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  
  const role = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";
  const isEstudiante = role === "ESTUDIANTE";
  const isAdmin = role === "ADMIN";

  let navItems: NavItem[] = isEstudiante 
    ? [
        { labelKey: "sidebar.dashboard", href: "/", icon: LayoutDashboard },
        { labelKey: "sidebar.directory.exalumno", href: "/directorio/exalumnos", icon: Users },
        { labelKey: "sidebar.positions.student", href: "/posiciones", icon: Briefcase },
        { labelKey: "sidebar.donations.student", href: "/donaciones", icon: Heart },
        { labelKey: "sidebar.cv", href: "/cv", icon: Briefcase },
        { labelKey: "sidebar.profile.student", href: "/perfil/editar", icon: UserCircle },
      ]
    : [
        { labelKey: "sidebar.dashboard", href: "/", icon: LayoutDashboard },
        { labelKey: "sidebar.directory.student", href: "/directorio/estudiantes", icon: Users },
        { labelKey: "sidebar.positions.exalumno", href: "/posiciones", icon: Briefcase },
        { labelKey: "sidebar.donations.exalumno", href: "/donaciones", icon: Heart },
        { labelKey: "sidebar.profile.exalumno", href: "/perfil/editar", icon: UserCircle },
      ];

  if (isAdmin) {
    navItems.push({ labelKey: "sidebar.admin", href: "/admin", icon: ShieldAlert });
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 hover:w-64 bg-white dark:bg-slate-950 border-r border-border dark:border-slate-800 flex flex-col z-30 transition-all duration-300 ease-in-out group shadow-lg hover:shadow-2xl">
      <div className="px-4 group-hover:px-6 pt-5 pb-4 flex flex-col items-center group-hover:items-start gap-2 group-hover:gap-0 transition-all duration-300 border-b border-slate-50 dark:border-slate-900/50">
        <img 
          src="/logo.png" 
          alt="Logo U" 
          className="h-10 group-hover:h-14 w-auto object-contain transition-all duration-300 dark:brightness-110"
        />
        <div className="mt-0 group-hover:mt-2 text-center group-hover:text-left transition-all duration-300 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap">
          <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-[#1a75d2] dark:text-sky-400">EXALUMNOS U</h1>
          <p className="text-[9px] group-hover:text-[10px] font-semibold text-[#1a75d2]/80 dark:text-sky-400/80">Impacto y Legado</p>
        </div>
      </div>

      <nav className="flex-1 px-3 group-hover:px-4 space-y-2 mt-6">
        {navItems.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            className="flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-foreground dark:hover:text-slate-100 transition-all duration-300"
          >
            <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden">
              {t(item.labelKey)}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-3 group-hover:p-4 space-y-2 border-t border-border dark:border-slate-800 mt-auto transition-all duration-300">
        <Link href="/ajustes" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-muted-foreground dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-foreground dark:hover:text-slate-100 px-2 group-hover:px-3">
            <Settings className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden">
              {t("sidebar.settings")}
            </span>
          </Button>
        </Link>
        <Link href="/ajustes?tab=help" className="block w-full mb-2 group-hover:mb-4">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-muted-foreground dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-foreground dark:hover:text-slate-100 px-2 group-hover:px-3">
            <HelpCircle className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden">
              {t("sidebar.help")}
            </span>
          </Button>
        </Link>
        <Link href="/proyectos/nuevo" className="block w-full">
          <Button className="w-full bg-[#004C63] hover:bg-[#00384a] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 font-bold text-white transition-all duration-300 flex items-center justify-center gap-0 group-hover:gap-2 px-2 group-hover:px-4 py-2.5">
            <Plus className="h-4 w-4 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden">
              {t("sidebar.startProject")}
            </span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
