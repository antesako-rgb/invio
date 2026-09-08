import EditableDate
  from "@/features/invitations/editor/components/EditableDate/EditableDate";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import EditableTime
  from "@/features/invitations/editor/components/EditableTime/EditableTime";

import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationDisplayData,
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import "./InvitationEventDetails.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEventDetailsProps {
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
   Invitation Event Details
========================================================================== */

export default function InvitationEventDetails({
  display,
  mode,
  editor,
  className,
}: InvitationEventDetailsProps) {
  return (
    <div
      className={
        className
      }
      data-invitation-event-details
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
                data-invitation-event-details-date-main
              >
                {month} {day}
              </span>

              {dayName && (
                <span
                  data-invitation-event-details-day-name
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

      {display.time.hasTime && (
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
          data-invitation-event-details-location
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