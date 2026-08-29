import * as React from "react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title:
    string;

  value:
    React.ReactNode;

  description?:
    string;

  icon?:
    LucideIcon;

  footer?:
    React.ReactNode;

  interactive?:
    boolean;
}


/* ==========================================================================
   Stat Card
========================================================================== */

const StatCard =
  React.forwardRef<
    HTMLDivElement,
    StatCardProps
  >(
    function StatCard(
      {
        title,
        value,
        description,
        icon: Icon,
        footer,
        interactive = false,
        className,
        ...props
      },
      ref
    ) {
      return (
        <Card
          ref={ref}
          data-slot="stat-card"
          variant={
            interactive
              ? "interactive"
              : undefined
          }
          shadow="sm"
          radius="lg"
          className={cn(
            "h-full",
            className
          )}
          {...props}
        >
          <CardContent
            spacing="none"
            className="flex h-full flex-col p-3 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium leading-tight text-muted-foreground sm:text-sm sm:leading-normal">
                  {title}
                </p>

                <strong className="mt-2 block text-2xl font-bold leading-none tracking-tight sm:text-3xl">
                  {value}
                </strong>

                {description && (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    {description}
                  </p>
                )}
              </div>

              {Icon && (
                <div
                  data-slot="stat-card-icon"
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-[0.625rem]",
                    "border border-primary/10",
                    "bg-primary/5",
                    "text-primary",
                    "sm:size-10 sm:rounded-lg"
                  )}
                >
                  <Icon
                    className="size-4 sm:size-5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {footer && (
              <div
                data-slot="stat-card-footer"
                className="mt-3 border-t border-border pt-3 sm:mt-4 sm:pt-4"
              >
                {footer}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }
  );


StatCard.displayName =
  "StatCard";


export {
  StatCard,
};