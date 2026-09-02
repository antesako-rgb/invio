import * as React from "react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

export type LabelSize =
  | "default"
  | "sm";

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?:
    boolean;

  size?:
    LabelSize;
}


/* ==========================================================================
   Label
========================================================================== */

const Label =
  React.forwardRef<
    HTMLLabelElement,
    LabelProps
  >(function Label(
    {
      className,
      required = false,
      size = "default",
      children,
      ...props
    },
    ref
  ) {
    return (
      <label
        ref={ref}
        data-slot="label"
        data-size={size}
        className={cn(
          [
            "inline-flex",
            "items-center",
            "gap-1.5",
            "font-semibold",
            "leading-none",
            "tracking-tight",
            "text-foreground",
            "select-none",

            size === "default" &&
              "text-sm",

            size === "sm" &&
              "text-xs",
          ],
          className
        )}
        {...props}
      >
        {children}

        {required && (
          <span
            data-slot="label-required"
            aria-hidden="true"
            className="text-destructive"
          >
            *
          </span>
        )}
      </label>
    );
  });

Label.displayName =
  "Label";


/* ==========================================================================
   Exports
========================================================================== */

export {
  Label,
};