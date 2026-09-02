"use client";

import {
  Check,
  UserRound,
  Users,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import type {
  EventGuest,
} from "@/features/guests/types/guest.types";

import styles
  from "./InvitationRecipientReviewStep.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientReviewStepProps {
  guests:
    EventGuest[];

  selectedGuestIds:
    string[];

  primaryGuestId:
    string;
}


/* ==========================================================================
   Invitation Recipient Review Step
========================================================================== */

export default function InvitationRecipientReviewStep({
  guests,
  selectedGuestIds,
  primaryGuestId,
}: InvitationRecipientReviewStepProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.create.review"
    );


  /* ==========================================================================
     Selected Guests
  ========================================================================== */

  const selectedGuests =
    guests.filter(
      (guest) =>
        selectedGuestIds.includes(
          guest.id
        )
    );

  const primaryGuest =
    selectedGuests.find(
      (guest) =>
        guest.id ===
        primaryGuestId
    ) ?? null;


  /* ==========================================================================
     Helpers
  ========================================================================== */

  function getGuestName(
    guest: EventGuest
  ) {
    return [
      guest.first_name,
      guest.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      <div
        className={
          styles.heading
        }
      >
        <h3
          className={
            styles.title
          }
        >
          {t(
            "title"
          )}
        </h3>

        <p
          className={
            styles.description
          }
        >
          {t(
            "description"
          )}
        </p>
      </div>


      {/* ====================================================================
          Summary
      ==================================================================== */}

      <div
        className={
          styles.summary
        }
      >
        <div
          className={
            styles.summaryItem
          }
        >
          <div
            className={
              styles.summaryIcon
            }
          >
            <Users
              size={18}
              aria-hidden="true"
            />
          </div>

          <div
            className={
              styles.summaryContent
            }
          >
            <span
              className={
                styles.summaryLabel
              }
            >
              {t(
                "guests.label"
              )}
            </span>

            <span
              className={
                styles.summaryValue
              }
            >
              {t(
                "guests.count",
                {
                  count:
                    selectedGuests.length,
                }
              )}
            </span>
          </div>
        </div>


        {primaryGuest && (
          <div
            className={
              styles.summaryItem
            }
          >
            <div
              className={
                styles.summaryIcon
              }
            >
              <UserRound
                size={18}
                aria-hidden="true"
              />
            </div>

            <div
              className={
                styles.summaryContent
              }
            >
              <span
                className={
                  styles.summaryLabel
                }
              >
                {t(
                  "primary.label"
                )}
              </span>

              <span
                className={
                  styles.summaryValue
                }
              >
                {getGuestName(
                  primaryGuest
                )}
              </span>
            </div>
          </div>
        )}
      </div>


      {/* ====================================================================
          Guests
      ==================================================================== */}

      <div
        className={
          styles.section
        }
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <span
            className={
              styles.sectionTitle
            }
          >
            {t(
              "guests.title"
            )}
          </span>

          <span
            className={
              styles.sectionDescription
            }
          >
            {t(
              "guests.description"
            )}
          </span>
        </div>


        <div
          className={
            styles.guestList
          }
        >
          {selectedGuests.map(
            (guest) => {
              const isPrimary =
                guest.id ===
                primaryGuestId;

              return (
                <div
                  key={
                    guest.id
                  }
                  className={
                    styles.guest
                  }
                >
                  <div
                    className={
                      styles.guestContent
                    }
                  >
                    <span
                      className={
                        styles.guestName
                      }
                    >
                      {getGuestName(
                        guest
                      )}
                    </span>

                    {(guest.email ||
                      guest.phone) && (
                      <span
                        className={
                          styles.guestContact
                        }
                      >
                        {guest.email ??
                          guest.phone}
                      </span>
                    )}
                  </div>


                  {isPrimary && (
                    <span
                      className={
                        styles.primary
                      }
                    >
                      <Check
                        size={14}
                        aria-hidden="true"
                      />

                      {t(
                        "primary.badge"
                      )}
                    </span>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}