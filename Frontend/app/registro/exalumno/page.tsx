"use client";
import { Register } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <Register nav={nav} role="alumni" />;
}
