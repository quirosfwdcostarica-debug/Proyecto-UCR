"use client";

import React, { useState } from "react";
import { BarChart3, BookOpen, Briefcase, Check, FileText, Handshake, HeartHandshake, Home, Layers, LayoutGrid, PartyPopper, Sparkles, User, Users, X } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { Landing, Matching } from "@/views";

const VIEW_GROUPS = [
  { label: "Público", color: C.naranja, views: [["landing", "Landing Page", Home], ["semana-u", "Semana U", PartyPopper]] },
  { label: "Registro", color: C.amarillo, views: [["register-alumni", "Registro Exalumno", User], ["register-student", "Registro Estudiante", BookOpen]] },
  { label: "Estudiante", color: C.greenDk, views: [["dash-student", "Dashboard Estudiante", LayoutGrid], ["directory-student", "Directorio Estudiantes", Users], ["cv-editor", "Editor de CV", FileText], ["cv-ai", "Adaptar CV con IA", Sparkles]] },
  { label: "Exalumno", color: C.blue, views: [["dash-alumni", "Dashboard Exalumno", LayoutGrid], ["directory-alumni", "Directorio Exalumnos", Users], ["matching", "Sistema de Matching", Handshake], ["donations", "Donaciones", HeartHandshake]] },
  { label: "Compartido", color: C.celeste, views: [["jobs", "Empleos y Pasantías", Briefcase]] },
  { label: "Administración", color: C.esmeralda, views: [["admin", "Panel Administrativo", BarChart3]] },
];

export function ViewSwitcher({ current, nav }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-[320px] rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: C.ink }}><span className="text-white font-bold text-[13px] flex items-center gap-2"><Layers size={15} /> 14 vistas del prototipo</span><button onClick={() => setOpen(false)} aria-label="Cerrar"><X size={17} color="#fff" /></button></div>
          <div className="max-h-[60vh] overflow-y-auto p-2">{VIEW_GROUPS.map(g => (
            <div key={g.label} className="mb-1"><div className="px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: g.color, fontFamily: FONT_DISP }}>{g.label}</div>
              {g.views.map(([key, label, Icon]) => (
                <button key={key} onClick={() => { nav(key); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-left transition-all" style={current === key ? { background: C.celesteSoft, color: C.blueDk } : { color: C.sub }}><Icon size={15} /> {label}{current === key && <Check size={14} className="ml-auto" color={C.blue} />}</button>
              ))}
            </div>
          ))}</div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-105" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.naranja})` }} aria-label="Cambiar vista">{open ? <X size={22} /> : <Layers size={22} />}</button>
    </div>
  );
}
