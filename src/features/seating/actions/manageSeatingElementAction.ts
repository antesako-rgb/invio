"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { elementActionSchema } from "../elements/model";
import { SEATING_ELEMENTS_RELEASE_ENABLED } from "../elements/release";
import type { ElementsDatabase } from "../elements/database";
import { getSeatingAssignmentErrorCode } from "../services/seatingError";
import { nullableRpcArgs } from "@/features/project-guests/types/database";

export async function manageSeatingElementAction(input: unknown) {
  if (!SEATING_ELEMENTS_RELEASE_ENABLED || process.env.PROJECT_GUESTS_ENABLED !== "true")
    return { success: false as const, code: "ELEMENTS_UNAVAILABLE" };
  const parsed = elementActionSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, code: "ELEMENT_GEOMETRY" };
  const p = parsed.data;
  const db = await createServerClient<ElementsDatabase>();
  try {
    const { data, error, status } = await db.rpc("manage_seating_element", nullableRpcArgs<"manage_seating_element">({
      p_plan_id: p.planId, p_revision: p.revision, p_element_id: p.operation === "create" ? null : p.id,
      p_operation: p.operation, p_element: p.operation === "delete" ? null : p.element,
    }));
    if (error?.code === "PGRST202" || error?.code === "42883") return { success: false as const, code: "ELEMENTS_UNAVAILABLE" };
    if (error) return { success: false as const, code: getSeatingAssignmentErrorCode(error, status) };
    const result = z.object({ id: z.string().uuid(), revision: z.number().int().positive() }).safeParse(data);
    if (!result.success || result.data.revision !== p.revision + 1 || (p.operation !== "create" && result.data.id !== p.id))
      return { success: false as const, code: "SEATING_UNCONFIRMED" };
    revalidatePath("/[locale]/dashboard/projects/[projectId]/seating", "page");
    return { success: true as const, data: result.data };
  } catch { return { success: false as const, code: "SEATING_UNCONFIRMED" }; }
}
