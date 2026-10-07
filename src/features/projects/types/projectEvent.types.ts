/* ==========================================================================
   Project Event Types
========================================================================== */

export const PROJECT_EVENT_TYPES = [
  "wedding",
  "birthday",
  "baptism",
  "communion",
  "confirmation",
  "business",
  "other",
] as const;

export type ProjectEventType =
  (typeof PROJECT_EVENT_TYPES)[number];

export function isProjectEventType(
  value: string
): value is ProjectEventType {
  return PROJECT_EVENT_TYPES.some(
    (type) =>
      type === value
  );
}
