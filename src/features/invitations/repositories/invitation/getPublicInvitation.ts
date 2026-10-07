import {
  z,
} from "zod";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  parseInvitationDocument,
} from "../../utils/parseInvitationDocument";


/* ==========================================================================
   Schema
========================================================================== */

const publicInvitationSchema =
  z.object({
    invitation:
      z.object({
        public_id:
          z.string()
            .min(1),

        name:
          z.string(),

        published_at:
          z.string(),
        generic_rsvp_enabled: z.boolean(),
        generic_rsvp_max_guests: z.number().int().min(1),
        generic_rsvp_capacity: z.number().int().min(1).nullable(),

        document:
          z
            .unknown()
            .transform(
              parseInvitationDocument
            ),

        document_version:
          z.literal(1),
      }),

    photos:
      z.array(
        z.object({
          id:
            z.string()
              .uuid(),

          image_path:
            z.string()
              .min(1),

          description:
            z.string()
              .nullable(),
        })
      ),
  });


/* ==========================================================================
   Get Public Invitation
========================================================================== */

export async function getPublicInvitation(
  publicId: string
) {
  const normalizedPublicId =
    publicId.trim();

  if (
    !normalizedPublicId
    || normalizedPublicId.length > 150
  ) {
    return null;
  }

  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_invitation",
      {
        p_public_id:
          normalizedPublicId,
      }
    );

  if (
    error?.code === "P0002"
  ) {
    return null;
  }

  if (error) {
    throw error;
  }

  return publicInvitationSchema.parse(
    data
  );
}
