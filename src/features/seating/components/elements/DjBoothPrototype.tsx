"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TableChairs, type TableColors } from "../TableDecorations";
import DjBoothVisual from "./DjBoothVisual";
import DanceFloorVisual from "./DanceFloorVisual";
import StageVisual from "./StageVisual";
import styles from "./DjBoothPrototype.module.css";

type Kind = "dj" | "stage" | "dance";
const kinds: Kind[] = ["dance", "stage", "dj"];
const dimensions = { dj: { width: 200, height: 100 }, stage: { width: 400, height: 240 }, dance: { width: 400, height: 400 } };
const initial = { dj: { x: 250, y: 180, rotation: 0 }, stage: { x: 230, y: -180, rotation: 0 }, dance: { x: -400, y: 0, rotation: 0 } };

function Visual({ kind, width, height, scale, colors }: { kind: Kind; width: number; height: number; scale: number; colors: TableColors }) {
  const props = { width, height, scale, colors };
  return kind === "dj" ? <DjBoothVisual {...props} /> : kind === "stage" ? <StageVisual {...props} /> : <DanceFloorVisual {...props} />;
}

export default function DjBoothPrototype() {
  const t = useTranslations("Seating.djPrototype");
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 560 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Kind>("dj");
  const [objects, setObjects] = useState(initial);
  const [colors, setColors] = useState<TableColors>({ fill: "#ffffff", text: "#242424", accent: "#6557ff", accentText: "#ffffff" });
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
      const css = getComputedStyle(element);
      const value = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      setColors({ fill: value("--card", "#ffffff"), text: value("--foreground", "#242424"), accent: value("--primary", "#6557ff"), accentText: value("--primary-foreground", "#ffffff") });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = Math.min(size.width / 1500, size.height / 850) * zoom;
  const studyWidth = Math.max(1, Math.min(280, size.width < 600 ? size.width - 26 : (size.width - 24) / 3 - 26));
  const table = { shape: "round" as const, capacity: 8, width_cm: 150, height_cm: 150, x_cm: -40, y_cm: 80, rotation_deg: 0, name: t("table") };
  const selectedSize = dimensions[selected];

  return <main className={styles.page}>
    <header className={styles.header}><p className={styles.eyebrow}>{t("eyebrow")}</p><h1 className={styles.title}>{t("title")}</h1><p className={styles.help}>{t("description")}</p></header>
    <div className={styles.controls} role="group" aria-label={t("selection")}>
      {kinds.map(kind => <Button key={kind} variant={selected === kind ? "default" : "outline"} aria-pressed={selected === kind} onClick={() => setSelected(kind)}>{t(kind)}</Button>)}
    </div>
    <div className={styles.controls} role="group" aria-label={t("controls")}>
      {[.6, 1, 1.5].map(value => <Button key={value} variant={zoom === value ? "default" : "outline"} aria-pressed={zoom === value} onClick={() => setZoom(value)}>{Math.round(value * 100)}%</Button>)}
      <Button variant="outline" onClick={() => setObjects(current => ({ ...current, [selected]: { ...current[selected], rotation: (current[selected].rotation + 45) % 360 } }))}>{t("rotate")}</Button>
      <Button variant="ghost" onClick={() => { setZoom(1); setObjects(initial); }}>{t("reset")}</Button>
    </div>
    <div ref={container} className={styles.canvas} role="img" aria-label={t("canvas")}>
      <Stage width={size.width} height={size.height}>
        <Layer><Group x={size.width / 2} y={size.height / 2} scaleX={scale} scaleY={scale}>
          <Rect x={-680} y={-350} width={1360} height={700} cornerRadius={6} fill={colors.fill} stroke={colors.text} opacity={.3} strokeWidth={1} strokeScaleEnabled={false} listening={false} />
          {kinds.map(kind => {
            const object = objects[kind]; const { width, height } = dimensions[kind];
            return <Group key={kind} x={object.x} y={object.y} rotation={object.rotation} draggable
              onClick={() => setSelected(kind)} onTap={() => setSelected(kind)} onDragStart={() => setSelected(kind)}
              onDragEnd={event => { const position = event.target.position(); setObjects(current => ({ ...current, [kind]: { ...current[kind], ...position } })); }}>
              <Rect x={-width / 2} y={-height / 2} width={width} height={height} fill={colors.fill} opacity={.01} />
              <Visual kind={kind} width={width} height={height} scale={scale} colors={colors} />
              {selected === kind && <Rect x={-width / 2} y={-height / 2} width={width} height={height} stroke={colors.accent} strokeWidth={1} strokeScaleEnabled={false} dash={[6 / scale, 4 / scale]} listening={false} />}
            </Group>;
          })}
          <TableChairs table={table} colors={colors} scale={scale} />
          <Rect x={table.x_cm} y={table.y_cm} width={150} height={150} offsetX={75} offsetY={75} cornerRadius={75} fill={colors.fill} stroke={colors.text} strokeWidth={1} strokeScaleEnabled={false} listening={false} />
          <Text x={table.x_cm - 65} y={table.y_cm - 8} width={130} align="center" text={table.name} fontSize={15} fill={colors.text} listening={false} />
        </Group></Layer>
      </Stage>
    </div>
    <div className={styles.caption} aria-live="polite"><strong>{t(selected)} · {selectedSize.width} × {selectedSize.height} cm</strong><span>{t("footprint")}</span></div>
    <div className={styles.caption}><span>{t("interaction")}</span><span>{t("localOnly")}</span></div>
    <section className={styles.studies} aria-label={t("comparison")}>
      {kinds.map(kind => {
        const { width, height } = dimensions[kind];
        const previewScale = Math.min((studyWidth - 16) / width, 200 / height);
        return <div key={kind} className={styles.study}>
          <Stage width={studyWidth} height={220} listening={false}><Layer><Group x={studyWidth / 2} y={110} scaleX={previewScale} scaleY={previewScale}>
            <Visual kind={kind} width={width} height={height} scale={previewScale} colors={colors} />
          </Group></Layer></Stage><h2>{t(kind)}</h2><p>{width} × {height} cm</p>
        </div>;
      })}
    </section>
  </main>;
}
