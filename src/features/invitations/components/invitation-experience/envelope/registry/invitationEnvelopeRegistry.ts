import type {
  InvitationEnvelopeId,
} from "@/features/invitations/components/invitation-experience/envelope/InvitationEnvelope/types/invitationEnvelope.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEnvelopeAssets {
  back:
    string;

  front:
    string;

  flap:
    string;

  liner:
    string;
}


/* ==========================================================================
   Invitation Envelope Registry
========================================================================== */

export const invitationEnvelopeRegistry:
  Record<
    InvitationEnvelopeId,
    InvitationEnvelopeAssets
  > = {
    classic: {
      back:
        "/invitation-assets/envelopes/classic/back.avif",

      front:
        "/invitation-assets/envelopes/classic/front.avif",

      flap:
        "/invitation-assets/envelopes/classic/flap.avif",

      liner:
        "/invitation-assets/envelopes/classic/liner.avif",
    },

    elegant: {
      back:
        "/invitation-assets/envelopes/elegant/back.png",

      front:
        "/invitation-assets/envelopes/elegant/front.png",

      flap:
        "/invitation-assets/envelopes/elegant/flap.png",

      liner:
        "/invitation-assets/envelopes/elegant/liner.png",
    },
  };