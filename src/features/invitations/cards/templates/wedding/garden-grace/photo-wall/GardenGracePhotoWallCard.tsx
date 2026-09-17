import PhotoWallCardContent
  from "@/features/invitations/cards/components/PhotoWallCardContent/PhotoWallCardContent";

import PhotoWallCardFooter
  from "@/features/invitations/cards/components/PhotoWallCardFooter/PhotoWallCardFooter";

import EventExperienceQrCode
  from "@/features/invitations/cards/components/EventExperienceQrCode/EventExperienceQrCode";

import type {
  EventExperienceTemplateProps,
} from "@/features/invitations/types/eventExperienceTemplate.types";

import {
  gardenGracePhotoWallCardAssets,
} from "./GardenGracePhotoWallCardAssets";

import "./GardenGracePhotoWallCard.css";
import "../styles/gardenGraceTokens.css";
import "../styles/gardenGraceVariants.css";


/* ==========================================================================
   Garden Grace Photo Wall Card
========================================================================== */

export default function GardenGracePhotoWallCard({
  data,
  mode,
  editor,
}: EventExperienceTemplateProps) {
  return (
    <article
      className="garden-grace-photo-wall-card"
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="garden-grace-photo-wall-card__background"
        aria-hidden="true"
      />


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="garden-grace-photo-wall-card__frame"
        src={
          gardenGracePhotoWallCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Layout
      ==================================================================== */}

      <div
        className="garden-grace-photo-wall-card__layout"
      >
        {/* ==================================================================
            Content
        ================================================================== */}

        <PhotoWallCardContent
          data={
            data
          }
          mode={
            mode
          }
          editor={
            editor
          }
          classNames={{
            content:
              "garden-grace-photo-wall-card__content",

            names:
              "garden-grace-photo-wall-card__names",

            name:
              "garden-grace-photo-wall-card__name",

            nameSeparator:
              "garden-grace-photo-wall-card__name-separator",

            title:
              "garden-grace-photo-wall-card__title",

            subtitle:
              "garden-grace-photo-wall-card__subtitle",
          }}
        />


        {/* ==================================================================
            QR
        ================================================================== */}

        {data.publicUrl && (
          <div
            className="garden-grace-photo-wall-card__qr"
          >
            <EventExperienceQrCode
              value={
                data.publicUrl
              }
              ariaLabel="QR kod za Photo Wall"
            />
          </div>
        )}


        {/* ==================================================================
            Footer
        ================================================================== */}

        <PhotoWallCardFooter
          description={
            data.content.description
          }
          display={
            data.display
          }
          mode={
            mode
          }
          editor={
            editor
          }
          className="garden-grace-photo-wall-card__footer"
        />
      </div>
    </article>
  );
}