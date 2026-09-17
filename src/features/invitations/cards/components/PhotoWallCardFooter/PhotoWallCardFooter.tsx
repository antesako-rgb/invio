import EventExperienceDescription
  from "@/features/invitations/cards/components/EventExperienceDescription/EventExperienceDescription";

import EditableDate
  from "@/features/invitations/editor/components/EditableDate/EditableDate";

import type {
  EventExperienceEditorContext,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceDisplayData,
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./PhotoWallCardFooter.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallCardFooterProps {
  description:
    string | null;

  display:
    EventExperienceDisplayData;

  mode:
    EventExperienceRenderMode;

  editor?:
    EventExperienceEditorContext;

  className?:
    string;
}


/* ==========================================================================
   Photo Wall Card Footer
========================================================================== */

export default function PhotoWallCardFooter({
  description,
  display,
  mode,
  editor,
  className,
}: PhotoWallCardFooterProps) {
  const hasDescription =
    Boolean(
      description
    );

  const hasDate =
    display.date.hasDate;


  /* ==========================================================================
     Empty
  ========================================================================== */

  if (
    !hasDescription &&
    !hasDate
  ) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        className
      }
      data-photo-wall-card-footer
    >
      {/* ====================================================================
          Description
      ==================================================================== */}

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


      {/* ====================================================================
          Date
      ==================================================================== */}

      {hasDate && (
        <div
          className="photo-wall-card-footer__date"
        >
          <EditableDate
            month={
              display.date.month
            }
            day={
              display.date.day
            }
            dayName={
              display.date.dayName
            }
            year={
              display.date.year
            }
            mode={
              mode
            }
            editor={
              editor
            }
          >
            {() => (
              <>
                {display.date.formatted}
              </>
            )}
          </EditableDate>
        </div>
      )}
    </div>
  );
}