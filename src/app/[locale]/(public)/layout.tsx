import type {
  ReactNode,
} from "react";

import PublicNavbar
  from "@/components/navigation/PublicNavbar/PublicNavbar";

import Footer
  from "@/components/layout/Footer/Footer";


/* ==========================================================================
   Public Layout
========================================================================== */

interface PublicLayoutProps {
  children:
    ReactNode;
}


export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      <PublicNavbar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}