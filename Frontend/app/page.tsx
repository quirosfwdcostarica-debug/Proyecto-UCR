"use client";
import { Landing } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <Landing nav={nav} />;
}
