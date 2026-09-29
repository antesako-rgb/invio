"use client";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { GripVertical, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import InvitationThumbnail from "../InvitationThumbnail/InvitationThumbnail";
import type { InvitationTheme } from "../../../config/invitationThemes";
import type { InvitationRenderPhoto } from "../../../types/invitationPhoto.types";
import type { InvitationDocumentPage } from "../../../types/invitationDocument.types";
import styles from "./InvitationPageRow.module.css";
interface InvitationPageRowProps {
  theme: InvitationTheme;
  photos: InvitationRenderPhoto[];
  onDuplicate: () => void;
  canDuplicate: boolean;
  page: InvitationDocumentPage;
  index: number;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUp?: () => void;
  onDown?: () => void;
}

export default function InvitationPageRow({ page, index, active, disabled, onSelect, onRemove, onUp, onDown, onDuplicate, canDuplicate, theme, photos }: InvitationPageRowProps) {
  const t = useTranslations("Invitations");
  const { ref: dragRef, handleRef, isDragging } = useDraggable({ id: page.id, disabled });
  const { ref: dropRef } = useDroppable({ id: page.id, disabled });

  return <li
    ref={node => {
      dragRef(node);
      dropRef(node);
    }}
    className={styles.pageRow}
    data-active={active}
    data-dragging={isDragging}>
    <div className={styles.row}>
      <button
        type="button"
        ref={handleRef}
        disabled={disabled}
        className={styles.dragHandle}
        aria-label={t("editor.reorder", { number: index + 1 })}>
        <GripVertical aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.pageSelect}
        onClick={onSelect}
        disabled={disabled}
        aria-current={active ? "true" : undefined}>
        <InvitationThumbnail document={{ theme, pages: [page] }} photos={photos} />
        <span>
          <strong>
            {index + 1}
            .
            {t(`types.${page.type}`)}
          </strong>
          <span className={styles.pageTitle}>
            {page.content.title}
          </span>
        </span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={styles.menuButton}
          disabled={disabled}
          aria-label={t("editor.pageActions", { number: index + 1 })}>
          <MoreVertical aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled={!canDuplicate} onClick={onDuplicate}>
            {t("editor.duplicate")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!onUp} onClick={onUp}>
            {t("editor.moveUp")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!onDown} onClick={onDown}>
            {t("editor.moveDown")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove}>
            {t("editor.removePage")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </li>;
}
