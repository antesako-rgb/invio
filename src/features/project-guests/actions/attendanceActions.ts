"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { nullableRpcArgs } from "../types/database";
import { getSeatingAssignmentErrorCode } from "@/features/seating/services/seatingError";
const schema=z.object({invitationId:z.string().uuid(),personId:z.string().uuid(),status:z.enum(["attending","not_attending"]).nullable()}).strict();
export async function setGuestAttendanceAction(input:unknown) {
 const parsed=schema.safeParse(input);
 if(process.env.PROJECT_GUESTS_ENABLED!=="true" || !parsed.success) return {success:false as const,code:"INVALID_INPUT"};
 const p=parsed.data,db=await createServerClient();
 try {
  const {data,error,status}=await db.rpc("set_invitation_guest_attendance",nullableRpcArgs<"set_invitation_guest_attendance">({p_invitation_id:p.invitationId,p_project_guest_id:p.personId,p_status:p.status}));
  if(error?.code==="PGRST202" || error?.code==="42883") return {success:false as const,code:"ATTENDANCE_SETUP_REQUIRED"};
  if(error) return {success:false as const,code:getSeatingAssignmentErrorCode(error,status)==="SEATING_UNCONFIRMED"?"ATTENDANCE_UNCONFIRMED":"ATTENDANCE_FAILED"};
  const ack=z.object({project_guest_id:z.literal(p.personId),status:z.literal(p.status)}).safeParse(data);
  if(!ack.success) return {success:false as const,code:"ATTENDANCE_UNCONFIRMED"};
  revalidatePath("/[locale]/dashboard/invitations/[invitationId]/guests","page");
  revalidatePath("/[locale]/dashboard/projects/[projectId]/seating","page");
  revalidatePath("/[locale]/dashboard/projects/[projectId]/seating/[planId]","page");
  return {success:true as const};
 } catch { return {success:false as const,code:"ATTENDANCE_UNCONFIRMED"}; }
}
