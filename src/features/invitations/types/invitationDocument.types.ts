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

export type InvitationPhotoSlot = {
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
  theme: InvitationTheme;
  pages: InvitationDocumentPage[];
};
