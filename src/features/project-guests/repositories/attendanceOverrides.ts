import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { AttendanceOverride } from "../types/attendance";
export async function getAttendanceOverrides(invitationId:string) {
 const db=await createServerClient();
 const {data,error}=await db.from("invitation_attendance_overrides").select("*").eq("invitation_id",invitationId);
 if(error?.code==="PGRST205" || error?.code==="42P01") return {rows:[],setupRequired:true};
 if(error) throw error;
 const rows: AttendanceOverride[] = (data ?? []).map(row => {
  if (row.status !== "attending" && row.status !== "not_attending") {
   throw new Error("Invalid attendance override status");
  }
  return { ...row, status: row.status };
 });
 return {rows,setupRequired:false};
}
