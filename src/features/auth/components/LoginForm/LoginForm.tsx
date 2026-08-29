"use client";

import {
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";

import {
  Field,
} from "@/components/ui/field";

import {
  Input,
} from "@/components/ui/input";

import {
  PasswordInput,
} from "@/components/ui/password-input/PasswordInput";

import FormActions
  from "@/components/ui/form-actions/FormActions";

import {
  FormError,
} from "@/components/ui/form-error/FormError";

import AuthFooter
  from "@/features/auth/components/AuthFooter/AuthFooter";

import {
  login,
} from "@/features/auth/repositories/login";

import {
  AuthError,
} from "@/features/auth/utils/authErrors";

import {
  createLoginSchema,
  type LoginFormValues,
} from "@/features/auth/validation/login.schema";

import styles from "./LoginForm.module.css";


/* ==========================================================================
   Login Form
========================================================================== */

export default function LoginForm() {
  const t =
    useTranslations(
      "Auth.login"
    );

  const tErrors =
    useTranslations(
      "Auth.errors"
    );

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [
    serverError,
    setServerError,
  ] =
    useState("");


  /* ==========================================================================
     Validation
  ========================================================================== */

  const loginSchema =
    createLoginSchema({
      invalidEmail:
        t(
          "validation.invalidEmail"
        ),

      passwordRequired:
        t(
          "validation.passwordRequired"
        ),
    });


  /* ==========================================================================
     Form
  ========================================================================== */

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<LoginFormValues>({
      resolver:
        zodResolver(
          loginSchema
        ),

      mode:
        "onBlur",
    });


  /* ==========================================================================
     Redirect
  ========================================================================== */

  const next =
    searchParams.get(
      "next"
    );

  const redirectTo =
    next?.startsWith("/") &&
    !next.startsWith("//")
      ? next
      : "/dashboard";


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function onSubmit(
    values: LoginFormValues
  ) {
    try {
      setServerError("");

      await login(
        values
      );

      router.replace(
        redirectTo
      );

      router.refresh();
    } catch (error) {
      if (
        error instanceof AuthError
      ) {
        setServerError(
          tErrors(
            error.code
          )
        );

        return;
      }

      setServerError(
        tErrors(
          "unknown"
        )
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <form
      noValidate
      onSubmit={
        handleSubmit(
          onSubmit
        )
      }
      className={
        styles.form
      }
    >
      <Field
        id="email"
        label={
          t(
            "email.label"
          )
        }
        required
        error={
          errors.email?.message
        }
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder={
            t(
              "email.placeholder"
            )
          }
          {...register(
            "email"
          )}
        />
      </Field>

      <Field
        id="password"
        label={
          t(
            "password.label"
          )
        }
        required
        error={
          errors.password?.message
        }
        labelAction={
          <Link
            href="/zaboravljena-lozinka"
            className={
              styles.link
            }
          >
            {t(
              "forgotPassword"
            )}
          </Link>
        }
      >
        <PasswordInput
          autoComplete="current-password"
          placeholder={
            t(
              "password.placeholder"
            )
          }
          {...register(
            "password"
          )}
        />
      </Field>

      <FormError>
        {serverError}
      </FormError>

      <FormActions
        isSubmitting={
          isSubmitting
        }
        submitLabel={
          t(
            "submit"
          )
        }
      />

      <AuthFooter
        text={
          t(
            "footer.text"
          )
        }
        href={
          `/registracija?next=${encodeURIComponent(
            redirectTo
          )}`
        }
        linkLabel={
          t(
            "footer.link"
          )
        }
      />
    </form>
  );
}