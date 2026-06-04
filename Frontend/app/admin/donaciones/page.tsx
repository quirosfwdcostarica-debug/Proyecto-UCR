"use client";
import { Donations } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <Donations nav={nav} />;
}
