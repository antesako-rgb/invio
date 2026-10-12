"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { SEATING_APPEARANCE_RELEASE_ENABLED, SEATING_PRESET_STYLES_RELEASE_ENABLED } from "../appearance/release";
import { normalizePreset, presetActionSchema, presetRoomPatchSchema } from "../appearance/presets";
import { nullableRpcArgs, type SeatingDatabase } from "@/features/project-guests/types/database";
import { getSeatingAssignmentErrorCode } from "../services/seatingError";
export async function setSeatingAppearanceAction(input: unknown) {
    if (!SEATING_APPEARANCE_RELEASE_ENABLED || !SEATING_PRESET_STYLES_RELEASE_ENABLED || process.env.PROJECT_GUESTS_ENABLED !== "true")
        return { success: false as const, code: "APPEARANCE_UNAVAILABLE" };
    const parsed = presetActionSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, code: "APPEARANCE_INVALID" };
    const p = parsed.data;
    try {
        const db = await createServerClient<SeatingDatabase>();
        let target: "room" | "table_theme" | "dance_floor" | "stage" | "dj_booth" = p.target === "element" ? "dance_floor" : p.target;
        if (p.target === "element") {
            const row = await db.from("seating_elements").select("kind").eq("id", p.id!).eq("plan_id", p.planId).maybeSingle();
            if (row.error || !row.data || !["dance_floor", "stage", "dj_booth"].includes(row.data.kind))
                return { success: false as const, code: "APPEARANCE_INVALID" };
            target = row.data.kind as typeof target;
        }
        const normalized = target === "room" ? presetRoomPatchSchema.parse(p.appearance) : normalizePreset(target, p.appearance);
        const { data, error, status } = await db.rpc("set_seating_appearance", nullableRpcArgs<"set_seating_appearance">({
            p_plan_id: p.planId, p_revision: p.revision, p_target: p.target,
            p_object_id: p.id, p_appearance: normalized, p_all: p.all,
        }));
        if (error) return { success: false as const, code: getSeatingAssignmentErrorCode(error, status) };
        const result = z.object({ revision: z.number().int().positive(), affected: z.literal(1) }).safeParse(data);
        if (!result.success || result.data.revision !== p.revision + 1)
            return { success: false as const, code: "SEATING_UNCONFIRMED" };
        revalidatePath("/[locale]/dashboard/projects/[projectId]/seating", "page");
        return { success: true as const, data: result.data.revision };
    } catch (error) {
        return { success: false as const, code: error instanceof z.ZodError ? "APPEARANCE_INVALID" : "SEATING_UNCONFIRMED" };
    }
}
