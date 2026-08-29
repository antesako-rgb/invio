"use client";

import {
  useMemo,
} from "react";

import {
  Search,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Input,
} from "@/components/ui/input";

import SelectFilter
  from "@/components/ui/select-filter/SelectFilter";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import type {
  GuestGroup,
  GuestGroupFilter,
  GuestStatusFilter,
} from "../../types/guest.types";

import styles
  from "./GuestFilters.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestFiltersProps {
  search:
    string;

  status:
    GuestStatusFilter;

  groupId:
    GuestGroupFilter;

  groups:
    GuestGroup[];

  totalCount:
    number;

  attendingCount:
    number;

  pendingCount:
    number;

  declinedCount:
    number;

  onSearchChange:
    (
      value: string
    ) => void;

  onStatusChange:
    (
      value: GuestStatusFilter
    ) => void;

  onGroupChange:
    (
      value: GuestGroupFilter
    ) => void;
}


/* ==========================================================================
   Guest Filters
========================================================================== */

export default function GuestFilters({
  search,
  status,
  groupId,
  groups,
  totalCount,
  attendingCount,
  pendingCount,
  declinedCount,
  onSearchChange,
  onStatusChange,
  onGroupChange,
}: GuestFiltersProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.filters"
    );

  const rsvpT =
    useTranslations(
      "Guests.rsvp"
    );


  /* ==========================================================================
     Status Items
  ========================================================================== */

  const statusItems =
    useMemo(
      () => [
        {
          value:
            "all",

          label:
            t(
              "allStatuses"
            ),

          count:
            totalCount,
        },

        {
          value:
            "attending",

          label:
            rsvpT(
              "attending"
            ),

          count:
            attendingCount,
        },

        {
          value:
            "pending",

          label:
            rsvpT(
              "pending"
            ),

          count:
            pendingCount,
        },

        {
          value:
            "declined",

          label:
            rsvpT(
              "declined"
            ),

          count:
            declinedCount,
        },
      ],
      [
        t,
        rsvpT,
        totalCount,
        attendingCount,
        pendingCount,
        declinedCount,
      ]
    );


  /* ==========================================================================
     Group Options
  ========================================================================== */

  const groupOptions =
    useMemo(
      () => [
        {
          value:
            "all",

          label:
            t(
              "allGroups"
            ),
        },

        {
          value:
            "ungrouped",

          label:
            t(
              "noGroup"
            ),
        },

        ...groups.map(
          (group) => ({
            value:
              group.id,

            label:
              group.name,
          })
        ),
      ],
      [
        groups,
        t,
      ]
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.filters
      }
    >
      <div
        className={
          styles.search
        }
      >
        <Search
          className={
            styles.searchIcon
          }
          aria-hidden="true"
        />

        <Input
          value={
            search
          }
          onChange={(
            event
          ) =>
            onSearchChange(
              event.target.value
            )
          }
          placeholder={
            t(
              "searchPlaceholder"
            )
          }
          aria-label={
            t(
              "searchPlaceholder"
            )
          }
          className={
            styles.searchInput
          }
        />
      </div>


      <div
        className={
          styles.controls
        }
      >
        <TabsFilter
          items={
            statusItems
          }
          value={
            status
          }
          onValueChange={(
            value
          ) =>
            onStatusChange(
              value as GuestStatusFilter
            )
          }
        />

        <SelectFilter
          label={
            t(
              "group"
            )
          }
          value={
            groupId
          }
          options={
            groupOptions
          }
          onValueChange={
            onGroupChange
          }
        />
      </div>
    </div>
  );
}