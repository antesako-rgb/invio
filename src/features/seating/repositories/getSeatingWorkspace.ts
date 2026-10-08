import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getSeatingPlan } from "./getSeatingPlan";
import { getSeatingTemplates } from "../templates/getSeatingTemplates";

export async function getSeatingWorkspace(projectId: string, planId: string | null = null) {
  const db = await createServerClient();
  const [plans, invitations, templates] = await Promise.all([
    db.from("seating_plans").select("*").eq("project_id", projectId).order("created_at").order("id"),
    db.from("invitations").select("id,name").eq("project_id", projectId).order("name"),
    getSeatingTemplates(),
  ]);
  if (plans.error) throw plans.error;
  if (invitations.error) throw invitations.error;
  // Only load a plan selected from this project's RLS-visible plans.
  const selected = planId && plans.data.some(plan => plan.id === planId) ? planId : null;
  const current = selected ? await getSeatingPlan(selected) : null;
  return { plans: plans.data, invitations: invitations.data, templates: templates.map(({ id, name }) => ({ id, name })), current };
}
