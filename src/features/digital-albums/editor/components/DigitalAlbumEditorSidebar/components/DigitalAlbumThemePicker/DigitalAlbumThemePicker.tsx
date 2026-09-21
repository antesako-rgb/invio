"use client";

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

const themes:
  DigitalAlbumTheme[] = [
    "classic",
  ];


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
    themes.map(
      (theme) => ({
        value:
          theme,

        label:
          t(
            theme
          ),

        imageSrc:
          `/digital-albums/theme-preview/${theme}.png`,
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