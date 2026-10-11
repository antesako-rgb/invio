"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import * as TooltipPrimitive
  from "@radix-ui/react-tooltip";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./tooltip.module.css";


/* ==========================================================================
   Tooltip Provider
========================================================================== */

interface TooltipProviderProps {
  children:
    ReactNode;
}

export function TooltipProvider({
  children,
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={300}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}


/* ==========================================================================
   Tooltip
========================================================================== */

type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;

export function Tooltip({
  children,
  ...props
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root {...props}>
      {children}
    </TooltipPrimitive.Root>
  );
}


/* ==========================================================================
   Tooltip Trigger
========================================================================== */

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger>;

export function TooltipTrigger({
  children,
  asChild = false,
  ...props
}: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger
      asChild={
        asChild
      }
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}


/* ==========================================================================
   Tooltip Content
========================================================================== */

type TooltipContentProps = ComponentProps<typeof TooltipPrimitive.Content>;

export function TooltipContent({
  children,
  className,
  side = "top",
  sideOffset = 8,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={
          side
        }
        sideOffset={
          sideOffset
        }
        className={cn(
          styles.content,
          className
        )}
        {...props}
      >
        {children}

        <TooltipPrimitive.Arrow
          className={
            styles.arrow
          }
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
