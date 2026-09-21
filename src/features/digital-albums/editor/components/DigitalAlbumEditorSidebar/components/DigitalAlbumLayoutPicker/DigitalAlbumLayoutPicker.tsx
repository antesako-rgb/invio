"use client";

import {
  useTranslations,
} from "next-intl";

import DigitalAlbumPicker
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumPicker/DigitalAlbumPicker";

import type {
  DigitalAlbumPageLayout,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumLayoutPickerProps {
  value?:
    DigitalAlbumPageLayout | null;

  onChange:
    (
      layout:
        DigitalAlbumPageLayout
    ) => void;
}


/* ==========================================================================
   Layouts
========================================================================== */

const layouts:
  DigitalAlbumPageLayout[] = [
    "cover",
    "full-photo",
    "two-photos",
    "editorial",
    "story",
    "collage",
  ];


/* ==========================================================================
   Digital Album Layout Picker
========================================================================== */

export default function DigitalAlbumLayoutPicker({
  value,
  onChange,
}: DigitalAlbumLayoutPickerProps) {
  const t =
    useTranslations(
      "DigitalAlbumEditor.design.layouts"
    );

  const items =
    layouts.map(
      (layout) => ({
        value:
          layout,

        label:
          t(
            layout
          ),

        imageSrc:
          `/digital-albums/layout-preview/${layout}.png`,
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