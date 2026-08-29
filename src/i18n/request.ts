import {
  hasLocale,
} from "next-intl";

import {
  getRequestConfig,
} from "next-intl/server";

import {
  loadMessages,
} from "./messages";

import {
  routing,
} from "./routing";


/* ==========================================================================
   Request Configuration
========================================================================== */

export default getRequestConfig(
  async ({
    requestLocale,
  }) => {
    const requestedLocale =
      await requestLocale;

    const locale =
      hasLocale(
        routing.locales,
        requestedLocale
      )
        ? requestedLocale
        : routing.defaultLocale;

    const messages =
      await loadMessages(
        locale
      );

    return {
      locale,

      messages,
    };
  }
);