"use client";

import React from "react";
import { ChevronDown, Filter } from "lucide-react";
import { C } from "@/lib/theme";
import { Card } from "@/components/ui";

export function FilterBar({ filters }: any) {
  return (
    <Card pad="p-4" className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-bold mr-1" style={{ color: C.ink }}><Filter size={15} /> Filtros</span>
        {filters.map(f => <button key={f} className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: C.bg, color: C.sub, border: `1px solid ${C.line}` }}>{f} <ChevronDown size={14} /></button>)}
        <button className="ml-auto text-[13px] font-semibold" style={{ color: C.blue }}>Limpiar</button>
      </div>
    </Card>
  );
}
