import { format, isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";

export function parseEditorDate(value: string | null | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = parseISO(value);
  return isValid(date) && format(date, "yyyy-MM-dd") === value ? date : undefined;
}
export function editorDateSelectionSchema(disablePast: boolean) {
  return z.date().refine(date => !disablePast || startOfDay(date).getTime() >= startOfDay(new Date()).getTime()).optional();
}
export const editorTimeValueSchema = z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]);
