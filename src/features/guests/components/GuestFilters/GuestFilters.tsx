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

import type {
  GuestGroup,
  GuestGroupFilter,
} from "../../types/guest.types";

import styles
  from "./GuestFilters.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestFiltersProps {
  search:
    string;

  groupId:
    GuestGroupFilter;

  groups:
    GuestGroup[];

  onSearchChange:
    (
      value: string
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
  groupId,
  groups,
  onSearchChange,
  onGroupChange,
}: GuestFiltersProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.filters"
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