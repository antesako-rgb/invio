"use client";
import { useState } from "react";
import Image from "next/image";
import { DIGITAL_ALBUM_THEMES, DIGITAL_ALBUM_THEME_IDS } from "@/features/digital-albums/config/digitalAlbumThemes";
import "@/features/digital-albums/components/album-renderer/themes/DigitalAlbumThemes.css";
import styles from "./DigitalAlbumThemePicker.module.css";

import {
  useTranslations,
} from "next-intl";

import DigitalAlbumPicker
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumPicker/DigitalAlbumPicker";

import type {
  DigitalAlbumTheme,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumThemePickerProps {
  value:
    DigitalAlbumTheme;

  onChange:
    (
      theme:
        DigitalAlbumTheme
    ) => void;
}


/* ==========================================================================
   Themes
========================================================================== */

/* ==========================================================================
   Digital Album Theme Picker
========================================================================== */

export default function DigitalAlbumThemePicker({
  value,
  onChange,
}: DigitalAlbumThemePickerProps) {
  const t =
    useTranslations(
      "DigitalAlbumEditor.design.themes"
    );

  const items =
    DIGITAL_ALBUM_THEME_IDS.map(
      (theme) => ({
        value:
          theme,

        label:
          t(
            theme
          ),

        preview: <ThemePreview theme={theme} label={t(theme)} />,
      })
    );

  return (
    <DigitalAlbumPicker
      items={
        items
      }
      value={
        value
      }
      onChange={
        onChange
      }
    />
  );
}
function ThemePreview({ theme, label }: { theme: DigitalAlbumTheme; label: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.preview} data-album-theme={theme} aria-hidden="true">
    {failed ? <span className={styles.sample}>
      <span className={styles.type}>Aa</span>
      <span className={styles.name}>{label}</span>
      <span className={styles.rule} />
      <span className={styles.swatches}><span /><span /><span /></span>
    </span> : <Image src={DIGITAL_ALBUM_THEMES[theme].preview} alt="" width={440} height={640}
      loading="lazy" unoptimized className={styles.image} onError={() => setFailed(true)} />}
  </span>;
}
