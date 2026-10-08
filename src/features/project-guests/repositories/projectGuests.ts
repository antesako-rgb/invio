import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { SeatingDatabase } from "../types/database";
export async function getProjectGuests(projectId: string) {
    const db = await createServerClient<SeatingDatabase>();
    const [people, memberships, invitations] = await Promise.all([
        db.from("project_guests").select("*").eq("project_id", projectId).order("first_name").order("id"),
        db.from("invitation_guests").select("project_guest_id,invitation_id").eq("project_id", projectId),
        db.from("invitations").select("id,name").eq("project_id", projectId),
    ]);
    if (people.error) throw people.error;
    if (memberships.error) throw memberships.error;
    if (invitations.error) throw invitations.error;
    const names = new Map(invitations.data.map(invitation => [invitation.id, invitation.name]));
    return people.data.map(person => {
        const invitationIds = memberships.data.filter(link => link.project_guest_id === person.id).map(link => link.invitation_id);
        const invitationNames = [...new Set(invitationIds.flatMap(id => {
            const name = names.get(id);
            return name ? [name] : [];
        }))].sort((a, b) => a.localeCompare(b));
        return { ...person, invitationIds, invitationNames };
    });
}
export async function getGenericGuestLinks(invitationId: string) {
    const db = await createServerClient<SeatingDatabase>();
    const { data, error } = await db.from("invitation_generic_guest_links").select("*").eq("invitation_id", invitationId);
    if (error)
        throw error;
    return data;
}
