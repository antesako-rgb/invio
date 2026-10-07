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
          "bg-warning/10",
          "text-[color:color-mix(in_oklab,var(--warning)_35%,var(--foreground))]",
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
          "bg-success/10",
          "text-[color:color-mix(in_oklab,var(--success)_35%,var(--foreground))]",
        ],

        warning: [
          "border-transparent",
          "bg-warning/10",
          "text-[color:color-mix(in_oklab,var(--warning)_35%,var(--foreground))]",
        ],

        info: [
          "border-transparent",
          "bg-info/10",
          "text-[color:color-mix(in_oklab,var(--info)_35%,var(--foreground))]",
        ],

        destructive: [
          "border-transparent",
          "bg-destructive/10",
          "text-[color:color-mix(in_oklab,var(--destructive)_35%,var(--foreground))]",
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