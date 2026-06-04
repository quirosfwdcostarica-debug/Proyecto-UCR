"use client";
import { CVEditor } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <CVEditor nav={nav} />;
}
