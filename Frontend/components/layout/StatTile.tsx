"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { Badge, Card } from "@/components/ui";

export function StatTile({ label, value, sub, icon: Icon, tone }: any) {
  return (
    <Card pad="p-5" hover>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tone + "1a", color: tone }}><Icon size={19} /></div>
        {sub && <Badge tone="green"><TrendingUp size={11} />{sub}</Badge>}
      </div>
      <div className="text-[24px] font-extrabold mt-3" style={{ color: C.ink, fontFamily: FONT_DISP }}>{value}</div>
      <div className="text-[13px] font-semibold" style={{ color: C.sub }}>{label}</div>
    </Card>
  );
}
