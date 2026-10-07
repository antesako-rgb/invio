"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { ActionResult } from "@/lib/actions/actionResult";
import * as repository from "../../repositories/guests/mutateInvitationGuests";
import * as schemas from "../../validation/invitationGuest.schema";
import { invitationGuestError } from "./invitationGuestError";

async function mutate<T, Output>(input: unknown, schema: z.ZodType<T, z.ZodTypeDef, unknown>, operation: (value: T) => Promise<Output>, group = false): Promise<ActionResult<Output>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const data = await operation(parsed.data);
    revalidatePath("/[locale]/dashboard/invitations/[invitationId]/guests", "page");
    return { success: true, data } as ActionResult<Output>;
  } catch (error) {
    return { success: false, code: invitationGuestError(error, group) };
  }
}
export async function createInvitationGuestAction(input: unknown) { return mutate(input, schemas.createGuestSchema, repository.createInvitationGuest); }
export async function updateInvitationGuestAction(input: unknown) { return mutate(input, schemas.updateGuestSchema, repository.updateInvitationGuest); }
export async function deleteInvitationGuestAction(input: unknown) { return mutate(input, schemas.guestIdSchema, repository.deleteInvitationGuest); }
export async function createInvitationGuestGroupAction(input: unknown) { return mutate(input, schemas.createGroupSchema, repository.createInvitationGuestGroup, true); }
export async function updateInvitationGuestGroupAction(input: unknown) { return mutate(input, schemas.updateGroupSchema, repository.updateInvitationGuestGroup, true); }
export async function deleteInvitationGuestGroupAction(input: unknown) { return mutate(input, schemas.groupIdSchema, repository.deleteInvitationGuestGroup, true); }
