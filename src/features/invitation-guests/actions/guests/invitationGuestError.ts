import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

export function invitationGuestError(error: unknown, group = false): ActionErrorCode {
  if (!error || typeof error !== "object") return "GUEST_ACTION_FAILED";
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message).toLowerCase() : "";
  if (code === "42501" || code === "PGRST301" || code === "PGRST302") return "FORBIDDEN";
  if (code === "P0002" || code === "PGRST116") return "NOT_FOUND";
  if (code === "23505") return group ? "GUEST_GROUP_EXISTS" : "GUEST_ACTION_FAILED";
  if (["23503", "23514", "23502", "22023", "22P02"].includes(code)) return "INVALID_INPUT";
  if (code === "P0001") {
    if (/not authenticated|authentication required|not.*member|access denied|permission|not allowed/.test(message)) return "FORBIDDEN";
    if (/not found|does not exist/.test(message)) return "NOT_FOUND";
    if (/required|invalid|belongs.*project|different project|same project|belongs.*invitation|different invitation|same invitation/.test(message)) return "INVALID_INPUT";
    if (group && /already exists|duplicate/.test(message)) return "GUEST_GROUP_EXISTS";
  }
  return "GUEST_ACTION_FAILED";
}
