"use client";

import {
  Heart,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import DeleteButton
  from "@/components/ui/common/DeleteButton";

import styles
  from "./PhotoWallPhotoManagementActions.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotoManagementActionsProps {
  isFavorite:
    boolean;

  isFavoritePending:
    boolean;

  isDeleting:
    boolean;

  onFavoriteChange:
    () => void;

  onDelete:
    () => void | Promise<void>;
}


/* ==========================================================================
   Photo Wall Photo Management Actions
========================================================================== */

export default function PhotoWallPhotoManagementActions({
  isFavorite,
  isFavoritePending,
  isDeleting,
  onFavoriteChange,
  onDelete,
}: PhotoWallPhotoManagementActionsProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.photoWall.photos.actions"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.actions
      }
    >
      <button
        type="button"
        className={
          styles.favorite
        }
        data-active={
          isFavorite
            ? "true"
            : "false"
        }
        aria-label={
          isFavorite
            ? t(
                "removeFavorite"
              )
            : t(
                "addFavorite"
              )
        }
        aria-pressed={
          isFavorite
        }
        disabled={
          isFavoritePending ||
          isDeleting
        }
        onClick={
          onFavoriteChange
        }
      >
        <Heart
          size={
            18
          }
          strokeWidth={
            2
          }
          fill={
            isFavorite
              ? "currentColor"
              : "none"
          }
        />
      </button>

      <DeleteButton
        display="icon"
        ariaLabel={
          t(
            "delete"
          )
        }
        title={
          t(
            "deleteConfirm.title"
          )
        }
        description={
          t(
            "deleteConfirm.description"
          )
        }
        confirmText={
          t(
            "deleteConfirm.confirm"
          )
        }
        loading={
          isDeleting
        }
        onDelete={
          onDelete
        }
      />
    </div>
  );
}