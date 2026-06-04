"use client";
import { SemanaU } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <SemanaU nav={nav} embedded />;
}
