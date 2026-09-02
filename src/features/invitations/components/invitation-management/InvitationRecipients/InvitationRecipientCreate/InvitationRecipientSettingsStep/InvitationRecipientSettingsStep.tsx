"use client";

import {
  useTranslations,
} from "next-intl";

import type {
  EventGuest,
} from "@/features/guests/types/guest.types";

import styles
  from "./InvitationRecipientSettingsStep.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientSettingsStepProps {
  guests:
    EventGuest[];

  selectedGuestIds:
    string[];

  primaryGuestId:
    string | null;

  onPrimaryGuestChange:
    (
      guestId: string
    ) => void;
}


/* ==========================================================================
   Invitation Recipient Settings Step
========================================================================== */

export default function InvitationRecipientSettingsStep({
  guests,
  selectedGuestIds,
  primaryGuestId,
  onPrimaryGuestChange,
}: InvitationRecipientSettingsStepProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.create.settings"
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


      <div
        className={
          styles.field
        }
      >
        <div
          className={
            styles.fieldHeading
          }
        >
          <span
            className={
              styles.fieldLabel
            }
          >
            {t(
              "primary.title"
            )}
          </span>

          <span
            className={
              styles.fieldDescription
            }
          >
            {t(
              "primary.description"
            )}
          </span>
        </div>


        <div
          className={
            styles.options
          }
        >
          {selectedGuests.map(
            (guest) => {
              const fullName =
                [
                  guest.first_name,
                  guest.last_name,
                ]
                  .filter(Boolean)
                  .join(" ");

              const isSelected =
                primaryGuestId ===
                guest.id;

              return (
                <label
                  key={
                    guest.id
                  }
                  className={
                    isSelected
                      ? `${styles.option} ${styles.selected}`
                      : styles.option
                  }
                >
                  <input
                    type="radio"
                    name="primary-recipient"
                    value={
                      guest.id
                    }
                    checked={
                      isSelected
                    }
                    onChange={
                      () =>
                        onPrimaryGuestChange(
                          guest.id
                        )
                    }
                    className={
                      styles.radio
                    }
                  />

                  <div
                    className={
                      styles.guest
                    }
                  >
                    <span
                      className={
                        styles.guestName
                      }
                    >
                      {fullName}
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
                </label>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}