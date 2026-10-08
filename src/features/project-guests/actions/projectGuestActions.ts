"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs, type SeatingDatabase } from "../types/database";
const schema = z.object({ p_project_id: z.string().uuid(), p_guest_id: z.string().uuid().nullable(), p_operation: z.enum(["create", "update", "archive", "restore", "delete"]), p_first_name: z.string().trim().min(1).max(100).nullable(), p_last_name: z.string().trim().max(100).nullable(), p_notes: z.string().trim().max(2000).nullable() }).strict().refine(v => v.p_operation === "create" || v.p_guest_id !== null).refine(v => !["create", "update"].includes(v.p_operation) || v.p_first_name !== null);
export async function manageProjectGuestAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return { success: false as const }; const p = schema.safeParse(input); if (!p.success)
    return { success: false as const }; const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("manage_project_guest", nullableRpcArgs<"manage_project_guest">(p.data)); if (error)
    return { success: false as const }; revalidatePath("/[locale]/dashboard/invitations/[invitationId]/guests", "page"); return { success: true as const, data }; }
