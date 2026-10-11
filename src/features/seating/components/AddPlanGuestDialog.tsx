"use client";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SeatingGuestPicker from "./SeatingGuestPicker";
import GenericRsvpImportList from "./GenericRsvpImportList";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";

import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatingWorkspace.module.css";
export default function AddPlanGuestDialog({ current, disabled, saving, error, onReload, onAddMany, tables, onCreate, onClose, onAdded, onIncludeGeneric,initialMode="existing" }: {
 current: PlanData; disabled:boolean; saving:boolean; error:string|null; onReload:()=>void; onClose:()=>void; onAdded:(ids:string[])=>void;
 tables:SeatingTable[]; onAddMany:(ids:string[])=>Promise<boolean>; onCreate:(first:string,last:string)=>Promise<{included:boolean;createdId:string|null}>;
 initialMode?:"existing"|"new";
 onIncludeGeneric:(id:string,personId:string|null)=>Promise<string|null>;
}) {
  const t = useTranslations("Seating");
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"existing" | "new">(initialMode);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const members = new Set(current.participants.map(member => member.project_guest_id));
  const available = current.people.filter(person => !person.archived_at && !members.has(person.id));
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createdId) { if (members.has(createdId) || await onAddMany([createdId])) { onClose(); setCreatedId(null); onAdded([createdId]); } return; }
    const form = new FormData(event.currentTarget);
    const result = await onCreate(String(form.get("first") ?? "").trim(), String(form.get("last") ?? "").trim());
    if (result.included) { onClose(); setCreatedId(null); if (result.createdId) onAdded([result.createdId]); } else { setCreatedId(result.createdId); if (!result.createdId) setMode("existing"); }
  }
  return <Dialog open onOpenChange={value => { if (!saving) if (!value) onClose(); }}>
      <DialogContent className={styles.dialog}><DialogHeader><DialogTitle>{t("addGuest")}</DialogTitle><DialogDescription>{t("newPersonHelp")}</DialogDescription></DialogHeader>
        {error && <div className={styles.warning} role="alert">{t(error)}{(error === "conflict" || error === "reloadRequired") && <Button size="sm" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button>}</div>}
        <div className={styles.actions}>
          <Button variant={mode === "existing" ? "default" : "outline"} disabled={disabled || !!createdId} onClick={() => setMode("existing")}>{t("existingPerson")}</Button>
          <Button variant={mode === "new" ? "default" : "outline"} disabled={disabled} onClick={() => setMode("new")}>{t("newPerson")}</Button>
        </div>
        {mode === "existing" ? <div className={styles.workspace}>
          <SeatingGuestPicker current={current} tables={tables} tableId={null} selected={selected} onChange={setSelected} multiple projectOnly disabled={disabled}/>
          <DialogFooter><Button disabled={disabled || !selected.length || selected.length>100 || selected.some(id=>!available.some(person=>person.id===id))} onClick={async () => { if (await onAddMany(selected)) { onClose(); onAdded(selected); } }}>{t("includeGuestsCount",{count:selected.length})}</Button></DialogFooter>
          {!!current.unlinkedGenericGuests?.length&&<GenericRsvpImportList current={current} disabled={disabled} onInclude={onIncludeGeneric} onAdded={ids=>{onClose();onAdded(ids);}}/>}
        </div> : <form onSubmit={create} className={styles.workspace}>
          <fieldset disabled={disabled || !!createdId} className={styles.grid}>
            <Field label={t("firstName")}><Input name="first" required maxLength={100} /></Field>
            <Field label={t("lastName")}><Input name="last" maxLength={100} /></Field>
          </fieldset>
          {createdId && <p role="status" className={styles.warning}>{t("personCreatedNotIncluded")}</p>}
          <DialogFooter><Button type="submit" disabled={disabled}>{t(createdId ? "include" : "createAndInclude")}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>;
}
