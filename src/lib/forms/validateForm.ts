import type { ZodSchema } from "zod";

import { extractErrors } from "./extractErrors";
import { focusField } from "./focusField";
import { scrollToField } from "./scrollToField";

export function validateForm<T>(
  schema: ZodSchema<T>,
  values: unknown
) {
  const result =
    schema.safeParse(values);

  if (result.success) {
    return {
      success: true as const,
      data: result.data,
      errors: {},
    };
  }

  const errors = extractErrors(
    result.error
  );

  const firstField =
    Object.keys(errors)[0];

  if (firstField) {
  scrollToField(firstField);
focusField(firstField);
  }

  return {
    success: false as const,
    errors,
    message:
      result.error.issues[0]?.message ??
      "Neispravni podaci.",
  };
}