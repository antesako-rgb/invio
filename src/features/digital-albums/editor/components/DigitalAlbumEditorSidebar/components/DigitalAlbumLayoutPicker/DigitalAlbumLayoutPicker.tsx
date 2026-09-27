"use client";
import Image from "next/image";
import { Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import localStyles from "./DigitalAlbumLayoutPicker.module.css";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DIGITAL_ALBUM_LAYOUT_IDS,
  getDigitalAlbumLayout,
  type LayoutCategory,
} from "../../../../../config/digitalAlbumLayouts";
import type { DigitalAlbumPageLayout } from "../../../../../types/digitalAlbumDocument.types";
import styles from "../DigitalAlbumPicker/DigitalAlbumPicker.module.css";
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
      <div className={localStyles.filters} role="group" aria-label={t("upgrade.category")}>
        {(["all", "single", "pairs", "sequence", "text"] as const).map((item) => (
          <Button key={item} type="button" variant="outline" size="sm"
            aria-pressed={category === item} onClick={() => setCategory(item)}
            onFocus={(event) => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}>
            {t(`upgrade.categories.${item}`)}
          </Button>
        ))}
      </div>
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
              <span className={`${styles.preview} ${localStyles.preview}`}>
                <LayoutPreview key={definition.preview} src={definition.preview} />
                {value === id && <span className={localStyles.check} aria-hidden="true"><Check /></span>}
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

function LayoutPreview({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className={localStyles.placeholder} aria-hidden="true"><ImageIcon /></span>;
  }
  return <Image src={src} alt="" width={440} height={640}
    className={localStyles.image} loading="lazy" unoptimized
    onError={() => setFailed(true)} />;
}
