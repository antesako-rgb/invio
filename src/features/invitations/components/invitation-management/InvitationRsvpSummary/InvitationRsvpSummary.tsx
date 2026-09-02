import {
  CircleCheck,
  CircleX,
  Clock3,
  Users,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import styles
  from "./InvitationRsvpSummary.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRsvpSummaryProps {
  total:
    number;

  attending:
    number;

  declined:
    number;

  pending:
    number;
}


/* ==========================================================================
   Invitation RSVP Summary
========================================================================== */

export default async function InvitationRsvpSummary({
  total,
  attending,
  declined,
  pending,
}: InvitationRsvpSummaryProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    await getTranslations(
      "Invitations.management.rsvpSummary"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.summary
      }
      aria-label={
        t(
          "label"
        )
      }
    >
      {/* ==================================================================
          Label
      ================================================================== */}

      <div
        className={
          styles.label
        }
      >
        <strong>
          RSVP
        </strong>
      </div>


      {/* ==================================================================
          Total
      ================================================================== */}

      <div
        className={
          styles.item
        }
      >
        <Users
          aria-hidden="true"
        />

        <strong>
          {total}
        </strong>

        <span>
          {t(
            "total"
          )}
        </span>
      </div>


      {/* ==================================================================
          Attending
      ================================================================== */}

      <div
        className={
          styles.item
        }
        data-status="attending"
      >
        <CircleCheck
          aria-hidden="true"
        />

        <strong>
          {attending}
        </strong>

        <span>
          {t(
            "attending"
          )}
        </span>
      </div>


      {/* ==================================================================
          Declined
      ================================================================== */}

      <div
        className={
          styles.item
        }
        data-status="declined"
      >
        <CircleX
          aria-hidden="true"
        />

        <strong>
          {declined}
        </strong>

        <span>
          {t(
            "declined"
          )}
        </span>
      </div>


      {/* ==================================================================
          Pending
      ================================================================== */}

      <div
        className={
          styles.item
        }
        data-status="pending"
      >
        <Clock3
          aria-hidden="true"
        />

        <strong>
          {pending}
        </strong>

        <span>
          {t(
            "pending"
          )}
        </span>
      </div>
    </section>
  );
}