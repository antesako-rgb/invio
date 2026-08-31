import type {
  NextConfig,
} from "next";

import createNextIntlPlugin
  from "next-intl/plugin";


/* ==========================================================================
   Next Intl
========================================================================== */

const withNextIntl =
  createNextIntlPlugin(
    "./src/i18n/request.ts"
  );


/* ==========================================================================
   Next Config
========================================================================== */

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol:
          "https",

        hostname:
          "invio.b-cdn.net",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit:
        "12mb",
    },
  },
};


/* ==========================================================================
   Export
========================================================================== */

export default withNextIntl(
  nextConfig
);