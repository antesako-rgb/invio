"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

interface DataTableToolbarProps {
  left?: ReactNode;

  right?: ReactNode;

  className?: string;
}

export default function DataTableToolbar({
  left,
  right,
  className,
}: DataTableToolbarProps) {
  if (!left && !right) {
    return null;
  }

  return (
    <div
      className={cn(
        `
          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-center
          sm:justify-between
        `,
        className
      )}
    >
      <div
        className="
          flex
          flex-1
          flex-wrap
          items-center
          gap-2
        "
      >
        {left}
      </div>

      <div
        className="
          flex
          flex-wrap
          items-center
          justify-start
          gap-2

          sm:justify-end
        "
      >
        {right}
      </div>
    </div>
  );
}