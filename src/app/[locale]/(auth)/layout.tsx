import type {
  ReactNode,
} from "react";

import PublicNavbar
  from "@/components/navigation/PublicNavbar/PublicNavbar";


/* ==========================================================================
   Types
========================================================================== */

interface AuthLayoutProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Auth Layout
========================================================================== */

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <>
      <PublicNavbar />

      <main>
        {children}
      </main>
    </>
  );
}