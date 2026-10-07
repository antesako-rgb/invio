import { z } from "zod";
const contact = (min: number, max: number, lowercase = false) => z.string()
  .trim()
  .nullable()
  .transform(value => {
    if (!value) return null;
    return lowercase ? value.toLowerCase() : value;
  })
  .pipe(z.string().min(min).max(max).nullable());

export const recipientFieldsSchema = z.object({
  p_email: contact(3, 320, true),
  p_phone: contact(1, 50),
  p_guest_ids: z.array(z.string().uuid()).min(1).refine(ids => new Set(ids).size === ids.length),
  p_primary_guest_id: z.string().uuid(),
}).strict();
function integrity(value: z.infer<typeof recipientFieldsSchema>, ctx: z.RefinementCtx) {
  if (!value.p_guest_ids.includes(value.p_primary_guest_id))
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["p_primary_guest_id"],
      message: "primary"
    });
}

export const recipientFormSchema = recipientFieldsSchema.superRefine(integrity);

export const createRecipientSchema = recipientFieldsSchema.extend({
  p_invitation_id: z.string().uuid()
}).superRefine(integrity);

export const updateRecipientSchema = recipientFieldsSchema.extend({
  p_recipient_id: z.string().uuid()
}).superRefine(integrity);

export const deleteRecipientSchema = z.object({
  p_recipient_id: z.string().uuid()
}).strict();
