import { CalendarDays, LayoutDashboard, Plus } from "lucide-react";
import type { SideNavigationItem } from "@/components/ui/side-navigation/types";

export interface DashboardNavigationGroup {
  id: string;
  label?: string;
  items: SideNavigationItem[];
}

export const dashboardNavigation: DashboardNavigationGroup[] = [
  {
    id: "main",
    items: [{ id: "overview", label: "overview", href: "/dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    id: "organize",
    label: "organize",
    items: [
      { id: "events", label: "events", href: "/dashboard/dogadaji", icon: CalendarDays, exact: true },
      { id: "newEvent", label: "newEvent", href: "/dashboard/dogadaji/novi", icon: Plus, exact: true },
    ],
  },
];
