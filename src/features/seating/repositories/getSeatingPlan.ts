import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { SeatingDatabase } from "@/features/project-guests/types/database";
import { resolveGuestRsvp } from "@/features/project-guests/utils/resolveRsvp";
import { sortSeatingTables } from "../validation/seatingUx";
import { getAttendanceOverrides } from "@/features/project-guests/repositories/attendanceOverrides";
import { getSeatingElements } from "./getSeatingElements";
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
    const elements = await getSeatingElements(plan.id, plan.project_id);
    const [people, members, tables, assignments] = await Promise.all([db.from("project_guests").select("*").eq("project_id", plan.project_id), db.from("seating_plan_guests").select("*").eq("plan_id", plan.id), db.from("seating_tables").select("*").eq("plan_id", plan.id), db.from("seating_assignments").select("*").eq("plan_id", plan.id)]);
    for (const result of [people, members, tables, assignments])
        if (result.error)
            throw result.error;
    const attendance: Record<string, {
        status: "attending" | "not_attending" | undefined;
        conflict: boolean;
        hasInvitationLink: boolean;
        manual: boolean;
    }> = {};
    let invitationGroups: {id:string;name:string}[]=[];
    const guestGroups:Record<string,string>={};
    const unlinkedGenericGuests:{id:string;first_name:string;last_name:string|null;status:"attending"|"not_attending";submitted_at:string}[]=[];
    let attendanceSetupRequired=false;
    if (plan.rsvp_invitation_id) {
        const [invGuests, responses, links, groups, overrides] = await Promise.all([db.from("invitation_guests").select("*").eq("invitation_id", plan.rsvp_invitation_id), db.from("rsvp_responses").select("id,response_type,submitted_at,rsvp_response_guests(id,invitation_guest_id,status,first_name,last_name)").eq("invitation_id", plan.rsvp_invitation_id).order("submitted_at").order("id"), db.from("invitation_generic_guest_links").select("*").eq("invitation_id", plan.rsvp_invitation_id),db.from("invitation_guest_groups").select("id,name").eq("invitation_id",plan.rsvp_invitation_id).order("name").order("id"),getAttendanceOverrides(plan.rsvp_invitation_id)]);
        for (const result of [invGuests, responses, links, groups])
            if (result.error)
                throw result.error;
        invitationGroups=groups.data??[];
        attendanceSetupRequired=overrides.setupRequired;
        const overrideStatus=new Map(overrides.rows.map(row=>[row.project_guest_id,row.status]));
        for(const guest of invGuests.data??[]) if(guest.group_id) guestGroups[guest.project_guest_id]=guest.group_id;
        const invitationPeople = new Map((invGuests.data ?? []).map(guest => [guest.id, guest.project_guest_id]));
        const linkedPeople = new Set(invitationPeople.values());
        const genericPeople = new Map((links.data ?? []).map(link => [link.response_guest_id, link.project_guest_id]));
        const personalized = new Map<string, "attending" | "not_attending">();
        const generic = new Map<string, { status: "attending" | "not_attending"; submittedAt: string }[]>();
        for (const response of responses.data ?? []) {
            for (const answer of response.rsvp_response_guests) {
                if (answer.status !== "attending" && answer.status !== "not_attending")
                    throw new Error("Invalid RSVP status");
                if (response.response_type === "personalized" && answer.invitation_guest_id) {
                    const personId = invitationPeople.get(answer.invitation_guest_id);
                    if (personId) personalized.set(personId, answer.status);
                } else if (response.response_type === "generic") {
                    const personId = genericPeople.get(answer.id);
                    if (!personId) {
                        if(!answer.first_name) throw new Error("Generic response guest name missing");
                        unlinkedGenericGuests.push({id:answer.id,first_name:answer.first_name,last_name:answer.last_name,status:answer.status,submitted_at:response.submitted_at});
                        continue;
                    }
                    const answers = generic.get(personId) ?? [];
                    answers.push({ status: answer.status, submittedAt: response.submitted_at });
                    generic.set(personId, answers);
                }
            }
        }
        // Resolve project people before inclusion too, so RSVP attendees can be added to the plan.
        for (const person of people.data ?? []) {
            const manual=overrideStatus.get(person.id);
            attendance[person.id] = { ...resolveGuestRsvp(personalized.get(person.id), generic.get(person.id) ?? []), ...(manual?{status:manual}:{}),manual:!!manual, hasInvitationLink: linkedPeople.has(person.id) };
        }
    }
    return { plan, ...elements, people: people.data ?? [], participants: members.data ?? [], tables: sortSeatingTables(tables.data ?? []), assignments: assignments.data ?? [], attendance, invitationGroups,guestGroups,unlinkedGenericGuests,attendanceSetupRequired };
}
