"use client";

import {
  CheckCircle2,
  Clock3,
  UserRoundX,
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

  const attendingGuests =
    guests.filter(
      (guest) =>
        guest.rsvp_status ===
        "attending"
    ).length;

  const pendingGuests =
    guests.filter(
      (guest) =>
        guest.rsvp_status ===
        "pending"
    ).length;

  const declinedGuests =
    guests.filter(
      (guest) =>
        guest.rsvp_status ===
        "declined"
    ).length;


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

      <StatCard
        title={
          t(
            "attending.title"
          )
        }
        value={
          attendingGuests
        }
        description={
          t(
            "attending.description"
          )
        }
        icon={
          CheckCircle2
        }
      />

      <StatCard
        title={
          t(
            "pending.title"
          )
        }
        value={
          pendingGuests
        }
        description={
          t(
            "pending.description"
          )
        }
        icon={
          Clock3
        }
      />

      <StatCard
        title={
          t(
            "declined.title"
          )
        }
        value={
          declinedGuests
        }
        description={
          t(
            "declined.description"
          )
        }
        icon={
          UserRoundX
        }
      />
    </div>
  );
}