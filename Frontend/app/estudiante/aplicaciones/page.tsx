"use client";
import { Jobs } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <Jobs nav={nav} />;
}
