import type { ReactNode } from "react";
import type { InvitationContentField } from "../../config/invitationPageTypes";
/** Optional presentation slots supplied only by the editor. Public output is plain content. */
export interface InvitationPresentation {
  text: (field: InvitationContentField, value: string | undefined, display?: ReactNode) => ReactNode;
  photo: (slotId: string) => ReactNode;
  selectPhoto?: (slotId: string) => void;
}
export function invitationText(presentation: InvitationPresentation | undefined, field: InvitationContentField, value: string | undefined, display?: ReactNode) {
  return presentation ? presentation.text(field, value, display) : (display ?? value);
}
