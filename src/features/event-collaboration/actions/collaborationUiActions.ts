"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getEvent } from "@/features/events/repositories/getEvent";
import { inviteEventCollaborator } from "../repositories/inviteEventCollaborator";
import { acceptEventCollaborationInvite } from "../repositories/acceptEventCollaborationInvite";
import { declineEventCollaborationInvite } from "../repositories/declineEventCollaborationInvite";

export async function createCollaborationLink(eventId: string, email: string) {
  const input = z.object({ eventId: z.string().uuid(), email: z.string().trim().email().max(320) }).safeParse({ eventId, email });
  if (!input.success) return { success: false as const };
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const event = await getEvent(input.data.eventId);
    if (!user || event?.owner_id !== user.id) return { success: false as const };
    const invite = await inviteEventCollaborator({ p_event_id: event.id, p_email: input.data.email.toLowerCase() });
    revalidatePath("/[locale]/dashboard/dogadaji/[eventId]/suradnici", "page");
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
    const eventId = response === "accept"
      ? await acceptEventCollaborationInvite({ p_token: token.trim() })
      : await declineEventCollaborationInvite({ p_token: token.trim() });
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true as const, eventId };
  } catch {
    return { success: false as const };
  }
}
