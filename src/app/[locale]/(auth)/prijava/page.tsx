import type {
  Metadata,
} from "next";

import {
  getTranslations,
} from "next-intl/server";

import LoginPage
  from "@/features/auth/pages/LoginPage/LoginPage";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface PageProps {
  params:
    Promise<{
      locale:
        Locale;
    }>;
}


/* ==========================================================================
   Metadata
========================================================================== */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  const t =
    await getTranslations({
      locale,

      namespace:
        "Auth.login",
    });

  return {
    title:
      t(
        "metadata.title"
      ),

    description:
      t(
        "metadata.description"
      ),
  };
}


/* ==========================================================================
   Page
========================================================================== */

export default async function Page({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  return (
    <LoginPage
      locale={
        locale
      }
    />
  );
}