export type RsvpSyncResult = { revision: number; added_count: number };

export function isRsvpSyncConfirmed(value: unknown, previousRevision: number): value is RsvpSyncResult {
  if (!value || typeof value !== "object" || !("revision" in value) || !("added_count" in value)) return false;
  return Number.isSafeInteger(value.revision) && typeof value.added_count === "number"
    && Number.isSafeInteger(value.added_count) && value.added_count >= 0
    && value.revision === previousRevision + (value.added_count > 0 ? 1 : 0);
}
