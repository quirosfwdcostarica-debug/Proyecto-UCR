"use client";
import { Admin } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <Admin nav={nav} />;
}
