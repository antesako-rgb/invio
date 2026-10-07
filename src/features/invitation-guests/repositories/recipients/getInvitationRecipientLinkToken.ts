import { recipientTokenSchema } from "../../validation/recipientToken.schema";
import { createServerClient } from "@/lib/supabase/server";

export async function getInvitationRecipientLinkToken(recipientId: string): Promise<string> {
  const db = await createServerClient();
  const { data, error } = await db.rpc("get_invitation_recipient_link_token", {
    p_recipient_id: recipientId
  });
  if (error) throw error;
  if (data === null)
    throw {
      code: "P0002"
    };
  const parsed = recipientTokenSchema.safeParse(data);
  if (!parsed.success)
    throw new Error("Invalid recipient credential response");
  return parsed.data;
}
