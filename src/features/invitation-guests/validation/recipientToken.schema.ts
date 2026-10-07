import { z } from "zod";

export const recipientTokenSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const createdRecipientSchema = z.array(z.object({
  recipient_id: z.string().uuid(),
  token: recipientTokenSchema,
})).length(1);
