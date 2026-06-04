"use client";
import { DirectoryAlumni } from "@/views";
import { useNav } from "@/lib/nav";

export default function Page() {
  const nav = useNav();
  return <DirectoryAlumni nav={nav} />;
}
