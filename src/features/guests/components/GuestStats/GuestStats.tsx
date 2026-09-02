"use client";

import {
  Users,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  StatCard,
} from "@/components/ui/stat-card";

import type {
  EventGuest,
} from "../../types/guest.types";

import styles
  from "./GuestStats.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestStatsProps {
  guests:
    EventGuest[];
}


/* ==========================================================================
   Guest Stats
========================================================================== */

export default function GuestStats({
  guests,
}: GuestStatsProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.stats"
    );


  /* ==========================================================================
     Stats
  ========================================================================== */

  const totalGuests =
    guests.length;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.stats
      }
    >
      <StatCard
        title={
          t(
            "total.title"
          )
        }
        value={
          totalGuests
        }
        description={
          t(
            "total.description"
          )
        }
        icon={
          Users
        }
      />
    </div>
  );
}