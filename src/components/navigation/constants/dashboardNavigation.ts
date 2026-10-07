import { CalendarDays, LayoutDashboard, Plus, UserRound } from "lucide-react";
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
      { id: "content", label: "content", href: "/dashboard/projects", icon: CalendarDays, exact: true },
      { id: "create", label: "create", href: "/dashboard/projects/new/event", icon: Plus, exact: true },
    ],
  },
  { id: "account", label: "account", items: [{ id: "profile", label: "profile", href: "/dashboard/profile", icon: UserRound, exact: true }] },
];
