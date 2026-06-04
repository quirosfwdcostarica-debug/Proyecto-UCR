"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { useNav, keyFromPath } from "@/lib/nav";

export default function RoleShell({ role, children }: any) {
  const pathname = usePathname();
  const nav = useNav();
  return (
    <Shell role={role} current={keyFromPath(pathname)} nav={nav}>
      {children}
    </Shell>
  );
}
