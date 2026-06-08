import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-[#0f4c81]">{title}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search opportunities..." 
            className="pl-8 bg-slate-50 border-slate-200 rounded-full h-9"
          />
        </div>
        
        <NotificationsDropdown />
        
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-[#0f4c81] transition-all overflow-hidden">
          <img src="https://github.com/shadcn.png" alt="User" className="h-full w-full object-cover" />
        </div>
      </div>
    </header>
  );
}
