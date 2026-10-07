import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { genericRsvpSuccessSchema } from "../../validation/genericRsvp.schema";
import type { SubmitGenericRsvpInput } from "../../types/genericRsvp.types";
export async function submitGenericRsvp(input: SubmitGenericRsvpInput) {
  const db = await createServerClient();
  const { data, error } = await db.rpc("submit_generic_rsvp", input);
  if (error) throw error;
  return genericRsvpSuccessSchema.parse(data);
}
