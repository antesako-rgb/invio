import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

export function publicRsvpError(error: unknown): ActionErrorCode {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  // Missing tokens and unavailable invitations share a public-facing message.
  if (["P0002", "42501", "PGRST116"].includes(code)) return "RSVP_UNAVAILABLE";
  if (["22023", "22P02", "23514", "23503", "23502"].includes(code)) return "INVALID_INPUT";
  if (code === "P0001" && error && typeof error === "object" && "message" in error) {
    const message = String(error.message).toLowerCase();
    if (/invalid.*token|token.*invalid|not found|does not exist|not.*public|not.*published|unpublished|unavailable/.test(message)) return "RSVP_UNAVAILABLE";
  }
  return "RSVP_SUBMIT_FAILED";
}
