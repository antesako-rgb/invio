import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

export function recipientError(error: unknown): ActionErrorCode {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (["42501", "PGRST301", "PGRST302"].includes(code)) return "FORBIDDEN";
  if (["P0002", "PGRST116"].includes(code)) return "NOT_FOUND";
  if (code === "23505") return "RECIPIENT_GUEST_CONFLICT";
  if (["23503", "23514", "23502", "22023", "22P02"].includes(code)) return "INVALID_INPUT";
  if (code === "P0001" && error && typeof error === "object" && "message" in error) {
    const message = String(error.message).toLowerCase();
    if (/not authenticated|authentication required|not.*member|access denied|permission|not allowed/.test(message)) return "FORBIDDEN";
    if (/not found|does not exist|(credential|token|link).*(missing|unavailable|not available)|missing.*credential/.test(message)) return "NOT_FOUND";
    if (/(response|rsvp).*(guest|composition)|(guest|composition).*(response|rsvp)/.test(message)) return "RECIPIENT_GUESTS_LOCKED";
    if (/already.*recipient|already.*assigned|already.*linked/.test(message)) return "RECIPIENT_GUEST_CONFLICT";
    if (/required|invalid|at least one|primary|contact|belongs.*project/.test(message)) return "INVALID_INPUT";
  }
  return "RECIPIENT_ACTION_FAILED";
}
