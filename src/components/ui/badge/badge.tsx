import * as React from "react";

import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const badgeVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-1.5",
    "rounded-full",
    "border",
    "font-medium",
    "whitespace-nowrap",
    "select-none",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-transparent",
          "bg-primary",
          "text-primary-foreground",
        ],

        secondary: [
          "border-transparent",
          "bg-amber-50",
          "text-amber-800",
          "hover:bg-amber-100",
          "dark:bg-amber-500/10",
          "dark:text-amber-300",
          "dark:hover:bg-amber-500/20",
        ],

        soft: [
          "border-border",
          "bg-secondary",
          "text-secondary-foreground",
        ],

        outline: [
          "border-border",
          "bg-background",
          "text-foreground",
        ],

        muted: [
          "border-transparent",
          "bg-muted",
          "text-muted-foreground",
        ],

        success: [
          "border-transparent",
          "bg-emerald-50",
          "text-emerald-800",
          "hover:bg-emerald-100",
          "dark:bg-emerald-500/10",
          "dark:text-emerald-300",
          "dark:hover:bg-emerald-500/20",
        ],

        warning: [
          "border-transparent",
          "bg-orange-50",
          "text-orange-800",
          "hover:bg-orange-100",
          "dark:bg-orange-500/10",
          "dark:text-orange-300",
          "dark:hover:bg-orange-500/20",
        ],

        info: [
          "border-transparent",
          "bg-sky-50",
          "text-sky-800",
          "hover:bg-sky-100",
          "dark:bg-sky-500/10",
          "dark:text-sky-300",
          "dark:hover:bg-sky-500/20",
        ],

        destructive: [
          "border-transparent",
          "bg-red-50",
          "text-red-800",
          "hover:bg-red-100",
          "dark:bg-red-500/10",
          "dark:text-red-300",
          "dark:hover:bg-red-500/20",
        ],
      },

      size: {
        sm: [
          "h-5",
          "px-2",
          "text-[11px]",
        ],

        md: [
          "h-6",
          "px-2.5",
          "text-xs",
        ],

        lg: [
          "h-7",
          "px-3",
          "text-sm",
        ],
      },

      dot: {
        true: "",
        false: "",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
      dot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(
        badgeVariants({
          variant,
          size,
          dot,
        }),
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5",
            "rounded-full",
            "bg-current"
          )}
        />
      )}

      {children}
    </div>
  );
}