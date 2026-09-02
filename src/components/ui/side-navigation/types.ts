import type {
  LucideIcon,
} from "lucide-react";


/* ==========================================================================
   Side Navigation Item
========================================================================== */

export interface SideNavigationItem {
  id:
    string;

  label:
    string;

  href:
    string;

  icon?:
    LucideIcon;

  exact?:
    boolean;

  prefetch?:
    boolean;
}


/* ==========================================================================
   Side Navigation Props
========================================================================== */

export interface SideNavigationProps {
  items:
    SideNavigationItem[];

  variant?:
    | "route"
    | "anchor"
    | "controlled";

  appearance?:
    | "default"
    | "tabs"
    | "underline";

  activeId?:
    string;

  collapsed?:
    boolean;

  onNavigate?:
    () => void;

  onControlledNavigate?:
    (
      id: string
    ) => void;

  ariaLabel?:
    string;
}