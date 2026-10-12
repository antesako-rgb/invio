"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { FLOOR_STYLES, ROOM_STYLES } from "../../appearance/model";
import { TABLE_THEMES, presetRoomSchema, presetFloorSchema } from "../../appearance/presets";
import styles from "./MaterialPanel.module.css";
const Preview=dynamic(()=>import("./PresetPreview"),{ssr:false,loading:()=> <div className={styles.previewHost} aria-hidden="true"/>});

export default function PresetPanel({target,value,disabled,onChange}:{target:"room"|"table_theme"|"dance_floor";value:unknown;disabled:boolean;onChange:(value:Record<string,unknown>)=>void}) {
 const t=useTranslations("Seating"),key=target === "room"?"floor_style":target === "table_theme"?"table_theme":"style";
 const values=target === "room"?ROOM_STYLES:target === "table_theme"?TABLE_THEMES:FLOOR_STYLES;
 const selected=target === "dance_floor"?presetFloorSchema.parse(value).style:target === "room"?presetRoomSchema.parse(value).floor_style:presetRoomSchema.parse(value).table_theme;
 const title=t(target === "room"?"roomPresetTitle":target === "table_theme"?"tablePresetTitle":"floorPresetTitle");
 return <section className={styles.section} aria-label={title}><h3>{title}</h3>
  {target === "table_theme"&&<p className={styles.help}>{t("tablePresetHelp")}</p>}
  <div className={styles.cards}>{values.map(v=><button type="button" key={v} className={styles.card} disabled={disabled || v===selected}
   aria-pressed={v===selected} onClick={()=>onChange({[key]:v})}>
   <Preview target={target} value={v}/><span>{t(target === "table_theme"?"theme_"+v:"material_"+v)}</span>
   {target === "table_theme"&&<small className={styles.caption}>{t("themeHint_"+v)}</small>}
  </button>)}</div>
 </section>;
}
