import {
  MapPin,
} from "lucide-react";

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

import "./EventExperienceSchedule.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceScheduleProps {
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
   Event Experience Schedule
========================================================================== */

export default function EventExperienceSchedule({
  display,
  mode,
  editor,
  className,
}: EventExperienceScheduleProps) {
  return (
    <div
      className={
        className
      }
      data-event-experience-schedule
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
            year,
          }) => (
            <span
              data-event-experience-schedule-date
            >
              {dayName && (
                <>
                  {dayName},{" "}
                </>
              )}

              {month} {day}

              {display.date.hasEndDate && (
                <>
                  {" – "}
                  {display.date.endMonth}{" "}
                  {display.date.endDay}
                </>
              )}

              {year && (
                <>
                  , {year}
                </>
              )}
            </span>
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
          data-event-experience-schedule-location
        >
          <MapPin
            aria-hidden="true"
            size={16}
            strokeWidth={1.5}
          />

          <div>
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
        </div>
      )}
    </div>
  );
}