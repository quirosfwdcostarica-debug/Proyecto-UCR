"use client";

import { signOut } from "next-auth/react";

export function UserDropdown() {
  return (
    <div className="relative group">
      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-transparent group-hover:ring-[#0f4c81] transition-all overflow-hidden">
        <img src="https://github.com/shadcn.png" alt="User" className="h-full w-full object-cover" />
      </div>
      
      {/* Dropdown Menu (Hover) */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
