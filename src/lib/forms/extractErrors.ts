import type { ZodError } from "zod";

import type { FormErrors } from "./types";

export function extractErrors(
  error: ZodError
): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field =
      issue.path[0]?.toString();

    if (
      field &&
      !errors[field]
    ) {
      errors[field] =
        issue.message;
    }
  }

  return errors;
}