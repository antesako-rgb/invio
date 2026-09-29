"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getProject } from "@/features/projects/repositories/getProject";
import { inviteProjectCollaborator } from "../repositories/inviteProjectCollaborator";
import { acceptProjectCollaborationInvite } from "../repositories/acceptProjectCollaborationInvite";
import { declineProjectCollaborationInvite } from "../repositories/declineProjectCollaborationInvite";

export async function createCollaborationLink(projectId: string, email: string) {
  const input = z.object({ projectId: z.string().uuid(), email: z.string().trim().email().max(320) }).safeParse({ projectId, email });
  if (!input.success) return { success: false as const };
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const project = await getProject(input.data.projectId);
    if (!user || project?.owner_id !== user.id) return { success: false as const };
    const invite = await inviteProjectCollaborator({ p_project_id: project.id, p_email: input.data.email.toLowerCase() });
    revalidatePath("/[locale]/dashboard/projects/[projectId]/collaborators", "page");
    return { success: true as const, token: invite.token, expiresAt: invite.expires_at };
  } catch {
    return { success: false as const };
  }
}

export async function respondToCollaborationInvite(token: string, response: "accept" | "decline") {
  if (!z.string().trim().min(1).max(2048).safeParse(token).success || !["accept", "decline"].includes(response)) {
    return { success: false as const };
  }
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const };
    // Recipient identity, expiry and single-use checks remain in the existing RPC.
    const projectId = response === "accept"
      ? await acceptProjectCollaborationInvite({ p_token: token.trim() })
      : await declineProjectCollaborationInvite({ p_token: token.trim() });
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true as const, projectId };
  } catch {
    return { success: false as const };
  }
}
