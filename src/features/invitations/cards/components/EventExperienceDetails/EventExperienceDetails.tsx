import EditableDate
  from "@/features/invitations/editor/components/EditableDate/EditableDate";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import EditableTime
  from "@/features/invitations/editor/components/EditableTime/EditableTime";

import type {
  EventExperienceEditorContext
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceDisplayData,
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./EventExperienceDetails.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceDetailsProps {
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
   Event Experience Details
========================================================================== */

export default function EventExperienceDetails({
  display,
  mode,
  editor,
  className,
}: EventExperienceDetailsProps) {
  return (
    <div
      className={
        className
      }
      data-event-experience-details
    >
      {/* ====================================================================
          Date
      ==================================================================== */}

      {display.date.hasDate && (
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
          {({
            month,
            day,
            dayName,
          }) => (
            <>
              <span
                data-event-experience-details-date-main
              >
                {month} {day}
              </span>

              {dayName && (
                <span
                  data-event-experience-details-day-name
                >
                  {dayName},
                </span>
              )}
            </>
          )}
        </EditableDate>
      )}


      {/* ====================================================================
          Time
      ==================================================================== */}

      {(
        mode === "edit" ||
        display.time.hasTime
      ) && (
        <EditableTime
          mode={
            mode
          }
          editor={
            editor
          }
        >
          {display.time.text}
        </EditableTime>
      )}


      {/* ====================================================================
          Location
      ==================================================================== */}

      {display.location.hasLocation && (
        <div
          data-event-experience-details-location
        >
          {display.location.venueName && (
            <EditableText
              element="location.name"
              mode={
                mode
              }
              editor={
                editor
              }
            >
              {display.location.venueName}
            </EditableText>
          )}

          {display.location.address && (
            <EditableText
              element="location.address"
              mode={
                mode
              }
              editor={
                editor
              }
            >
              {display.location.address}
            </EditableText>
          )}
        </div>
      )}
    </div>
  );
}