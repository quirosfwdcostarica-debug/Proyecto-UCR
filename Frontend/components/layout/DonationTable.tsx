"use client";

import React from "react";
import { C } from "@/lib/theme";
import { Badge } from "@/components/ui";

export function DonationTable({ rows }: any) {
  const stTone = { Confirmada: "green", Pendiente: "gold", Rechazada: "red" };
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[13px]">
        <thead><tr style={{ color: C.faint }} className="text-left text-[11.5px] uppercase tracking-wider"><th className="font-bold py-2 px-1">Proyecto</th><th className="font-bold py-2 px-1">Monto</th><th className="font-bold py-2 px-1 hidden sm:table-cell">Fecha</th><th className="font-bold py-2 px-1">Estado</th></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
            <td className="py-3 px-1 font-semibold" style={{ color: C.ink }}>{r.project}</td>
            <td className="py-3 px-1 font-bold" style={{ color: C.ink }}>{r.amount}</td>
            <td className="py-3 px-1 hidden sm:table-cell" style={{ color: C.sub }}>{r.date}</td>
            <td className="py-3 px-1"><Badge tone={stTone[r.status]}>{r.status}</Badge></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
