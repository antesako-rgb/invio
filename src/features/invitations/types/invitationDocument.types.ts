import type {
  InvitationLayout,
} from "../config/invitationLayouts";

import type {
  InvitationContentField,
  InvitationPageType,
} from "../config/invitationPageTypes";

import type {
  InvitationTheme,
} from "../config/invitationThemes";

export type InvitationContent =
  Partial<
    Record<
      InvitationContentField,
      string
    >
  >;

import type { EditorPhotoFramingValue } from "@/features/editor/types/editorPhotoFraming.types";

export type InvitationPhotoSlot = EditorPhotoFramingValue & {
  id: string;
  photoId: string | null;
};

export type InvitationDocumentPage = {
  id: string;
  type: InvitationPageType;
  layout: InvitationLayout;
  variant?: string;
  layoutVersion: 1;
  content: InvitationContent;
  rsvp?: InvitationRsvpConfiguration;
  photos: InvitationPhotoSlot[];
  unplacedPhotos?: InvitationPhotoSlot[];
};

export type RsvpQuestion = { id: string; type: "short_text" | "long_text" | "choice"; label: string; required: boolean; options?: { id: string; label: string }[] };
export type RsvpAttendance = { label: string; attendingLabel: string; notAttendingLabel: string };
export type InvitationRsvpConfiguration = { attendance: RsvpAttendance; questions: RsvpQuestion[] };
export type RsvpAnswers = Record<string, string>;

export type InvitationDocument = {
  eventDate?: string | null;
  eventTime?: string | null;
  legacyDateTime?: { date?: true; time?: true };
  theme: InvitationTheme;
  pages: InvitationDocumentPage[];
};
