"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs, type SeatingDatabase } from "@/features/project-guests/types/database";
const inputSchema = z.object({ projectId: z.string().uuid(), templateId: z.string().uuid(), name: z.string().trim().min(1).max(150), rsvpInvitationId: z.string().uuid().nullable() }).strict();
const resultSchema = z.object({ id: z.string().uuid(), project_id: z.string().uuid(), revision: z.number().int().positive() });
export async function createPlanFromTemplateAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true")
        return { success: false as const };
    const p = inputSchema.safeParse(input);
    if (!p.success)
        return { success: false as const };
    const db = await createServerClient<SeatingDatabase>();
    const { data, error } = await db.rpc("create_seating_plan_from_template", nullableRpcArgs<"create_seating_plan_from_template">({ p_project_id: p.data.projectId, p_template_id: p.data.templateId, p_name: p.data.name, p_rsvp_invitation_id: p.data.rsvpInvitationId }));
    if (error)
        return { success: false as const };
    const result = resultSchema.safeParse(data);
    if (!result.success || result.data.project_id !== p.data.projectId)
        return { success: false as const };
    revalidatePath("/[locale]/dashboard/projects/[projectId]/seating", "page");
    return { success: true as const, data: result.data };
}
