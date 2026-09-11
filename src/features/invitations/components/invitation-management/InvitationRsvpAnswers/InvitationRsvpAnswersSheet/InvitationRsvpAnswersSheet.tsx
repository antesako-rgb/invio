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
  InvitationManagementGuest,
  InvitationManagementRow,
} from "@/features/invitations/types/invitationManagement.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationRsvp.types";

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

  guests:
    InvitationManagementGuest[];
}


/* ==========================================================================
   Invitation RSVP Answers Sheet
========================================================================== */

export default function InvitationRsvpAnswersSheet({
  open,
  onOpenChange,
  questions,
  guests,
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
    selectedRow,
    setSelectedRow,
  ] =
    useState<InvitationManagementRow | null>(
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
     Responses
  ========================================================================== */

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
    const guest =
      guests.find(
        (guest) =>
          guest.id ===
          guestId
      );

    if (!guest) {
      return;
    }

    const row:
      InvitationManagementRow = {
        id:
          guest.recipient_id ??
          guest.id,

        recipient_id:
          guest.recipient_id,

        public_id:
          guest.recipient_public_id,

        guests: [
          {
            id:
              guest.id,

            first_name:
              guest.first_name,

            last_name:
              guest.last_name,

            email:
              guest.email,

            phone:
              guest.phone,

            is_primary_recipient:
              guest.is_primary_recipient,

            rsvp:
              guest.rsvp,
          },
        ],

        created_at:
          guest.assigned_at,

        updated_at:
          guest.rsvp?.updated_at ??
          guest.assigned_at,
      };

    setSelectedGuestId(
      guestId
    );

    setSelectedRow(
      row
    );
  }


  function handleRecipientDetailsOpenChange(
    nextOpen:
      boolean
  ) {
    if (nextOpen) {
      return;
    }

    setSelectedRow(
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
          Guest Details
      ==================================================================== */}

      {selectedRow && (
        <InvitationRecipientDetails
          row={
            selectedRow
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