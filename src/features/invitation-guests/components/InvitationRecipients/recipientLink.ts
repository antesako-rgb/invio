import { getPathname } from "@/i18n/navigation";

export function recipientLink(origin: string, locale: string, token: string) {
  return `${origin}${getPathname({ locale, href: `/invitation/rsvp/${encodeURIComponent(token)}` })}`;
}
