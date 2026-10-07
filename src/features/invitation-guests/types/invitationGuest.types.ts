import type { Database, Tables } from "@/lib/supabase/database.types";

export type InvitationGuest = Tables<"invitation_guests">;

export type InvitationGuestGroup = Tables<"invitation_guest_groups">;
type RpcArgs<Name extends keyof Database["public"]["Functions"]> = Database["public"]["Functions"][Name]["Args"];
type NullableGuestFields<T> = Omit<T, "p_group_id" | "p_last_name" | "p_notes"> & {
  p_group_id: string | null;
  p_last_name: string | null;
  p_notes: string | null;
};

export type CreateInvitationGuestInput = NullableGuestFields<RpcArgs<"create_invitation_guest">>;

export type UpdateInvitationGuestInput = NullableGuestFields<RpcArgs<"update_invitation_guest">>;

export type CreateInvitationGuestGroupInput = RpcArgs<"create_invitation_guest_group">;

export type UpdateInvitationGuestGroupInput = RpcArgs<"update_invitation_guest_group">;
