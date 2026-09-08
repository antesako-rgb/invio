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

import "./InvitationEventInfo.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEventInfoProps {
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
   Invitation Event Info
========================================================================== */

export default function InvitationEventInfo({
  display,
  mode,
  editor,
  className,
}: InvitationEventInfoProps) {
  return (
    <div
      className={
        className
      }
      data-invitation-event-info
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
        />
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
          data-invitation-event-location
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