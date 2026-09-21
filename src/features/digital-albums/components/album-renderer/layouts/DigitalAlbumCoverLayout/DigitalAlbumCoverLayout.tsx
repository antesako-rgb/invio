import Image
  from "next/image";

import DigitalAlbumEditableText
  from "@/features/digital-albums/editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText";

import DigitalAlbumPhotoSlot
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPhotoSlot/DigitalAlbumPhotoSlot";

import type {
  DigitalAlbumPageContent,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import styles
  from "./DigitalAlbumCoverLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumCoverLayoutProps {
  photoSlotId:
    string;

  imageUrl:
    string | null;

  alt?:
    string;

  title?:
    string;

  subtitle?:
    string;

  text?:
    string;

  active?:
    boolean;

  photoEditable?:
    boolean;

  contentEditable?:
    boolean;

  onSelectPhotoSlot?:
    (
      photoSlotId:
        string
    ) => void;

  onContentChange?:
    (
      content:
        Partial<DigitalAlbumPageContent>
    ) => void;
}


/* ==========================================================================
   Digital Album Cover Layout
========================================================================== */

export default function DigitalAlbumCoverLayout({
  photoSlotId,
  imageUrl,
  alt = "",
  title,
  subtitle,
  text,
  active = false,
  photoEditable = false,
  contentEditable = false,
  onSelectPhotoSlot,
  onContentChange,
}: DigitalAlbumCoverLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      <DigitalAlbumPhotoSlot
        slotId={
          photoSlotId
        }
        active={
          active
        }
        editable={
          photoEditable
        }
        empty={
          !imageUrl
        }
        onSelect={
          onSelectPhotoSlot
        }
      >
        {imageUrl && (
          <Image
            src={
              imageUrl
            }
            alt={
              alt
            }
            fill
            sizes="480px"
            className={
              styles.image
            }
          />
        )}
      </DigitalAlbumPhotoSlot>

      {imageUrl && (
        <div
          className={
            styles.overlay
          }
        />
      )}

      <div
        className={
          styles.content
        }
      >
        <DigitalAlbumEditableText
          value={
            text
          }
          placeholder="15 · 06 · 2027"
          editable={
            contentEditable
          }
          className={
            styles.text
          }
          onChange={
            (value) =>
              onContentChange?.({
                text:
                  value,
              })
          }
        />

        <DigitalAlbumEditableText
          value={
            title
          }
          placeholder="Ana & Marko"
          editable={
            contentEditable
          }
          className={
            styles.title
          }
          onChange={
            (value) =>
              onContentChange?.({
                title:
                  value,
              })
          }
        />

        <DigitalAlbumEditableText
          value={
            subtitle
          }
          placeholder="Naše uspomene"
          editable={
            contentEditable
          }
          className={
            styles.subtitle
          }
          onChange={
            (value) =>
              onContentChange?.({
                subtitle:
                  value,
              })
          }
        />
      </div>
    </div>
  );
}