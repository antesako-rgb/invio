import InvitationDescription
  from "@/features/invitations/cards/components/InvitationDescription/InvitationDescription";

import InvitationEventInfo
  from "@/features/invitations/cards/components/InvitationEventInfo/InvitationEventInfo";

import InvitationImageFrame
  from "@/features/invitations/cards/components/InvitationImageFrame/InvitationImageFrame";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  InvitationTemplateProps,
} from "@/features/invitations/types/invitationTemplate.types";

import {
  portraitCardAssets,
} from "./PortraitCardAssets";

import "./PortraitCard.css";
import "./styles/portraitTokens.css";
import "./styles/portraitVariants.css";


/* ==========================================================================
   Portrait Card
========================================================================== */

export default function PortraitCard({
  data,
  mode,
  editor,
}: InvitationTemplateProps) {
  const {
    primary_name,
    secondary_name,
    subtitle,
  } =
    data.content.hero;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <article
      className="portrait-card"
      data-invitation-card="portrait"
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="portrait-card__background"
        aria-hidden="true"
      />


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="portrait-card__frame"
        src={
          portraitCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="portrait-card__content"
      >
        {/* ==================================================================
            Hero
        ================================================================== */}

        <div
          className="portrait-card__hero"
        >
          {/* ================================================================
              Subtitle
          ================================================================ */}

          {subtitle && (
            <EditableText
              element="hero.subtitle"
              mode={
                mode
              }
              editor={
                editor
              }
              className="portrait-card__subtitle"
            >
              {subtitle}
            </EditableText>
          )}


          {/* ================================================================
              Names
          ================================================================ */}

          {(primary_name || secondary_name) && (
            <h1
              className="portrait-card__names"
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
                  className="portrait-card__name"
                >
                  {primary_name}
                </EditableText>
              )}

              {primary_name && secondary_name && (
                <span
                  className="portrait-card__name-separator"
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
                  className="portrait-card__name"
                >
                  {secondary_name}
                </EditableText>
              )}
            </h1>
          )}
        </div>


        {/* ==================================================================
            Photo
        ================================================================== */}

        <InvitationImageFrame
          element="media.image_url"
          value={
            data.content.media.image_url
          }
          mode={
            mode
          }
          editor={
            editor
          }
          mask={
            portraitCardAssets.mask
          }
          frame={
            portraitCardAssets.maskFrame
          }
          className="portrait-card__photo"
        >
          <div
            className="portrait-card__photo-placeholder"
          />
        </InvitationImageFrame>


        {/* ==================================================================
            Event Info
        ================================================================== */}

        <InvitationEventInfo
          display={
            data.display
          }
          mode={
            mode
          }
          editor={
            editor
          }
        />


        {/* ==================================================================
            Description
        ================================================================== */}

        <InvitationDescription
          value={
            data.content.description
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