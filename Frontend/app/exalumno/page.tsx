"use client";
import { DashAlumni } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <DashAlumni nav={nav} />;
}
