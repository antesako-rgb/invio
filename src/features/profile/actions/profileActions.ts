"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { Profile } from "../types/profile.types";

const name = z.string().trim().max(100).transform(value => value || null);
const names = z.object({ first_name: name, last_name: name });

export async function updateProfileAction(input: unknown): Promise<ActionResult<Profile>> {
  const parsed = names.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const db = await createServerClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { success: false, code: "FORBIDDEN" };
    const { data, error } = await db.from("profiles").update(parsed.data).eq("id", user.id).select("*").single();
    if (error) throw error;
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, data };
  } catch {
    console.error("updateProfileAction failed");
    return { success: false, code: "SAVE_FAILED" };
  }
}
