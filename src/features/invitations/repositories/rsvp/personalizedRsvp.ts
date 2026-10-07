import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { publicRsvpSchema, personalizedRsvpSuccessSchema } from "../../validation/publicRsvp.schema";
import type { PublicRsvp, SubmitPersonalizedRsvpInput } from "../../types/publicRsvp.types";

export async function getPublicRsvp(token: string): Promise<PublicRsvp> {
  const db = await createServerClient();
  const { data, error } = await db.rpc("get_public_rsvp", { p_token: token.trim() });
  if (error) throw error;
  return publicRsvpSchema.parse(data);
}
export async function submitPersonalizedRsvp(input: SubmitPersonalizedRsvpInput): Promise<void> {
  const db = await createServerClient();
  const { data, error } = await db.rpc("submit_rsvp", input);
  if (error) throw error;
  personalizedRsvpSuccessSchema.parse(data);
}
