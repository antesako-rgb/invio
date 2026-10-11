"use server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs, type SeatingDatabase } from "@/features/project-guests/types/database";
import * as schema from "../validation/seating.schema";
import { getStandardTableUpdates } from "../validation/tableDimensions";
import { seatingGeometryFits } from "../validation/seatingGeometry";
import { updateTableSizes } from "../services/updateTableSizes";
import { getSeatingAssignmentErrorCode, getSeatingErrorCode } from "../services/seatingError";
import type { SeatingTable } from "../types";
import { getDefaultRsvpInvitation } from "../repositories/getDefaultRsvpInvitation";
function success<T>(data: T) { revalidatePath("/[locale]/dashboard/projects/[projectId]/seating", "page"); return { success: true as const, data }; }
function failure(error: unknown) {
    return { success: false as const, code: getSeatingErrorCode(error) };
}
export async function manageSeatingPlanAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.planSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>();
    if (p.data.p_operation === "create" && p.data.p_rsvp_invitation_id === null)
        p.data.p_rsvp_invitation_id = await getDefaultRsvpInvitation(db, p.data.p_project_id);
    const { data, error } = await db.rpc("manage_seating_plan", nullableRpcArgs<"manage_seating_plan">(p.data)); return error ? failure(error) : success(data); }
export async function manageSeatingParticipantAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.participantSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("manage_seating_participant", nullableRpcArgs<"manage_seating_participant">(p.data)); return error ? failure(error) : success(data); }
export async function manageSeatingTableAction(input: unknown) { if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return failure(null); const p = schema.tableSchema.safeParse(input); if (!p.success)
    return failure(null); const db = await createServerClient<SeatingDatabase>(); const { data, error } = await db.rpc("manage_seating_table", nullableRpcArgs<"manage_seating_table">(p.data)); return error ? failure(error) : success(data); }
export async function assignSeatingGuestAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true") return failure(null);
    const parsed = schema.assignmentSchema.safeParse(input);
    if (!parsed.success) return failure(null);
    const db = await createServerClient<SeatingDatabase>();
    try {
        const { data, error, status } = await db.rpc("assign_seating_guest", nullableRpcArgs<"assign_seating_guest">(parsed.data));
        return error ? { success: false as const, code: getSeatingAssignmentErrorCode(error, status) } : success(data);
    } catch {
        return { success: false as const, code: "SEATING_UNCONFIRMED" as const };
    }
}

export async function assignSeatingGuestToSeatAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true") return failure(null);
    const parsed = schema.seatAssignmentSchema.safeParse(input);
    if (!parsed.success) return failure(null);
    const db = await createServerClient<SeatingDatabase>();
    try {
        const { data, error, status } = await db.rpc(
            "assign_seating_guest_to_seat",
            nullableRpcArgs<"assign_seating_guest_to_seat">(parsed.data),
        );
        return error ? { success: false as const, code: getSeatingAssignmentErrorCode(error, status) } : success(data);
    } catch {
        return { success: false as const, code: "SEATING_UNCONFIRMED" as const };
    }
}

export async function standardizeSeatingTablesAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true") return failure(null);
    const parsed = schema.standardizeTablesSchema.safeParse(input);
    if (!parsed.success) return failure(null);
    const p = parsed.data, db = await createServerClient<SeatingDatabase>();
    const planResult = await db.from("seating_plans").select("id,width_cm,height_cm,revision").eq("id",p.p_plan_id).maybeSingle();
    if (planResult.error || !planResult.data) return failure(planResult.error);
    const plan = planResult.data;
    if (plan.revision !== p.p_revision) return { success: false as const, code: "REVISION_CONFLICT" };
    const tableResult = await db.from("seating_tables").select("*").eq("plan_id",plan.id);
    if (tableResult.error) return failure(tableResult.error);
    const tables: SeatingTable[] = (tableResult.data ?? []).map(table => {
        if (table.shape !== "round" && table.shape !== "rectangle") throw new Error("Invalid table shape");
        return { ...table,shape:table.shape };
    });
    const updates = getStandardTableUpdates(tables,p.p_shape,plan.width_cm,plan.height_cm);
    if (updates.some(table => !seatingGeometryFits(table,plan.width_cm,plan.height_cm)))
        return { success: false as const, code: "STANDARDIZE_GEOMETRY" };
    const result = await updateTableSizes(updates,p.p_revision,async (table,revision) => {
        const { data,error } = await db.rpc("manage_seating_table",{
            p_plan_id:plan.id,p_revision:revision,p_table_id:table.id,p_operation:"update",
            p_name:table.name,p_shape:table.shape,p_capacity:table.capacity,p_x_cm:table.x_cm,p_y_cm:table.y_cm,
            p_width_cm:table.width_cm,p_height_cm:table.height_cm,p_rotation_deg:table.rotation_deg,
        });
        return error ? failure(error) : { success:true as const,data };
    });
    revalidatePath("/[locale]/dashboard/projects/[projectId]/seating","page");
    return result;
}

export async function assignSeatingGuestsAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true") return failure(null);
    const parsed = schema.batchSeatingSchema.safeParse(input);
    if (!parsed.success) return failure(null);
    const db = await createServerClient<SeatingDatabase>();
    try {
        const { data, error, status } = await db.rpc(
            "assign_seating_guests",
            nullableRpcArgs<"assign_seating_guests">(parsed.data),
        );
        if (error?.code === "PGRST202" || error?.code === "42883")
            return { success: false as const, code: "SEATING_UPGRADE_REQUIRED" as const };
        return error ? { success: false as const, code: getSeatingAssignmentErrorCode(error, status) } : success(data);
    } catch {
        return { success: false as const, code: "SEATING_UNCONFIRMED" as const };
    }
}

export async function assignSeatingGuestsToSeatsAction(input: unknown) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true") return failure(null);
    const parsed = schema.manualBatchSchema.safeParse(input);
    if (!parsed.success) return failure(null);
    const db = await createServerClient<SeatingDatabase>();
    try {
        const { data, error, status } = await db.rpc("assign_seating_guests_to_seats", parsed.data);
        if (error?.code === "PGRST202" || error?.code === "42883")
            return { success: false as const, code: "SEATING_MANUAL_UPGRADE_REQUIRED" as const };
        return error ? { success: false as const, code: getSeatingAssignmentErrorCode(error, status) } : success(data);
    } catch {
        return { success: false as const, code: "SEATING_UNCONFIRMED" as const };
    }
}
