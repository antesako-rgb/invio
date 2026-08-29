import {
  clsx,
  type ClassValue,
} from "clsx";

import {
  twMerge,
} from "tailwind-merge";


/* ==========================================================================
   Class Names
========================================================================== */

export function cn(
  ...inputs: ClassValue[]
) {
  return twMerge(
    clsx(inputs)
  );
}