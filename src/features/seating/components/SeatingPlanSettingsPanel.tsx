"use client";

import { useId, type FormEvent } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PlanData, SeatingTable, SeatingWorkspace } from "../types";
import { getStandardTableDimensions, getStandardTableUpdates } from "../validation/tableDimensions";
import styles from "./SeatingPlanSettingsPanel.module.css";

export type PlanSettingsDraft = { name: string; source: string };
export function getPlanSettingsDraft(plan: PlanData["plan"]): PlanSettingsDraft {
  return { name: plan.name, source: plan.rsvp_invitation_id ?? "" };
}
export function isPlanSettingsDraftUnchanged(draft: PlanSettingsDraft, plan: PlanData["plan"]) {
  return draft.name === plan.name && draft.source === (plan.rsvp_invitation_id ?? "");
}

export default function SeatingPlanSettingsPanel({ plan, invitations, tables, draft, disabled, saving, onDraftChange, onReset, onSubmit, onStandardize, onDelete, appearancePanel }: {
  appearancePanel?: ReactNode;
  plan: PlanData["plan"]; invitations: SeatingWorkspace["invitations"]; tables: SeatingTable[];
  draft: PlanSettingsDraft; disabled: boolean; saving: boolean;
  onDraftChange: (patch: Partial<PlanSettingsDraft>) => void; onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStandardize: (shape: SeatingTable["shape"]) => void; onDelete: () => void;
}) {
  const t = useTranslations("Seating");
  const sourceId = useId();
  const round = getStandardTableDimensions("round", plan.width_cm, plan.height_cm);
  const rectangle = getStandardTableDimensions("rectangle", plan.width_cm, plan.height_cm);
  const unchanged = isPlanSettingsDraftUnchanged(draft, plan);
  return <div className={styles.root}>
    {appearancePanel}
    <form onSubmit={onSubmit} className={styles.form}>
      <fieldset disabled={disabled} className={styles.fields}>
        <Field label={t("name")}><Input name="name" value={draft.name} onChange={event => onDraftChange({ name:event.target.value })} maxLength={150} required/></Field>
        <Field label={t("rsvpSource")} description={t(invitations.length ? "sourceHelp" : "rsvpNoInvitation")}>
          {invitations.length === 1 ? <div className={styles.sourceToggle}>
            <label htmlFor={sourceId}><strong>{invitations[0].name}</strong><span>{t("rsvpAutomatic")}</span></label>
            <Switch id={sourceId} disabled={disabled} checked={draft.source === invitations[0].id} onCheckedChange={checked => onDraftChange({ source:checked ? invitations[0].id : "" })}/>
            <input type="hidden" name="source" value={draft.source}/>
          </div> : invitations.length > 1 ? <Select name="source" value={draft.source} onValueChange={source => onDraftChange({ source })}
            options={[{ value:"",label:t("noSource") },...invitations.map(item => ({ value:item.id,label:item.name }))]}/>
            : <input type="hidden" name="source" value=""/>}
        </Field>
      </fieldset>
      <div className={styles.formActions}>
        <Button type="submit" disabled={disabled || unchanged} loading={saving}>{t("savePlan")}</Button>
        {!unchanged && <Button type="button" variant="ghost" disabled={saving} onClick={onReset}><RotateCcw aria-hidden="true"/>{t("resetPlanChanges")}</Button>}
      </div>
    </form>
    <section className={styles.section}>
      <h3>{t("tableStandards")}</h3>
      <p>{t("tableStandardsHelp", { diameter:round.width_cm,width:rectangle.width_cm,height:rectangle.height_cm })}</p>
      <div className={styles.standardActions}>
        <Button type="button" variant="outline" disabled={disabled || !getStandardTableUpdates(tables,"round",plan.width_cm,plan.height_cm).length} onClick={() => onStandardize("round")}>{t("standardizeRound")}</Button>
        <Button type="button" variant="outline" disabled={disabled || !getStandardTableUpdates(tables,"rectangle",plan.width_cm,plan.height_cm).length} onClick={() => onStandardize("rectangle")}>{t("standardizeRectangle")}</Button>
      </div>
    </section>
    <div className={styles.dangerZone}><Button type="button" variant="destructiveOutline" disabled={disabled} onClick={onDelete}><Trash2 aria-hidden="true"/>{t("deletePlan")}</Button></div>
  </div>;
}
