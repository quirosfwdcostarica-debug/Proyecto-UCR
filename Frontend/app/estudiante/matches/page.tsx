"use client";
import { Matching } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <Matching nav={nav} />;
}
