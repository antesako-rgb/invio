import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { CreateInvitationGuestInput, UpdateInvitationGuestInput, CreateInvitationGuestGroupInput, UpdateInvitationGuestGroupInput } from "../../types/invitationGuest.types";

export async function createInvitationGuest(input: CreateInvitationGuestInput) {
  const db = await createServerClient();
  // Narrow compatibility assertion for generated scalar argument nullability.
  const { data, error } = await db.rpc("create_invitation_guest", input as Database["public"]["Functions"]["create_invitation_guest"]["Args"]);
  if (error) throw error;
  return data;
}

export async function updateInvitationGuest(input: UpdateInvitationGuestInput) {
  const db = await createServerClient();
  const { data, error } = await db.rpc("update_invitation_guest", input as Database["public"]["Functions"]["update_invitation_guest"]["Args"]);
  if (error) throw error;
  return data;
}

export async function deleteInvitationGuest(input: Database["public"]["Functions"]["delete_invitation_guest"]["Args"]) {
  const db = await createServerClient();
  const { data, error } = await db.rpc("delete_invitation_guest", input);
  if (error) throw error;
  return data;
}

export async function createInvitationGuestGroup(input: CreateInvitationGuestGroupInput) {
  const db = await createServerClient();
  const { data, error } = await db.rpc("create_invitation_guest_group", input);
  if (error) throw error;
  return data;
}

export async function updateInvitationGuestGroup(input: UpdateInvitationGuestGroupInput) {
  const db = await createServerClient();
  const { data, error } = await db.rpc("update_invitation_guest_group", input);
  if (error) throw error;
  return data;
}

export async function deleteInvitationGuestGroup(input: Database["public"]["Functions"]["delete_invitation_guest_group"]["Args"]) {
  const db = await createServerClient();
  const { data, error } = await db.rpc("delete_invitation_guest_group", input);
  if (error) throw error;
  return data;
}
