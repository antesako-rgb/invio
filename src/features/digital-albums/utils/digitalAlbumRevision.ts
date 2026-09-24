/**
 * PostgREST serializes bigint as JSON numbers.
 * Reject unsafe values, never round.
 */
export function assertDigitalAlbumRevision(
  value:
    unknown
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(
      value
    ) ||
    value < 1
  ) {
    throw new Error(
      "Invalid or missing album revision."
    );
  }
}


/* ==========================================================================
   Digital Album Save Conflict
========================================================================== */

export class DigitalAlbumSaveConflict
  extends Error {
  constructor() {
    super(
      "Album changed in another session."
    );
  }
}