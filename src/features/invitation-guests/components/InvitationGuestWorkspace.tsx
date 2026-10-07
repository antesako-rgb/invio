"use client";
import type { RsvpStatus } from "@/features/invitations/types/publicRsvp.types";
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
export default function InvitationGuestWorkspace({ invitationId, guests, groups, recipients, genericResponses, questions }: { invitationId: string; guests: InvitationGuest[]; groups: InvitationGuestGroup[]; recipients: InvitationRecipientWithGuests[]; genericResponses: GenericInvitationResponse[]; questions: RsvpQuestion[] }) {
  const t = useTranslations("InvitationGuests");
  const [view, setView] = useState("guests");
  const statuses: Record<string, RsvpStatus> = {};
  for (const recipient of recipients) for (const answer of recipient.response?.guests ?? []) statuses[answer.invitation_guest_id] = answer.status;
  return <div className={styles.page}><div className={styles.headerActions} role="group" aria-label={t("workspaceLabel")}><Button variant={view === "guests" ? "default" : "outline"} aria-pressed={view === "guests"} onClick={() => setView("guests")}>{t("guestList")}</Button><Button variant={view === "responses" ? "default" : "outline"} aria-pressed={view === "responses"} onClick={() => setView("responses")}>{t("linksAndResponses")}</Button></div>
    {view === "guests" ? <InvitationGuests invitationId={invitationId} guests={guests} groups={groups} statuses={statuses} /> : <InvitationRecipients invitationId={invitationId} recipients={recipients} guests={guests} questions={questions} genericResponses={genericResponses} onManageGuests={() => setView("guests")} />}
  </div>;
}
