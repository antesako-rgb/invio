"use client";

import { useId, useRef, useState, useTransition } from "react";
import { Check, Copy, Ellipsis, Eye, Mail, Phone, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge/badge";
import { Input } from "@/components/ui/input";
import Avatar from "@/components/ui/avatar/Avatar";
import Search from "@/components/ui/search/Search";
import { DataTable, DataTableToolbar, Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import ManagementSurface from "../GuestManagementSurface";
import { getInitials } from "@/lib/utils/getInitials";
import { useActionError } from "@/lib/actions/useActionError";
import type { InvitationGuest } from "../../types/invitationGuest.types";
import type { InvitationRecipientWithGuests, CreateInvitationRecipientInput } from "../../types/invitationRecipient.types";
import * as actions from "../../actions/recipients/invitationRecipientActions";
import InvitationRecipientForm from "./InvitationRecipientForm";
import InvitationRecipientLink from "./InvitationRecipientLink";
import { recipientLink } from "./recipientLink";
import { recipientGuestName, recipientPrimaryGuest, recipientMatchesSearch } from "./recipientPresentation";
import styles from "./InvitationRecipients.module.css";

import GuestIdentityLinks from "@/features/project-guests/components/GuestIdentityLinks";
import type { ProjectGuest, SeatingDatabase } from "@/features/project-guests/types/database";
import type { GenericInvitationResponse, InvitationAttendanceRow } from "../../types/invitationResponse.types";
import type { RsvpQuestion } from "@/features/invitations/types/invitationDocument.types";

type CreatedSummary = { guests: { id: string; name: string; primary: boolean }[]; email: string | null; phone: string | null };
export default function InvitationRecipients({ invitationId, recipients, guests, questions = [], genericResponses = [], projectGuestsEnabled=false, projectGuests=[], genericLinks=[], onManageGuests }: {
  projectGuestsEnabled?: boolean; projectGuests?: ProjectGuest[]; genericLinks?: SeatingDatabase["public"]["Tables"]["invitation_generic_guest_links"]["Row"][];
  invitationId: string; recipients: InvitationRecipientWithGuests[]; guests: InvitationGuest[]; questions?: RsvpQuestion[]; genericResponses?: GenericInvitationResponse[]; onManageGuests?: () => void;
}) {
  const t = useTranslations("Invitations.recipients");
  const locale = useLocale();
  const availabilityId = useId();
  const actionError = useActionError();
  const [busy, startTransition] = useTransition();
  const lock = useRef(false);
  const [editor, setEditor] = useState<InvitationRecipientWithGuests | "new" | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [removal, setRemoval] = useState<InvitationRecipientWithGuests | null>(null);
  const [filter, setFilter] = useState<"all" | "personalized" | "generic">("all");
  const [genericDetailsId, setGenericDetailsId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [createdSummary, setCreatedSummary] = useState<CreatedSummary | null>(null);
  const [copying, setCopying] = useState(false);
  const details = recipients.find(recipient => recipient.id === detailsId);
  const genericDetails = genericResponses.find(response => response.id === genericDetailsId);
  const rows: InvitationAttendanceRow[] = [
    ...recipients.map(recipient => ({ kind: "personalized_recipient" as const, recipient })),
    ...genericResponses.map(response => ({ kind: "generic_response" as const, response })),
  ];
  const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
  const visible = rows.filter(row => (filter === "all" || (filter === "personalized" ? row.kind === "personalized_recipient" : row.kind === "generic_response")) && (row.kind === "personalized_recipient" ? recipientMatchesSearch(row.recipient, query) : row.response.guests.some(guest => recipientGuestName(guest).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().includes(normalizedQuery))));
  const allAssigned = new Set(recipients.flatMap(recipient => recipient.guests.map(guest => guest.id)));
  const hasAvailableGuests = guests.some(guest => !allAssigned.has(guest.id));
  const assigned = recipients.filter(recipient => recipient.id !== (editor && editor !== "new" ? editor.id : null)).flatMap(recipient => recipient.guests.map(guest => guest.id));
  function name(recipient: InvitationRecipientWithGuests) { const primary = recipientPrimaryGuest(recipient); return primary ? recipientGuestName(primary) || t("unnamed") : t("unnamed"); }
  function closeFlow() { if (!lock.current) { setEditor(null); setCreatedLink(null); setCreatedSummary(null); } }
  function edit(recipient: InvitationRecipientWithGuests) { setGenericDetailsId(null); setDetailsId(null); setEditor(recipient); }
  function run(operation: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    startTransition(async () => { try { await operation(); } catch { toast.error(t("failed")); } finally { lock.current = false; } });
  }
  async function copyLink() {
    if (!createdLink || copying) return;
    setCopying(true);
    try { await navigator.clipboard.writeText(createdLink); toast.success(t("copied")); }
    catch { toast.error(t("copyFailed")); }
    finally { setCopying(false); }
  }
  function save(fields: Omit<CreateInvitationRecipientInput, "p_invitation_id">) {
    run(async () => {
      if (editor === "new") {
        const result = await actions.createInvitationRecipientAction({ ...fields, p_invitation_id: invitationId });
        if (!result.success) { toast.error(actionError(result.code)); return; }
        setCreatedSummary({ guests: guests.filter(guest => fields.p_guest_ids.includes(guest.id)).map(guest => ({ id: guest.id, name: recipientGuestName(guest), primary: guest.id === fields.p_primary_guest_id })), email: fields.p_email, phone: fields.p_phone });
        setCreatedLink(recipientLink(window.location.origin, locale, result.data.token));
      } else if (editor) {
        const result = await actions.updateInvitationRecipientAction({ ...fields, p_recipient_id: editor.id });
        if (!result.success) { toast.error(actionError(result.code)); return; }
        setDetailsId(editor.id); toast.success(t("updated"));
      }
      setEditor(null);
    });
  }
  function rowActions(recipient: InvitationRecipientWithGuests) {
    return <DropdownMenu><DropdownMenuTrigger disabled={busy} render={<Button variant="ghost" size="icon" aria-label={t("rowActions", { name: name(recipient) })} />}><Ellipsis aria-hidden="true" /></DropdownMenuTrigger>
      <DropdownMenuContent align="end"><DropdownMenuItem disabled={busy} onClick={() => setDetailsId(recipient.id)}><Eye aria-hidden="true" />{t("details")}</DropdownMenuItem><DropdownMenuItem disabled={busy} onClick={() => edit(recipient)}><Pencil aria-hidden="true" />{t("edit")}</DropdownMenuItem><DropdownMenuItem disabled={busy} variant="destructive" onClick={() => setRemoval(recipient)}><Trash2 aria-hidden="true" />{t("delete")}</DropdownMenuItem></DropdownMenuContent>
    </DropdownMenu>;
  }
  function identity(recipient: InvitationRecipientWithGuests) {
    const primary = recipientPrimaryGuest(recipient);
    const additionalGuests = recipient.guests.length - (primary ? 1 : 0);
    return <div className={styles.identity}><span aria-hidden="true"><Avatar alt={name(recipient)} fallback={getInitials(name(recipient))} size="xs" /></span><div className={styles.identityText}>
      <Button variant="link" className={styles.nameButton} disabled={busy} onClick={() => setDetailsId(recipient.id)}>{name(recipient)}</Button>
      {additionalGuests > 0 && <span className={styles.companions}>{t("additionalGuests", { count: additionalGuests })}</span>}
    </div></div>;
  }
  function rsvpSummary(recipient: InvitationRecipientWithGuests) {
    const answered = recipient.response?.guests ?? [];
    const attending = answered.filter(guest => guest.status === "attending").length;
    const declined = answered.filter(guest => guest.status === "not_attending").length;
    const pending = recipient.guests.filter(guest => !answered.some(answer => answer.invitation_guest_id === guest.id)).length;
    return <div className={styles.rsvpSummary}>{!recipient.response ? <Badge variant="muted" dot>{t("noResponse")}</Badge> : <>{attending > 0 && <Badge variant="success" dot>{t("attendingCount", { count: attending })}</Badge>}{declined > 0 && <Badge variant="muted" dot>{t("declinedCount", { count: declined })}</Badge>}{pending > 0 && <Badge variant="warning" dot>{t("pendingCount", { count: pending })}</Badge>}</>}</div>;
  }
  function guestResponse(recipient: InvitationRecipientWithGuests, guestId: string) {
    const answer = recipient.response?.guests.find(guest => guest.invitation_guest_id === guestId);
    const entries = Object.entries(answer?.answers ?? {});
    return <div className={styles.guestResponse}><Badge dot variant={answer?.status === "attending" ? "success" : answer ? "muted" : "warning"}>{t(answer?.status === "attending" ? "attending" : answer ? "notAttending" : "pending")}</Badge>
      {entries.length > 0 && <dl className={styles.answers}>{entries.map(([id, value]) => <div key={id}><dt>{questions.find(question => question.id === id)?.label || t("previousQuestion")}</dt><dd>{typeof value === "string" ? questions.find(question => question.id === id)?.options?.find(option => option.id === value)?.label ?? value : JSON.stringify(value)}</dd></div>)}</dl>}
    </div>;
  }
  function genericName(response: GenericInvitationResponse) { return response.guests[0] ? recipientGuestName(response.guests[0]) : t("unnamed"); }
  function genericSummary(response: GenericInvitationResponse) {
    const attending = response.guests.filter(guest => guest.status === "attending").length;
    const declined = response.guests.length - attending;
    return <div className={styles.rsvpSummary}>{attending > 0 && <Badge variant="success" dot>{t("attendingCount", { count: attending })}</Badge>}{declined > 0 && <Badge variant="muted" dot>{t("declinedCount", { count: declined })}</Badge>}</div>;
  }
  function publicIdentity(response: GenericInvitationResponse) {
    return <div className={styles.identity}><Avatar alt={genericName(response)} fallback={getInitials(genericName(response))} size="xs" /><div className={styles.identityText}><Button variant="link" className={styles.nameButton} onClick={() => { setDetailsId(null); setGenericDetailsId(response.id); }}>{genericName(response)}</Button>{response.guests.length > 1 && <span className={styles.companions}>{t("additionalGuests", { count: response.guests.length - 1 })}</span>}</div></div>;
  }
  function submitted(date: string) { return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)); }
  function publicActions(response: GenericInvitationResponse) { return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t("rowActions", { name: genericName(response) })} />}><Ellipsis aria-hidden="true" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setDetailsId(null); setGenericDetailsId(response.id); }}><Eye aria-hidden="true" />{t("publicDetails")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>; }
  const add = <Button disabled={busy || !hasAvailableGuests} aria-describedby={!hasAvailableGuests ? availabilityId : undefined} onClick={() => setEditor("new")}><Plus aria-hidden="true" />{t("create")}</Button>;
  return <section className={styles.section}>
    <div className={styles.header}><div><h2>{t("title")}</h2><p className={styles.hint}>{t("description")}</p></div>{filter !== "generic" && <div className={styles.linkActions}><Button variant="outline" onClick={onManageGuests}>{t("manageGuests")}</Button>{add}</div>}</div>
    {filter !== "generic" && !hasAvailableGuests && <p id={availabilityId} className={styles.hint}>{t(guests.length ? "allGuestsAssigned" : "noInvitationGuests")} <Button variant="link" onClick={onManageGuests}>{t("manageGuests")}</Button></p>}
    {!rows.length ? <EmptyState icon={UsersRound} title={t("emptyTitle")} description={t("emptyDescription")} action={add} variant="card" /> :
      <DataTable data={visible} toolbar={<DataTableToolbar left={<div className={styles.toolbar}><div className={styles.filters} role="group" aria-label={t("typeFilter")}>{(["all", "personalized", "generic"] as const).map(value => <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} aria-pressed={filter === value} onClick={() => setFilter(value)}>{t(`filter.${value}`)}</Button>)}</div><div className={styles.search}><Search value={query} onValueChange={setQuery} placeholder={t("search")} ariaLabel={t("search")} clearLabel={t("clearSearch")} /></div></div>} />}>
        <p role="status" className={styles.hint}>{t("count", { count: visible.length })}</p>
        {!visible.length ? <EmptyState title={t("noSearchResults")} description={t("searchHelp")} action={<Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>{t("clearSearch")}</Button>} /> : <>
          <div className={styles.desktopList}><Table><TableHeader><TableRow><TableHead>{t("personGroup")}</TableHead><TableHead>{t("kind")}</TableHead><TableHead className={styles.countColumn}>{t("guests")}</TableHead><TableHead className={styles.rsvpColumn}>{t("rsvp")}</TableHead><TableHead>{t("sent")}</TableHead><TableHead className={styles.actionsColumn}>{t("actions")}</TableHead></TableRow></TableHeader><TableBody>
            {visible.map(row => row.kind === "personalized_recipient" ? <TableRow key={`recipient-${row.recipient.id}`}><TableCell>{identity(row.recipient)}</TableCell><TableCell><Badge variant="soft">{t("filter.personalized")}</Badge><div className={styles.contact}>{row.recipient.email || row.recipient.phone || "—"}</div></TableCell><TableCell>{t("guestCount", { count: row.recipient.guests.length })}</TableCell><TableCell>{rsvpSummary(row.recipient)}</TableCell><TableCell>{row.recipient.response ? submitted(row.recipient.response.submitted_at) : "—"}</TableCell><TableCell className={styles.actionsColumn}>{rowActions(row.recipient)}</TableCell></TableRow> : <TableRow key={`response-${row.response.id}`}><TableCell>{publicIdentity(row.response)}</TableCell><TableCell><Badge variant="muted">{t("filter.generic")}</Badge></TableCell><TableCell>{t("guestCount", { count: row.response.guests.length })}</TableCell><TableCell>{genericSummary(row.response)}</TableCell><TableCell>{submitted(row.response.submitted_at)}</TableCell><TableCell className={styles.actionsColumn}>{publicActions(row.response)}</TableCell></TableRow>)}
          </TableBody></Table></div>
          <ul className={styles.mobileList}>{visible.map(row => <li key={`${row.kind}-${row.kind === "personalized_recipient" ? row.recipient.id : row.response.id}`}><Card className={styles.card}><div className={styles.recipientHeader}>{row.kind === "personalized_recipient" ? identity(row.recipient) : publicIdentity(row.response)}{row.kind === "personalized_recipient" ? rowActions(row.recipient) : publicActions(row.response)}</div><Badge variant="muted">{t(row.kind === "personalized_recipient" ? "filter.personalized" : "filter.generic")}</Badge>{row.kind === "personalized_recipient" ? rsvpSummary(row.recipient) : genericSummary(row.response)}<span className={styles.hint}>{t("guestCount", { count: row.kind === "personalized_recipient" ? row.recipient.guests.length : row.response.guests.length })}</span><span className={styles.hint}>{row.kind === "generic_response" ? submitted(row.response.submitted_at) : row.recipient.response ? submitted(row.recipient.response.submitted_at) : "—"}</span></Card></li>)}</ul>
        </>}
      </DataTable>}
    <ManagementSurface open={!!genericDetails} busy={false} title={genericDetails ? genericName(genericDetails) : t("publicDetails")} description={t("publicDetailsHelp")} onClose={() => setGenericDetailsId(null)}>
      {Footer => genericDetails && <div className={styles.surfaceContent}><div className={styles.surfaceBody}><section className={styles.detailGroup}><h3>{t("rsvpSummary")}</h3>{genericSummary(genericDetails)}<p className={styles.hint}>{t("submittedAt", { date: submitted(genericDetails.submitted_at) })}</p></section><section className={styles.detailGroup}><h3>{t("guestCount", { count: genericDetails.guests.length })}</h3><ul className={styles.linkedGuests}>{genericDetails.guests.map(guest => <li key={guest.id}><Avatar alt={recipientGuestName(guest)} fallback={getInitials(recipientGuestName(guest))} size="xs" /><span>{recipientGuestName(guest)}</span><div className={styles.guestResponse}><Badge dot variant={guest.status === "attending" ? "success" : "muted"}>{t(guest.status === "attending" ? "attending" : "notAttending")}</Badge><dl className={styles.answers}>{Object.entries(guest.answers && typeof guest.answers === "object" && !Array.isArray(guest.answers) ? guest.answers : {}).map(([id, value]) => <div key={id}><dt>{questions.find(question => question.id === id)?.label || t("previousQuestion")}</dt><dd>{typeof value === "string" ? questions.find(question => question.id === id)?.options?.find(option => option.id === value)?.label ?? value : JSON.stringify(value)}</dd></div>)}</dl>{projectGuestsEnabled && <GuestIdentityLinks people={projectGuests} responseGuestId={guest.id} linkedPersonId={genericLinks.find(link => link.response_guest_id === guest.id)?.project_guest_id} />}</div></li>)}</ul></section></div><Footer className={styles.stickyFooter}><Button variant="secondary" onClick={() => setGenericDetailsId(null)}>{t("done")}</Button></Footer></div>}
    </ManagementSurface>
    <ManagementSurface open={!!details && !editor && !createdLink} busy={busy} title={details ? name(details) : t("details")} description={t("detailsHelp")} onClose={() => { if (!lock.current) setDetailsId(null); }}>
      {Footer => details && <div className={styles.surfaceContent}><div className={styles.surfaceBody}>
        <section className={styles.detailGroup}><h3>{t("contact")}</h3><dl className={styles.detailContacts}>
          <div><dt><Mail aria-hidden="true" /><span className={styles.srOnly}>{t("email")}</span></dt><dd>{details.email || "â€”"}</dd></div>
          <div><dt><Phone aria-hidden="true" /><span className={styles.srOnly}>{t("phone")}</span></dt><dd>{details.phone || "â€”"}</dd></div>
        </dl></section>
        <section className={styles.detailGroup}><h3>{t("guestCount", { count: details.guests.length })}</h3><ul className={styles.linkedGuests}>{details.guests.map(guest => <li key={guest.id}><span aria-hidden="true"><Avatar alt={recipientGuestName(guest)} fallback={getInitials(recipientGuestName(guest))} size="xs" /></span><span>{recipientGuestName(guest)}</span>{guest.is_primary && <Badge variant="soft">{t("primary")}</Badge>}{guestResponse(details, guest.id)}</li>)}</ul></section>
        <section className={styles.detailGroup}><h3>{t("rsvpSummary")}</h3>{rsvpSummary(details)}{details.response && <p className={styles.hint}>{t("submittedAt", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(details.response.submitted_at)) })}</p>}</section>
        {detailsId && !editor && !createdLink && <InvitationRecipientLink key={details.id} recipientId={details.id} />}
      </div><Footer className={styles.stickyFooter}><Button variant="outline" disabled={busy} onClick={() => edit(details)}><Pencil aria-hidden="true" />{t("edit")}</Button><Button variant="destructiveOutline" disabled={busy} onClick={() => setRemoval(details)}><Trash2 aria-hidden="true" />{t("delete")}</Button></Footer></div>}
    </ManagementSurface>
    <ManagementSurface open={editor !== null || createdLink !== null} busy={busy} title={t(createdLink ? "created" : editor === "new" ? "create" : "edit")} description={t(createdLink ? "linkHelp" : "formDescription")} onClose={closeFlow}>
      {Footer => createdLink ? <div className={styles.surfaceContent}><div className={styles.surfaceBody}>
        <Check aria-hidden="true" className={styles.successIcon} />
        <ul className={styles.linkedGuests}>{createdSummary?.guests.map(guest => <li key={guest.id}><span>{guest.name}</span>{guest.primary && <Badge variant="soft">{t("primary")}</Badge>}</li>)}</ul>
        <Input readOnly aria-label={t("linkLabel")} value={createdLink} onFocus={event => event.target.select()} />
        <p className={styles.hint}>{t("linkHelp")}</p>
        <Button loading={copying} onClick={() => void copyLink()}><Copy aria-hidden="true" />{t("copyLink")}</Button>
      </div><Footer className={styles.stickyFooter}><Button onClick={closeFlow}>{t("done")}</Button></Footer></div> : editor && <InvitationRecipientForm Footer={Footer} key={editor === "new" ? "new" : editor.id} recipient={editor === "new" ? undefined : editor} guests={guests} assignedGuestIds={assigned} busy={busy} onCancel={closeFlow} onSave={save} />}
    </ManagementSurface>
    <ConfirmDialog open={removal !== null} variant="danger" loading={busy} loadingText={t("loading")} title={t("deleteTitle")} description={t("deleteDescription")} cancelText={t("cancel")} confirmText={t("delete")}
      onClose={() => { if (!lock.current) setRemoval(null); }} onConfirm={() => { if (removal) run(async () => { const result = await actions.deleteInvitationRecipientAction({ p_recipient_id: removal.id }); if (!result.success) { toast.error(actionError(result.code)); return; } setDetailsId(null); setRemoval(null); toast.success(t("deleted")); }); }} />
  </section>;
}
