import * as React from "react";

import {
  Loader2,
} from "lucide-react";

import {
  Button as ButtonPrimitive,
} from "@base-ui/react/button";

import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Button Variants
========================================================================== */

const buttonVariants =
  cva(
    [
      "group/button",
      "inline-flex",
      "shrink-0",
      "items-center",
      "justify-center",

      "rounded-full",

      "border",
      "border-transparent",

      "text-sm",
      "font-medium",
      "whitespace-nowrap",

      "shadow-none",

      "transition-[color,background-color,border-color,box-shadow]",
      "duration-200",
      "motion-reduce:transition-none",

      "outline-none",
      "select-none",

      "focus-visible:ring-offset-2",
      "focus-visible:ring-offset-background",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",


      "disabled:pointer-events-none",
      "disabled:opacity-50",
      "disabled:shadow-none",
      "aria-disabled:pointer-events-none",
      "aria-disabled:opacity-50",
      "aria-disabled:shadow-none",

      "aria-invalid:border-destructive",
      "aria-invalid:ring-4",
      "aria-invalid:ring-destructive/20",

      "[&_svg]:pointer-events-none",
      "[&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
    ],
    {
      variants: {
        variant: {
          default:
            "bg-primary text-primary-foreground shadow-xs hover:bg-primary-dark active:bg-primary-dark",

          secondary:
            "border-primary/20 bg-secondary text-primary-dark font-semibold shadow-xs hover:border-primary/40 hover:bg-primary/15 active:bg-primary/20",

          outline:
            "border-border bg-background text-foreground hover:border-primary/30 hover:bg-secondary/60 active:bg-secondary",

          ghost:
            "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:bg-secondary",

          destructive:
            "bg-destructive text-white shadow-xs hover:bg-destructive/90 active:bg-destructive/85 focus-visible:ring-destructive",

          destructiveOutline:
            "border-destructive/25 bg-transparent text-destructive hover:border-destructive/40 hover:bg-destructive/5 active:bg-destructive/10 focus-visible:ring-destructive",

          link:
            "border-transparent bg-transparent text-primary underline-offset-4 decoration-primary/40 hover:underline hover:decoration-primary active:text-primary-dark",
        },

        size: {
          default:
            "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",

          xs:
            "h-7 gap-1 px-2.5 text-xs [&_svg]:size-3",

          sm:
            "h-9 gap-1.5 px-4 text-sm [&_svg]:size-3.5",

          lg:
            "h-11 gap-2 px-6 text-sm",

          icon:
            "size-10 rounded-xl",

          "icon-xs":
            "size-7 rounded-lg [&_svg]:size-3",

          "icon-sm":
            "size-9 rounded-lg",

          "icon-lg":
            "size-11 rounded-xl",
        },
      },

      defaultVariants: {
        variant:
          "default",

        size:
          "default",
      },
    }
  );


/* ==========================================================================
   Types
========================================================================== */

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?:
    boolean;
}


/* ==========================================================================
   Button
========================================================================== */

const Button =
  React.forwardRef<
    HTMLButtonElement,
    ButtonProps
  >(function Button(
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        disabled={
          disabled ||
          loading
        }
        aria-busy={
          loading ||
          undefined
        }
        className={cn(
          buttonVariants({
            variant,
            size,
          }),
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        )}

        {children}
      </ButtonPrimitive>
    );
  });

Button.displayName =
  "Button";


/* ==========================================================================
   Types
========================================================================== */

export type ButtonVariant =
  VariantProps<
    typeof buttonVariants
  >["variant"];

export type ButtonSize =
  VariantProps<
    typeof buttonVariants
  >["size"];


/* ==========================================================================
   Exports
========================================================================== */

export {
  Button,
  buttonVariants,
};
