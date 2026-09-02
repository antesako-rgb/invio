"use client";

import {
  useState,
} from "react";

import {
  createInvitationRecipientAction,
} from "@/features/invitations/actions/invitation-recipients/createInvitationRecipientAction";


/* ==========================================================================
   Types
========================================================================== */

export type InvitationRecipientCreateStep =
  | "guests"
  | "settings"
  | "review";

interface UseInvitationRecipientCreateOptions {
  invitationId:
    string;

  onSuccess:
    () => void;
}


/* ==========================================================================
   Use Invitation Recipient Create
========================================================================== */

export function useInvitationRecipientCreate({
  invitationId,
  onSuccess,
}: UseInvitationRecipientCreateOptions) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    step,
    setStep,
  ] =
    useState<InvitationRecipientCreateStep>(
      "guests"
    );

  const [
    selectedGuestIds,
    setSelectedGuestIds,
  ] =
    useState<string[]>(
      []
    );

  const [
    primaryGuestId,
    setPrimaryGuestId,
  ] =
    useState<string | null>(
      null
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Derived State
  ========================================================================== */

  const hasSingleGuest =
    selectedGuestIds.length === 1;


  /* ==========================================================================
     Reset
  ========================================================================== */

  function reset() {
    setStep(
      "guests"
    );

    setSelectedGuestIds(
      []
    );

    setPrimaryGuestId(
      null
    );

    setIsSubmitting(
      false
    );

    setSubmitError(
      null
    );
  }


  /* ==========================================================================
     Guest Selection
  ========================================================================== */

  function handleGuestSelectionChange(
    guestIds: string[]
  ) {
    setSelectedGuestIds(
      guestIds
    );

    if (
      primaryGuestId &&
      !guestIds.includes(
        primaryGuestId
      )
    ) {
      setPrimaryGuestId(
        null
      );
    }
  }


  /* ==========================================================================
     Guest Continue
  ========================================================================== */

  function handleGuestContinue() {
    if (
      selectedGuestIds.length === 0
    ) {
      return;
    }

    if (
      selectedGuestIds.length === 1
    ) {
      setPrimaryGuestId(
        selectedGuestIds[0]
      );

      setStep(
        "review"
      );

      return;
    }

    setStep(
      "settings"
    );
  }


  /* ==========================================================================
     Settings Continue
  ========================================================================== */

  function handleSettingsContinue() {
    if (!primaryGuestId) {
      return;
    }

    setStep(
      "review"
    );
  }


  /* ==========================================================================
     Settings Back
  ========================================================================== */

  function handleSettingsBack() {
    setStep(
      "guests"
    );
  }


  /* ==========================================================================
     Review Back
  ========================================================================== */

  function handleReviewBack() {
    if (hasSingleGuest) {
      setStep(
        "guests"
      );

      return;
    }

    setStep(
      "settings"
    );
  }


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function handleSubmit() {
    if (
      isSubmitting ||
      selectedGuestIds.length === 0 ||
      !primaryGuestId
    ) {
      return;
    }

    setIsSubmitting(
      true
    );

    setSubmitError(
      null
    );

    const result =
      await createInvitationRecipientAction({
        p_invitation_id:
          invitationId,

        p_guest_ids:
          selectedGuestIds,

        p_primary_guest_id:
          primaryGuestId,
      });

    if (!result.success) {
      setSubmitError(
        result.message
      );

      setIsSubmitting(
        false
      );

      return;
    }

    reset();

    onSuccess();
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    step,
    selectedGuestIds,
    primaryGuestId,
    isSubmitting,
    submitError,

    setPrimaryGuestId,

    reset,

    handleGuestSelectionChange,
    handleGuestContinue,
    handleSettingsContinue,
    handleSettingsBack,
    handleReviewBack,
    handleSubmit,
  };
}