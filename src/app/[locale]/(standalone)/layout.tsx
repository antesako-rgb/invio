import type {
  ReactNode,
} from "react";


/* ==========================================================================
   Types
========================================================================== */

interface StandaloneLayoutProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Standalone Layout
========================================================================== */

export default function StandaloneLayout({
  children,
}: StandaloneLayoutProps) {
  return children;
}