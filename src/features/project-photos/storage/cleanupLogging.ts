import "server-only";

type Stage = "authorize" | "claim" | "delete" | "acknowledge" | "complete";
const databaseCodes = new Set(["40001", "40P01", "42501", "42883", "42702", "23505", "23503", "22023", "P0001", "PGRST202", "PGRST204"]);

// Never serialize the original error: messages/details may contain credentials or keys.
export function logCleanupFailure(stage: Stage, error: unknown) {
  let code = "UNCLASSIFIED";
  if (error && typeof error === "object" && "code" in error &&
      typeof error.code === "string" && databaseCodes.has(error.code)) code = error.code;
  else if (error instanceof Error && error.name === "ZodError") code = "INVALID_RESULT";
  else if (error instanceof Error && error.name === "TimeoutError") code = "TIMEOUT";
  else if (error instanceof Error && error.name === "AbortError") code = "ABORTED";
  console.error(JSON.stringify({ event: "storage_cleanup", stage, outcome: "failed", code }));
}

export function logCleanupComplete(completed: number, failed: number) {
  console.info(JSON.stringify({ event: "storage_cleanup", stage: "complete", completed, failed }));
}
