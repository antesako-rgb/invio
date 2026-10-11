"use client";

import { Group, Rect } from "react-konva";
import { TableChairs, TableLabel, type TableColors } from "../TableDecorations";
import TableSurface, { TABLE_RIM_FILL } from "../TableSurface";
import { chairPositions } from "../../validation/canvasInteraction";
import type { SeatingTable } from "../../types";

export type TableVariant = "existing" | "detailed";
export type PrototypeTable = Pick<SeatingTable, "shape" | "capacity" | "width_cm" | "height_cm" | "x_cm" | "y_cm" | "rotation_deg" | "name">;

/** Prototype 3 keeps the contrast, chairs and labels of 1, adding only surface depth.
 * Konva geometry props are drawing attributes, not DOM inline styles. */
export default function TableVisual({ table, variant, colors, scale, occupancy }: {
  table: PrototypeTable; variant: TableVariant; colors: TableColors; scale: number; occupancy: number;
}) {
  const { width_cm: width, height_cm: height } = table;
  const assignments = chairPositions(table).slice(0, occupancy).map(chair => ({ project_guest_id: `preview-${chair.seatNumber}`, seat_number: chair.seatNumber }));
  const detailed = variant === "detailed";
  const corner = table.shape === "round" ? width / 2 : 8;
  return <>
    <TableChairs table={table} colors={colors} assignments={assignments} scale={scale} />
    <Group x={table.x_cm} y={table.y_cm} rotation={table.rotation_deg} listening={false}>
      <Rect x={-width / 2} y={-height / 2} width={width} height={height} cornerRadius={corner}
        fill={detailed ? TABLE_RIM_FILL : colors.fill} stroke={colors.text} strokeWidth={1} strokeScaleEnabled={false} />
    </Group>
    {detailed && <TableSurface table={table} colors={colors} scale={scale} />}
    <TableLabel table={table} occupancy={occupancy} colors={colors} />
  </>;
}
