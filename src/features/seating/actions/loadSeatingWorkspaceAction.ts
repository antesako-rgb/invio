"use server";
import { z } from "zod";
import { getSeatingWorkspace } from "../repositories/getSeatingWorkspace";
export async function loadSeatingWorkspaceAction(projectId: string, planId: string | null) {
  const input = z.object({ projectId: z.string().uuid(), planId: z.string().uuid().nullable() }).safeParse({ projectId, planId });
  if (!input.success || process.env.PROJECT_GUESTS_ENABLED !== "true") return { success: false as const };
  try { return { success: true as const, data: await getSeatingWorkspace(input.data.projectId, input.data.planId) }; }
  catch { return { success: false as const }; }
}
