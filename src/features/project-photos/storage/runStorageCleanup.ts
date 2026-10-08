import "server-only";
import { cleanupJobsSchema } from "./storageLifecycle.schema";
import { deleteFromBunny } from "@/features/project-photos/storage/bunny";
import { claimStorageCleanup, finishStorageCleanup } from "./storageLifecycleRepository";

import { logCleanupFailure, logCleanupComplete } from "./cleanupLogging";

// Server job entry point, intentionally NOT a server action or public route.
// Called by the signed endpoint; Supabase Cron schedules it every five minutes.
export async function runStorageCleanup(limit = 10) {
  const jobs = await (async () => {
    try { return cleanupJobsSchema.parse(await claimStorageCleanup(limit)); }
    catch (error) { logCleanupFailure("claim", error); throw error; }
  })();
  let completed = 0;
  let failed = 0;
  for (const job of jobs) {
    try {
      await deleteFromBunny(job.storage_key);
    } catch (error) {
      logCleanupFailure("delete", error);
      failed++;
      try { await finishStorageCleanup(job.object_id, job.lease_token, false); }
      catch (ackError) { logCleanupFailure("acknowledge", ackError); throw ackError; }
      continue;
    }
    // A failed acknowledgement leaves the lease for retry. DELETE is idempotent
    // and canonical keys are never reused, even after deletion.
    try { await finishStorageCleanup(job.object_id, job.lease_token, true); }
    catch (error) { logCleanupFailure("acknowledge", error); throw error; }
    completed++;
  }
  logCleanupComplete(completed, failed);
  return { completed, failed };
}
