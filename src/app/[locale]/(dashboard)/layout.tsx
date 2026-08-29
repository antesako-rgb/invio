import type {
  ReactNode,
} from "react";

import DashboardBottomNavigation
  from "@/components/navigation/DashboardBottomNavigation/DashboardBottomNavigation";

import DashboardHeader
  from "@/components/navigation/DashboardHeader/DashboardHeader";

import DashboardSidebar
  from "@/components/navigation/DashboardSidebar/DashboardSidebar";

import styles from "./layout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardLayoutProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Dashboard Layout
========================================================================== */

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div
      className={
        styles.layout
      }
    >
      <DashboardSidebar />

      <div
        className={
          styles.content
        }
      >
        <DashboardHeader />

        <main
          className={
            styles.main
          }
        >
          {children}
        </main>
      </div>

      <DashboardBottomNavigation />
    </div>
  );
}