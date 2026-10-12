"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ELEMENT_LIMITS, type ElementKind, type SeatingElement } from "../../elements/model";
import styles from "../SeatingWorkspace.module.css";
import { SEATING_APPEARANCE_RELEASE_ENABLED } from "../../appearance/release";

export default function ElementsPanel({ elements, selected, disabled, onAdd, onSelect, onSave, onDelete, appearancePanel }: {
  appearancePanel?: ReactNode;
  elements: SeatingElement[]; selected: SeatingElement | null; disabled: boolean;
  onAdd: (kind: ElementKind) => void; onSelect: (id: string) => void; onSave: (element: SeatingElement) => void; onDelete: (element: SeatingElement) => void;
}) {
  const t = useTranslations("Seating");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected || disabled) return;
    const f = new FormData(event.currentTarget);
    onSave({ ...selected, name: String(f.get("name")).trim(), ...(SEATING_APPEARANCE_RELEASE_ENABLED ? {
      width_cm:Number(f.get("width")),height_cm:Number(f.get("height")),x_cm:Number(f.get("x")),y_cm:Number(f.get("y")),rotation_deg:Number(f.get("rotation")),
    } : {}) });
  }
  const limits = selected && ELEMENT_LIMITS[selected.kind];
  return <div className={styles.workspace}>
    <h3>{t("elementsCatalog")}</h3>
    <p className={styles.help}>{t("elementsFootprint")}</p>
    {(Object.keys(ELEMENT_LIMITS) as ElementKind[]).map(kind => <Button key={kind} variant="outline" disabled={disabled || elements.length >= 200} onClick={() => onAdd(kind)}>{t("element_" + kind)}</Button>)}
    <div className={styles.workspace}>{elements.map(e => <Button key={e.id} variant={e.id === selected?.id ? "default" : "ghost"} onClick={() => onSelect(e.id)} disabled={disabled}>{e.name}{e.locked ? " · " + t("elementLocked") : ""}</Button>)}</div>
    {selected && limits ? <>
      {appearancePanel}
      <form key={JSON.stringify(selected)} className={styles.workspace} onSubmit={submit}>
        <Field label={t("name")}><Input name="name" defaultValue={selected.name} required maxLength={150} disabled={disabled} /></Field>
        {SEATING_APPEARANCE_RELEASE_ENABLED && <details><summary>{t("appearanceGeometry")}</summary>
          {([
            ["width","elementWidth",selected.width_cm,limits.minWidth,limits.maxWidth],
            ["height","elementHeight",selected.height_cm,limits.minHeight,limits.maxHeight],
            ["x","elementX",selected.x_cm,0,100000],["y","elementY",selected.y_cm,0,100000],
            ["rotation","elementRotation",selected.rotation_deg,0,359],
          ] as const).map(([name,label,value,min,max])=><Field key={name} label={t(label)}><Input name={name} type="number" defaultValue={value} min={min} max={max} step={1} required readOnly={selected.locked} disabled={disabled}/></Field>)}
        </details>}
        <Button type="submit" disabled={disabled}>{t("elementSave")}</Button>
      </form>
      <Button variant="outline" disabled={disabled} onClick={() => onSave({ ...selected, locked: !selected.locked })}>{t(selected.locked ? "elementUnlock" : "elementLock")}</Button>
      <Button variant="destructiveOutline" disabled={disabled} onClick={() => onDelete(selected)}>{t("elementDelete")}</Button>
    </> : <p className={styles.help}>{t("elementSelect")}</p>}
  </div>;
}
