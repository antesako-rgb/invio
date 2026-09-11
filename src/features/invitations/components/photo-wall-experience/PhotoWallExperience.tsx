"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ImagePlus,
  Images,
} from "lucide-react";
import {
  useTranslations,
} from "next-intl";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import PhotoWallGallery
  from "@/features/invitations/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery";

import type {
  PhotoWallGalleryPhoto,
} from "@/features/invitations/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery";

import PhotoWallUpload
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload";

import "./PhotoWallExperience.css";


/* ==========================================================================
   Types
========================================================================== */
interface PhotoWallExperienceProps {
  publicId:
    string | null;

  primaryName:
    string | null;

  secondaryName:
    string | null;

  date:
    string | null;

  photos:
    PhotoWallGalleryPhoto[];

  onBack?:
    () => void;
}


/* ==========================================================================
   Photo Wall Experience
========================================================================== */

export default function PhotoWallExperience({
  publicId,
  primaryName,
  secondaryName,
  date,
  photos,
  onBack,
}: PhotoWallExperienceProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall"
    );

  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isUploadOpen,
    setIsUploadOpen,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const names =
    [
      primaryName,
      secondaryName,
    ]
      .filter(Boolean)
      .join(" & ");

  const hasPhotos =
    photos.length >
    0;

  /* ==========================================================================
     Upload
  ========================================================================== */

  function handleAddPhotos() {
    if (
      !publicId
    ) {
      return;
    }

    setIsUploadOpen(
      true
    );
  }

  function handleUploadOpenChange(
    open:
      boolean
  ) {
    setIsUploadOpen(
      open
    );
  }

function handleUploadSuccess() {
  setIsUploadOpen(
    false
  );

  router.refresh();
}

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <section
        className="photo-wall-experience"
        data-photo-wall-experience
      >
        {/* ==================================================================
            Navigation
        ================================================================== */}

        {onBack && (
          <button
            type="button"
            className="photo-wall-experience__back"
            onClick={
              onBack
            }
            aria-label={
              t(
                "back"
              )
            }
          >
            <ArrowLeft
              aria-hidden="true"
            />
          </button>
        )}


        {/* ==================================================================
            Header
        ================================================================== */}

        <header
          className="photo-wall-experience__header"
        >
          {names && (
            <h1
              className="photo-wall-experience__names"
            >
              {names}
            </h1>
          )}

          {date && (
            <p
              className="photo-wall-experience__date"
            >
              {date}
            </p>
          )}

          {hasPhotos && (
            <button
              type="button"
              className="photo-wall-experience__add"
              onClick={
                handleAddPhotos
              }
            >
              <ImagePlus
                aria-hidden="true"
              />

              {t(
                "actions.addPhotos"
              )}
            </button>
          )}
        </header>


        {/* ==================================================================
            Photos
        ================================================================== */}

        {hasPhotos
          ? (
              <>
                <p
                  className="photo-wall-experience__count"
                >
                  {t(
                    "gallery.count",
                    {
                      count:
                        photos.length,
                    }
                  )}
                </p>

                <PhotoWallGallery
                  photos={
                    photos
                  }
                  primaryName={
                    primaryName
                  }
                  secondaryName={
                    secondaryName
                  }
                  date={
                    date
                  }
                />
              </>
            )
          : (
              <EmptyState
                icon={
                  Images
                }
                title={
                  t(
                    "gallery.empty"
                  )
                }
                description={
                  t(
                    "gallery.emptyDescription"
                  )
                }
                action={
                  <button
                    type="button"
                    className="photo-wall-experience__add"
                    onClick={
                      handleAddPhotos
                    }
                  >
                    <ImagePlus
                      aria-hidden="true"
                    />

                    {t(
                      "actions.addPhotos"
                    )}
                  </button>
                }
              />
            )}
      </section>


      {/* ====================================================================
          Photo Wall Upload
      ==================================================================== */}

      {publicId && (
        <PhotoWallUpload
          open={
            isUploadOpen
          }
          publicId={
            publicId
          }
          primaryName={
            primaryName
          }
          secondaryName={
            secondaryName
          }
          date={
            date
          }
          onOpenChange={
            handleUploadOpenChange
          }
          onSuccess={
            handleUploadSuccess
          }
        />
      )}
    </>
  );
}