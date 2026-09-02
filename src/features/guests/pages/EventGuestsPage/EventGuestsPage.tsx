"use client";

import {
  useState,
} from "react";

import {
  Plus,
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
  from "../../components/GuestFilters/GuestFilters";

import GuestSheet
  from "../../components/GuestSheet/GuestSheet";

import GuestTable
  from "../../components/GuestTable/GuestTable";

import {
  useEventGuests,
} from "../../hooks/useEventGuests";

import type {
  EventGuest,
  GuestGroup,
} from "../../types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventGuestsPageProps {
  eventId:
    string;

  initialGuests:
    EventGuest[];

  initialGroups:
    GuestGroup[];
}


/* ==========================================================================
   Event Guests Page
========================================================================== */

export default function EventGuestsPage({
  eventId,
  initialGuests,
  initialGroups,
}: EventGuestsPageProps) {
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
     Sheet State
  ========================================================================== */

  const [
    guestSheetOpen,
    setGuestSheetOpen,
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
     Guests State
  ========================================================================== */

  const {
    guests,
    groups,

    search,
    groupId,

    filteredGuests,

    setSearch,
    setGroupId,

    reload,
  } =
    useEventGuests({
      eventId,
      initialGuests,
      initialGroups,
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


  async function handleGuestSuccess() {
    await reload();

    setGuestSheetOpen(
      false
    );

    setSelectedGuest(
      null
    );
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
        }
      />


      <div className="flex flex-col gap-6">
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
          allGuests={
            guests
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
    </Page>
  );
}