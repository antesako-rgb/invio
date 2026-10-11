"use client";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Armchair, UserRound, UserRoundPlus, UserRoundMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import SeatingGuestPicker from "./SeatingGuestPicker";
import { getManualSeatOptions } from "../validation/manualSeating";
import { previewAutomaticSeats } from "../validation/automaticSeating";
import { GuestRsvpStatus } from "./SeatingGuestRow";
import { changeSeatTable, getInitialSeatChoice, getSeatPickerIssue, isSeatChoiceUnchanged, type SeatAssignmentRequest, type SeatAssignmentChoice } from "../validation/seatAssignmentChoices";
import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatAssignmentDialog.module.css";

export type SeatAssignmentFormProps = {
  request: SeatAssignmentRequest; current: PlanData; tables: SeatingTable[];
  saving: boolean; blocked: boolean; error: string | null; fixedGuest?: boolean;
  onClose: () => void; onReload: () => void;
  onChoiceChange?: (choice: SeatAssignmentChoice) => void;
  initialChoice?: SeatAssignmentChoice | null;
  onAddGuest?: () => void;
  onAutoAssign: (guestId: string, tableId: string) => Promise<boolean>;
  onAssign: (guestId: string, tableId: string | null, seatNumber: number | null) => Promise<boolean>;
};

export default function SeatAssignmentForm({ request, current, tables, saving, blocked, error, fixedGuest, initialChoice, onClose, onReload, onAssign, onAutoAssign, onChoiceChange, onAddGuest }: SeatAssignmentFormProps) {
  const t = useTranslations("Seating");
  const id = useId();
  const [choice, setChoice] = useState(() => initialChoice ?? getInitialSeatChoice(request, current, tables));
  const [mode,setMode] = useState<"auto"|"manual">(initialChoice?.seatMode ?? request.seatMode ?? (choice.seatNumber === null ? "auto" : "manual"));
  const included = new Set(current.participants.map(item => item.project_guest_id));
  const people = current.people.filter(person => included.has(person.id));
  const person = people.find(item => item.id === choice.guestId);
  const table = tables.find(item => item.id === choice.tableId);
  const availableSeats = table ? getManualSeatOptions(table, choice.guestId, [choice.guestId], {}, current.assignments) : [];
  const unavailableChoice = mode === "manual" && choice.seatNumber !== null && !availableSeats.includes(choice.seatNumber);
  const existing = current.assignments.find(item => item.project_guest_id === choice.guestId);
  const name = (person: PlanData["people"][number]) => [person.first_name, person.last_name].filter(Boolean).join(" ");
  const automatic = table && choice.guestId ? previewAutomaticSeats(table,[choice.guestId],current.assignments).seats[0]?.seatNumber ?? null : null;
  const effective = { ...choice, seatMode:mode, seatNumber: mode === "auto" && !person?.archived_at ? automatic : choice.seatNumber };
  useEffect(() => { onChoiceChange?.({ ...choice, seatMode:mode, seatNumber:mode === "auto" && !person?.archived_at ? automatic : choice.seatNumber }); }, [choice,mode,automatic,person?.archived_at,onChoiceChange]);
  const issue = getSeatPickerIssue(effective, current, tables);
  const disabled = saving || blocked;
  const unchanged = isSeatChoiceUnchanged(effective, current.assignments);
  const explicit = effective.tableId !== null && effective.seatNumber !== null;
  async function assign(tableId: string | null, seatNumber: number | null) {
    if (disabled || getSeatPickerIssue({ ...choice, tableId, seatNumber }, current, tables)) return;
    if (await onAssign(choice.guestId, tableId, seatNumber)) onClose();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (unchanged || issue || !explicit) return;
    if (mode === "auto" && choice.tableId && !person?.archived_at) { if (await onAutoAssign(choice.guestId,choice.tableId)) onClose(); }
    else await assign(choice.tableId, effective.seatNumber);
  }
  return <form onSubmit={submit} className={`${styles.form} ${styles.singleForm}`}>
        <div className={styles.body}>
          <div className={styles.destination}>
          <Field id={id + "-table"} label={t("seatTable")}>
            <Select value={choice.tableId ?? ""} disabled={disabled || !!person?.archived_at || !tables.length} options={[...(choice.tableId === null ? [{ value: "", label: t("chooseTable") }] : []), ...tables.map(table => ({ value: table.id, label: table.name + " · " + current.assignments.filter(item => item.table_id === table.id).length + " / " + table.capacity }))]}
              onValueChange={tableId => setChoice(previous => changeSeatTable(previous, tableId || null, current.assignments))} />
          </Field>
          {table && <Field id={id+"-seat"} className={styles.chairField} label={<span className={styles.chairLabel}><Armchair size={15} aria-hidden="true" />{t("seatChoice")}</span>}
            description={mode === "auto" && effective.seatNumber !== null ? t("proposedSeat", { number: effective.seatNumber }) : undefined}>
            <Select value={mode === "auto" ? "auto" : choice.seatNumber?.toString() ?? ""} disabled={disabled || !!person?.archived_at}
              options={[{value:"auto",label:t("automaticSeatOption")},...(mode === "manual" && choice.seatNumber === null ? [{value:"",label:t("chooseSeat")}] : []),...(unavailableChoice ? [{value:choice.seatNumber!.toString(),label:t("seatNumber",{number:choice.seatNumber!})+" · "+t("occupiedSeat")}] : []),...availableSeats.map(number=>({value:number.toString(),label:t("seatNumber",{number})}))]}
              onValueChange={value=>{setMode(value === "auto" ? "auto" : "manual");setChoice(previous=>({...previous,seatNumber:value === "auto"||!value?null:Number(value)}));}} />
          </Field>}
          </div>
          <fieldset className={`${styles.choices} ${styles.guestChoices}`} disabled={disabled}>
            <legend>{t("seatGuest")}</legend>
            {fixedGuest && person ? <div className={styles.fixedGuest}><span className={styles.guestIcon}><UserRound size={18} aria-hidden="true" /></span><span>{name(person)}</span></div> : <SeatingGuestPicker className={styles.guestPicker} current={current} tables={tables} tableId={choice.tableId} selected={choice.guestId?[choice.guestId]:[]} disabled={disabled} simpleScope hideSelection onChange={ids=>setChoice(previous=>({...previous,guestId:ids[0]??""}))} />}
            {!fixedGuest && onAddGuest && <Button type="button" variant="outline" className={styles.addGuest} disabled={disabled} onClick={onAddGuest}><UserRoundPlus size={16} aria-hidden="true" />{t("addGuest")}</Button>}
          </fieldset>
          {person && <GuestRsvpStatus current={current} person={person} />}
          {person?.archived_at && <p className={styles.notice}>{t("seatArchivedHelp")}</p>}
          {!tables.length && <p className={styles.notice}>{t("seatNoTables")}</p>}
          {!people.length && <p className={styles.notice}>{t("seatNoParticipants")}</p>}
          {person && !explicit && !issue && <p className={styles.notice} role="status">{t(table ? "chooseSeat" : "chooseTableHelp")}</p>}
          {issue && choice.guestId && <p className={styles.notice} role="status">{t(issue)}{issue === "seatOccupiedError" && " " + t("seatOccupiedHelp")}</p>}
          {error && <div className={styles.notice} role="alert">{t(error)}{blocked && <Button type="button" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button>}</div>}
          {blocked && !error && <div className={styles.notice} role="alert">{t("reloadRequired")}<Button type="button" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button></div>}
          {existing && <Button type="button" variant="destructiveOutline" className={styles.removeAssignment} disabled={disabled} onClick={() => void assign(null, null)}><UserRoundMinus aria-hidden="true" />{t("removeFromTable")}</Button>}
        </div>
        <div className={styles.footer}>
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>{t("cancel")}</Button><Button type="submit" loading={saving} disabled={disabled || !!issue || unchanged || !explicit}>{t("seatAssignmentSave")}</Button>
        </div>
      </form>;
}
