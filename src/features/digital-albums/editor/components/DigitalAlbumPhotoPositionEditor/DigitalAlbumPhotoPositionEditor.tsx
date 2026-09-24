"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { DigitalAlbumPhotoSlot } from "../../../types/digitalAlbumDocument.types";
import { digitalAlbumPhotoStyle } from "../../../utils/digitalAlbumPhotoStyle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import styles from "./DigitalAlbumPhotoPositionEditor.module.css";
export default function DigitalAlbumPhotoPositionEditor({
  slot,
  imageUrl,
  aspectRatio,
  allowContain,
  inheritedCaption,
  onApply,
  onCancel,
}: {
  slot: DigitalAlbumPhotoSlot;
  imageUrl: string;
  aspectRatio: number;
  allowContain: boolean;
  inheritedCaption?: string | null;
  onApply: (slot: DigitalAlbumPhotoSlot) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");
  const [draft, setDraft] = useState(slot);
  const controlId = useId();
  const applied = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [excess, setExcess] = useState({ x: 0, y: 0 });
  const ratio =
    Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  const imageRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    start: { x: number; y: number };
  } | null>(null);
  const position = draft.position ?? { x: 0.5, y: 0.5 };
  function measureOverflow() {
    const image = imageRef.current;
    const bounds = previewRef.current?.getBoundingClientRect();
    if (
      !bounds?.width ||
      !bounds.height ||
      !image?.naturalWidth ||
      !image.naturalHeight
    )
      return;
    const scale = Math.max(
      bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight,
    );
    setExcess({
      x: Math.max(0, image.naturalWidth * scale - bounds.width),
      y: Math.max(0, image.naturalHeight * scale - bounds.height),
    });
  }

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(preview);
    return () => observer.disconnect();
  }, []);

  const canPosition = draft.fit !== "contain";

  return (
    <section className={styles.root} aria-label={t("position")}>
      <p>{t("positionHelp")}</p>
      <div
        className={styles.viewport}
        style={{ "--crop-ratio": ratio } as CSSProperties}
      >
        <div
          ref={previewRef}
          className={styles.preview}
          data-movable={canPosition && (excess.x > 1 || excess.y > 1)}
          onPointerDown={(event) => {
            if (
              !canPosition ||
              (!excess.x && !excess.y) ||
              !event.isPrimary ||
              event.button !== 0
            )
              return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              start: position,
            };
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onPointerMove={(event) => {
            const initial = drag.current;
            if (!initial || !canPosition) return;
            const excessX = excess.x;
            const excessY = excess.y;
            const clamp = (v: number) => Math.max(0, Math.min(1, v));
            setDraft((current) => ({
              ...current,
              position: {
                x:
                  excessX > 1
                    ? clamp(
                        initial.start.x - (event.clientX - initial.x) / excessX,
                      )
                    : initial.start.x,
                y:
                  excessY > 1
                    ? clamp(
                        initial.start.y - (event.clientY - initial.y) / excessY,
                      )
                    : initial.start.y,
              },
            }));
          }}
        >
          {/* Native image uses the same fit/position as Next Image in the page renderer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            onLoad={measureOverflow}
            src={imageUrl}
            alt=""
            draggable={false}
            style={digitalAlbumPhotoStyle(draft)}
          />
        </div>
      </div>
      <div className={styles.controls}>
        {(["x", "y"] as const).map((axis) => (
          <div
            key={axis}
            className={styles.axis}
            data-disabled={!canPosition || excess[axis] <= 1}
          >
            <Label htmlFor={`${controlId}-${axis}`}>
              {t(axis === "x" ? "horizontal" : "vertical")}
            </Label>
            <input
              id={`${controlId}-${axis}`}
              type="range"
              min="0"
              max="100"
              value={Math.round(position[axis] * 100)}
              disabled={!canPosition || excess[axis] <= 1}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  position: {
                    ...position,
                    [axis]: Number(event.target.value) / 100,
                  },
                })
              }
            />
          </div>
        ))}
      </div>
      {(allowContain || draft.fit === "contain") && (
        <div className={styles.fit}>
          <Label htmlFor={`${controlId}-contain`}>{t("contain")}</Label>
          <Switch
            id={`${controlId}-contain`}
            checked={draft.fit === "contain"}
            onCheckedChange={(checked) => {
              drag.current = null;
              setDraft((current) => ({
                ...current,
                fit: checked ? "contain" : "cover",
              }));
            }}
          />
        </div>
      )}
      <div className={styles.caption}>
        <Label htmlFor={`${controlId}-caption`}>{t("caption")}</Label>
        <Textarea
          id={`${controlId}-caption`}
          rows={2}
          value={draft.caption ?? inheritedCaption ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, caption: event.target.value })
          }
        />
      </div>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          type="button"
          onClick={() =>
            setDraft((current) => ({
              ...current,
              position: { x: 0.5, y: 0.5 },
              fit: "cover",
            }))
          }
        >
          {t("reset")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (applied.current) return;
            applied.current = true;
            onApply(draft);
          }}
        >
          {t("apply")}
        </Button>
      </div>
    </section>
  );
}
