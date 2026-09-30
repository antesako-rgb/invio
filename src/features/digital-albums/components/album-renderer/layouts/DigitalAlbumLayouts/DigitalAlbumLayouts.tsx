"use client";

import {
  useLocale,
  useTranslations,
} from "next-intl";
import { formatDigitalAlbumDate } from "../../../../utils/formatDigitalAlbumDate";

import type {
  ReactNode,
} from "react";

import DigitalAlbumPhoto
  from "../../DigitalAlbumPhoto/DigitalAlbumPhoto";

import DigitalAlbumEditableText
  from "../../../../editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText";

import type {
  DigitalAlbumDocumentPage,
  DigitalAlbumPageContent,
  DigitalAlbumPageLayout,
} from "../../../../types/digitalAlbumDocument.types";

import type {
  DigitalAlbumRendererPhoto,
} from "../../types/digitalAlbumRenderer.types";

import styles
  from "./DigitalAlbumLayouts.module.css";


import type { Parts } from "./types";
import compositionStyles from "./DigitalAlbumCompositions.module.css";
import CoverLayout from "./compositions/CoverLayout";
import FullPhotoLayout from "./compositions/FullPhotoLayout";
import TwoPhotosLayout from "./compositions/TwoPhotosLayout";
import EditorialLayout from "./compositions/EditorialLayout";
import StoryLayout from "./compositions/StoryLayout";
import CollageLayout from "./compositions/CollageLayout";
import PortraitPlateLayout from "./compositions/PortraitPlateLayout";
import LandscapePlateLayout from "./compositions/LandscapePlateLayout";
import PortraitDiptychLayout from "./compositions/PortraitDiptychLayout";
import MixedPairLayout from "./compositions/MixedPairLayout";
import HeroDetailLayout from "./compositions/HeroDetailLayout";
import QuoteLayout from "./compositions/QuoteLayout";
import ClosingLayout from "./compositions/ClosingLayout";

import SplitLayout from "./compositions/SplitLayout";
import ThreeGridLayout from "./compositions/ThreeGridLayout";
import FourGridLayout from "./compositions/FourGridLayout";
import HeroTextLayout from "./compositions/HeroTextLayout";
import PortraitPairTextLayout from "./compositions/PortraitPairTextLayout";
import MosaicLayout from "./compositions/MosaicLayout";

const layouts: Record<DigitalAlbumPageLayout, (parts: Parts) => ReactNode> = {
  "closing": ClosingLayout,
  "collage": CollageLayout,
  "cover": CoverLayout,
  "editorial": EditorialLayout,
  "four-grid": FourGridLayout,
  "full-photo": FullPhotoLayout,
  "hero-detail": HeroDetailLayout,
  "hero-text": HeroTextLayout,
  "landscape-plate": LandscapePlateLayout,
  "mixed-pair": MixedPairLayout,
  "mosaic": MosaicLayout,
  "portrait-diptych": PortraitDiptychLayout,
  "portrait-pair-text": PortraitPairTextLayout,
  "portrait-plate": PortraitPlateLayout,
  "quote": QuoteLayout,
  "split": SplitLayout,
  "story": StoryLayout,
  "three-grid": ThreeGridLayout,
  "two-photos": TwoPhotosLayout,
};

export default function DigitalAlbumLayouts({
  page,
  photos,
  photosById,
  activePhotoSlotId,
  onSelectPhotoSlot,
  onPageContentChange,
  showTextPlaceholders,
  showPhotoPlaceholders,
}: {
  page:
    DigitalAlbumDocumentPage;

  photos:
    DigitalAlbumRendererPhoto[];
  photosById?: ReadonlyMap<string, DigitalAlbumRendererPhoto>;

  activePhotoSlotId?:
    string | null;

  onSelectPhotoSlot?:
    (id: string) => void;

  showTextPlaceholders?: boolean;
  showPhotoPlaceholders?: boolean;

  onPageContentChange?:
    (
      content:
        Partial<DigitalAlbumPageContent>,
    ) => void;
}) {
  const t =
    useTranslations(
      "DigitalAlbumEditor.upgrade.fields"
    );

  const Composition =
    layouts[
      page.layout
    ];
  const locale = useLocale();


  /* ==========================================================================
     Photo
  ========================================================================== */

  function photo(
    index: number,
  ) {
    const slot =
      page.photos[
        index
      ];

    if (!slot) {
      return null;
    }

    const asset = photosById
      ? slot.photoId == null ? undefined : photosById.get(slot.photoId)
      : photos.find(
        (photo) =>
          photo.id ===
          slot.photoId
      );

    const description =
      slot.caption ??
      asset?.description;

    return (
      <figure
        data-album-photo-figure
        data-editable={Boolean(onSelectPhotoSlot) || undefined}
        className={
          styles.figure
        }
      >
        <div
          className={
            styles.image
          }
        >
          <DigitalAlbumPhoto
            showPlaceholder={showPhotoPlaceholders}
            slot={
              slot
            }
            photo={
              asset
            }
            active={
              slot.id ===
              activePhotoSlotId
            }
            onSelect={
              onSelectPhotoSlot
            }
          />
        </div>

        {
          asset && description && (
            <figcaption
              data-album-text-area
              data-album-caption
              data-album-text
              className={
                styles.caption
              }
            >
              {
                description
              }
            </figcaption>
          )
        }
      </figure>
    );
  }


  /* ==========================================================================
     Text
  ========================================================================== */

  function text(
    field:
      keyof DigitalAlbumPageContent,
  ) {
    return (
      <DigitalAlbumEditableText
        field={field}
        showPlaceholder={showTextPlaceholders || Boolean(onPageContentChange)}
        displayValue={field === "date" ? formatDigitalAlbumDate(page.content.date, locale) : undefined}
        value={
          page.content[
            field
          ]
        }
        placeholder={
          t(
            field
          )
        }
        editable={
          Boolean(
            onPageContentChange
          )
        }
        className={
          styles[
            field
          ]
        }
        onChange={(
          value
        ) =>
          onPageContentChange?.({
            [field]:
              value,
          })
        }
      />
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        [styles.page, compositionStyles.composition].join(" ")
      }
      data-album-page={
        page.id
      }
      data-composition={
        page.layout
      }
      data-album-layout-version="2"
    >
      <Composition
        photo={
          photo
        }
        text={
          text
        }
      />
    </div>
  );
}
