"use client";
import { useEffect, useId, useRef, useState, type ReactNode, type CSSProperties } from "react";
import type { EditorPhotoFramingValue } from "../../types/editorPhotoFraming.types";
import { editorPhotoStyle } from "../../utils/editorPhotoStyle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import styles from "./EditorPhotoFraming.module.css";
export default function EditorPhotoFraming({
  value,
  imageUrl,
  aspectRatio,
  allowContain,
  labels,
  children,
  onApply,
  onCancel,
}: {
  value: EditorPhotoFramingValue;
  imageUrl: string;
  aspectRatio: number;
  allowContain: boolean;
  labels: Record<"position" | "positionHelp" | "horizontal" | "vertical" | "contain" | "reset" | "cancel" | "apply", string>;
  children?: ReactNode;
  onApply: (value: EditorPhotoFramingValue) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<EditorPhotoFramingValue>({ position: value.position, fit: value.fit });
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
    <section className={styles.root} aria-label={labels.position}>
      <p>{labels.positionHelp}</p>
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
          onLostPointerCapture={() => {
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
            style={editorPhotoStyle(draft)}
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
              {labels[axis === "x" ? "horizontal" : "vertical"]}
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
          <Label htmlFor={`${controlId}-contain`}>{labels.contain}</Label>
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
      {children}
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
          {labels.reset}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {labels.cancel}
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (applied.current) return;
            applied.current = true;
            onApply(draft);
          }}
        >
          {labels.apply}
        </Button>
      </div>
    </section>
  );
}
