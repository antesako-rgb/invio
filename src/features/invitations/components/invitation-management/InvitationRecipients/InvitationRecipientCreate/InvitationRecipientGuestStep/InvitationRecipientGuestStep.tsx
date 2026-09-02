"use client";

import {
  useMemo,
} from "react";

import {
  Users,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import type {
  EventGuest,
  GuestGroup,
} from "@/features/guests/types/guest.types";

import styles
  from "./InvitationRecipientGuestStep.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientGuestStepProps {
  guests:
    EventGuest[];

  groups:
    GuestGroup[];

  selectedGuestIds:
    string[];

  onSelectionChange:
    (
      guestIds: string[]
    ) => void;
}


/* ==========================================================================
   Invitation Recipient Guest Step
========================================================================== */

export default function InvitationRecipientGuestStep({
  guests,
  groups,
  selectedGuestIds,
  onSelectionChange,
}: InvitationRecipientGuestStepProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.create.guests"
    );


  /* ==========================================================================
     Groups
  ========================================================================== */

  const groupMap =
    useMemo(
      () =>
        new Map(
          groups.map(
            (group) => [
              group.id,
              group.name,
            ]
          )
        ),
      [
        groups,
      ]
    );


  /* ==========================================================================
     Selection
  ========================================================================== */

  function handleToggle(
    guestId: string
  ) {
    const isSelected =
      selectedGuestIds.includes(
        guestId
      );

    if (isSelected) {
      onSelectionChange(
        selectedGuestIds.filter(
          (id) =>
            id !== guestId
        )
      );

      return;
    }

    onSelectionChange([
      ...selectedGuestIds,
      guestId,
    ]);
  }


  /* ==========================================================================
     Empty
  ========================================================================== */

  if (
    guests.length === 0
  ) {
    return (
      <div
        className={
          styles.empty
        }
      >
        <div
          className={
            styles.emptyIcon
          }
        >
          <Users
            size={20}
            aria-hidden="true"
          />
        </div>

        <div
          className={
            styles.emptyContent
          }
        >
          <h3
            className={
              styles.emptyTitle
            }
          >
            {t(
              "empty.title"
            )}
          </h3>

          <p
            className={
              styles.emptyDescription
            }
          >
            {t(
              "empty.description"
            )}
          </p>
        </div>
      </div>
    );
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
        <div>
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

        <span
          className={
            styles.selectionCount
          }
        >
          {t(
            "selected",
            {
              count:
                selectedGuestIds.length,
            }
          )}
        </span>
      </div>


      <div
        className={
          styles.list
        }
      >
        {guests.map(
          (guest) => {
            const isSelected =
              selectedGuestIds.includes(
                guest.id
              );

            const fullName =
              [
                guest.first_name,
                guest.last_name,
              ]
                .filter(Boolean)
                .join(" ");

            const groupName =
              guest.group_id
                ? groupMap.get(
                    guest.group_id
                  )
                : null;

            return (
              <label
                key={
                  guest.id
                }
                className={
                  isSelected
                    ? `${styles.guest} ${styles.selected}`
                    : styles.guest
                }
              >
                <input
                  type="checkbox"
                  className={
                    styles.checkbox
                  }
                  checked={
                    isSelected
                  }
                  onChange={
                    () =>
                      handleToggle(
                        guest.id
                      )
                  }
                />

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
                    {fullName}
                  </span>

                  <div
                    className={
                      styles.guestMeta
                    }
                  >
                    {groupName && (
                      <span>
                        {groupName}
                      </span>
                    )}

                    {guest.email && (
                      <span>
                        {guest.email}
                      </span>
                    )}

                    {!groupName &&
                      !guest.email && (
                        <span>
                          {t(
                            "noDetails"
                          )}
                        </span>
                      )}
                  </div>
                </div>
              </label>
            );
          }
        )}
      </div>
    </div>
  );
}