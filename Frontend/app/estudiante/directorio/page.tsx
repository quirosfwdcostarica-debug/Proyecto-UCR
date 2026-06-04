"use client";
import { DirectoryStudent } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <DirectoryStudent nav={nav} />;
}
