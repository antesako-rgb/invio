"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DIGITAL_ALBUM_LAYOUT_IDS,
  getDigitalAlbumLayout,
  type LayoutCategory,
} from "../../../../../config/digitalAlbumLayouts";
import type { DigitalAlbumPageLayout } from "../../../../../types/digitalAlbumDocument.types";
import styles from "../DigitalAlbumPicker/DigitalAlbumPicker.module.css";
const frames: Record<DigitalAlbumPageLayout, number[][]> = {
  cover: [[0, 0, 110, 160]],
  "full-photo": [[0, 0, 110, 160]],
  "two-photos": [
    [9, 13, 92, 62],
    [9, 83, 92, 62],
  ],
  editorial: [[10, 38, 90, 68]],
  story: [],
  collage: [
    [9, 9, 49, 142],
    [62, 9, 39, 68],
    [62, 81, 39, 70],
  ],
  "portrait-plate": [[17, 18, 76, 114]],
  "landscape-plate": [[10, 42, 90, 61]],
  "portrait-diptych": [
    [8, 33, 45, 76],
    [57, 33, 45, 76],
  ],
  "mixed-pair": [
    [10, 14, 53, 84],
    [32, 106, 68, 41],
  ],
  "hero-detail": [
    [0, 0, 92, 114],
    [65, 124, 35, 27],
  ],
  quote: [],
  closing: [],
};
export default function DigitalAlbumLayoutPicker({
  value,
  onChange,
}: {
  value?: DigitalAlbumPageLayout | null;
  onChange: (layout: DigitalAlbumPageLayout) => void;
}) {
  const t = useTranslations("DigitalAlbumEditor");
  const [category, setCategory] = useState<LayoutCategory | "all">("all");
  return (
    <>
      <label className={styles.filter}>
        {t("upgrade.category")}
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as LayoutCategory | "all")
          }
        >
          {(["all", "single", "pairs", "sequence", "text"] as const).map(
            (c) => (
              <option key={c} value={c}>
                {t(`upgrade.categories.${c}`)}
              </option>
            ),
          )}
        </select>
      </label>
      <div className={styles.root}>
        {DIGITAL_ALBUM_LAYOUT_IDS.filter(
          (id) =>
            category === "all" ||
            getDigitalAlbumLayout(id).category === category,
        ).map((id) => {
          const definition = getDigitalAlbumLayout(id);
          return (
            <button
              key={id}
              type="button"
              className={styles.card}
              data-active={value === id ? "" : undefined}
              aria-pressed={value === id}
              onClick={() => onChange(id)}
            >
              <span className={styles.preview}>
                <svg
                  viewBox="0 0 110 160"
                  width="100%"
                  height="100%"
                  aria-hidden="true"
                >
                  <rect width="110" height="160" fill="#faf8f3" />
                  {frames[id].map(([x, y, width, height], index) => (
                    <rect
                      key={index}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={index === 0 ? "#a5a393" : "#c9c7b8"}
                    />
                  ))}
                  {definition.textFields.length > 0 && (
                    <g fill={id === "cover" ? "#fff" : "#666855"}>
                      <rect
                        x={id === "editorial" ? 10 : 30}
                        y={
                          id === "cover"
                            ? 120
                            : id === "closing"
                              ? 112
                              : id === "editorial"
                                ? 16
                                : 65
                        }
                        width="50"
                        height="2"
                      />
                      <rect
                        x="38"
                        y={
                          id === "cover"
                            ? 128
                            : id === "closing"
                              ? 120
                              : id === "editorial"
                                ? 119
                                : 74
                        }
                        width="34"
                        height="1"
                      />
                    </g>
                  )}
                </svg>
              </span>
              <span className={styles.label}>{t(`design.layouts.${id}`)}</span>
              <span className={styles.meta}>
                {t("upgrade.photoCount", { count: definition.photoSlotCount })}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
