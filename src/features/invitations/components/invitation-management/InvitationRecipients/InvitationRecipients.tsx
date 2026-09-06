import {
  getTranslations,
} from "next-intl/server";

import InvitationRecipientCreate
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientCreate/InvitationRecipientCreate";

import InvitationRecipientsView
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientsView/InvitationRecipientsView";

import type {
  getEventGuestsPageData,
} from "@/features/guests/repositories/getEventGuestsPageData";

import type {
  InvitationManagementGuest,
} from "@/features/invitations/types/invitationManagement.types";

import type {
  InvitationRecipientDetails,
} from "@/features/invitations/types/invitationRecipient.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import styles
  from "./InvitationRecipients.module.css";


/* ==========================================================================
   Types
========================================================================== */

type GuestsPageData =
  Awaited<
    ReturnType<
      typeof getEventGuestsPageData
    >
  >;

interface InvitationRecipientsProps {
  invitationId:
    string;

  invitationPublicId:
    string;

  eventId:
    string;

  recipients:
    InvitationRecipientDetails[];

  managementGuests:
    InvitationManagementGuest[];

  questions:
    InvitationRsvpQuestion[];

  availableGuests:
    GuestsPageData["guests"];

  groups:
    GuestsPageData["groups"];
}


/* ==========================================================================
   Invitation Recipients
========================================================================== */

export default async function InvitationRecipients({
  invitationId,
  invitationPublicId,
  eventId,
  recipients,
  managementGuests,
  questions,
  availableGuests,
  groups,
}: InvitationRecipientsProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    await getTranslations(
      "Invitations.management.recipients"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.section
      }
    >
      <div
        className={
          styles.header
        }
      >
        <div
          className={
            styles.heading
          }
        >
          <h2
            className={
              styles.title
            }
          >
            {t(
              "title"
            )}
          </h2>

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


        <InvitationRecipientCreate
          invitationId={
            invitationId
          }
          eventId={
            eventId
          }
          guests={
            availableGuests
          }
          groups={
            groups
          }
        />
      </div>


      <InvitationRecipientsView
        invitationPublicId={
          invitationPublicId
        }
        recipients={
          recipients
        }
        managementGuests={
          managementGuests
        }
        questions={
          questions
        }
      />
    </section>
  );
}