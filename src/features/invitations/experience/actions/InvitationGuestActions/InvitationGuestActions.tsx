"use client";

import {
  Heart,
  Info,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import "./InvitationGuestActions.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationGuestActionsProps {
  onDetails?:
    () => void;

  onRsvp?:
    () => void;
}


/* ==========================================================================
   Invitation Guest Actions
========================================================================== */

export default function InvitationGuestActions({
  onDetails,
  onRsvp,
}: InvitationGuestActionsProps) {
  const t =
    useTranslations(
      "Invitations.experience.actions"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-guest-actions"
      data-invitation-guest-actions
    >
      {onDetails && (
        <button
          type="button"
          className="
            invitation-guest-actions__button
            invitation-guest-actions__button--secondary
          "
          onClick={
            onDetails
          }
        >
          <Info
            className="invitation-guest-actions__icon"
            aria-hidden="true"
          />

          <span>
            {t(
              "details"
            )}
          </span>
        </button>
      )}

      {onRsvp && (
        <button
          type="button"
          className="
            invitation-guest-actions__button
            invitation-guest-actions__button--primary
          "
          onClick={
            onRsvp
          }
        >
          <Heart
            className="invitation-guest-actions__icon"
            aria-hidden="true"
          />

          <span>
            {t(
              "rsvp"
            )}
          </span>
        </button>
      )}
    </div>
  );
}