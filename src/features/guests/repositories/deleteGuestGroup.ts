import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Delete Guest Group
========================================================================== */

export async function deleteGuestGroup(
  groupId: string
): Promise<void> {
  const supabase =
    await createServerClient();


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
    console.error(
      "deleteGuestGroup error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}