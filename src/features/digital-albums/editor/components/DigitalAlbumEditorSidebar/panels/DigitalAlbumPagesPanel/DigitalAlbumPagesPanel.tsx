"use client";

import {
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import DigitalAlbumPagePreview
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPagePreview/DigitalAlbumPagePreview";

import type {
  DigitalAlbumDocumentPage,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import styles
  from "./DigitalAlbumPagesPanel.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPagesPanelProps {
  pages:
    DigitalAlbumDocumentPage[];

  photos:
    DigitalAlbumPhotoWithPhoto[];

  activePageId:
    string | null;

  visiblePageIndexes:
    number[];

  onSelectPage:
    (
      pageId:
        string
    ) => void;

  onAddPage:
    () => void;
}


/* ==========================================================================
   Digital Album Pages Panel
========================================================================== */

export default function DigitalAlbumPagesPanel({
  pages,
  photos,
  activePageId,
  visiblePageIndexes,
  onSelectPage,
  onAddPage,
}: DigitalAlbumPagesPanelProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor.pages"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      <div
        className={
          styles.header
        }
      >
        <span
          className={
            styles.count
          }
        >
          {t(
            "count",
            {
              count:
                pages.length,
            }
          )}
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className={
          styles.addButton
        }
        onClick={
          onAddPage
        }
      >
        <Plus
          aria-hidden="true"
        />

        {t(
          "add"
        )}
      </Button>

      <div
        className={
          styles.list
        }
      >
        {pages.map(
          (
            page,
            index
          ) => {
            const isActive =
              page.id ===
              activePageId;

            const isVisible =
              visiblePageIndexes.includes(
                index
              );

            return (
              <button
                key={
                  page.id
                }
                type="button"
                className={
                  styles.item
                }
                data-active={
                  isActive
                    ? ""
                    : undefined
                }
                data-visible={
                  isVisible
                    ? ""
                    : undefined
                }
                onClick={
                  () =>
                    onSelectPage(
                      page.id
                    )
                }
              >
                <div
                  className={
                    styles.preview
                  }
                >
                  <DigitalAlbumPagePreview
                    page={
                      page
                    }
                    photos={
                      photos
                    }
                  />
                </div>

                <span
                  className={
                    styles.label
                  }
                >
                  {t(
                    "page",
                    {
                      number:
                        index + 1,
                    }
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}