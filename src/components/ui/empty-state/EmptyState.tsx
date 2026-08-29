import * as React from "react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?:
    LucideIcon;

  title:
    string;

  description?:
    string;

  action?:
    React.ReactNode;

  variant?:
    | "default"
    | "card";
}


/* ==========================================================================
   Empty State
========================================================================== */

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center text-center",

        variant === "default" && [
          "rounded-xl",
          "border",
          "border-dashed",
          "bg-card",
          "px-4",
          "py-10",
          "sm:px-8",
          "sm:py-12",
        ],

        variant === "card" && [
          "rounded-2xl",
          "border",
          "bg-card",
          "px-5",
          "py-8",
          "shadow-xs",
          "sm:px-8",
          "sm:py-9",
        ],

        className
      )}
      {...props}
    >
      {Icon && (
        <div
          className={cn(
            "mb-4",
            "flex",
            "size-14",
            "items-center",
            "justify-center",
            "rounded-2xl",
            "bg-primary/10",
            "text-primary"
          )}
        >
          <Icon
            strokeWidth={1.75}
            className="size-7"
            aria-hidden="true"
          />
        </div>
      )}

      <h2
        className={
          "text-xl font-semibold tracking-tight"
        }
      >
        {title}
      </h2>

      {description && (
        <p
          className={
            "mt-2 max-w-md text-sm leading-6 text-muted-foreground"
          }
        >
          {description}
        </p>
      )}

      {action && (
        <div
          className={
            "mt-5"
          }
        >
          {action}
        </div>
      )}
    </div>
  );
}


/* ==========================================================================
   Exports
========================================================================== */

export {
  EmptyState,
};