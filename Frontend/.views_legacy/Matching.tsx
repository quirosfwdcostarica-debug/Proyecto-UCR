"use client";

import React from "react";
import { CheckCircle2, Eye, Filter, Handshake, Sparkles, TrendingUp } from "lucide-react";
import { C } from "@/lib/theme";
import { matchReasons } from "@/lib/data";
import { Avatar, Badge, Btn, Card, Ring } from "@/components/ui";
import { PageHead } from "@/components/layout";

export function Matching({ nav }: any) {
  const matches = [
    { a: "Lucía Vargas", aRole: "Product Lead · Stripe", s: "Valeria Campos", sRole: "Ing. Biomédica", score: 96, areas: ["Salud", "Tecnología"], support: "Mentoría + Financiamiento" },
    { a: "María F. Rojas", aRole: "VP Ing · Globant", s: "Esteban Picado", sRole: "Ing. Eléctrica", score: 92, areas: ["Energía", "Tecnología"], support: "Financiamiento" },
    { a: "Carlos Méndez", aRole: "CFO · BAC", s: "Sofía Aguilar", sRole: "Economía", score: 89, areas: ["Finanzas", "Impacto social"], support: "Empleo" },
    { a: "Diego Hernández", aRole: "Arquitecto · Gensler", s: "Andrés Solano", sRole: "Arquitectura", score: 88, areas: ["Sostenibilidad"], support: "Mentoría + Pasantía" },
  ];
  return (
    <>
      <PageHead eyebrow="Marketplace de afinidad" title="Sistema de matching" sub="Ordenado por compatibilidad. Cada match explica su porqué." tone={C.blue} action={<div className="flex gap-2"><Btn variant="outline" size="sm" icon={Filter}>Filtrar</Btn><Btn variant="softblue" size="sm" icon={TrendingUp}>Por afinidad</Btn></div>} />
      <div className="grid lg:grid-cols-2 gap-4">{matches.map(m => (
        <Card key={m.s} hover>
          <div className="flex items-center justify-between mb-4"><Badge tone={m.score >= 90 ? "green" : "blue"}><Sparkles size={12} /> {m.score >= 90 ? "Match excelente" : "Buen match"}</Badge><div className="flex items-center gap-2"><span className="text-[12px] font-bold" style={{ color: C.sub }}>Compatibilidad</span><Ring value={m.score} size={52} /></div></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0"><Avatar name={m.a} size={40} /><div className="min-w-0"><div className="font-bold text-[13.5px] truncate" style={{ color: C.ink }}>{m.a}</div><div className="text-[11.5px] truncate" style={{ color: C.sub }}>{m.aRole}</div></div></div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: C.greenSoft, color: C.greenDk }}><Handshake size={16} /></div>
            <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end"><div className="min-w-0 text-right"><div className="font-bold text-[13.5px] truncate" style={{ color: C.ink }}>{m.s}</div><div className="text-[11.5px] truncate" style={{ color: C.sub }}>{m.sRole}</div></div><Avatar name={m.s} size={40} tone={C.green} /></div>
          </div>
          <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.faint }}>Razones del match</div>
            {matchReasons.slice(0, 3).map(r => <div key={r} className="flex items-center gap-2 text-[12.5px]" style={{ color: C.ink }}><CheckCircle2 size={14} color={C.greenDk} /> {r}</div>)}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3"><span className="text-[11.5px] font-semibold" style={{ color: C.sub }}>Áreas:</span>{m.areas.map(a => <Badge key={a} tone="blue">{a}</Badge>)}<Badge tone="gold">{m.support}</Badge></div>
          <div className="flex gap-2 mt-4"><Btn variant="primary" size="sm" full icon={Handshake}>Aceptar match</Btn><Btn variant="outline" size="sm" icon={Eye}>Perfil</Btn></div>
        </Card>
      ))}</div>
    </>
  );
}
