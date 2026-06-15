"use client";

import React, { useState, useEffect } from "react";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/input";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLanguage, TranslationKeys } from "@/components/providers/LanguageContext";

interface TopBarProps {
  title?: string;
  titleKey?: TranslationKeys;
}

export function TopBar({ title, titleKey }: TopBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isHome = pathname === "/";
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTitle = mounted && titleKey ? t(titleKey) : title;

  return (
    <header className={`h-16 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300 ${
      isHome 
        ? "border-none bg-transparent" 
        : "border-b border-border dark:border-slate-800 bg-white dark:bg-slate-950"
    }`}>
      <div className="flex items-center gap-4">
        {!isHome && displayTitle && (
          <h2 className="text-xl font-bold text-[#0f4c81] dark:text-sky-400">{displayTitle}</h2>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar oportunidades..." 
            className="pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full h-9 text-slate-800 dark:text-slate-100"
          />
        </div>

        {session ? (
          <Button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant="outline" 
            size="sm" 
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-body font-semibold transition-colors"
          >
            {mounted && t("topbar.logout" as any) !== "topbar.logout" ? t("topbar.logout" as any) : "Cerrar Sesión"}
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="border-ucr-celeste text-[#0f4c81] dark:text-sky-400 hover:bg-ucr-celeste/10 dark:hover:bg-sky-400/10 font-body font-semibold">
              {mounted && t("topbar.login" as any) !== "topbar.login" ? t("topbar.login" as any) : "Iniciar Sesión"}
            </Button>
          </Link>
        )}
        
        {session && (
          <>
            <NotificationsDropdown />
            <UserDropdown />
          </>
        )}
      </div>
    </header>
  );
}
