import {
  supabase,
} from "@/lib/supabase/client";


/* ==========================================================================
   Delete Guest Group
========================================================================== */

export async function deleteGuestGroup(
  groupId: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from("guest_groups")
      .delete()
      .eq(
        "id",
        groupId
      );

  if (error) {
    throw error;
  }
}