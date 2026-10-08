import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { SeatingDatabase } from "@/features/project-guests/types/database";
import { resolveGuestRsvp } from "@/features/project-guests/utils/resolveRsvp";
export async function getSeatingPlan(planId: string) {
    if (process.env.PROJECT_GUESTS_ENABLED !== "true")
        return null;
    const db = await createServerClient<SeatingDatabase>();
    const planResult = await db.from("seating_plans").select("*").eq("id", planId).maybeSingle();
    if (planResult.error)
        throw planResult.error;
    const plan = planResult.data;
    if (!plan)
        return null;
    const [people, members, tables, assignments] = await Promise.all([db.from("project_guests").select("*").eq("project_id", plan.project_id), db.from("seating_plan_guests").select("*").eq("plan_id", plan.id), db.from("seating_tables").select("*").eq("plan_id", plan.id), db.from("seating_assignments").select("*").eq("plan_id", plan.id)]);
    for (const result of [people, members, tables, assignments])
        if (result.error)
            throw result.error;
    const attendance: Record<string, {
        status: "attending" | "not_attending" | undefined;
        conflict: boolean;
        hasInvitationLink: boolean;
    }> = {};
    if (plan.rsvp_invitation_id) {
        const [invGuests, responses, links] = await Promise.all([db.from("invitation_guests").select("*").eq("invitation_id", plan.rsvp_invitation_id), db.from("rsvp_responses").select("id,response_type,submitted_at,rsvp_response_guests(id,invitation_guest_id,status)").eq("invitation_id", plan.rsvp_invitation_id), db.from("invitation_generic_guest_links").select("*").eq("invitation_id", plan.rsvp_invitation_id)]);
        for (const result of [invGuests, responses, links])
            if (result.error)
                throw result.error;
        for (const member of members.data ?? []) {
            const invitationGuest = invGuests.data?.find(g => g.project_guest_id === member.project_guest_id);
            let personalized: "attending" | "not_attending" | undefined;
            const generic: {
                status: "attending" | "not_attending";
                submittedAt: string;
            }[] = [];
            for (const response of responses.data ?? [])
                for (const answer of response.rsvp_response_guests) {
                    if (answer.status !== "attending" && answer.status !== "not_attending")
                        throw new Error("Invalid RSVP status");
                    if (response.response_type === "personalized" && invitationGuest && answer.invitation_guest_id === invitationGuest.id)
                        personalized = answer.status;
                    else if (response.response_type === "generic" && links.data?.some(l => l.response_guest_id === answer.id && l.project_guest_id === member.project_guest_id))
                        generic.push({ status: answer.status, submittedAt: response.submitted_at });
                }
            attendance[member.project_guest_id] = { ...resolveGuestRsvp(personalized, generic), hasInvitationLink: !!invitationGuest };
        }
    }
    return { plan, people: people.data ?? [], participants: members.data ?? [], tables: tables.data ?? [], assignments: assignments.data ?? [], attendance };
}
