import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/input";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-16 border-b border-border dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-[#0f4c81] dark:text-sky-400">{title}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm" className="border-ucr-celeste text-[#0f4c81] dark:text-sky-400 hover:bg-ucr-celeste/10 dark:hover:bg-sky-400/10 font-body font-semibold">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/registro/estudiante">
            <Button size="sm" className="bg-[#0f4c81] hover:bg-[#0b3a63] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 font-body font-semibold text-white">
              Registrarse
            </Button>
          </Link>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar oportunidades..." 
            className="pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full h-9 text-slate-800 dark:text-slate-100"
          />
        </div>
        
        <NotificationsDropdown />
        
        <UserDropdown />
      </div>
    </header>
  );
}
