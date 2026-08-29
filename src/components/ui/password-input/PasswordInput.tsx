"use client";

import * as React from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import styles from "./PasswordInput.module.css";


/* ==========================================================================
   Types
========================================================================== */

type PasswordInputProps =
  React.ComponentPropsWithoutRef<
    typeof Input
  >;


/* ==========================================================================
   Password Input
========================================================================== */

const PasswordInput =
  React.forwardRef<
    HTMLInputElement,
    PasswordInputProps
  >(function PasswordInput(
    {
      className,
      ...props
    },
    ref
  ) {
    const t =
      useTranslations(
        "Common"
      );

    const [
      showPassword,
      setShowPassword,
    ] =
      React.useState(false);

    return (
      <div
        className={
          styles.wrapper
        }
      >
        <Input
          ref={ref}
          type={
            showPassword
              ? "text"
              : "password"
          }
          className={
            className
          }
          {...props}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={
            styles.toggle
          }
          onClick={() =>
            setShowPassword(
              (previous) =>
                !previous
            )
          }
          aria-label={
            showPassword
              ? t(
                  "hidePassword"
                )
              : t(
                  "showPassword"
                )
          }
          aria-pressed={
            showPassword
          }
        >
          {showPassword ? (
            <EyeOff
              aria-hidden="true"
            />
          ) : (
            <Eye
              aria-hidden="true"
            />
          )}
        </Button>
      </div>
    );
  });

PasswordInput.displayName =
  "PasswordInput";


/* ==========================================================================
   Exports
========================================================================== */

export {
  PasswordInput,
};