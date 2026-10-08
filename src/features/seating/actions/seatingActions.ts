"use server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs, type SeatingDatabase } from "@/features/project-guests/types/database";
import * as schema from "../validation/seating.schema";
function success<T>(data: T) { revalidatePath("/[locale]/dashboard/projects/[projectId]/seating", "page"); return { success: true as const, data }; }
function failure(error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
        if (error.message === "Table full" || error.message === "Capacity below occupancy") return { success: false as const, code: "CAPACITY" };
        if (error.message === "Active person missing" || error.message === "Person archived") return { success: false as const, code: "ARCHIVED" };
    } return { success: false as const, code: error && typeof error === "object" && "code" in error && error.code === "40001" ? "REVISION_CONFLICT" : "SEATING_FAILED" }; }
export async function manageSeatingPlanAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.planSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("manage_seating_plan", nullableRpcArgs<"manage_seating_plan">(p.data)); return error ? failure(error) : success(data); }
export async function manageSeatingParticipantAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.participantSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("manage_seating_participant", nullableRpcArgs<"manage_seating_participant">(p.data)); return error ? failure(error) : success(data); }
export async function manageSeatingTableAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.tableSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("manage_seating_table", nullableRpcArgs<"manage_seating_table">(p.data)); return error ? failure(error) : success(data); }
export async function assignSeatingGuestAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.assignmentSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("assign_seating_guest", nullableRpcArgs<"assign_seating_guest">(p.data)); return error ? failure(error) : success(data); }
