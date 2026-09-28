import type {
  Metadata,
} from "next";

import {
  Inter,
} from "next/font/google";

import {
  Toaster,
} from "sonner";

import "./globals.css";


/* ==========================================================================
   Fonts
========================================================================== */

const inter =
  Inter({
    variable:
      "--font-inter",

    subsets: [
      "latin",
    ],
  });


/* ==========================================================================
   Metadata
========================================================================== */

export const metadata: Metadata = {
  title: {
    default:
      "Memiva",

    template:
      "%s | Memiva",
  },

  description:
    "Memiva — podijelite fotografije i sačuvajte uspomene sa svojih događaja.",
};


/* ==========================================================================
   Root Layout
========================================================================== */

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="hr"
      data-scroll-behavior="smooth"
      className={`
        ${inter.variable}
        h-full
        antialiased
      `}
    >
      <body
        className="min-h-full flex flex-col"
      >
        {children}

        <Toaster
          position="top-center"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}