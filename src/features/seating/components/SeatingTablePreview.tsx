"use client";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { TableChairs, TableLabel, type TableColors } from "./TableDecorations";
import TableSurface, { TABLE_RIM_FILL } from "./TableSurface";
import { getTablePreviewBounds } from "../validation/canvasInteraction";
import type { SeatingTable } from "../types";
import styles from "./CreateSeatingTableDialog.module.css";
import TableThemeRenderer from "./appearance/TableThemeRenderer";
import { TABLE_PRESETS, type TableTheme } from "../appearance/presets";

export default function SeatingTablePreview({ table, theme = "generic" }: { table: SeatingTable; theme?: TableTheme }) {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 320, height: 224 });
  const [colors, setColors] = useState<TableColors>({ fill: "#ffffff", text: "#242424", accent: "#6557ff", accentText: "#ffffff" });
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width < 1 || height < 1) return;
      setSize({ width, height });
      const css = getComputedStyle(element);
      setColors({ fill: css.getPropertyValue("--card").trim() || "#ffffff",
        text: css.getPropertyValue("--foreground").trim() || "#242424",
        accent: css.getPropertyValue("--primary").trim() || "#6557ff",
        accentText: css.getPropertyValue("--primary-foreground").trim() || "#ffffff" });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const bounds = getTablePreviewBounds(table);
  const scale = Math.max(.001, Math.min((size.width-32)/bounds.width, (size.height-32)/bounds.height));
  const centered = { ...table, x_cm: 0, y_cm: 0, rotation_deg: 0 };
  const labelColors=theme === "generic" ? colors : {...colors,text:TABLE_PRESETS[theme].text};
  return <div ref={container} className={styles.previewCanvas} aria-hidden="true">
    <Stage width={size.width} height={size.height} listening={false}>
      <Layer><Group x={size.width/2} y={size.height/2} scaleX={scale} scaleY={scale}>
        <TableChairs table={centered} colors={colors} theme={theme} scale={scale}/>
        <Rect width={table.width_cm} height={table.height_cm} offsetX={table.width_cm/2} offsetY={table.height_cm/2}
          cornerRadius={table.shape === "round" ? table.width_cm/2 : 8} fill={TABLE_RIM_FILL} stroke={colors.text} strokeWidth={1} strokeScaleEnabled={false} />
        <TableSurface table={centered} colors={colors} scale={scale} />
        <TableThemeRenderer table={centered} theme={theme} scale={scale}/>
        <TableLabel table={centered} occupancy={0} colors={labelColors} />
      </Group></Layer>
    </Stage>
  </div>;
}
