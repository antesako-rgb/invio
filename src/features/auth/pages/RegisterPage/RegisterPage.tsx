import {
  getTranslations,
} from "next-intl/server";

import AuthFormLayout
  from "@/features/auth/components/AuthFormLayout/AuthFormLayout";

import RegisterForm
  from "@/features/auth/components/RegisterForm/RegisterForm";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface RegisterPageProps {
  locale:
    Locale;
}


/* ==========================================================================
   Register Page
========================================================================== */

export default async function RegisterPage({
  locale,
}: RegisterPageProps) {
  const t =
    await getTranslations({
      locale,

      namespace:
        "Auth.register",
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
      <RegisterForm />
    </AuthFormLayout>
  );
}