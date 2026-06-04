"use client";
import { DashStudent } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <DashStudent nav={nav} />;
}
