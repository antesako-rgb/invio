"use client";
import { useId, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Circle, RectangleHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";
import { getStandardTableDimensions } from "../validation/tableDimensions";
import { seatingGeometryFits } from "../validation/seatingGeometry";
import type { SeatingTable, PlanData } from "../types";
import styles from "./CreateSeatingTableDialog.module.css";
import workspaceStyles from "./SeatingWorkspace.module.css";
import { SEATING_PRESET_STYLES_RELEASE_ENABLED } from "../appearance/release";
import { presetRoomSchema } from "../appearance/presets";

const Preview = dynamic(() => import("./SeatingTablePreview"), { ssr: false });
const PRESETS = [6, 8, 10, 12];

export default function CreateSeatingTableDialog({ initialShape, defaultName, plan, saving, blocked, error, onCreate, onClose, onReload }: {
  initialShape: SeatingTable["shape"]; defaultName: string; plan: PlanData["plan"];
  saving: boolean; blocked: boolean; error: string | null;
  onCreate: (table: SeatingTable) => Promise<void>; onClose: () => void; onReload: () => void;
}) {
  const t = useTranslations("Seating");
  const id = useId();
  const [name, setName] = useState(defaultName);
  const [shape, setShape] = useState(initialShape);
  const [seatInput, setSeatInput] = useState("8");
  const capacity = Number(seatInput);
  const validCapacity = seatInput.trim() !== "" && Number.isInteger(capacity) && capacity >= 1 && capacity <= 100;
  const validName = name.trim().length > 0 && name.trim().length <= 150;
  const table: SeatingTable = { id: "", project_id: plan.project_id, plan_id: plan.id, name: name.trim() || defaultName,
    shape, capacity: validCapacity ? capacity : 8,
    ...getStandardTableDimensions(shape, plan.width_cm, plan.height_cm, validCapacity ? capacity : 8),
    x_cm: Math.floor(plan.width_cm/2), y_cm: Math.floor(plan.height_cm/2), rotation_deg: 0 };
  const fits = seatingGeometryFits(table, plan.width_cm, plan.height_cm);
  const disabled = saving || blocked;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !validName || !validCapacity || !fits) return;
    await onCreate(table);
  }
  return <Dialog open onOpenChange={value => { if (!value && !saving) onClose(); }}>
    <DialogContent className={workspaceStyles.dialog} closeLabel={t("cancel")}>
      <DialogHeader><DialogTitle>{t("createTable")}</DialogTitle><DialogDescription>{t("createTableHelp")}</DialogDescription></DialogHeader>
      <form onSubmit={submit} className={workspaceStyles.workspace}>
        <fieldset disabled={disabled} className={workspaceStyles.formFields}>
          <Field id={id+"-name"} label={t("name")} required><Input name="name" value={name} onChange={event => setName(event.target.value)} maxLength={150} required /></Field>
          <div className={styles.shapeOptions} role="group" aria-label={t("tableShape")}>
            <Button type="button" variant={shape === "round" ? "default" : "outline"} aria-pressed={shape === "round"} onClick={() => setShape("round")}><Circle aria-hidden="true" />{t("addRound")}</Button>
            <Button type="button" variant={shape === "rectangle" ? "default" : "outline"} aria-pressed={shape === "rectangle"} onClick={() => setShape("rectangle")}><RectangleHorizontal aria-hidden="true" />{t("addRectangle")}</Button>
          </div>
          <div className={styles.capacityControls}>
            <Field id={id+"-capacity"} label={t("seatCount")} description={t("seatCountRange")} required invalid={!validCapacity}>
              <Input name="capacity" type="number" inputMode="numeric" min={1} max={100} step={1} value={seatInput} onChange={event => setSeatInput(event.target.value)} required />
            </Field>
            <div className={styles.presets} role="group" aria-label={t("seatPresets")}>
              {PRESETS.map(value => <Button key={value} type="button" variant={validCapacity && capacity === value ? "default" : "outline"} aria-pressed={validCapacity && capacity === value} onClick={() => setSeatInput(String(value))}>{value}</Button>)}
            </div>
          </div>
        </fieldset>
        <figure className={styles.preview}>
          <figcaption className={styles.previewCaption}><span>{t("tablePreview")}</span><span>{t("roomSize", { width: table.width_cm, height: table.height_cm })}</span></figcaption>
          {validCapacity && <Preview table={table} theme={SEATING_PRESET_STYLES_RELEASE_ENABLED ? presetRoomSchema.parse(plan.appearance).table_theme : "generic"}/>}
          <p className={workspaceStyles.help}>{t(shape === "round" ? "roundTableCreateHelp" : "rectangleTableCreateHelp")}</p>
        </figure>
        {validCapacity && !fits && <p className={workspaceStyles.warning} role="alert">{t("newTableNoSpace")}</p>}
        {error && <div className={workspaceStyles.warning} role="alert">{t(error)}{blocked && <Button type="button" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button>}</div>}
        <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={onClose}>{t("cancel")}</Button>
          <Button type="submit" loading={saving} disabled={disabled || !validName || !validCapacity || !fits}>{t("addTable")}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
