"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";

export function UserDropdown() {
  const { data: session } = useSession();
  const imageUrl = session?.user?.image || "https://github.com/shadcn.png";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el menú si el usuario hace click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Avatar — click para abrir/cerrar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-[#0f4c81] transition-all overflow-hidden focus:outline-none focus:ring-[#0f4c81]"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <img src={imageUrl} alt="User" className="h-full w-full object-cover" />
      </button>

      {/* Dropdown — controlado por estado, no por hover */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Info usuario */}
          {session?.user?.name && (
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {session.user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
            </div>
          )}

          <Link
            href="/perfil/editar"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
