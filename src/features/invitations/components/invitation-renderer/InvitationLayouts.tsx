import type {
  ComponentType,
} from "react";

import type {
  InvitationLayout,
} from "../../config/invitationLayouts";

import type {
  InvitationDocumentPage,
} from "../../types/invitationDocument.types";

import type {
  InvitationRenderPhoto,
} from "../../types/invitationPhoto.types";

import Editorial
  from "./layouts/Editorial/Editorial";

import FullPhoto
  from "./layouts/FullPhoto/FullPhoto";

import Grid
  from "./layouts/Grid/Grid";

import Ornamental
  from "./layouts/Ornamental/Ornamental";

import PhotoText
  from "./layouts/PhotoText/PhotoText";

import Split
  from "./layouts/Split/Split";

import Timeline
  from "./layouts/Timeline/Timeline";
import Poster from "./layouts/Poster/Poster";
import PortraitCover from "./layouts/PortraitCover/PortraitCover";
import TornPaper from "./layouts/TornPaper/TornPaper";
import PhotoStrip from "./layouts/PhotoStrip/PhotoStrip";
import DateCard from "./layouts/DateCard/DateCard";
import Calendar from "./layouts/Calendar/Calendar";


/* ==========================================================================
   Types
========================================================================== */

export interface InvitationLayoutProps {
  page: InvitationDocumentPage;
  photos: ReadonlyMap<string, InvitationRenderPhoto>;
  locale: string;
  showPhotoPlaceholders?: boolean;
}


/* ==========================================================================
   Layout Registry
========================================================================== */

export const invitationLayoutComponents: Record<
  InvitationLayout,
  ComponentType<InvitationLayoutProps>
> = {
  "photo-strip": PhotoStrip,
  "date-card": DateCard,
  calendar: Calendar,
  "portrait-cover": PortraitCover,
  "torn-paper": TornPaper,
  poster: Poster,
  ornamental: Ornamental,
  "full-photo": FullPhoto,
  editorial: Editorial,
  timeline: Timeline,
  "photo-text": PhotoText,
  split: Split,
  "photo-left": PhotoText,
  grid: Grid,
};
