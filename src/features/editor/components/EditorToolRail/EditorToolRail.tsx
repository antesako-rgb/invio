"use client";

import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import IconButton from "@/components/ui/icon-button/IconButton";
import SideNavigation from "@/components/ui/side-navigation/SideNavigation";
import type { SideNavigationItem } from "@/components/ui/side-navigation/types";
import styles from "./EditorToolRail.module.css";

interface EditorToolRailProps {
  items: SideNavigationItem[];
  activeId: string;
  ariaLabel: string;
  collapsed: boolean;
  disabled?: boolean;
  onToggleCollapsed: () => void;
  onNavigate: (id: string) => void;
}

/** Common desktop tools and sidebar toggle; each editor owns its panel state. */
export default function EditorToolRail({ items, activeId, ariaLabel, collapsed, disabled = false, onToggleCollapsed, onNavigate }: EditorToolRailProps) {
  const t = useTranslations("Navigation.dashboard");
  const toggleLabel = t(collapsed ? "expand" : "collapse");
  return <>
    <IconButton className={styles.collapse} disabled={disabled} aria-label={toggleLabel}
      title={toggleLabel} aria-expanded={!collapsed} onClick={onToggleCollapsed}>
      {collapsed ? <PanelLeftOpen aria-hidden="true"/> : <PanelLeftClose aria-hidden="true"/>}
    </IconButton>
    <div className={styles.navigation} inert={disabled || undefined} aria-disabled={disabled || undefined}>
      <SideNavigation items={items} variant="controlled" appearance="rail" activeId={activeId}
        ariaLabel={ariaLabel} onControlledNavigate={id => { if (!disabled) onNavigate(id); }}/>
    </div>
  </>;
}
