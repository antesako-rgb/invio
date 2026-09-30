import { getInvitationPageType, type InvitationContentField } from "./invitationPageTypes";
import type { InvitationDocumentPage } from "../types/invitationDocument.types";
/** Fields with an explicit visual text target in each composition. */
export function invitationInlineFields(page: InvitationDocumentPage): readonly InvitationContentField[] {
  switch (page.layout) {
    case "ornamental": return ["title", "subtitle"];
    case "poster": return ["title", "subtitle", "location", "address"];
    case "calendar": case "date-card": return ["title", "text", "location", "address"];
    case "photo-strip": return ["firstName", "secondName", "subtitle", "text", ...(!page.content.firstName?.trim() && !page.content.secondName?.trim() && page.content.title?.trim() ? ["title" as const] : [])];
    default: return getInvitationPageType(page.type).fields.filter(field => field !== "date" && field !== "time");
  }
}
