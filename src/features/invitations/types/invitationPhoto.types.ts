import type {
  Tables,
} from "@/lib/supabase/database.types";

export type InvitationPhoto =
  Tables<"invitation_photos">;

export type InvitationPhotoWithPhoto =
  InvitationPhoto & {
    photo: Tables<"project_photos">;
  };

export interface InvitationRenderPhoto {
  id: string;
  image_path: string;
  description: string | null;
}