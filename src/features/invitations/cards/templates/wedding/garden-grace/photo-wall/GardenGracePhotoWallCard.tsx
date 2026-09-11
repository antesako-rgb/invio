import EventExperienceDescription
  from "@/features/invitations/cards/components/EventExperienceDescription/EventExperienceDescription";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

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
  const {
    title,
    primary_name,
    secondary_name,
  } =
    data.content.hero;

  const {
    description,
  } =
    data.content;


  /* ==========================================================================
     Render
  ========================================================================== */

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
          Content
      ==================================================================== */}

      <div
        className="garden-grace-photo-wall-card__content"
      >
        {/* ==================================================================
            Names
        ================================================================== */}

        {(primary_name || secondary_name) && (
          <div
            className="garden-grace-photo-wall-card__names"
          >
            {primary_name && (
              <EditableText
                element="hero.primary_name"
                mode={
                  mode
                }
                editor={
                  editor
                }
                className="garden-grace-photo-wall-card__name"
              >
                {primary_name}
              </EditableText>
            )}

            {primary_name && secondary_name && (
              <span
                className="garden-grace-photo-wall-card__name-separator"
                aria-hidden="true"
              >
                &
              </span>
            )}

            {secondary_name && (
              <EditableText
                element="hero.secondary_name"
                mode={
                  mode
                }
                editor={
                  editor
                }
                className="garden-grace-photo-wall-card__name"
              >
                {secondary_name}
              </EditableText>
            )}
          </div>
        )}


        {/* ==================================================================
            Title
        ================================================================== */}

        {title && (
          <EditableText
            element="hero.title"
            mode={
              mode
            }
            editor={
              editor
            }
            className="garden-grace-photo-wall-card__title"
          >
            {title}
          </EditableText>
        )}


        {/* ==================================================================
            Description
        ================================================================== */}

        <EventExperienceDescription
          value={
            description
          }
          mode={
            mode
          }
          editor={
            editor
          }
        />
      </div>
    </article>
  );
}