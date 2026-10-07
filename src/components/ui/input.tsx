import * as React from "react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Input
========================================================================== */

const Input =
  React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input">
  >(function Input(
    {
      className,
      type = "text",
      ...props
    },
    ref
  ) {
    return (
      <input
        ref={ref}
        data-slot="input"
        type={type}
        className={cn(
          [
            "flex",
            "h-10",
            "w-full",
            "rounded-xl",
            "border",
            "border-border",
            "bg-background",
            "px-3",
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

            "file:border-0",
            "file:bg-transparent",
            "file:text-sm",
            "file:font-medium",

            "sm:text-sm",
          ],
          className
        )}
        {...props}
      />
    );
  });

Input.displayName =
  "Input";


/* ==========================================================================
   Exports
========================================================================== */

export {
  Input,
};