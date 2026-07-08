"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";
import { useSession } from "next-auth/react";
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
    <div className={`sticky top-0 z-50 transition-all duration-300 ${isHome ? '-mb-16' : ''}`}>
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#005da4] via-sky-400 to-emerald-400 opacity-90 z-10" />
      
      <header className="h-16 flex items-center justify-between px-8 transition-all duration-300 relative bg-transparent">
        <div className="flex items-center gap-4">
          {displayTitle && (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
              <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-[#005da4] to-sky-400 shadow-sm"></div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{displayTitle}</h2>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!session && (
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-ucr-celeste text-ucr-celeste-medium dark:text-sky-400 hover:bg-ucr-celeste/10 dark:hover:bg-sky-400/10 font-body font-semibold">
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
    </div>
  );
}
