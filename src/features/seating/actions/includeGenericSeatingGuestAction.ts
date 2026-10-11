"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs } from "@/features/project-guests/types/database";
import { getSeatingAssignmentErrorCode } from "../services/seatingError";
const schema=z.object({p_plan_id:z.string().uuid(),p_revision:z.number().int().positive().max(Number.MAX_SAFE_INTEGER-1),p_response_guest_id:z.string().uuid(),p_project_guest_id:z.string().uuid().nullable(),p_create_new:z.boolean()}).strict().refine(v=>v.p_create_new?v.p_project_guest_id===null:v.p_project_guest_id!==null);
export async function includeGenericSeatingGuestAction(input:unknown) {
 const parsed=schema.safeParse(input);
 if(process.env.PROJECT_GUESTS_ENABLED!=="true" || !parsed.success) return {success:false as const,code:"SEATING_FAILED"};
 const db=await createServerClient();
 try {
  const {data,error,status}=await db.rpc("include_generic_seating_guest",nullableRpcArgs<"include_generic_seating_guest">(parsed.data));
  if(error?.code==="PGRST202" || error?.code==="42883") return {success:false as const,code:"ATTENDANCE_SETUP_REQUIRED"};
  if(error) return {success:false as const,code:getSeatingAssignmentErrorCode(error,status)};
  const ack=z.object({revision:z.literal(parsed.data.p_revision+1),project_guest_id:z.string().uuid()}).safeParse(data);
  if(!ack.success) return {success:false as const,code:"SEATING_UNCONFIRMED"};
  revalidatePath("/[locale]/dashboard/invitations/[invitationId]/guests","page");
  revalidatePath("/[locale]/dashboard/projects/[projectId]/seating","page");
  return {success:true as const,data:ack.data};
 } catch { return {success:false as const,code:"SEATING_UNCONFIRMED"}; }
}
