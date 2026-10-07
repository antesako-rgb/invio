"use client";

import type { RsvpStatus } from "@/features/invitations/types/publicRsvp.types";
import { useRef, useState, useTransition } from "react";
import { Ellipsis, FolderHeart, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge/badge";
import Avatar from "@/components/ui/avatar/Avatar";
import { getInitials } from "@/lib/utils/getInitials";
import Search from "@/components/ui/search/Search";
import { DataTable, DataTableToolbar, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import TabsFilter from "@/components/ui/filter/TabsFilter";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import GuestManagementSurface from "./GuestManagementSurface";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionResult } from "@/lib/actions/actionResult";
import * as actions from "../actions/guests/invitationGuestActions";
import { type InvitationGuest, type InvitationGuestGroup } from "../types/invitationGuest.types";
import InvitationGuestForm from "./InvitationGuestForm";
import InvitationGuestGroupsDialog from "./InvitationGuestGroupsDialog";
import styles from "./InvitationGuests.module.css";

type Removal = { kind: "guest"; item: InvitationGuest } | { kind: "group"; item: InvitationGuestGroup };
const fullName = (guest: InvitationGuest) => [guest.first_name, guest.last_name].filter(Boolean).join(" ");
const searchableName = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().replace(/đ/g, "d");

export default function InvitationGuests({ invitationId, guests, groups, statuses = {} }: {
  invitationId: string; guests: InvitationGuest[]; groups: InvitationGuestGroup[]; statuses?: Record<string, RsvpStatus>;
}) {
  const t = useTranslations("InvitationGuests");
  const actionError = useActionError();
  const [busy, startTransition] = useTransition();
  const lock = useRef(false);
  const [editor, setEditor] = useState<InvitationGuest | "new" | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const statusOptions = ["pending", "attending", "not_attending"].map(value => ({ value, label: t(`status.${value}`) }));
  const visible = guests.filter(guest => (filter === "all" || (statuses[guest.id] ?? "pending") === filter) && searchableName(fullName(guest)).includes(searchableName(query.trim())));
  const groupNames = new Map(groups.map(group => [group.id, group.name]));

  function run<T>(action: () => Promise<ActionResult<T>>, success: string, onSuccess?: () => void) {
    if (lock.current) return;
    lock.current = true;
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.success) { toast.error(actionError(result.code)); return; }
        toast.success(t(success)); onSuccess?.();
      } catch { toast.error(t("errors.transport")); }
      finally { lock.current = false; }
    });
  }
  function remove() {
    if (!removal) return;
    if (removal.kind === "guest") run(() => actions.deleteInvitationGuestAction({ p_guest_id: removal.item.id }), "success.guestDeleted", () => setRemoval(null));
    else run(() => actions.deleteInvitationGuestGroupAction({ p_group_id: removal.item.id }), "success.groupDeleted", () => setRemoval(null));
  }
  const add = <Button disabled={busy} onClick={() => setEditor("new")}><Plus aria-hidden="true" />{t("addGuest")}</Button>;
  function statusControl(guest: InvitationGuest) {
    const status = statuses[guest.id];
    return <Badge dot variant={status === "attending" ? "success" : status === "not_attending" ? "muted" : "warning"}>{t(`status.${status ?? "pending"}`)}</Badge>;
  }
  function rowActions(guest: InvitationGuest) {
    return <DropdownMenu>
      <DropdownMenuTrigger disabled={busy} render={<Button variant="ghost" size="icon" aria-label={t("rowActions", { name: fullName(guest) })} />}><Ellipsis aria-hidden="true" /></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={busy} onClick={() => setEditor(guest)}><Pencil aria-hidden="true" />{t("editGuest")}</DropdownMenuItem>
        <DropdownMenuItem disabled={busy} variant="destructive" onClick={() => setRemoval({ kind: "guest", item: guest })}><Trash2 aria-hidden="true" />{t("deleteGuest")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
  }
  return <section className={styles.page}>
    <div className={styles.headerActions}><div><h2>{t("title")}</h2><p className={styles.help}>{t("description")}</p></div><Button variant="outline" disabled={busy} onClick={() => setGroupsOpen(true)}><FolderHeart aria-hidden="true" />{t("groups.title")}</Button>{add}</div>
    {!guests.length ? <EmptyState icon={UsersRound} title={t("empty.title")} description={t("empty.description")} action={add} variant="card" /> : <DataTable data={visible} toolbar={<DataTableToolbar className={styles.toolbar}
        left={<TabsFilter className={styles.filterRow} items={[{ value: "all", label: t("all") }, ...statusOptions]} value={filter} onValueChange={setFilter} />}
        right={<div className={styles.search}><Search value={query} onValueChange={setQuery} placeholder={t("search")} ariaLabel={t("search")} clearLabel={t("clearSearch")} /></div>} />}>
      <p className={styles.help} role="status">{t("results", { count: visible.length })}</p>
      {!visible.length ? <EmptyState title={t("noResults.title")} description={t("noResults.description")} action={<Button variant="secondary" onClick={() => { setFilter("all"); setQuery(""); }}>{t("resetFilters")}</Button>} /> :
        <>
          <div className={styles.desktopList} aria-busy={busy}>
            <Table><TableHeader><TableRow>
              <TableHead className={styles.guestColumn}>{t("columns.guest")}</TableHead><TableHead>{t("columns.group")}</TableHead><TableHead>{t("columns.notes")}</TableHead><TableHead className={styles.statusColumn}>{t("columns.status")}</TableHead><TableHead className={styles.actionsColumn}>{t("columns.actions")}</TableHead>
            </TableRow></TableHeader><TableBody>{visible.map(guest => <TableRow key={guest.id}>
              <TableCell><div className={styles.guestIdentity}><span aria-hidden="true"><Avatar alt={fullName(guest)} fallback={getInitials(fullName(guest))} size="xs" /></span><span className={styles.name}>{fullName(guest)}</span></div></TableCell><TableCell className={styles.groupName}>{guest.group_id ? groupNames.get(guest.group_id) ?? "—" : "—"}</TableCell>
              <TableCell><span className={styles.desktopNotes} title={guest.notes || undefined}>{guest.notes || "—"}</span></TableCell>
              <TableCell>{statusControl(guest)}</TableCell><TableCell className={styles.actionsColumn}>{rowActions(guest)}</TableCell>
            </TableRow>)}</TableBody></Table>
          </div>
          <ul className={styles.mobileList} aria-busy={busy}>{visible.map(guest => <li key={guest.id}><Card className={styles.guestCard}>
            <div className={styles.cardHeader}><div className={styles.guestIdentity}><span aria-hidden="true"><Avatar alt={fullName(guest)} fallback={getInitials(fullName(guest))} size="xs" /></span><div className={styles.identity}><span className={styles.name}>{fullName(guest)}</span>{guest.group_id && groupNames.get(guest.group_id) && <span className={styles.help}>{groupNames.get(guest.group_id)}</span>}</div></div>{rowActions(guest)}</div>
            {guest.notes && <p className={styles.mobileNotes}>{guest.notes}</p>}
            {statusControl(guest)}
          </Card></li>)}</ul>
        </>}
    </DataTable>}
    <GuestManagementSurface open={editor !== null} busy={busy} onClose={() => { if (!lock.current) setEditor(null); }} title={t(editor === "new" ? "addGuest" : "editGuest")} description={t("form.description")}>
        {Footer => editor && <InvitationGuestForm Footer={Footer} key={editor === "new" ? "new" : editor.id} guest={editor === "new" ? undefined : editor} groups={groups} busy={busy} onCancel={() => { if (!lock.current) setEditor(null); }}
          onSave={fields => { if (editor === "new") run(() => actions.createInvitationGuestAction({ ...fields, p_invitation_id: invitationId }), "success.guestCreated", () => setEditor(null));
            else run(() => actions.updateInvitationGuestAction({ ...fields, p_guest_id: editor.id }), "success.guestUpdated", () => setEditor(null)); }} />}
    </GuestManagementSurface>
    <InvitationGuestGroupsDialog key={groupsOpen ? "open" : "closed"} open={groupsOpen} groups={groups} busy={busy} onClose={() => { if (!lock.current) setGroupsOpen(false); }}
      onDelete={item => setRemoval({ kind: "group", item })}
      onSave={(group, name, onSuccess) => { if (group) run(() => actions.updateInvitationGuestGroupAction({ p_group_id: group.id, p_name: name }), "success.groupUpdated", onSuccess);
        else run(() => actions.createInvitationGuestGroupAction({ p_invitation_id: invitationId, p_name: name }), "success.groupCreated", onSuccess); }} />
    <ConfirmDialog open={!!removal} variant="danger" loading={busy} loadingText={t("loading")} confirmText={t("delete")} cancelText={t("cancel")}
      title={t(removal?.kind === "group" ? "groups.deleteTitle" : "deleteTitle")}
      description={removal ? t(removal.kind === "group" ? "groups.deleteDescription" : "deleteDescription", { name: removal.kind === "group" ? removal.item.name : fullName(removal.item) }) : undefined}
      onConfirm={remove} onClose={() => { if (!lock.current) setRemoval(null); }} />
  </section>;
}
