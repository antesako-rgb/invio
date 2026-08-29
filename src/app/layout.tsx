import type {
  Metadata,
} from "next";

import {
  Inter,
} from "next/font/google";

import {
  Toaster,
} from "sonner";

import {
  invitationFontVariables,
} from "@/features/invitations/fonts/invitationFonts";

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
      "Invio",

    template:
      "%s | Invio",
  },

  description:
    "Kreirajte pozivnice, upravljajte gostima i organizirajte svoje događaje.",
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
        ${invitationFontVariables}
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