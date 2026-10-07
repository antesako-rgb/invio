import type { InvitationRecipientWithGuests, RecipientGuest } from "../../types/invitationRecipient.types";

export const recipientGuestName = (guest: Pick<RecipientGuest, "first_name" | "last_name">) => [guest.first_name, guest.last_name].filter(Boolean).join(" ");
export const recipientPrimaryGuest = (recipient: InvitationRecipientWithGuests) => recipient.guests.find(guest => guest.is_primary) ?? recipient.guests[0];
const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().replace(/đ/g, "d");
export const recipientTextMatchesSearch = (value: string, query: string) => normalize(value).includes(normalize(query.trim()));
export function recipientMatchesSearch(recipient: InvitationRecipientWithGuests, query: string) {
  const values = [recipient.email ?? "", recipient.phone ?? "", ...recipient.guests.map(recipientGuestName)];
  return recipientTextMatchesSearch(values.join(" "), query);
}
