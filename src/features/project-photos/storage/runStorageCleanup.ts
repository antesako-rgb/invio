import "server-only";
import { cleanupJobsSchema } from "./storageLifecycle.schema";
import { deleteFromBunny } from "@/lib/upload/bunny";
import { claimStorageCleanup, finishStorageCleanup } from "./storageLifecycleRepository";

// Server job entry point, intentionally NOT a server action or public route.
// The operator must schedule this after reviewing/deploying the SQL package.
export async function runStorageCleanup(limit = 10) {
  const jobs = cleanupJobsSchema.parse(await claimStorageCleanup(limit));
  let completed = 0;
  let failed = 0;
  for (const job of jobs) {
    try {
      await deleteFromBunny(job.storage_key);
    } catch {
      failed++;
      await finishStorageCleanup(job.object_id, job.lease_token, false);
      continue;
    }
    // A failed acknowledgement leaves the lease for retry. DELETE is idempotent
    // and canonical keys are never reused, even after deletion.
    await finishStorageCleanup(job.object_id, job.lease_token, true);
    completed++;
  }
  return { completed, failed };
}
