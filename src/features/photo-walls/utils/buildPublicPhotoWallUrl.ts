import type { Locale } from "@/i18n/config";
import { getPhotoWallPublicPath } from "./getPhotoWallPublicPath";

export function buildPublicPhotoWallUrl(locale: Locale, publicId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  return `${appUrl.replace(/\/+$/, "")}/${locale}${getPhotoWallPublicPath(publicId)}`;
}
