import {
  hasLocale,
  NextIntlClientProvider,
} from "next-intl";

import {
  setRequestLocale,
} from "next-intl/server";

import {
  notFound,
} from "next/navigation";

import BackToTop
  from "@/components/layout/BackToTop/BackToTop";

import Providers
  from "@/components/providers/Providers";

import {
  loadMessages,
} from "@/i18n/messages";

import {
  routing,
} from "@/i18n/routing";


/* ==========================================================================
   Locale Layout
========================================================================== */

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const {
    locale,
  } =
    await params;

  if (
    !hasLocale(
      routing.locales,
      locale
    )
  ) {
    notFound();
  }

  setRequestLocale(
    locale
  );

  const messages =
    await loadMessages(
      locale
    );

  return (
    <NextIntlClientProvider
      locale={
        locale
      }
      messages={
        messages
      }
    >
      <Providers>
        {children}
      </Providers>

      <BackToTop />
    </NextIntlClientProvider>
  );
}