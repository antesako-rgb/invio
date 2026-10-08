"use client";

import {
  Camera,
  Trash2,
} from "lucide-react";

import IconButton
  from "@/components/ui/icon-button/IconButton";

import styles
  from "./PhotoUploadComposer.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoUploadComposerProps {
  previewUrl:
    string;

  description:
    string;

  descriptionPlaceholder:
    string;

  descriptionLabel:
    string;

  removeLabel:
    string;

  disabled?:
    boolean;

  onDescriptionChange:
    (
      value:
        string
    ) => void;

  onRemove?:
    () => void;
}


/* ==========================================================================
   Photo Upload Composer
========================================================================== */

export default function PhotoUploadComposer({
  previewUrl,
  description,
  descriptionPlaceholder,
  descriptionLabel,
  removeLabel,
  disabled = false,
  onDescriptionChange,
  onRemove,
}: PhotoUploadComposerProps) {
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
            styles.media
          }
        >
          <div
            className={
              styles.frame
            }
          >
            <img
              src={
                previewUrl
              }
              alt=""
              className={
                styles.image
              }
            />

            <span
              className={
                styles.camera
              }
              aria-hidden="true"
            >
              <Camera />
            </span>

            {onRemove && (
              <IconButton
                className={
                  styles.remove
                }
                disabled={
                  disabled
                }
                onClick={
                  onRemove
                }
                aria-label={
                  removeLabel
                }
              >
                <Trash2
                  aria-hidden="true"
                />
              </IconButton>
            )}
          </div>
        </div>

        <div
          className={
            styles.caption
          }
        >
          <textarea
            value={
              description
            }
            rows={
              2
            }
            maxLength={
              300
            }
            disabled={
              disabled
            }
            className={
              styles.description
            }
            placeholder={
              descriptionPlaceholder
            }
            aria-label={
              descriptionLabel
            }
            onChange={(
              event
            ) =>
              onDescriptionChange(
                event.target.value
              )
            }
          />
        </div>
      </div>
    </div>
  );
}