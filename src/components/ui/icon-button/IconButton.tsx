import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Styles
========================================================================== */

export const iconButtonClassName =
  [
    "inline-flex size-10 shrink-0 items-center justify-center",
    "rounded-full",
    "border border-border",
    "bg-background",
    "text-foreground",
    "cursor-pointer",
    "transition-[background-color,opacity,transform] duration-150",
    "hover:bg-muted",
    "active:scale-95",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "[&_svg]:size-4",
    "[&_svg]:shrink-0",
  ];


/* ==========================================================================
   Types
========================================================================== */

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children:
    ReactNode;
}


/* ==========================================================================
   Icon Button
========================================================================== */

export default function IconButton({
  children,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={
        type
      }
      className={cn(
        iconButtonClassName,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}