"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvitationDocument } from "../../../types/invitationDocument.types";
import type { InvitationRenderPhoto } from "../../../types/invitationPhoto.types";
import InvitationThumbnail from "../InvitationThumbnail/InvitationThumbnail";
import styles from "./InvitationPageNavigator.module.css";

interface InvitationPageNavigatorProps {
  document: InvitationDocument;
  photos: InvitationRenderPhoto[];
  activeId?: string;
  onSelect: (id: string) => void;
}

/* ==========================================================================
   Page Navigator — selection only; page management stays in Pages
========================================================================== */

export default function InvitationPageNavigator({
  document,
  photos,
  activeId,
  onSelect,
}: InvitationPageNavigatorProps) {
  const t = useTranslations("Invitations.editor");
  const stripRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const index = document.pages.findIndex(page => page.id === activeId);
  const order = document.pages.map(page => page.id).join(",");

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    function keepVisible() {
      const active = activeRef.current;
      if (!strip || !active || !strip.clientWidth) return;
      const left = active.offsetLeft;
      const right = left + active.offsetWidth;
      if (left < strip.scrollLeft) strip.scrollLeft = left;
      else if (right > strip.scrollLeft + strip.clientWidth) {
        strip.scrollLeft = right - strip.clientWidth;
      }
    }

    keepVisible();
    const observer = new ResizeObserver(keepVisible);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [activeId, order]);

  if (index < 0) return null;

  return (
    <nav className={styles.navigator} aria-label={t("pageNavigation")}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={styles.arrow}
        aria-label={t("previousPage")}
        disabled={index === 0}
        onClick={() => onSelect(document.pages[index - 1].id)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>

      <div className={styles.strip} ref={stripRef}>
        {document.pages.map((page, pageIndex) => (
          <button
            key={page.id}
            ref={page.id === activeId ? activeRef : undefined}
            type="button"
            className={styles.page}
            aria-current={page.id === activeId ? "page" : undefined}
            aria-label={t("goToPage", { number: pageIndex + 1 })}
            onClick={() => onSelect(page.id)}
          >
            <span className={styles.thumbnail}>
              <span className={styles.miniature}>
                <InvitationThumbnail document={{ ...document, pages: [page] }} photos={photos} />
              </span>
            </span>
            <span>{pageIndex + 1}</span>
          </button>
        ))}
      </div>

      <span className={styles.counter} aria-live="polite" aria-atomic="true">
        {t("pagePosition", { current: index + 1, total: document.pages.length })}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className={styles.arrow}
        aria-label={t("nextPage")}
        disabled={index === document.pages.length - 1}
        onClick={() => onSelect(document.pages[index + 1].id)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
