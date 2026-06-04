import React from "react";
import RoleShell from "@/components/layout/RoleShell";

export default function Layout({ children }: any) {
  return <RoleShell role="alumni">{children}</RoleShell>;
}
