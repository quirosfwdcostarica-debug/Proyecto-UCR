"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, Heart, UserCircle, Settings, HelpCircle, ShieldAlert } from "lucide-react";
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

  const navItems: NavItem[] = isEstudiante 
    ? [
        { labelKey: "sidebar.dashboard", href: "/", icon: LayoutDashboard },
        { labelKey: "sidebar.directory.exalumno", href: "/directorio/exalumnos", icon: Users },
        { labelKey: "sidebar.positions.student", href: "/posiciones", icon: Briefcase },
        { labelKey: "sidebar.donations.student", href: "/donaciones", icon: Heart },
        { labelKey: "sidebar.cv", href: "/cv", icon: Briefcase },
        { labelKey: "sidebar.profile.student", href: "/perfil/editar", icon: UserCircle },
        { labelKey: "sidebar.admin", href: "/admin", icon: ShieldAlert },
      ]
    : [
        { labelKey: "sidebar.dashboard", href: "/", icon: LayoutDashboard },
        { labelKey: "sidebar.directory.student", href: "/directorio/estudiantes", icon: Users },
        { labelKey: "sidebar.positions.exalumno", href: "/posiciones", icon: Briefcase },
        { labelKey: "sidebar.donations.exalumno", href: "/donaciones", icon: Heart },
        { labelKey: "sidebar.profile.exalumno", href: "/perfil/editar", icon: UserCircle },
        { labelKey: "sidebar.admin", href: "/admin", icon: ShieldAlert },
      ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-border dark:border-slate-800 flex flex-col z-20 transition-colors duration-300">
      <div className="px-6 pt-4 pb-4 flex flex-col items-start gap-0">
        <img 
          src="/logo.png" 
          alt="Logo UCR" 
          className="h-16 w-auto object-contain -ml-1 dark:brightness-110"
        />
        <div className="-mt-1">
          <h1 className="text-lg font-bold tracking-tight text-[#1a75d2] dark:text-sky-400">EXALUMNOS UCR</h1>
          <p className="text-xs font-medium text-[#1a75d2]/80 dark:text-sky-400/80">Impacto y Legado</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-foreground dark:hover:text-slate-100 transition-colors"
          >
            <item.icon className="h-5 w-5" />
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>

      <div className="p-4 space-y-2 border-t border-border dark:border-slate-800 mt-auto">
        <Link href="/ajustes" className="block w-full">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-foreground dark:hover:text-slate-100">
            <Settings className="mr-2 h-4 w-4" />
            {t("sidebar.settings")}
          </Button>
        </Link>
        <Link href="/ajustes?tab=help" className="block w-full mb-4">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-foreground dark:hover:text-slate-100">
            <HelpCircle className="mr-2 h-4 w-4" />
            {t("sidebar.help")}
          </Button>
        </Link>
        <Link href="/proyectos/nuevo" className="block w-full">
          <Button className="w-full bg-ucr-azul-2 hover:bg-ucr-azul-1 dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 font-bold text-white transition-colors">
            {t("sidebar.startProject")}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
