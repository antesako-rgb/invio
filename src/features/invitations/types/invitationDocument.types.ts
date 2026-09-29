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
  photos: InvitationPhotoSlot[];
  unplacedPhotos?: InvitationPhotoSlot[];
};

export type InvitationDocument = {
  eventDate?: string | null;
  eventTime?: string | null;
  legacyDateTime?: { date?: true; time?: true };
  theme: InvitationTheme;
  pages: InvitationDocumentPage[];
};
