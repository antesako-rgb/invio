import EditableDate
  from "@/features/invitations/editor/components/EditableDate/EditableDate";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";
import {
  MapPin,
} from "lucide-react";
import EditableTime
  from "@/features/invitations/editor/components/EditableTime/EditableTime";

import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationDisplayData,
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import "./InvitationEventSchedule.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEventScheduleProps {
  display:
    InvitationDisplayData;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;

  className?:
    string;
}


/* ==========================================================================
   Invitation Event Schedule
========================================================================== */

export default function InvitationEventSchedule({
  display,
  mode,
  editor,
  className,
}: InvitationEventScheduleProps) {
  return (
    <div
      className={
        className
      }
      data-invitation-event-schedule
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
              data-invitation-event-schedule-date
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
          data-invitation-event-schedule-location
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