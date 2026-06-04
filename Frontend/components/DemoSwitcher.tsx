"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { useNav, keyFromPath } from "@/lib/nav";

// Navegador flotante de demo (acceso a las 14 vistas). Quitar en producción.
export default function DemoSwitcher() {
  const pathname = usePathname();
  const nav = useNav();
  return <ViewSwitcher current={keyFromPath(pathname)} nav={nav} />;
}
