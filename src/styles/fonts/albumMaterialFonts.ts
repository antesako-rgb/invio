import { Allura, Marcellus, Playfair_Display } from "next/font/google";

// Shared font instances: Album and Materials must not register duplicate fonts.
export const allura =
  Allura({
    variable:
      "--font-allura",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

export const marcellus =
  Marcellus({
    variable:
      "--font-marcellus",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

export const playfairDisplay =
  Playfair_Display({
    variable:
      "--font-playfair-display",

    subsets: [
      "latin",
    ],
  });
