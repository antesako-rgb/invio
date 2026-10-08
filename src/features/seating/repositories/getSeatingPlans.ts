import "server-only";
import { createServerClient } from "@/lib/supabase/server";
export async function getSeatingPlans(projectId: string) {
  const db = await createServerClient();
  const [plans, tables, guests] = await Promise.all([
    db.from("seating_plans").select("*").eq("project_id", projectId).order("created_at").order("id"),
    db.from("seating_tables").select("plan_id").eq("project_id", projectId),
    db.from("seating_plan_guests").select("plan_id").eq("project_id", projectId),
  ]);
  if (plans.error) throw plans.error;
  if (tables.error) throw tables.error;
  if (guests.error) throw guests.error;
  return plans.data.map(plan => ({ ...plan,
    tableCount: tables.data.filter(table => table.plan_id === plan.id).length,
    participantCount: guests.data.filter(guest => guest.plan_id === plan.id).length,
  }));
}
