import DigitalAlbumEditableText
  from "@/features/digital-albums/editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText";

import type {
  DigitalAlbumPageContent,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import styles
  from "./DigitalAlbumStoryLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumStoryLayoutProps {
  title?:
    string;

  subtitle?:
    string;

  text?:
    string;

  contentEditable?:
    boolean;

  onContentChange?:
    (
      content:
        Partial<DigitalAlbumPageContent>
    ) => void;
}


/* ==========================================================================
   Digital Album Story Layout
========================================================================== */

export default function DigitalAlbumStoryLayout({
  title,
  subtitle,
  text,
  contentEditable = false,
  onContentChange,
}: DigitalAlbumStoryLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      <div
        className={
          styles.content
        }
      >
        <div
          className={
            styles.heading
          }
        >
          <DigitalAlbumEditableText
            value={
              subtitle
            }
            placeholder="Naš dan"
            editable={
              contentEditable
            }
            className={
              styles.eyebrow
            }
            onChange={
              (value) =>
                onContentChange?.({
                  subtitle:
                    value,
                })
            }
          />

          <DigitalAlbumEditableText
            value={
              title
            }
            placeholder={"Naše\nvjenčanje"}
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

          <div
            className={
              styles.divider
            }
          />

          <div
            className={
              styles.date
            }
          >
            15. lipnja 2027.
          </div>
        </div>

        <DigitalAlbumEditableText
          value={
            text
          }
          placeholder={"Jedan dan.\nTisuću uspomena."}
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

      <span
        className={
          styles.pageNumber
        }
      >
        01
      </span>
    </div>
  );
}