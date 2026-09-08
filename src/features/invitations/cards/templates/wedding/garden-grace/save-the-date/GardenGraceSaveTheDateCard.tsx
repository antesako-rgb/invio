import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import InvitationDescription
  from "@/features/invitations/cards/components/InvitationDescription/InvitationDescription";

import type {
  InvitationTemplateProps,
} from "@/features/invitations/types/invitationTemplate.types";

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
}: InvitationTemplateProps) {
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
      data-invitation-card="garden-grace-save-the-date"
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

        <InvitationDescription
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