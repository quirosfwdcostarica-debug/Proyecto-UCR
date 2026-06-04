"use client";
import { CVAdaptAI } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <CVAdaptAI nav={nav} />;
}
