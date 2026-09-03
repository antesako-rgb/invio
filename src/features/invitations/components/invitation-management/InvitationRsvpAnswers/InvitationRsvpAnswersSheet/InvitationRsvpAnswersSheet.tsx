"use client";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  MessageSquareText,
  Users,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet/Sheet";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import InvitationRecipientDetails
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientDetails/InvitationRecipientDetails";

import InvitationRsvpGuests
  from "@/features/invitations/components/invitation-management/InvitationRsvpAnswers/InvitationRsvpGuests/InvitationRsvpGuests";

import InvitationRsvpQuestionSummary
  from "@/features/invitations/components/invitation-management/InvitationRsvpAnswers/InvitationRsvpQuestionSummary/InvitationRsvpQuestionSummary";

import type {
  InvitationRecipientDetails as InvitationRecipientDetailsType,
} from "@/features/invitations/types/invitationRecipient.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import styles
  from "./InvitationRsvpAnswersSheet.module.css";


/* ==========================================================================
   Types
========================================================================== */

type InvitationRsvpAnswersTab =
  | "guests"
  | "answers";


interface InvitationRsvpAnswersSheetProps {
  open:
    boolean;

  onOpenChange:
    (open: boolean) => void;

  questions:
    InvitationRsvpQuestion[];

  recipients:
    InvitationRecipientDetailsType[];
}


/* ==========================================================================
   Invitation RSVP Answers Sheet
========================================================================== */

export default function InvitationRsvpAnswersSheet({
  open,
  onOpenChange,
  questions,
  recipients,
}: InvitationRsvpAnswersSheetProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.rsvpAnswers"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<InvitationRsvpAnswersTab>(
      "guests"
    );

  const [
    selectedRecipient,
    setSelectedRecipient,
  ] =
    useState<InvitationRecipientDetailsType | null>(
      null
    );

  const [
    selectedGuestId,
    setSelectedGuestId,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Guests
  ========================================================================== */

  const guests =
    recipients.flatMap(
      (recipient) =>
        recipient.guests
    );

  const respondedGuests =
    guests.filter(
      (guest) =>
        guest.rsvp !==
        null
    );


  /* ==========================================================================
     Tabs
  ========================================================================== */

  const tabs = [
    {
      value:
        "guests",

      label:
        t(
          "tabs.guests"
        ),

      count:
        guests.length,
    },

    {
      value:
        "answers",

      label:
        t(
          "tabs.answers"
        ),

      count:
        questions.length,
    },
  ];


  /* ==========================================================================
     Tab Change
  ========================================================================== */

  function handleTabChange(
    value:
      string
  ) {
    if (
      value !==
        "guests" &&
      value !==
        "answers"
    ) {
      return;
    }

    setActiveTab(
      value
    );
  }


  /* ==========================================================================
     Guest Details
  ========================================================================== */

  function handleGuestClick(
    guestId:
      string
  ) {
    const recipient =
      recipients.find(
        (recipient) =>
          recipient.guests.some(
            (guest) =>
              guest.id ===
              guestId
          )
      );

    if (!recipient) {
      return;
    }

    setSelectedGuestId(
      guestId
    );

    setSelectedRecipient(
      recipient
    );
  }


  function handleRecipientDetailsOpenChange(
    nextOpen:
      boolean
  ) {
    if (nextOpen) {
      return;
    }

    setSelectedRecipient(
      null
    );

    setSelectedGuestId(
      null
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <Sheet
        open={
          open
        }
        onOpenChange={
          onOpenChange
        }
      >
        <SheetContent
          side="right"
        >
          <SheetHeader>
            <SheetTitle>
              {t(
                "title"
              )}
            </SheetTitle>

            <SheetDescription>
              {t(
                "description"
              )}
            </SheetDescription>
          </SheetHeader>


          <div
            className={
              styles.content
            }
          >
            {/* ================================================================
                Tabs
            ================================================================ */}

            <TabsFilter
              items={
                tabs
              }
              value={
                activeTab
              }
              onValueChange={
                handleTabChange
              }
              equalWidth
            />


            {/* ================================================================
                Tab Content
            ================================================================ */}

            <div
              className={
                styles.tabContent
              }
            >
              {/* ==============================================================
                  Guests
              ============================================================== */}

              {activeTab ===
                "guests" && (
                <>
                  <div
                    className={
                      styles.overview
                    }
                  >
                    <div
                      className={
                        styles.overviewIcon
                      }
                    >
                      <Users
                        className="size-5"
                        aria-hidden="true"
                      />
                    </div>

                    <div
                      className={
                        styles.overviewContent
                      }
                    >
                      <strong>
                        {t(
                          "guestCount",
                          {
                            count:
                              guests.length,
                          }
                        )}
                      </strong>

                      <span>
                        {t(
                          "respondedCount",
                          {
                            count:
                              respondedGuests.length,
                          }
                        )}
                      </span>
                    </div>
                  </div>


                  <InvitationRsvpGuests
                    guests={
                      guests
                    }
                    onGuestClick={
                      handleGuestClick
                    }
                  />
                </>
              )}


              {/* ==============================================================
                  Answers
              ============================================================== */}

              {activeTab ===
                "answers" && (
                <>
                  <div
                    className={
                      styles.overview
                    }
                  >
                    <div
                      className={
                        styles.overviewIcon
                      }
                    >
                      <MessageSquareText
                        className="size-5"
                        aria-hidden="true"
                      />
                    </div>

                    <div
                      className={
                        styles.overviewContent
                      }
                    >
                      <strong>
                        {t(
                          "responseCount",
                          {
                            count:
                              respondedGuests.length,
                          }
                        )}
                      </strong>

                      <span>
                        {t(
                          "questionCount",
                          {
                            count:
                              questions.length,
                          }
                        )}
                      </span>
                    </div>
                  </div>


                  {questions.length >
                  0 ? (
                    <div
                      className={
                        styles.questions
                      }
                    >
                      {questions.map(
                        (question) => (
                      <InvitationRsvpQuestionSummary
  key={
    question.id
  }
  question={
    question
  }
  guests={
    respondedGuests
  }
  onGuestClick={
    handleGuestClick
  }
/>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className={
                        styles.empty
                      }
                    >
                      <MessageSquareText
                        className="size-5"
                        aria-hidden="true"
                      />

                      <strong>
                        {t(
                          "empty.title"
                        )}
                      </strong>

                      <span>
                        {t(
                          "empty.description"
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>


      {/* ====================================================================
          Recipient Details
      ==================================================================== */}

      {selectedRecipient && (
 <InvitationRecipientDetails
  recipient={
    selectedRecipient
  }
  questions={
    questions
  }
  selectedGuestId={
    selectedGuestId ??
    undefined
  }
  open
  onOpenChange={
    handleRecipientDetailsOpenChange
  }
/>
      )}
    </>
  );
}