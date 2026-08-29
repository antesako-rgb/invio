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
  GuestStatusFilter,
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
    status,
    setStatus,
  ] =
    useState<GuestStatusFilter>(
      "all"
    );


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
     Stats
  ========================================================================== */

  const attendingCount =
    useMemo(
      () =>
        guests.filter(
          (guest) =>
            guest.rsvp_status ===
            "attending"
        ).length,
      [
        guests,
      ]
    );


  const pendingCount =
    useMemo(
      () =>
        guests.filter(
          (guest) =>
            guest.rsvp_status ===
            "pending"
        ).length,
      [
        guests,
      ]
    );


  const declinedCount =
    useMemo(
      () =>
        guests.filter(
          (guest) =>
            guest.rsvp_status ===
            "declined"
        ).length,
      [
        guests,
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


            const matchesStatus =
              status === "all" ||
              guest.rsvp_status ===
                status;


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
              matchesStatus &&
              matchesGroup
            );
          }
        );
      },
      [
        guests,
        search,
        status,
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
    status,
    groupId,

    filteredGuests,

    attendingCount,
    pendingCount,
    declinedCount,

    setSearch,
    setStatus,
    setGroupId,

    reload,
  };
}