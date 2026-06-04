"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Card({ children, className = "", style = {}, hover = false, pad = "p-5" }: any) {
  return (
    <div className={`bg-white rounded-2xl ${pad} ${hover ? "transition-all duration-200 hover:shadow-[0_12px_40px_-14px_rgba(0,102,179,.28)] hover:-translate-y-[2px]" : ""} ${className}`}
      style={{ border: `1px solid ${C.line}`, ...style }}>{children}</div>
  );
}
