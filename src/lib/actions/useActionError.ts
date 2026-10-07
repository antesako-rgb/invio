"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import type { ActionErrorCode } from "./actionErrorCodes";

export function useActionError() {
  const t = useTranslations("Common.errors");
  return useCallback((code: ActionErrorCode) => t(code), [t]);
}
