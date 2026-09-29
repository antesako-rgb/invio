"use client";
import { type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { DragDropProvider } from "@dnd-kit/react";
import InvitationPagePicker from "../InvitationPagePicker/InvitationPagePicker";
import type { InvitationTheme } from "../../../config/invitationThemes";
import type { InvitationRenderPhoto } from "../../../types/invitationPhoto.types";
import { type InvitationPageType } from "../../../config/invitationPageTypes";
import type { InvitationDocument, InvitationDocumentPage } from "../../../types/invitationDocument.types";
import InvitationPageRow from "./InvitationPageRow";
import styles from "./InvitationPagesPanel.module.css";
interface InvitationPagesPanelProps {
  sharedDateTime: Pick<InvitationDocument, "eventDate" | "eventTime" | "legacyDateTime">;
  theme: InvitationTheme;
  photos: InvitationRenderPhoto[];
  onDuplicate: (id: string) => void;
  pages: InvitationDocumentPage[];
  activeId?: string;
  disabled: boolean;
  onSelect: (id: string) => void;
  onAdd: (type: InvitationPageType, designId: string) => void;
  onMove: (from: string, to: string) => void;
  onRemove: (id: string) => void;
}

export default function InvitationPagesPanel({ pages, activeId, disabled, onSelect, onAdd, onMove, onRemove, onDuplicate, theme, photos, sharedDateTime }: InvitationPagesPanelProps) {
  const t = useTranslations("Invitations");

  function dragEnd(event: Parameters<NonNullable<ComponentProps<typeof DragDropProvider>["onDragEnd"]>>[0]) {
    const { source, target } = event.operation;

    if (!disabled && !event.canceled && source && target) onMove(String(source.id), String(target.id));
  }

  return <section className={styles.panel}>
    <p className={styles.hint}>
      {t("templates.pageCount", { count: pages.length })}
    </p>
    <InvitationPagePicker theme={theme} disabled={disabled || pages.length >= 100} onAdd={onAdd} />
    <DragDropProvider onDragEnd={dragEnd}>
      <ol className={styles.pageList}>
        {pages.map((page, index) => <InvitationPageRow
          key={page.id}
          page={page}
          sharedDateTime={sharedDateTime}
          theme={theme}
          photos={photos}
          onDuplicate={() => onDuplicate(page.id)}
          canDuplicate={pages.length < 100}
          index={index}
          active={page.id === activeId}
          disabled={disabled}
          onSelect={() => onSelect(page.id)}
          onRemove={() => onRemove(page.id)}
          onUp={index ? () => onMove(page.id, pages[index - 1].id) : undefined}
          onDown={index < pages.length - 1 ? () => onMove(page.id, pages[index + 1].id) : undefined} />)}
      </ol>
    </DragDropProvider>
  </section>;
}
