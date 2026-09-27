import type { PhotoWallMaterialDateContent } from "../../types/photoWallMaterialContent.types";
import type { PhotoWallMaterialDateDisplay } from "../../types/photoWallMaterialRenderer.types";

export function isMaterialDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function buildPhotoWallMaterialDateDisplay(
  content: PhotoWallMaterialDateContent, locale: string,
): PhotoWallMaterialDateDisplay {
  const value = content.start_date;
  if (!value || !isMaterialDate(value)) {
    return { hasDate: false, value: null, formatted: "", day: "", dayName: "", month: "", year: "" };
  }
  const date = new Date(value + "T12:00:00Z");
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(date);
  return {
    hasDate: true, value,
    formatted: format({ day: "numeric", month: "long", year: "numeric" }),
    day: format({ day: "numeric" }), dayName: format({ weekday: "long" }),
    month: format({ month: "long" }), year: format({ year: "numeric" }),
  };
}
