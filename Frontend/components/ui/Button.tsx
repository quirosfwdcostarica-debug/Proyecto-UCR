"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Btn({ children, variant = "primary", size = "md", icon: Icon, onClick, className = "", style = {}, full }: any) {
  const sizes = { sm: "text-[13px] px-3 py-2 gap-1.5", md: "text-sm px-4 py-2.5 gap-2", lg: "text-[15px] px-5 py-3 gap-2" };
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none cursor-pointer whitespace-nowrap";
  const vstyle = {
    primary: { background: C.blue, color: "#fff", boxShadow: "0 1px 2px rgba(0,102,179,.28)" },
    green: { background: C.green, color: "#063", boxShadow: "0 1px 2px rgba(46,204,113,.28)" },
    orange: { background: C.naranja, color: "#fff", boxShadow: "0 2px 8px rgba(243,75,38,.30)" },
    outline: { background: "#fff", color: C.ink, border: `1px solid ${C.line}` },
    ghost: { background: "transparent", color: C.sub },
    soft: { background: C.greenSoft, color: C.greenDk },
    softblue: { background: C.celesteSoft, color: C.blueDk },
  }[variant];
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} ${full ? "w-full" : ""} ${className}`} style={{ ...vstyle, ...style }}>
      {Icon && <Icon size={size === "sm" ? 15 : 17} strokeWidth={2.2} />}{children}
    </button>
  );
}
