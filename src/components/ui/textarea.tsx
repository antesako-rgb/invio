import * as React from "react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Textarea
========================================================================== */

const Textarea =
  React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<"textarea">
  >(function Textarea(
    {
      className,
      ...props
    },
    ref
  ) {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          [
            "flex",
            "min-h-28",
            "w-full",
            "resize-y",
            "rounded-xl",
            "border",
            "border-border",
            "bg-background",
            "px-3",
            "py-2",
            "text-base",
            "text-foreground",
            "shadow-none",
            "transition-[border-color,box-shadow,background-color]",
            "duration-200",
            "motion-reduce:transition-none",
            "outline-none",

            "placeholder:text-muted-foreground",

            "hover:not-disabled:border-primary/30",
            "focus-visible:border-primary",
            "focus-visible:ring-2",
            "focus-visible:ring-ring/20",

            "disabled:pointer-events-none",
            "disabled:opacity-50",
            "disabled:bg-muted",

            "aria-invalid:border-destructive",
            "aria-invalid:ring-4",
            "aria-invalid:ring-destructive/20",

            "sm:text-sm",
          ],
          className
        )}
        {...props}
      />
    );
  });

Textarea.displayName =
  "Textarea";


/* ==========================================================================
   Exports
========================================================================== */

export {
  Textarea,
};