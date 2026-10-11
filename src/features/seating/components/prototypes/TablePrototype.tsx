"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { TableColors } from "../TableDecorations";
import { getTablePreviewBounds } from "../../validation/canvasInteraction";
import { getStandardTableDimensions } from "../../validation/tableDimensions";
import DjBoothVisual from "../elements/DjBoothVisual";
import DanceFloorVisual from "../elements/DanceFloorVisual";
import StageVisual from "../elements/StageVisual";
import TableVisual, { type PrototypeTable, type TableVariant } from "./TableVisual";
import styles from "./TablePrototype.module.css";

const variants: TableVariant[] = ["existing", "detailed"];
function useCanvasFrame() {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 320, height: 360 });
  const [colors, setColors] = useState<TableColors>({ fill: "#ffffff", text: "#242424", accent: "#6557ff", accentText: "#ffffff" });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setFrame({ width: element.clientWidth, height: element.clientHeight });
      const css = getComputedStyle(element);
      const value = (key: string, fallback: string) => css.getPropertyValue(key).trim() || fallback;
      setColors({ fill: value("--card", "#ffffff"), text: value("--foreground", "#242424"), accent: value("--primary", "#6557ff"), accentText: value("--primary-foreground", "#ffffff") });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, frame, colors };
}

function Comparison({ table, variant, zoom }: { table: PrototypeTable; variant: TableVariant; zoom: number }) {
  const t = useTranslations("Seating.tablePrototype");
  const { ref, frame, colors } = useCanvasFrame();
  const bounds = getTablePreviewBounds(table);
  // Reserve the full diagonal for all rotations and 150% zoom. Rotation never refits the view.
  const extent = Math.hypot(bounds.width, bounds.height);
  const scale = Math.max(.001, Math.min(frame.width - 32, frame.height - 32) / extent / 1.5) * zoom;
  return <article className={styles.card}>
    <div className={styles.cardHeader}><h3>{t(variant)}</h3><span className={styles.dimensions}>{table.width_cm} × {table.height_cm} cm</span></div>
    <div ref={ref} className={styles.canvas} role="img" aria-label={t("comparisonCanvas", { variant: t(variant), name: table.name })}>
      <Stage width={frame.width} height={frame.height} listening={false}><Layer><Group x={frame.width / 2} y={frame.height / 2} scaleX={scale} scaleY={scale}>
        <TableVisual table={table} variant={variant} colors={colors} scale={scale} occupancy={Math.floor(table.capacity * .625)} />
      </Group></Layer></Stage>
    </div>
  </article>;
}

function Room({ round, rectangle, variant, zoom }: { round: PrototypeTable; rectangle: PrototypeTable; variant: TableVariant; zoom: number }) {
  const t = useTranslations("Seating.tablePrototype");
  const { ref, frame, colors } = useCanvasFrame();
  const scale = Math.max(.001, Math.min(frame.width / 2400, frame.height / 1450)) * zoom;
  return <div ref={ref} className={styles.room} role="img" aria-label={t("roomCanvas")}>
    <Stage width={frame.width} height={frame.height} listening={false}>
      <Layer><Group x={frame.width / 2} y={frame.height / 2} scaleX={scale} scaleY={scale}>
        <Rect x={-760} y={-420} width={1520} height={840} fill={colors.fill} stroke={colors.text} strokeWidth={1} strokeScaleEnabled={false} opacity={.25} cornerRadius={6} />
        <Group x={-470} y={-170}><DanceFloorVisual colors={colors} scale={scale} /></Group>
        <Group x={330} y={-230}><StageVisual colors={colors} scale={scale} /></Group>
        <Group x={610} y={335}><DjBoothVisual colors={colors} scale={scale} /></Group>
        <TableVisual table={{ ...round, x_cm: -300, y_cm: 230 }} variant={variant} colors={colors} scale={scale} occupancy={5} />
        <TableVisual table={{ ...rectangle, x_cm: 330, y_cm: 100 }} variant={variant} colors={colors} scale={scale} occupancy={Math.floor(rectangle.capacity * .625)} />
      </Group></Layer>
    </Stage>
  </div>;
}

export default function TablePrototype() {
  const t = useTranslations("Seating.tablePrototype");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [capacity, setCapacity] = useState(8);
  const [variant, setVariant] = useState<TableVariant>("detailed");
  const round: PrototypeTable = { ...getStandardTableDimensions("round", 2000, 1500, 8), shape: "round", capacity: 8, x_cm: 0, y_cm: 0, rotation_deg: rotation, name: t("tableName", { number: 1 }) };
  const rectangle: PrototypeTable = { ...getStandardTableDimensions("rectangle", 2000, 1500, capacity), shape: "rectangle", capacity, x_cm: 0, y_cm: 0, rotation_deg: rotation, name: t("tableName", { number: 2 }) };
  return <main className={styles.page}>
    <header className={styles.header}><p className={styles.eyebrow}>{t("eyebrow")}</p><h1 className={styles.title}>{t("title")}</h1><p className={styles.help}>{t("description")}</p></header>
    <div className={styles.toolbar} role="group" aria-label={t("controls")}>
      {[.6, 1, 1.5].map(value => <Button key={value} variant={zoom === value ? "default" : "outline"} aria-pressed={zoom === value} onClick={() => setZoom(value)}>{Math.round(value * 100)}%</Button>)}
      <Button variant="outline" onClick={() => setRotation(value => (value + 45) % 360)}>{t("rotate", { angle: rotation })}</Button>
      <Button variant="ghost" onClick={() => { setZoom(1); setRotation(0); setCapacity(8); setVariant("detailed"); }}>{t("reset")}</Button>
    </div>
    <p className={styles.note}>{t("scaleNote")}</p>
    <section className={styles.section}><h2>{t("round")}</h2><div className={styles.grid}>
      {variants.map(item => <Comparison key={item} table={round} variant={item} zoom={zoom} />)}
    </div></section>
    <section className={styles.section}><h2>{t("rectangle")}</h2>
      <div className={styles.toolbar} role="group" aria-label={t("capacityControls")}>
        {[8, 12, 16].map(value => <Button key={value} variant={capacity === value ? "default" : "outline"} aria-pressed={capacity === value} onClick={() => setCapacity(value)}>{t("seats", { count: value })}</Button>)}
      </div><p className={styles.note}>{t("geometryNote")}</p>
      <div className={styles.grid}>{variants.map(item => <Comparison key={item} table={rectangle} variant={item} zoom={zoom} />)}</div>
    </section>
    <section className={styles.section}><h2>{t("room")}</h2>
      <div className={styles.toolbar} role="group" aria-label={t("variants")}>
        {variants.map(item => <Button key={item} variant={variant === item ? "default" : "outline"} aria-pressed={variant === item} onClick={() => setVariant(item)}>{t(item)}</Button>)}
      </div><Room round={round} rectangle={rectangle} variant={variant} zoom={zoom} />
    </section>
    <p className={styles.note}>{t("localOnly")}</p>
  </main>;
}
