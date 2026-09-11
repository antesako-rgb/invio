import EventExperienceDescription
  from "@/features/invitations/cards/components/EventExperienceDescription/EventExperienceDescription";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  EventExperienceTemplateProps,
} from "@/features/invitations/types/eventExperienceTemplate.types";

import {
  gardenGraceSaveTheDateCardAssets,
} from "./GardenGraceSaveTheDateCardAssets";

import "./GardenGraceSaveTheDateCard.css";
import "../styles/gardenGraceTokens.css";
import "../styles/gardenGraceVariants.css";


/* ==========================================================================
   Garden Grace Save The Date Card
========================================================================== */

export default function GardenGraceSaveTheDateCard({
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

  const {
    date,
  } =
    data.display;

  const {
    address:
      locationAddress,
  } =
    data.content.location;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <article
      className="garden-grace-save-the-date-card"
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="garden-grace-save-the-date-card__background"
        aria-hidden="true"
      />


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="garden-grace-save-the-date-card__frame"
        src={
          gardenGraceSaveTheDateCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="garden-grace-save-the-date-card__content"
      >
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
            className="garden-grace-save-the-date-card__title"
          >
            {title}
          </EditableText>
        )}


        {/* ==================================================================
            Names
        ================================================================== */}

        {(primary_name || secondary_name) && (
          <h1
            className="garden-grace-save-the-date-card__names"
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
                className="garden-grace-save-the-date-card__name"
              >
                {primary_name}
              </EditableText>
            )}

            {primary_name && secondary_name && (
              <span
                className="garden-grace-save-the-date-card__name-separator"
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
                className="garden-grace-save-the-date-card__name"
              >
                {secondary_name}
              </EditableText>
            )}
          </h1>
        )}


        {/* ==================================================================
            Event
        ================================================================== */}

        <div
          className="garden-grace-save-the-date-card__event"
        >
          {date.hasDate && (
            <EditableText
              element="date.start_date"
              mode={
                mode
              }
              editor={
                editor
              }
              className="garden-grace-save-the-date-card__date"
            >
              {date.formatted}
            </EditableText>
          )}

          {locationAddress && (
            <EditableText
              element="location.address"
              mode={
                mode
              }
              editor={
                editor
              }
              className="garden-grace-save-the-date-card__location"
            >
              {locationAddress}
            </EditableText>
          )}
        </div>


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