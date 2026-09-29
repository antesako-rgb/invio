"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Images, Layers, LayoutTemplate, TextCursorInput, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import EditorShell from "@/features/editor/components/EditorShell/EditorShell";
import EditorWorkspace from "@/features/editor/components/EditorWorkspace/EditorWorkspace";
import EditorSidebar from "@/features/editor/components/EditorSidebar/EditorSidebar";
import EditorMobileNavigation from "@/features/editor/components/EditorMobileNavigation/EditorMobileNavigation";
import EditorMobilePanel from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
import EditorPreview from "@/features/editor/components/EditorPreview/EditorPreview";
import SideNavigation from "@/components/ui/side-navigation/SideNavigation";
import IconButton from "@/components/ui/icon-button/IconButton";
import { DrawerTitle } from "@/components/ui/drawer/Drawer";
import styles from "./InvitationEditor.module.css";
const tools = { pages: Layers, content: TextCursorInput, templates: LayoutTemplate, photos: Images };
export type InvitationEditorTab = keyof typeof tools;
const DEFAULT_SNAP = 0.35;

interface Props {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  tab: InvitationEditorTab;
  onTabChange: (tab: InvitationEditorTab) => void;
  disabled: boolean;
  preview: boolean;
  previewContent: ReactNode;
  onClosePreview: () => void;
}

/** Invitation composes the same editor primitives as Album; domain state stays in its view. */
export default function InvitationEditor({ header, sidebar, children, tab, onTabChange, disabled, preview, previewContent, onClosePreview }: Props) {
  const t = useTranslations("Invitations");
  const navigationT = useTranslations("Navigation.dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snap, setSnap] = useState(DEFAULT_SNAP);
  const previewRoot = useRef<HTMLDivElement>(null);
  const items = (Object.keys(tools) as InvitationEditorTab[]).map(id => ({ id, href: `#${id}`, label: t(`editor.${id}`), icon: tools[id] }));

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const resize = () => {
      if (!media.matches) setMobileOpen(false);
    };

    media.addEventListener("change", resize);

    return () => media.removeEventListener("change", resize);
  }, []);

  useEffect(() => {
    if (!preview) return;
    const previousFocus = document.activeElement;

    previewRoot.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClosePreview();
    };

    window.addEventListener("keydown", escape);

    return () => {
      window.removeEventListener("keydown", escape);

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [preview, onClosePreview]);

  function navigate(id: string, mobile: boolean) {
    if (disabled || !Object.hasOwn(tools, id)) return;

    onTabChange(id as InvitationEditorTab);
    setCollapsed(false);

    if (mobile) {
      setSnap(DEFAULT_SNAP);
      setMobileOpen(true);
    }
  }
  const panel = <EditorSidebar title={t(`editor.${tab}`)} mobileScrollOwner="parent">
    {sidebar}
  </EditorSidebar>;

  return <>
    <div inert={preview || undefined}>
      <EditorShell
        header={header}
        mobileControls={<>
          <EditorMobileNavigation
            items={items}
            activeId={tab}
            ariaLabel={t("editor.tools")}
            onNavigate={id => navigate(id, true)} />
          <EditorMobilePanel
            open={mobileOpen && !preview}
            onOpenChange={open => {
              setMobileOpen(open);
              if (open) setSnap(DEFAULT_SNAP);
            }}
            defaultSnapPoint={DEFAULT_SNAP}
            snapPoint={snap}
            onSnapPointChange={setSnap}
            scrollResetKey={`${tab}:${snap}`}
            handleOnly>
            <DrawerTitle className={styles.srOnly}>
              {t(`editor.${tab}`)}
            </DrawerTitle>

            {panel}
          </EditorMobilePanel>
        </>}>
        <EditorWorkspace
          sidebarCollapsed={collapsed}
          sidebar={panel}
          toolRail={<>
            <IconButton
              className={styles.collapse}
              aria-expanded={!collapsed}
              aria-label={navigationT(collapsed ? "expand" : "collapse")}
              onClick={() => setCollapsed(value => !value)}>
              {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
            </IconButton>
            <SideNavigation
              items={items}
              variant="controlled"
              appearance="rail"
              activeId={tab}
              ariaLabel={t("editor.tools")}
              onControlledNavigate={id => navigate(id, false)} />
          </>}>
          <div className={styles.canvas}>
            {children}
          </div>
        </EditorWorkspace>
      </EditorShell>
    </div>

    {preview && <div ref={previewRoot} role="dialog" aria-modal="true" aria-label={t("editor.preview")}>
      <EditorPreview closeLabel={t("editor.edit")} onClose={onClosePreview}>
        <div className={styles.previewContent}>
          {previewContent}
        </div>
      </EditorPreview>
    </div>}
  </>;
}
