import * as React from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/utils";

interface SectionProps
  extends React.HTMLAttributes<HTMLElement> {
  title: string;

  description?: string;

  icon?: LucideIcon;

  actions?: React.ReactNode;

  children: React.ReactNode;
}

const Section = React.forwardRef<
  HTMLElement,
  SectionProps
>(function Section(
  {
    title,
    description,
    icon: Icon,
    actions,
    children,
    className,
    ...props
  },
  ref
) {
  return (
    <section
      ref={ref}
      data-slot="section"
   className={cn(
  "space-y-8 scroll-mt-24",
  className
)}
      {...props}
    >
      <div
        data-slot="section-header"
        className="flex items-start justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          {Icon && (
    <div
  data-slot="section-icon"
  className={cn(
    "flex size-11 shrink-0 items-center justify-center rounded-xl",
    "border border-primary/20",
    "bg-primary/10",
    "text-primary",
    "shadow-xs"
  )}
>
  <Icon
    className="size-5"
    strokeWidth={2.3}
  />
</div>
          )}

          <div
            data-slot="section-heading"
            className="space-y-1"
          >
            <h2
              data-slot="section-title"
              className="text-xl font-semibold tracking-tight"
            >
              {title}
            </h2>

            {description && (
              <p
                data-slot="section-description"
                className="max-w-2xl text-sm leading-6 text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div
            data-slot="section-actions"
            className="flex shrink-0 items-center gap-2"
          >
            {actions}
          </div>
        )}
      </div>

      <div
        data-slot="section-content"
        className="space-y-6"
      >
        {children}
      </div>
    </section>
  );
});

Section.displayName = "Section";

export { Section };