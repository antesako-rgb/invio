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
            "border-primary/20",
            "bg-background",
            "px-3",
            "text-base",
            "text-foreground",
            "shadow-sm",
            "transition-all",
            "outline-none",

            "placeholder:text-muted-foreground",

            "hover:border-primary/35",

            "focus-visible:border-primary",
            "focus-visible:ring-4",
            "focus-visible:ring-ring/30",

            "disabled:pointer-events-none",
            "disabled:opacity-50",

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