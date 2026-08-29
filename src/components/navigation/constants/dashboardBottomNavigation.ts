import type {
  LucideIcon,
} from "lucide-react";

import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  MoreHorizontal,
  Store,
} from "lucide-react";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardBottomNavigationLink {
  id:
    string;

  label:
    string;

  href:
    string;

  icon:
    LucideIcon;

  exact?:
    boolean;
}

interface DashboardBottomNavigationAction {
  id:
    "more";

  label:
    string;

  icon:
    LucideIcon;

  href?:
    never;

  exact?:
    never;
}

type DashboardBottomNavigationItem =
  | DashboardBottomNavigationLink
  | DashboardBottomNavigationAction;


/* ==========================================================================
   Dashboard Bottom Navigation
========================================================================== */

export const dashboardBottomNavigation:
  DashboardBottomNavigationItem[] = [
    {
      id:
        "overview",

      label:
        "overview",

      href:
        "/dashboard",

      icon:
        LayoutDashboard,

      exact:
        true,
    },

    {
      id:
        "events",

      label:
        "events",

      href:
        "/dashboard/dogadaji",

      icon:
        CalendarDays,
    },

    {
      id:
        "explore",

      label:
        "explore",

      href:
        "/dashboard/istrazi",

      icon:
        Compass,
    },

    {
      id:
        "business",

      label:
        "business",

      href:
        "/dashboard/poslovanje",

      icon:
        Store,
    },

    {
      id:
        "more",

      label:
        "more",

      icon:
        MoreHorizontal,
    },
  ];    