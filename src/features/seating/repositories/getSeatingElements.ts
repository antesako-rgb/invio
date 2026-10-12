import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { SEATING_ELEMENTS_RELEASE_ENABLED } from "../elements/release";
import { elementDocumentSchema, type SeatingElement } from "../elements/model";
import type { ElementsDatabase } from "../elements/database";

export async function getSeatingElements(planId: string, projectId: string) {
  if (!SEATING_ELEMENTS_RELEASE_ENABLED) return { elements: [] as SeatingElement[], elementsAvailable: false };
  const db = await createServerClient<ElementsDatabase>();
  const { data, error } = await db.from("seating_elements").select("*").eq("plan_id", planId).eq("project_id", projectId);
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return { elements: [] as SeatingElement[], elementsAvailable: false };
    throw error;
  }
  const elements = (data ?? []).map(row => {
    const { id, project_id, plan_id, ...document } = row;
    return { id, project_id, plan_id, ...elementDocumentSchema.parse(document) };
  });
  return { elements, elementsAvailable: true };
}
