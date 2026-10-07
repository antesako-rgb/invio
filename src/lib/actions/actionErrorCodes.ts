/* ==========================================================================
   Stable Public Error Codes
========================================================================== */

export type CommonActionErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "ACTION_FAILED"
  | "CONFLICT"
  | "VALIDATION"
  | "SAVE_FAILED";

export type ProjectActionErrorCode =
  | "PROJECT_CREATE_FAILED"
  | "PROJECT_UPDATE_FAILED"
  | "PROJECT_DELETE_FAILED"
  | "EVENT_CREATE_FAILED"
  | "EVENT_UPDATE_FAILED"
  | "COLLABORATION_FAILED";
export type InvitationGuestActionErrorCode = "GUEST_ACTION_FAILED" | "GUEST_GROUP_EXISTS";

export type ProductActionErrorCode =
  | "ALBUM_CREATE_FAILED"
  | "ALBUM_UPDATE_FAILED"
  | "ALBUM_DELETE_FAILED"
  | "ALBUM_PUBLISH_FAILED"
  | "INVITATION_CREATE_FAILED"
  | "INVITATION_UPDATE_FAILED"
  | "INVITATION_RSVP_SETTINGS_FAILED"
  | "RSVP_UNAVAILABLE"
  | "RSVP_SUBMIT_FAILED"
  | "RSVP_ANSWERS_INVALID"
  | "RSVP_CAPACITY_EXCEEDED"
  | "RSVP_GUEST_LIMIT_EXCEEDED"
  | "INVITATION_PUBLISH_FAILED"
  | "INVITATION_MISSING_PHOTO"
  | "RECIPIENT_ACTION_FAILED"
  | "RECIPIENT_GUEST_CONFLICT"
  | "RECIPIENT_GUESTS_LOCKED"
  | "PHOTO_WALL_UPDATE_FAILED"
  | "PHOTO_WALL_PUBLISH_FAILED"
  | "MATERIAL_CREATE_FAILED";

export type PhotoActionErrorCode =
  | "PHOTO_DESCRIPTION_FAILED"
  | "PHOTO_UPLOAD_FAILED"
  | "PHOTO_REMOVE_FAILED"
  | "PHOTO_ADD_FAILED"
  | "PHOTO_FAVORITE_FAILED"
  | "PHOTOS_LOAD_FAILED";

export type ActionErrorCode =
  | CommonActionErrorCode
  | ProjectActionErrorCode
  | InvitationGuestActionErrorCode
  | ProductActionErrorCode
  | PhotoActionErrorCode;
