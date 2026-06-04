"use client";

import React from "react";
import { C } from "@/lib/theme";
import { Eyebrow, Title } from "@/components/ui";

export function PageHead({ eyebrow, title, sub, action, tone }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>{eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}<Title className="mt-2" style={{ fontSize: 30 }}>{title}</Title>{sub && <p className="text-sm mt-1" style={{ color: C.sub }}>{sub}</p>}</div>
      {action}
    </div>
  );
}
