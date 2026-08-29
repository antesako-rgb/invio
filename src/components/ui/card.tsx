import * as React from "react";

import {
  Slot,
} from "@radix-ui/react-slot";

import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Card Variants
========================================================================== */

const cardVariants =
  cva(
    [
      "relative",
      "overflow-hidden",
      "border",
      "border-border",
      "bg-card",
      "text-card-foreground",
      "transition-all",
      "duration-200",
    ],
    {
      variants: {
        variant: {
          default:
            "",

          outline:
            "shadow-none",

          ghost:
            "border-transparent bg-transparent shadow-none",

          interactive:
            "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        },

        shadow: {
          none:
            "shadow-none",

          xs:
            "shadow-xs",

          sm:
            "shadow-sm",

          md:
            "shadow-md",

          lg:
            "shadow-lg",
        },

        radius: {
          none:
            "rounded-none",

          sm:
            "rounded-md",

          md:
            "rounded-lg",

          lg:
            "rounded-xl",

          xl:
            "rounded-2xl",
        },
      },

      defaultVariants: {
        variant:
          "default",

        shadow:
          "xs",

        radius:
          "lg",
      },
    }
  );


/* ==========================================================================
   Card
========================================================================== */

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?:
    boolean;
}

const Card =
  React.forwardRef<
    HTMLDivElement,
    CardProps
  >(function Card(
    {
      className,
      variant,
      shadow,
      radius,
      asChild = false,
      ...props
    },
    ref
  ) {
    const Comp =
      asChild
        ? Slot
        : "div";

    return (
      <Comp
        ref={ref}
        data-slot="card"
        className={cn(
          cardVariants({
            variant,
            shadow,
            radius,
          }),
          className
        )}
        {...props}
      />
    );
  });

Card.displayName =
  "Card";


/* ==========================================================================
   Card Header
========================================================================== */

const CardHeader =
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(function CardHeader(
    {
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(
          "flex items-center justify-between gap-4",
          className
        )}
        {...props}
      />
    );
  });

CardHeader.displayName =
  "CardHeader";


/* ==========================================================================
   Card Title
========================================================================== */

const CardTitle =
  React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
  >(function CardTitle(
    {
      className,
      ...props
    },
    ref
  ) {
    return (
      <h3
        ref={ref}
        data-slot="card-title"
        className={cn(
          "text-lg font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    );
  });

CardTitle.displayName =
  "CardTitle";


/* ==========================================================================
   Card Description
========================================================================== */

const CardDescription =
  React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(function CardDescription(
    {
      className,
      ...props
    },
    ref
  ) {
    return (
      <p
        ref={ref}
        data-slot="card-description"
        className={cn(
          "text-sm leading-6 text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  });

CardDescription.displayName =
  "CardDescription";


/* ==========================================================================
   Card Media
========================================================================== */

const CardMedia =
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(function CardMedia(
    {
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-slot="card-media"
        className={cn(
          "overflow-hidden",
          className
        )}
        {...props}
      />
    );
  });

CardMedia.displayName =
  "CardMedia";


/* ==========================================================================
   Card Content
========================================================================== */

const contentVariants =
  cva(
    "p-4",
    {
      variants: {
        spacing: {
          none:
            "",

          xs:
            "space-y-2",

          sm:
            "space-y-3",

          md:
            "space-y-4",

          lg:
            "space-y-5",
        },
      },

      defaultVariants: {
        spacing:
          "none",
      },
    }
  );

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentVariants> {}

const CardContent =
  React.forwardRef<
    HTMLDivElement,
    CardContentProps
  >(function CardContent(
    {
      className,
      spacing,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn(
          contentVariants({
            spacing,
          }),
          className
        )}
        {...props}
      />
    );
  });

CardContent.displayName =
  "CardContent";


/* ==========================================================================
   Card Divider
========================================================================== */

function CardDivider({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      data-slot="card-divider"
      className={cn(
        "border-border",
        className
      )}
      {...props}
    />
  );
}


/* ==========================================================================
   Card Footer
========================================================================== */

interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  separator?:
    boolean;
}

const CardFooter =
  React.forwardRef<
    HTMLDivElement,
    CardFooterProps
  >(function CardFooter(
    {
      className,
      separator = false,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn(
          "flex items-center justify-end gap-3",
          separator &&
            "mt-6 border-t border-border pt-4",
          className
        )}
        {...props}
      />
    );
  });

CardFooter.displayName =
  "CardFooter";


/* ==========================================================================
   Exports
========================================================================== */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardMedia,
  CardContent,
  CardDivider,
  CardFooter,
};