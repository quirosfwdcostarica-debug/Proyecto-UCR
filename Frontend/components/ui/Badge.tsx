"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Badge({ children, tone = "blue", className = "" }: any) {
  const tones = {
    blue: { bg: C.celesteSoft, fg: C.blueDk }, green: { bg: C.greenSoft, fg: C.greenDk },
    gray: { bg: "#EEF2F8", fg: C.sub }, gold: { bg: C.amarilloSoft, fg: "#B9760A" },
    orange: { bg: C.naranjaSoft, fg: "#C2371A" }, red: { bg: "#FDECEC", fg: "#C0392B" },
    dark: { bg: "rgba(255,255,255,.16)", fg: "#fff" },
  }[tone];
  return <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full leading-none ${className}`} style={{ background: tones.bg, color: tones.fg }}>{children}</span>;
}
