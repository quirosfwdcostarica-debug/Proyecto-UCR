"use client";

import React, { useState } from "react";
import { BarChart3, Bell, Briefcase, FileText, Handshake, HeartHandshake, Home, Menu, PartyPopper, Search, Send, Settings, Shield, Sparkles, User, Users, Wallet, X } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { Avatar } from "@/components/ui";
import { Brand, Sunburst } from "@/components/brand";

const NAVS = {
  alumni: { label: "Exalumno", color: C.blue, who: "María Fernanda Rojas", role: "VP de Ingeniería · Globant",
    items: [["dash-alumni", "Inicio", Home], ["__p", "Mi Perfil", User], ["matching", "Matches", Sparkles], ["jobs", "Posiciones", Briefcase], ["donations", "Donaciones", HeartHandshake], ["semana-u", "Semana U", PartyPopper], ["__s", "Configuración", Settings]] },
  student: { label: "Estudiante", color: C.greenDk, who: "Valeria Campos", role: "Ing. Biomédica · Rodrigo Facio",
    items: [["dash-student", "Inicio", Home], ["__p", "Mi Perfil", User], ["cv-editor", "Proyecto", FileText], ["matching", "Matches", Sparkles], ["jobs", "Aplicaciones", Send], ["__m", "Mentorías", Handshake], ["semana-u", "Semana U", PartyPopper], ["__s", "Configuración", Settings]] },
  admin: { label: "Administración", color: C.esmeralda, who: "Panel Ejecutivo", role: "Fundación UCR",
    items: [["admin", "Resumen", BarChart3], ["donations", "Donaciones", Wallet], ["matching", "Matches", Sparkles], ["__f", "Reportes", Shield], ["directory-alumni", "Usuarios", Users], ["semana-u", "Semana U", PartyPopper], ["__s", "Configuración", Settings]] },
};

export function Shell({ role, current, nav, children }: any) {
  const cfg = NAVS[role];
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-[260px] flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{ background: "#fff", borderRight: `1px solid ${C.line}` }}>
        <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: `1px solid ${C.line}` }}>
          <Brand size={30} /><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={20} color={C.sub} /></button>
        </div>
        <div className="px-5 pt-4 pb-1 text-[10.5px] font-bold uppercase tracking-[.18em]" style={{ color: C.faint, fontFamily: FONT_DISP }}>{cfg.label}</div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {cfg.items.map(([key, label, Icon]) => {
            const active = current === key;
            return <button key={label} onClick={() => { if (!key.startsWith("__")) nav(key); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all" style={active ? { background: cfg.color, color: "#fff" } : { color: C.sub }}><Icon size={17} strokeWidth={2.2} />{label}</button>;
          })}
        </nav>
        <div className="p-3">
          <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${cfg.color}, ${C.celeste})` }}>
            <div className="absolute -right-3 -bottom-3"><Sunburst size={48} color="rgba(255,255,255,.35)" /></div>
            <div className="relative text-white font-bold text-[13px]">Impacto este año</div>
            <div className="relative text-white/85 text-[12px] mt-0.5">{role === "student" ? "₡525,000 recibidos" : role === "admin" ? "₡248.6M gestionados" : "₡725,000 donados"}</div>
          </div>
        </div>
        <div className="p-3 flex items-center gap-3" style={{ borderTop: `1px solid ${C.line}` }}>
          <Avatar name={cfg.who} size={36} tone={cfg.color} /><div className="leading-tight min-w-0"><div className="font-bold text-[13px] truncate" style={{ color: C.ink }}>{cfg.who}</div><div className="text-[11px] truncate" style={{ color: C.sub }}>{cfg.role}</div></div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 md:px-6 bg-white/90 backdrop-blur" style={{ borderBottom: `1px solid ${C.line}` }}>
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu size={22} color={C.ink} /></button>
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search size={16} color={C.faint} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input placeholder="Buscar personas, proyectos, posiciones…" className="w-full text-[13px] rounded-xl pl-9 pr-3 py-2 outline-none" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.ink }} />
          </div>
          <div className="flex-1 sm:hidden" />
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.bg }} aria-label="Notificaciones"><Bell size={17} color={C.sub} /><span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: C.naranja }} /></button>
          <Avatar name={cfg.who} size={34} tone={cfg.color} />
        </header>
        <main className="flex-1 p-4 md:p-7 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
