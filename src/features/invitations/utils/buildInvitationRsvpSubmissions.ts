import type {
  InvitationRenderGuest,
} from "@/features/invitations/types/invitationRenderer.types";

import type {
  InvitationRsvpAnswers,
  InvitationRsvpStatus,
  InvitationRsvpSubmission,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Build Invitation RSVP Submissions
========================================================================== */

export function buildInvitationRsvpSubmissions(
  guests:
    InvitationRenderGuest[],
  responses:
    Record<
      string,
      InvitationRsvpStatus | undefined
    >,
  answers:
    Record<
      string,
      InvitationRsvpAnswers
    >
): InvitationRsvpSubmission[] {
  return guests.flatMap(
    (guest) => {
      const status =
        responses[
          guest.id
        ];

      if (
        !status
      ) {
        return [];
      }

      return [
        {
          guest_id:
            guest.id,

          status,

          answers:
            status === "attending"
              ? answers[
                  guest.id
                ] ?? {}
              : {},
        },
      ];
    }
  );
}