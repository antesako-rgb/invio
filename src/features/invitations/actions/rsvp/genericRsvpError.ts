import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";
export function genericRsvpError(error: unknown): ActionErrorCode {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const message = error && typeof error === "object" && "message" in error ? String(error.message).toLowerCase() : "";
  if (/capacity|not enough.*(places|space|seats)|nema dovoljno slobodnih mjesta/.test(message)) return "RSVP_CAPACITY_EXCEEDED";
  if (/max.*guests|too many.*guests|guest.*limit/.test(message)) return "RSVP_GUEST_LIMIT_EXCEEDED";
  if (["P0002", "42501"].includes(code) || /not.*published|not.*public|disabled|not.*enabled|unavailable/.test(message)) return "RSVP_UNAVAILABLE";
  if (["22023", "22P02", "23514", "23502"].includes(code)) return "INVALID_INPUT";
  return "RSVP_SUBMIT_FAILED";
}
