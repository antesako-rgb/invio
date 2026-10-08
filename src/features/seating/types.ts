import type { Database } from "@/lib/supabase/database.types";
import type { getSeatingWorkspace } from "./repositories/getSeatingWorkspace";
export type SeatingWorkspace = Awaited<ReturnType<typeof getSeatingWorkspace>>;
export type PlanData = NonNullable<SeatingWorkspace["current"]>;
export type SeatingTable = Database["public"]["Tables"]["seating_tables"]["Row"] & { shape: "round" | "rectangle" };
