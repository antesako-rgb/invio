import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { SeatingDatabase } from "@/features/project-guests/types/database";
import { seatingTemplateSchema } from "./seatingTemplate.schema";
import { SEATING_APPEARANCE_RELEASE_ENABLED } from "../appearance/release";
export async function getSeatingTemplates() {
    if (!SEATING_APPEARANCE_RELEASE_ENABLED || process.env.PROJECT_GUESTS_ENABLED !== "true")
        return [];
    const db = await createServerClient<SeatingDatabase>();
    const { data, error } = await db.from("seating_templates").select("*").eq("is_active", true).order("sort_order").order("id");
    if (error)
        throw error;
    return seatingTemplateSchema.array().parse(data ?? []);
}
