"use client";
import type { RsvpStatus } from "@/features/invitations/types/publicRsvp.types";
import { resolveGuestRsvp } from "@/features/project-guests/utils/resolveRsvp";
import type {ProjectGuest,SeatingDatabase} from "@/features/project-guests/types/database";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import InvitationGuests from "./InvitationGuests";
import InvitationRecipients from "./InvitationRecipients/InvitationRecipients";
import type { InvitationGuest, InvitationGuestGroup } from "../types/invitationGuest.types";
import type { InvitationRecipientWithGuests } from "../types/invitationRecipient.types";
import type { GenericInvitationResponse } from "../types/invitationResponse.types";
import type { RsvpQuestion } from "@/features/invitations/types/invitationDocument.types";
import styles from "./InvitationGuests.module.css";
export default function InvitationGuestWorkspace({ invitationId, guests, groups, recipients, genericResponses, questions, projectGuestsEnabled=false, projectGuests=[], genericLinks=[] }: { invitationId: string; guests: InvitationGuest[]; groups: InvitationGuestGroup[]; recipients: InvitationRecipientWithGuests[]; genericResponses: GenericInvitationResponse[]; questions: RsvpQuestion[];projectGuestsEnabled?:boolean;projectGuests?:ProjectGuest[];genericLinks?:SeatingDatabase["public"]["Tables"]["invitation_generic_guest_links"]["Row"][] }) {
  const t = useTranslations("InvitationGuests");
  const [view, setView] = useState("guests");
  const statuses: Record<string, RsvpStatus> = {};
  for (const recipient of recipients) for (const answer of recipient.response?.guests ?? []) statuses[answer.invitation_guest_id] = answer.status;
  const conflicts:Record<string,boolean>={};
  for(const guest of guests){const linked=genericLinks.filter(l=>l.project_guest_id===guest.project_guest_id);const answers=genericResponses.flatMap(r=>r.guests.filter(g=>linked.some(l=>l.response_guest_id===g.id)).map(g=>({status:g.status,submittedAt:r.submitted_at})));const resolved=resolveGuestRsvp(statuses[guest.id],answers);if(resolved.status)statuses[guest.id]=resolved.status;conflicts[guest.id]=resolved.conflict;}
  return <div className={styles.page}><div className={styles.headerActions} role="group" aria-label={t("workspaceLabel")}><Button variant={view === "guests" ? "default" : "outline"} aria-pressed={view === "guests"} onClick={() => setView("guests")}>{t("guestList")}</Button><Button variant={view === "responses" ? "default" : "outline"} aria-pressed={view === "responses"} onClick={() => setView("responses")}>{t("linksAndResponses")}</Button></div>
    {view === "guests" ? <InvitationGuests projectGuests={projectGuests} invitationId={invitationId} guests={guests} groups={groups} statuses={statuses} conflicts={conflicts} sharedNames={projectGuestsEnabled} archivedGuests={guests.filter(g=>projectGuests.some(p=>p.id===g.project_guest_id&&p.archived_at!==null)).map(g=>g.id)} /> : <InvitationRecipients projectGuestsEnabled={projectGuestsEnabled} projectGuests={projectGuests} genericLinks={genericLinks} invitationId={invitationId} recipients={recipients} guests={guests} questions={questions} genericResponses={genericResponses} onManageGuests={() => setView("guests")} />}
  </div>;
}
