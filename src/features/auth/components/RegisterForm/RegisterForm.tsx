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
  register as registerUser,
} from "@/features/auth/repositories/register";

import {
  AuthError,
} from "@/features/auth/utils/authErrors";

import {
  createRegisterSchema,
  type RegisterFormValues,
} from "@/features/auth/validation/register.schema";

import styles from "./RegisterForm.module.css";


/* ==========================================================================
   Register Form
========================================================================== */

export default function RegisterForm() {
  const t =
    useTranslations(
      "Auth.register"
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

  const registerSchema =
    createRegisterSchema({
      firstNameRequired:
        t(
          "validation.firstNameRequired"
        ),

      lastNameRequired:
        t(
          "validation.lastNameRequired"
        ),

      invalidEmail:
        t(
          "validation.invalidEmail"
        ),

      passwordMinLength:
        t(
          "validation.passwordMinLength"
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
    useForm<RegisterFormValues>({
      resolver:
        zodResolver(
          registerSchema
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
    values: RegisterFormValues
  ) {
    try {
      setServerError("");

      await registerUser({
        email:
          values.email,

        password:
          values.password,

        firstName:
          values.firstName,

        lastName:
          values.lastName,

        redirectTo,
      });

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
      <div
        className={
          styles.nameFields
        }
      >
        <Field
          id="firstName"
          label={
            t(
              "firstName.label"
            )
          }
          required
          error={
            errors.firstName?.message
          }
        >
          <Input
            type="text"
            autoComplete="given-name"
            placeholder={
              t(
                "firstName.placeholder"
              )
            }
            {...register(
              "firstName"
            )}
          />
        </Field>

        <Field
          id="lastName"
          label={
            t(
              "lastName.label"
            )
          }
          required
          error={
            errors.lastName?.message
          }
        >
          <Input
            type="text"
            autoComplete="family-name"
            placeholder={
              t(
                "lastName.placeholder"
              )
            }
            {...register(
              "lastName"
            )}
          />
        </Field>
      </div>

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
      >
        <PasswordInput
          autoComplete="new-password"
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
          `/prijava?next=${encodeURIComponent(
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