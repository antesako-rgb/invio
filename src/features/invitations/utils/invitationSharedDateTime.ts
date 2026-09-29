import { z } from "zod";
import { getInvitationPageType } from "../config/invitationPageTypes";
import type { InvitationDocument, InvitationDocumentPage } from "../types/invitationDocument.types";

export type InvitationDateTimeField = "date" | "time";

export const invitationEventDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
});
export const invitationEventTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

/** One canonical change; the pages array retains its identity. */
export function setInvitationDateTime(
  document: InvitationDocument,
  field: InvitationDateTimeField,
  value: string,
): InvitationDocument {
  const key = field === "date" ? "eventDate" : "eventTime";
  const schema = field === "date" ? invitationEventDateSchema : invitationEventTimeSchema;
  const next = { ...document, [key]: value === "" ? null : schema.parse(value) };
  if (document.legacyDateTime?.[field]) {
    const legacy = { ...document.legacyDateTime };
    delete legacy[field];
    if (legacy.date || legacy.time) next.legacyDateTime = legacy;
    else delete next.legacyDateTime;
  }
  return next;
}

/** Read compatibility only. Conflicting or noncanonical legacy values require an explicit choice. */
export function normalizeInvitationDateTime(document: InvitationDocument): InvitationDocument {
  let result = document;
  for (const field of ["date", "time"] as const) {
    const key = field === "date" ? "eventDate" : "eventTime";
    if (result[key] !== undefined) continue;
    const values = new Set(result.pages
      .filter(page => getInvitationPageType(page.type).fields.includes(field))
      .map(page => page.content[field]?.trim()).filter((value): value is string => Boolean(value)));
    const schema = field === "date" ? invitationEventDateSchema : invitationEventTimeSchema;
    const [value] = values;
    if (values.size > 1 || (value && !schema.safeParse(value).success)) {
      result = { ...result, [key]: null, legacyDateTime: { ...result.legacyDateTime, [field]: true } };
      continue;
    }
    result = { ...result, [key]: value ?? null, pages: result.pages.map(page => {
      if (!getInvitationPageType(page.type).fields.includes(field)) return page;
      const content = { ...page.content };
      delete content[field];
      return { ...page, content };
    }) };
  }
  return result;
}

/** Ephemeral presentation projection, never committed or persisted. */
export function resolveInvitationPageDateTime(
  document: InvitationDocument,
  page: InvitationDocumentPage,
): InvitationDocumentPage {
  const content = { ...page.content };
  for (const field of ["date", "time"] as const) {
    const key = field === "date" ? "eventDate" : "eventTime";
    if (getInvitationPageType(page.type).fields.includes(field) && document[key] !== undefined && !document.legacyDateTime?.[field]) {
      content[field] = document[key] ?? "";
    }
  }
  return { ...page, content };
}

export function applyInvitationTemplate(current: InvitationDocument, template: InvitationDocument): InvitationDocument {
  return {
    ...template,
    ...(current.eventDate !== undefined ? { eventDate: current.eventDate } : {}),
    ...(current.eventTime !== undefined ? { eventTime: current.eventTime } : {}),
  };
}
