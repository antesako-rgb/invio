"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs, type SeatingDatabase } from "../types/database";
const generic = z.object({ responseGuestId: z.string().uuid(), guestId: z.string().uuid().nullable(), createNew: z.boolean() }).strict().refine(v => v.createNew ? v.guestId === null : v.guestId !== null);
function refresh() { revalidatePath("/[locale]/dashboard/invitations/[invitationId]/guests", "page"); }
export async function linkGenericGuestAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true")
        return { success: false as const };
    const p = generic.safeParse(input);
    if (!p.success)
        return { success: false as const };
    const db = await createServerClient<SeatingDatabase>();
    const { error } = await db.rpc("link_generic_rsvp_guest", nullableRpcArgs<"link_generic_rsvp_guest">({ p_response_guest_id: p.data.responseGuestId, p_project_guest_id: p.data.guestId, p_create_new: p.data.createNew }));
    if (error)
        return { success: false as const };
    refresh();
    return { success: true as const };
}
export async function unlinkGenericGuestAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true")
        return { success: false as const };
    const p = z.string().uuid().safeParse(input);
    if (!p.success)
        return { success: false as const };
    const db = await createServerClient<SeatingDatabase>();
    const { error } = await db.rpc("unlink_generic_rsvp_guest", nullableRpcArgs<"unlink_generic_rsvp_guest">({ p_response_guest_id: p.data }));
    if (error)
        return { success: false as const };
    refresh();
    return { success: true as const };
}
