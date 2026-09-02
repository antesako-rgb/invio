"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  getEventGuests,
} from "../repositories/getEventGuests";

import {
  getGuestGroups,
} from "../repositories/getGuestGroups";

import type {
  EventGuest,
  GuestGroup,
  GuestGroupFilter,
} from "../types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseEventGuestsProps {
  eventId:
    string;

  initialGuests:
    EventGuest[];

  initialGroups:
    GuestGroup[];
}


/* ==========================================================================
   Hook
========================================================================== */

export function useEventGuests({
  eventId,
  initialGuests,
  initialGroups,
}: UseEventGuestsProps) {
  /* ==========================================================================
     Data State
  ========================================================================== */

  const [
    guests,
    setGuests,
  ] =
    useState<EventGuest[]>(
      initialGuests
    );


  const [
    groups,
    setGroups,
  ] =
    useState<GuestGroup[]>(
      initialGroups
    );


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
     Reload
  ========================================================================== */

  const reload =
    useCallback(
      async () => {
        const [
          guestData,
          groupData,
        ] =
          await Promise.all([
            getEventGuests(
              eventId
            ),

            getGuestGroups(
              eventId
            ),
          ]);


        setGuests(
          guestData
        );


        setGroups(
          groupData
        );
      },
      [
        eventId,
      ]
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

    reload,
  };
}