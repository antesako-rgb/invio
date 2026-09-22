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
  from "./DigitalAlbumEditorialLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorialLayoutProps {
  photoSlotId:
    string;

  imageUrl:
    string | null;

  alt?:
    string;

  title?:
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
   Digital Album Editorial Layout
========================================================================== */

export default function DigitalAlbumEditorialLayout({
  photoSlotId,
  imageUrl,
  alt = "",
  title,
  text,
  active = false,
  photoEditable = false,
  contentEditable = false,
  onSelectPhotoSlot,
  onContentChange,
}: DigitalAlbumEditorialLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      <div
        className={
          styles.photo
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
      </div>

      <div
        className={
          styles.content
        }
      >
        <DigitalAlbumEditableText
          value={
            title
          }
          placeholder="Naš poseban dan"
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
            text
          }
          placeholder="Ovdje napišite priču koja prati ovu fotografiju..."
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
      </div>
    </div>
  );
}