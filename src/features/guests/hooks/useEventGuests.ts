"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  EventGuestWithRsvp,
  GuestGroup,
  GuestGroupFilter,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseEventGuestsProps {
  guests:
    EventGuestWithRsvp[];

  groups:
    GuestGroup[];
}


/* ==========================================================================
   Hook
========================================================================== */

export function useEventGuests({
  guests,
  groups,
}: UseEventGuestsProps) {
  /* ==========================================================================
     Filter State
  ========================================================================== */

  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    groupId,
    setGroupId,
  ] =
    useState<GuestGroupFilter>(
      "all"
    );


  /* ==========================================================================
     Filtered Guests
  ========================================================================== */

  const filteredGuests =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase();


        return guests.filter(
          (guest) => {
            const matchesSearch =
              !normalizedSearch ||
              [
                guest.first_name,
                guest.last_name,
                guest.email,
                guest.phone,
              ]
                .filter(
                  Boolean
                )
                .some(
                  (value) =>
                    value!
                      .toLocaleLowerCase()
                      .includes(
                        normalizedSearch
                      )
                );


            const matchesGroup =
              groupId === "all" ||
              (
                groupId ===
                  "ungrouped"
                  ? guest.group_id ===
                    null
                  : guest.group_id ===
                    groupId
              );


            return (
              matchesSearch &&
              matchesGroup
            );
          }
        );
      },
      [
        guests,
        search,
        groupId,
      ]
    );


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    guests,
    groups,

    search,
    groupId,

    filteredGuests,

    setSearch,
    setGroupId,
  };
}