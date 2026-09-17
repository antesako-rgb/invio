import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  EventExperienceTemplateProps,
} from "@/features/invitations/types/eventExperienceTemplate.types";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallCardContentProps {
  data:
    EventExperienceTemplateProps["data"];

  mode:
    EventExperienceTemplateProps["mode"];

  editor:
    EventExperienceTemplateProps["editor"];

  classNames: {
    content:
      string;

    names:
      string;

    name:
      string;

    nameSeparator:
      string;

    title:
      string;

    subtitle:
      string;
  };
}


/* ==========================================================================
   Photo Wall Card Content
========================================================================== */

export default function PhotoWallCardContent({
  data,
  mode,
  editor,
  classNames,
}: PhotoWallCardContentProps) {
  const {
    title,
    subtitle,
    primary_name,
    secondary_name,
  } =
    data.content.hero;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        classNames.content
      }
    >
      {/* ====================================================================
          Names
      ==================================================================== */}

      {(primary_name || secondary_name) && (
        <div
          className={
            classNames.names
          }
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
              className={
                classNames.name
              }
            >
              {primary_name}
            </EditableText>
          )}

          {primary_name && secondary_name && (
            <span
              className={
                classNames.nameSeparator
              }
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
              className={
                classNames.name
              }
            >
              {secondary_name}
            </EditableText>
          )}
        </div>
      )}


      {/* ====================================================================
          Title
      ==================================================================== */}

      {title && (
        <EditableText
          element="hero.title"
          mode={
            mode
          }
          editor={
            editor
          }
          className={
            classNames.title
          }
        >
          {title}
        </EditableText>
      )}


      {/* ====================================================================
          Subtitle
      ==================================================================== */}

      {subtitle && (
        <EditableText
          element="hero.subtitle"
          mode={
            mode
          }
          editor={
            editor
          }
          className={
            classNames.subtitle
          }
        >
          {subtitle}
        </EditableText>
      )}
    </div>
  );
}