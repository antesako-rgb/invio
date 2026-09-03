"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Plus,
  UsersRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import Page
  from "@/components/layout/PageContainer/Page";

import PageHeader
  from "@/components/ui/page-header/PageHeader";

import {
  Button,
} from "@/components/ui/button";

import GuestFilters
  from "@/features/guests/components/GuestFilters/GuestFilters";

import GuestGroupsDialog
  from "@/features/guests/components/GuestGroupsDialog/GuestGroupsDialog";

import GuestRsvpSource
  from "@/features/guests/components/GuestRsvpSource/GuestRsvpSource";

import GuestSheet
  from "@/features/guests/components/GuestSheet/GuestSheet";

import GuestTable
  from "@/features/guests/components/GuestTable/GuestTable";

import {
  useEventGuests,
} from "@/features/guests/hooks/useEventGuests";

import type {
  EventGuest,
  GuestGroup,
  GuestRsvpInvitation,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventGuestsPageProps {
  eventId:
    string;

  guests:
    EventGuest[];

  groups:
    GuestGroup[];

  rsvpInvitations:
    GuestRsvpInvitation[];
}


/* ==========================================================================
   Event Guests Page
========================================================================== */

export default function EventGuestsPage({
  eventId,
  guests,
  groups,
  rsvpInvitations,
}: EventGuestsPageProps) {
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
      "Guests.page"
    );

  const actionsT =
    useTranslations(
      "Guests.actions"
    );


  /* ==========================================================================
     Dialog / Sheet State
  ========================================================================== */

  const [
    guestSheetOpen,
    setGuestSheetOpen,
  ] =
    useState(false);

  const [
    groupsDialogOpen,
    setGroupsDialogOpen,
  ] =
    useState(false);

  const [
    selectedGuest,
    setSelectedGuest,
  ] =
    useState<EventGuest | null>(
      null
    );


  /* ==========================================================================
     Guests
  ========================================================================== */

  const {
    search,
    groupId,

    filteredGuests,

    setSearch,
    setGroupId,
  } =
    useEventGuests({
      guests,
      groups,
    });


  /* ==========================================================================
     Guest Sheet
  ========================================================================== */

  function handleAddGuest() {
    setSelectedGuest(
      null
    );

    setGuestSheetOpen(
      true
    );
  }


  function handleEditGuest(
    guest: EventGuest
  ) {
    setSelectedGuest(
      guest
    );

    setGuestSheetOpen(
      true
    );
  }


  function handleGuestSheetOpenChange(
    open: boolean
  ) {
    setGuestSheetOpen(
      open
    );

    if (!open) {
      setSelectedGuest(
        null
      );
    }
  }


  function handleGuestSuccess() {
    setGuestSheetOpen(
      false
    );

    setSelectedGuest(
      null
    );

    router.refresh();
  }


  /* ==========================================================================
     Groups Dialog
  ========================================================================== */

  function handleManageGroups() {
    setGroupsDialogOpen(
      true
    );
  }


  function handleGroupsDialogOpenChange(
    open: boolean
  ) {
    setGroupsDialogOpen(
      open
    );
  }


  function handleGroupSuccess() {
    router.refresh();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Page>
      <PageHeader
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={
                handleManageGroups
              }
            >
              <UsersRound
                className="size-4"
                aria-hidden="true"
              />

              {actionsT(
                "manageGroups"
              )}
            </Button>


            <Button
              type="button"
              onClick={
                handleAddGuest
              }
            >
              <Plus
                className="size-4"
                aria-hidden="true"
              />

              {actionsT(
                "addGuest"
              )}
            </Button>
          </>
        }
      />


      <div className="flex flex-col gap-6">
        <GuestRsvpSource
          rsvpInvitations={
            rsvpInvitations
          }
        />


        <GuestFilters
          search={
            search
          }
          groupId={
            groupId
          }
          groups={
            groups
          }
          onSearchChange={
            setSearch
          }
          onGroupChange={
            setGroupId
          }
        />


        <GuestTable
          guests={
            filteredGuests
          }
          groups={
            groups
          }
          onAddGuest={
            handleAddGuest
          }
          onEditGuest={
            handleEditGuest
          }
        />
      </div>


      <GuestSheet
        open={
          guestSheetOpen
        }
        eventId={
          eventId
        }
        groups={
          groups
        }
        guest={
          selectedGuest
        }
        onOpenChange={
          handleGuestSheetOpenChange
        }
        onSuccess={
          handleGuestSuccess
        }
      />


      <GuestGroupsDialog
        open={
          groupsDialogOpen
        }
        eventId={
          eventId
        }
        groups={
          groups
        }
        onOpenChange={
          handleGroupsDialogOpenChange
        }
        onSuccess={
          handleGroupSuccess
        }
      />
    </Page>
  );
}