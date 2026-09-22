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
  from "./DigitalAlbumCollageLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface CollagePhoto {
  imageUrl:
    string;

  description:
    string | null;
}

interface DigitalAlbumCollageLayoutProps {
  firstPhotoSlotId:
    string;

  secondPhotoSlotId:
    string;

  thirdPhotoSlotId:
    string;

  firstPhoto:
    CollagePhoto | null;

  secondPhoto:
    CollagePhoto | null;

  thirdPhoto:
    CollagePhoto | null;

  title?:
    string;

  text?:
    string;

  activePhotoSlotId?:
    string | null;

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
   Digital Album Collage Layout
========================================================================== */

export default function DigitalAlbumCollageLayout({
  firstPhotoSlotId,
  secondPhotoSlotId,
  thirdPhotoSlotId,
  firstPhoto,
  secondPhoto,
  thirdPhoto,
  title,
  text,
  activePhotoSlotId,
  photoEditable = false,
  contentEditable = false,
  onSelectPhotoSlot,
  onContentChange,
}: DigitalAlbumCollageLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      <div
        className={
          styles.firstPhoto
        }
      >
        <DigitalAlbumPhotoSlot
          slotId={
            firstPhotoSlotId
          }
          active={
            firstPhotoSlotId ===
            activePhotoSlotId
          }
          editable={
            photoEditable
          }
          empty={
            !firstPhoto
          }
          onSelect={
            onSelectPhotoSlot
          }
        >
          {firstPhoto && (
            <Image
              src={
                firstPhoto.imageUrl
              }
              alt={
                firstPhoto.description ??
                ""
              }
              fill
              sizes="240px"
              className={
                styles.image
              }
            />
          )}
        </DigitalAlbumPhotoSlot>
      </div>

      <div
        className={
          styles.secondPhoto
        }
      >
        <DigitalAlbumPhotoSlot
          slotId={
            secondPhotoSlotId
          }
          active={
            secondPhotoSlotId ===
            activePhotoSlotId
          }
          editable={
            photoEditable
          }
          empty={
            !secondPhoto
          }
          onSelect={
            onSelectPhotoSlot
          }
        >
          {secondPhoto && (
            <Image
              src={
                secondPhoto.imageUrl
              }
              alt={
                secondPhoto.description ??
                ""
              }
              fill
              sizes="240px"
              className={
                styles.image
              }
            />
          )}
        </DigitalAlbumPhotoSlot>
      </div>

      <div
        className={
          styles.thirdPhoto
        }
      >
        <DigitalAlbumPhotoSlot
          slotId={
            thirdPhotoSlotId
          }
          active={
            thirdPhotoSlotId ===
            activePhotoSlotId
          }
          editable={
            photoEditable
          }
          empty={
            !thirdPhoto
          }
          onSelect={
            onSelectPhotoSlot
          }
        >
          {thirdPhoto && (
            <Image
              src={
                thirdPhoto.imageUrl
              }
              alt={
                thirdPhoto.description ??
                ""
              }
              fill
              sizes="240px"
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
            text
          }
          placeholder="09"
          editable={
            contentEditable
          }
          className={
            styles.number
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
          placeholder="Obitelj i prijatelji"
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
      </div>
    </div>
  );
}