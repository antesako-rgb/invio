"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { getSeatingAssignmentErrorCode } from "../services/seatingError";
import { isRsvpSyncConfirmed } from "../validation/rsvpSync";

const inputSchema = z.object({ p_project_id: z.string().uuid(), p_plan_id: z.string().uuid(), p_revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1) }).strict();

export async function syncSeatingRsvpGuestsAction(input: unknown) {
  const parsed = inputSchema.safeParse(input);
  if (process.env.PROJECT_GUESTS_ENABLED !== "true" || !parsed.success)
    return { success: false as const, code: "SEATING_FAILED" };
  const db = await createServerClient();
  try {
    const { data, error, status } = await db.rpc("sync_seating_rsvp_guests", parsed.data);
    if (error?.code === "PGRST202" || error?.code === "42883")
      return { success: false as const, code: "SEATING_RSVP_SETUP_REQUIRED" };
    if (error) return { success: false as const, code: getSeatingAssignmentErrorCode(error, status) };
    if (!isRsvpSyncConfirmed(data, parsed.data.p_revision))
      return { success: false as const, code: "SEATING_UNCONFIRMED" };
    if (data.added_count > 0) revalidatePath("/[locale]/dashboard/projects/[projectId]/seating", "page");
    return { success: true as const, data: { revision:data.revision,added_count:data.added_count } };
  } catch {
    return { success: false as const, code: "SEATING_UNCONFIRMED" };
  }
}
