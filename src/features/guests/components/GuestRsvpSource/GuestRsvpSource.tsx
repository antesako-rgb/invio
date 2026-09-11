"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Select,
} from "@/components/ui/select";

import {
  setPrimaryRsvpInvitationAction,
} from "@/features/invitations/actions/experience/setPrimaryRsvpInvitationAction";

import type {
  GuestRsvpInvitation,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface GuestRsvpSourceProps {
  rsvpInvitations:
    GuestRsvpInvitation[];
}


/* ==========================================================================
   Guest RSVP Source
========================================================================== */

export default function GuestRsvpSource({
  rsvpInvitations,
}: GuestRsvpSourceProps) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.rsvpSource"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isPending,
    setIsPending,
  ] =
    useState(false);


  /* ==========================================================================
     Primary Invitation
  ========================================================================== */

  const primaryInvitation =
    rsvpInvitations.find(
      (invitation) =>
        invitation.is_primary_rsvp
    );


  /* ==========================================================================
     Options
  ========================================================================== */

  const invitationOptions =
    rsvpInvitations.map(
      (invitation) => ({
        value:
          invitation.id,

        label:
          invitation.name,
      })
    );


  /* ==========================================================================
     Set Primary Invitation
  ========================================================================== */

  async function handleChange(
    invitationId: string
  ) {
    if (
      isPending ||
      invitationId ===
        primaryInvitation?.id
    ) {
      return;
    }

    setIsPending(
      true
    );

    try {
      const result =
        await setPrimaryRsvpInvitationAction({
          p_invitation_id:
            invitationId,
        });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      toast.success(
        t(
          "success"
        )
      );

      router.refresh();
    } finally {
      setIsPending(
        false
      );
    }
  }


  /* ==========================================================================
     No RSVP Invitations
  ========================================================================== */

  if (
    rsvpInvitations.length === 0
  ) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <strong>
            {t(
              "title"
            )}
          </strong>

          <span className="text-sm text-muted-foreground">
            {t(
              "manual.description"
            )}
          </span>
        </div>
      </div>
    );
  }


  /* ==========================================================================
     Single RSVP Invitation
  ========================================================================== */

  if (
    rsvpInvitations.length === 1
  ) {
    const invitation =
      rsvpInvitations[0];

    return (
      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <strong>
              {t(
                "title"
              )}
            </strong>

            <span className="text-sm font-medium">
              {invitation.name}
            </span>

            <span className="text-sm text-muted-foreground">
              {invitation.is_primary_rsvp
                ? t(
                    "single.description"
                  )
                : t(
                    "single.notPrimary"
                  )}
            </span>
          </div>


          {!invitation.is_primary_rsvp && (
            <div>
              <Button
                type="button"
                variant="outline"
                disabled={
                  isPending
                }
                onClick={() =>
                  handleChange(
                    invitation.id
                  )
                }
              >
                {isPending
                  ? t(
                      "single.setting"
                    )
                  : t(
                      "single.action"
                    )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }


  /* ==========================================================================
     Multiple RSVP Invitations
  ========================================================================== */

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <strong>
            {t(
              "title"
            )}
          </strong>

          <span className="text-sm text-muted-foreground">
            {t(
              "multiple.description"
            )}
          </span>
        </div>


        <div className="max-w-sm">
          <Select
            value={
              primaryInvitation?.id ??
              ""
            }
            options={
              invitationOptions
            }
            placeholder={
              t(
                "multiple.placeholder"
              )
            }
            disabled={
              isPending
            }
            onValueChange={
              handleChange
            }
          />
        </div>
      </div>
    </div>
  );
}