import type { Database } from "@/lib/supabase/database.types";
export type AttendanceStatus = "attending" | "not_attending";
export type AttendanceOverride = Database["public"]["Tables"]["invitation_attendance_overrides"]["Row"] & {
 status: AttendanceStatus;
};
