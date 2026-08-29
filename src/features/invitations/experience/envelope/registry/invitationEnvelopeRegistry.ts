import type {
  InvitationEnvelopeId,
} from "@/features/invitations/experience/envelope/types/invitationEnvelope.types";


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
        "/invitation-assets/envelopes/classic/back.png",

      front:
        "/invitation-assets/envelopes/classic/front.png",

      flap:
        "/invitation-assets/envelopes/classic/flap.png",

      liner:
        "/invitation-assets/envelopes/classic/liner.png",
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