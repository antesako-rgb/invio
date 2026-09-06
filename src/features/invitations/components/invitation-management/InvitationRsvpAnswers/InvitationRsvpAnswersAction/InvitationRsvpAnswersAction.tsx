"use client";

import {
  useState,
} from "react";

import {
  BarChart3,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationRsvpAnswersSheet
  from "@/features/invitations/components/invitation-management/InvitationRsvpAnswers/InvitationRsvpAnswersSheet/InvitationRsvpAnswersSheet";

import type {
  InvitationManagementGuest,
} from "@/features/invitations/types/invitationManagement.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import styles
  from "./InvitationRsvpAnswersAction.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRsvpAnswersActionProps {
  questions:
    InvitationRsvpQuestion[];

  guests:
    InvitationManagementGuest[];
}


/* ==========================================================================
   Invitation RSVP Answers Action
========================================================================== */

export default function InvitationRsvpAnswersAction({
  questions,
  guests,
}: InvitationRsvpAnswersActionProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.rsvpSummary"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <button
        type="button"
        className={
          styles.trigger
        }
        onClick={
          () =>
            setIsOpen(
              true
            )
        }
      >
        <BarChart3
          aria-hidden="true"
        />

        {t(
          "viewAnswers"
        )}
      </button>

      <InvitationRsvpAnswersSheet
        open={
          isOpen
        }
        onOpenChange={
          setIsOpen
        }
        questions={
          questions
        }
        guests={
          guests
        }
      />
    </>
  );
}