import {
  getTranslations,
} from "next-intl/server";

import AuthFormLayout
  from "@/features/auth/components/AuthFormLayout/AuthFormLayout";

import LoginForm
  from "@/features/auth/components/LoginForm/LoginForm";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface LoginPageProps {
  locale:
    Locale;
}


/* ==========================================================================
   Login Page
========================================================================== */

export default async function LoginPage({
  locale,
}: LoginPageProps) {
  const t =
    await getTranslations({
      locale,

      namespace:
        "Auth.login",
    });

  return (
    <AuthFormLayout
      title={
        t(
          "title"
        )
      }
      description={
        t(
          "description"
        )
      }
    >
      <LoginForm />
    </AuthFormLayout>
  );
}