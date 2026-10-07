import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

export function invitationRsvpSettingsError(error: unknown): ActionErrorCode {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (["42501", "PGRST301", "PGRST302"].includes(code)) return "FORBIDDEN";
  if (["P0002", "PGRST116"].includes(code)) return "NOT_FOUND";
  if (["23514", "23502", "22023", "22P02"].includes(code)) return "INVALID_INPUT";
  return "INVITATION_RSVP_SETTINGS_FAILED";
}
