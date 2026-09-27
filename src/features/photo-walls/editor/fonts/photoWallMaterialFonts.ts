import {
  Alex_Brush,
  Allison,
  Allura,
  Arizonia,
  Bangers,
  Beau_Rivage,
  Bilbo_Swash_Caps,
  Bodoni_Moda,
  Caveat,
  Cormorant_Garamond,
  Dancing_Script,
  DM_Sans,
  Ephesis,
  Faster_One,
  Great_Vibes,
  Honk,
  Italiana,
  Italianno,
  Kalnia_Glaze,
  Luckiest_Guy,
  Manrope,
  Marcellus,
  Mrs_Saint_Delafield,
  Parisienne,
  Pinyon_Script,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Sacramento,
  Style_Script,
  Tangerine,
  WindSong,
} from "next/font/google";


/* ==========================================================================
   Photo Wall Material Fonts
========================================================================== */

const alexBrush =
  Alex_Brush({
    variable:
      "--font-alex-brush",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const allison =
  Allison({
    variable:
      "--font-allison",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const allura =
  Allura({
    variable:
      "--font-allura",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const arizonia =
  Arizonia({
    variable:
      "--font-arizonia",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const bangers =
  Bangers({
    variable:
      "--font-bangers",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const beauRivage =
  Beau_Rivage({
    variable:
      "--font-beau-rivage",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const bilboSwashCaps =
  Bilbo_Swash_Caps({
    variable:
      "--font-bilbo-swash-caps",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const bodoniModa =
  Bodoni_Moda({
    variable:
      "--font-bodoni-moda",

    subsets: [
      "latin",
    ],
  });

const caveat =
  Caveat({
    variable:
      "--font-caveat",

    subsets: [
      "latin",
    ],
  });

const cormorantGaramond =
  Cormorant_Garamond({
    variable:
      "--font-cormorant-garamond",

    subsets: [
      "latin",
    ],

    weight: [
      "400",
      "500",
      "600",
    ],
  });

const dancingScript =
  Dancing_Script({
    variable:
      "--font-dancing-script",

    subsets: [
      "latin",
    ],
  });

const dmSans =
  DM_Sans({
    variable:
      "--font-dm-sans",

    subsets: [
      "latin",
    ],
  });

const ephesis =
  Ephesis({
    variable:
      "--font-ephesis",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const fasterOne =
  Faster_One({
    variable:
      "--font-faster-one",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const greatVibes =
  Great_Vibes({
    variable:
      "--font-great-vibes",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const honk =
  Honk({
    variable:
      "--font-honk",

    subsets: [
      "latin",
    ],
  });

const italiana =
  Italiana({
    variable:
      "--font-italiana",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const italianno =
  Italianno({
    variable:
      "--font-italianno",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const kalniaGlaze =
  Kalnia_Glaze({
    variable:
      "--font-kalnia-glaze",

    subsets: [
      "latin",
    ],
  });

const luckiestGuy =
  Luckiest_Guy({
    variable:
      "--font-luckiest-guy",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const manrope =
  Manrope({
    variable:
      "--font-manrope",

    subsets: [
      "latin",
    ],
  });

const marcellus =
  Marcellus({
    variable:
      "--font-marcellus",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const mrsSaintDelafield =
  Mrs_Saint_Delafield({
    variable:
      "--font-mrs-saint-delafield",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const parisienne =
  Parisienne({
    variable:
      "--font-parisienne",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const pinyonScript =
  Pinyon_Script({
    variable:
      "--font-pinyon-script",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const playfairDisplay =
  Playfair_Display({
    variable:
      "--font-playfair-display",

    subsets: [
      "latin",
    ],
  });

const plusJakartaSans =
  Plus_Jakarta_Sans({
    variable:
      "--font-plus-jakarta-sans",

    subsets: [
      "latin",
    ],
  });

const sacramento =
  Sacramento({
    variable:
      "--font-sacramento",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const styleScript =
  Style_Script({
    variable:
      "--font-style-script",

    subsets: [
      "latin",
    ],

    weight:
      "400",
  });

const tangerine =
  Tangerine({
    variable:
      "--font-tangerine",

    subsets: [
      "latin",
    ],

    weight: [
      "400",
      "700",
    ],
  });

const windSong =
  WindSong({
    variable:
      "--font-wind-song",

    subsets: [
      "latin",
    ],

    weight: [
      "400",
      "500",
    ],
  });


/* ==========================================================================
   Photo Wall Material Font Variables
========================================================================== */

export const photoWallMaterialFonts = [
  alexBrush.variable,
  allison.variable,
  allura.variable,
  arizonia.variable,
  bangers.variable,
  beauRivage.variable,
  bilboSwashCaps.variable,
  bodoniModa.variable,
  caveat.variable,
  cormorantGaramond.variable,
  dancingScript.variable,
  dmSans.variable,
  ephesis.variable,
  fasterOne.variable,
  greatVibes.variable,
  honk.variable,
  italiana.variable,
  italianno.variable,
  kalniaGlaze.variable,
  luckiestGuy.variable,
  manrope.variable,
  marcellus.variable,
  mrsSaintDelafield.variable,
  parisienne.variable,
  pinyonScript.variable,
  playfairDisplay.variable,
  plusJakartaSans.variable,
  sacramento.variable,
  styleScript.variable,
  tangerine.variable,
  windSong.variable,
].join(
  " "
);




