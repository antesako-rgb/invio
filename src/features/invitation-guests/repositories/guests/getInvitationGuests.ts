import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { InvitationGuest } from "../../types/invitationGuest.types";

export async function getInvitationGuests(invitationId: string): Promise<InvitationGuest[]> {
  const db = await createServerClient();
  const { data, error } = await db.from("invitation_guests")
    .select("*, person:project_guests!invitation_guests_project_person_fk(first_name,last_name)")
    .eq("invitation_id", invitationId).order("created_at").order("id");
  if (error) throw error;
  const sharedNames = process.env.PROJECT_GUESTS_ENABLED === "true";
  return data.map(({ person, ...guest }) => {
    if (sharedNames && !person) throw new Error("Invitation guest identity missing");
    return sharedNames && person
      ? { ...guest, first_name: person.first_name, last_name: person.last_name }
      : guest;
  }).sort((a, b) => a.first_name.localeCompare(b.first_name)
    || (a.last_name ?? "").localeCompare(b.last_name ?? "") || a.id.localeCompare(b.id));
}
