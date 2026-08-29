import {
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Store,
  SwatchBook,
  BriefcaseBusiness,
} from "lucide-react";

import type {
  SideNavigationItem,
} from "@/components/ui/side-navigation/types";


/* ==========================================================================
   Types
========================================================================== */

export interface DashboardNavigationGroup {
  id:
    string;

  label?:
    string;

  items:
    SideNavigationItem[];
}


/* ==========================================================================
   Dashboard Navigation
========================================================================== */

export const dashboardNavigation: DashboardNavigationGroup[] = [
  {
    id:
      "main",

    items: [
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
    ],
  },

  {
    id:
      "organize",

    label:
      "organize",

    items: [
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
    ],
  },

  {
    id:
      "explore",

    label:
      "explore",

    items: [
      {
        id:
          "templates",

        label:
          "templates",

        href:
          "/predlosci",

        icon:
          SwatchBook,
      },

      {
        id:
          "services",

        label:
          "services",

        href:
          "/usluge",

        icon:
          Store,
      },
    ],
  },

  {
    id:
      "business",

    label:
      "business",

    items: [
      {
        id:
          "myBusiness",

        label:
          "myBusiness",

        href:
          "/dashboard/poslovanje",

        icon:
          BriefcaseBusiness,
      },
    ],
  },

  {
    id:
      "account",

    label:
      "account",

    items: [
      {
        id:
          "settings",

        label:
          "settings",

        href:
          "/dashboard/postavke",

        icon:
          Settings,
      },

      {
        id:
          "support",

        label:
          "support",

        href:
          "/pomoc",

        icon:
          LifeBuoy,
      },
    ],
  },
];