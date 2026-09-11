import type {
  ReactNode,
} from "react";


/* ==========================================================================
   Types
========================================================================== */

interface FullscreenLayoutProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Fullscreen Layout
========================================================================== */

export default function FullscreenLayout({
  children,
}: FullscreenLayoutProps) {
  return children;
}