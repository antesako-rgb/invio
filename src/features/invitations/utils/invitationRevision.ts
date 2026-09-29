/**
 * PostgREST serializes bigint as JSON numbers.
 * Reject unsafe values, never round.
 */
export function assertInvitationRevision(
  value: unknown
): asserts value is number {
  if (
    typeof value !== "number"
    || !Number.isSafeInteger(
      value
    )
    || value < 1
  ) {
    throw new Error(
      "Invalid or missing invitation revision."
    );
  }
}


/* ==========================================================================
   Invitation Save Conflict
========================================================================== */

export class InvitationSaveConflict
  extends Error {
  constructor() {
    super(
      "Invitation changed in another session."
    );
  }
}