import { z } from "zod";
const optionalText = (limit: number) => z.string().trim().max(limit).nullable().transform(value => value || null);

export const guestFieldsSchema = z.object({
  p_first_name: z.string().trim().min(1).max(100),
  p_last_name: optionalText(100),
  p_notes: optionalText(2000),
  p_group_id: z.string().uuid().nullable(),
}).strict();

export const createGuestSchema = guestFieldsSchema.extend({
  p_invitation_id: z.string().uuid()
});

export const updateGuestSchema = guestFieldsSchema.extend({
  p_guest_id: z.string().uuid()
});

export const createGroupSchema = z.object({
  p_invitation_id: z.string().uuid(),
  p_name: z.string().trim().min(1).max(150)
}).strict();

export const updateGroupSchema = z.object({
  p_group_id: z.string().uuid(),
  p_name: z.string().trim().min(1).max(150)
}).strict();

export const guestIdSchema = z.object({
  p_guest_id: z.string().uuid()
}).strict();

export const groupIdSchema = z.object({
  p_group_id: z.string().uuid()
}).strict();
