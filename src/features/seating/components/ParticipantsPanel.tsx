"use client";
import { useState, type FormEvent, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { Armchair, GripVertical, MousePointer2, Plus, Search, UserRound, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";
import { guestOptions } from "@/features/project-guests/utils/guestOptions";
import type { ProjectGuest } from "@/features/project-guests/types/database";
import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatingWorkspace.module.css";
import seatStyles from "./ParticipantsSeats.module.css";

export default function ParticipantsPanel({ current, tables, disabled, onAdd, onRemove, onAssign, onAssignSeat, onChooseSeat, onCreate, onDragStart, onPlace, error, saving, onReload }: {
  error: string | null; saving: boolean; onReload: () => void; current: PlanData; tables: SeatingTable[]; disabled: boolean; onAdd: (id: string) => Promise<boolean>;
  onRemove: (person: ProjectGuest) => void; onAssign: (personId: string, tableId: string | null) => void;
  onAssignSeat: (personId: string, tableId: string | null, seatNumber: number | null) => Promise<boolean>;
  onChooseSeat: (person: ProjectGuest) => void;
  onCreate: (first: string, last: string) => Promise<{ included: boolean; createdId: string | null }>;
  onDragStart: (event: PointerEvent<HTMLButtonElement>, person: ProjectGuest) => void;
  onPlace: (person: ProjectGuest) => void;
}) {
  const t = useTranslations("Seating");
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const members = new Set(current.participants.map(member => member.project_guest_id));
  const available = current.people.filter(person => !person.archived_at && !members.has(person.id));
  const assigned = new Map(current.assignments.map(item => [item.project_guest_id, item]));
  const participants = current.people.filter(person => members.has(person.id));
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createdId) { if (members.has(createdId) || await onAdd(createdId)) { setAddOpen(false); setCreatedId(null); } return; }
    const form = new FormData(event.currentTarget);
    const result = await onCreate(String(form.get("first") ?? "").trim(), String(form.get("last") ?? "").trim());
    if (result.included) { setAddOpen(false); setCreatedId(null); } else { setCreatedId(result.createdId); if (!result.createdId) setMode("existing"); }
  }
  function row(person: ProjectGuest) {
    const assignment = assigned.get(person.id);
    const tableId = assignment?.table_id;
    const attendance = current.attendance[person.id];
    const name = [person.first_name, person.last_name].filter(Boolean).join(" ");
    return <li key={person.id} className={styles.guestRow}>
      <div className={styles.guestIdentity}>
        <Button className={styles.dragHandle} size="icon" variant="ghost" disabled={disabled || !!person.archived_at}
          aria-label={t("dragGuest", { name })} title={t("dragGuest", { name })} onPointerDown={event => onDragStart(event, person)}
          onClick={event => { if (event.detail === 0) onPlace(person); }}><GripVertical aria-hidden="true" /></Button>
        <details className={styles.guestDetails}>
          <summary><UserRound size={14} aria-hidden="true" /><span className={seatStyles.identity}><span className={styles.name} title={name}>{name}</span>{assignment && <span className={seatStyles.assignment}>{assignment.seat_number === null ? t("noSpecificSeat") : t("seatNumber", { number: assignment.seat_number })}</span>}</span>{(person.archived_at || attendance?.conflict || (tableId && attendance?.status === "not_attending")) && <span title={t("guestWarning")} className={styles.guestWarning}>!</span>}<ChevronDown size={12} aria-hidden="true" /></summary>
          <div className={styles.guestOptions}>
            <div className={styles.status}>
              {person.archived_at && <Badge variant="warning">{t("archived")}</Badge>}
              <Badge variant="muted">{t(!current.plan.rsvp_invitation_id ? "noSource" : !attendance?.hasInvitationLink ? "notLinked" : attendance.status ?? "pending")}</Badge>
              {attendance?.conflict && <Badge variant="warning">{t("rsvpConflict")}</Badge>}
              {tableId && attendance?.status === "not_attending" && <Badge variant="warning">{t("absentAssigned")}</Badge>}
            </div>
            <Select aria-label={t("assignment", { name })} value={tableId ?? ""} disabled={disabled || !!person.archived_at} onValueChange={value => onAssign(person.id, value || null)}
              options={[{ value: "", label: t("unassigned") }, ...tables.map(table => ({ value: table.id, label: table.name + " · " + current.assignments.filter(item => item.table_id === table.id).length + "/" + table.capacity }))]} />
            <div className={styles.actions}>
              <Button variant="outline" size="sm" disabled={disabled || (!!person.archived_at && !assignment)} onClick={() => onChooseSeat(person)}><Armchair size={14} aria-hidden="true" />{t("chooseSeat")}</Button>
              {assignment?.seat_number !== null && tableId && <Button variant="outline" size="sm" disabled={disabled} onClick={() => void onAssignSeat(person.id, tableId, null)}>{t("releaseSeat")}</Button>}
              <Button variant="outline" size="sm" disabled={disabled || !!person.archived_at} onClick={() => onPlace(person)}><MousePointer2 size={14} aria-hidden="true" />{t("placeOnCanvas")}</Button>
              {tableId && <Button variant="outline" size="sm" disabled={disabled} onClick={() => onAssign(person.id, null)}>{t("unassign")}</Button>}
              <Button variant="destructiveOutline" size="sm" disabled={disabled} onClick={() => onRemove(person)}>{t("removeParticipant")}</Button>
            </div>
          </div>
        </details>
      </div>
    </li>;
  }
  const visible = participants.filter(person => [person.first_name, person.last_name].filter(Boolean).join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  const groups = [{ id: "", label: t("unassignedCount", { count:participants.filter(person => !assigned.has(person.id)).length }) },
    ...tables.map(table => ({ id:table.id, label:table.name + " · " + current.assignments.filter(item => item.table_id === table.id).length + " / " + table.capacity }))];
  return <div className={styles.workspace}>
    <div className={styles.guestSearch}>
      <Search size={16} aria-hidden="true" />
      <Input aria-label={t("searchPeople")} placeholder={t("searchPeople")} value={query} onChange={event => setQuery(event.target.value)} />
      <Button size="icon" disabled={disabled} aria-label={t("addGuest")} title={t("addGuest")} onClick={() => setAddOpen(true)}><Plus aria-hidden="true" /></Button>
    </div>
    <p className={styles.help}>{t("guestDragHelp")}</p>
    <div className={styles.guestGroups}>{groups.map(group => {
      const people = visible.filter(person => (assigned.get(person.id)?.table_id ?? "") === group.id);
      const withoutChair = people.filter(person => assigned.get(person.id)?.seat_number === null);
      const seated = people.filter(person => assigned.get(person.id)?.seat_number != null).sort((left, right) => (assigned.get(left.id)?.seat_number ?? 0) - (assigned.get(right.id)?.seat_number ?? 0));
      if (query && !people.length) return null;
      return <details key={group.id + ":" + !!query} className={styles.guestGroup} open={!group.id || query ? true : undefined}>
        <summary>{group.label}<ChevronDown size={14} aria-hidden="true" /></summary>
        {!group.id ? <ul className={styles.compactList}>{people.map(row)}</ul> : <>
          {!!withoutChair.length && <><h4 className={seatStyles.subheading}>{t("tableOnlyCount", { count: withoutChair.length })}</h4><ul className={styles.compactList}>{withoutChair.map(row)}</ul></>}
          {!!seated.length && <><h4 className={seatStyles.subheading}>{t("seatedCount", { count: seated.length })}</h4><ul className={styles.compactList}>{seated.map(row)}</ul></>}
        </>}
        {!people.length && <p className={styles.emptyGroup}>{t("noGuests")}</p>}
      </details>;
    })}</div>
    {!participants.length && <Button variant="outline" disabled={disabled} onClick={() => setAddOpen(true)}>{t("addGuest")}</Button>}
    <Dialog open={addOpen} onOpenChange={value => { if (!saving) setAddOpen(value); }}>
      <DialogContent className={styles.dialog}><DialogHeader><DialogTitle>{t("addGuest")}</DialogTitle><DialogDescription>{t("newPersonHelp")}</DialogDescription></DialogHeader>
        {error && <div className={styles.warning} role="alert">{t(error)}{(error === "conflict" || error === "reloadRequired") && <Button size="sm" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button>}</div>}
        <div className={styles.actions}>
          <Button variant={mode === "existing" ? "default" : "outline"} disabled={disabled || !!createdId} onClick={() => setMode("existing")}>{t("existingPerson")}</Button>
          <Button variant={mode === "new" ? "default" : "outline"} disabled={disabled} onClick={() => setMode("new")}>{t("newPerson")}</Button>
        </div>
        {mode === "existing" ? <div className={styles.workspace}>
          <Field label={t("existingPerson")}><Select value={selected} disabled={disabled} onValueChange={value => setSelected(value ?? "")} options={[{ value:"",label:t("choosePerson") },...guestOptions(available)]} /></Field>
          <DialogFooter><Button disabled={disabled || !available.some(person => person.id === selected)} onClick={async () => { if (await onAdd(selected)) { setSelected(""); setAddOpen(false); } }}>{t("include")}</Button></DialogFooter>
        </div> : <form onSubmit={create} className={styles.workspace}>
          <fieldset disabled={disabled || !!createdId} className={styles.grid}>
            <Field label={t("firstName")}><Input name="first" required maxLength={100} /></Field>
            <Field label={t("lastName")}><Input name="last" maxLength={100} /></Field>
          </fieldset>
          {createdId && <p role="status" className={styles.warning}>{t("personCreatedNotIncluded")}</p>}
          <DialogFooter><Button type="submit" disabled={disabled}>{t(createdId ? "include" : "createAndInclude")}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>
  </div>;
}
