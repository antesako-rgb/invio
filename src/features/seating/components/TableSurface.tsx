"use client";

import { Group, Rect } from "react-konva";
import type { SeatingTable } from "../types";
import type { TableColors } from "./TableDecorations";

export const TABLE_RIM_FILL = "#dfe1e9";

/** Non-interactive surface inside the original table footprint. The editor keeps
 * its existing Rect as the drag/rotation target and draws this detail above it. */
export default function TableSurface({ table, colors, scale }: {
  table: Pick<SeatingTable, "shape" | "width_cm" | "height_cm" | "x_cm" | "y_cm" | "rotation_deg">;
  colors: TableColors; scale: number;
}) {
  const { width_cm: width, height_cm: height } = table;
  const size = Math.min(width, height);
  const inset = Math.min(3, size * .12);
  const ring = Math.min(7, size * .24);
  return <Group x={table.x_cm} y={table.y_cm} rotation={table.rotation_deg} listening={false}>
    <Rect x={-width / 2 + inset} y={-height / 2 + inset} width={width - inset * 2} height={height - inset * 2}
      cornerRadius={table.shape === "round" ? (width - inset * 2) / 2 : Math.min(6, size * .15)}
      fillPriority="linear-gradient" fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: height - inset * 2 }}
      fillLinearGradientColorStops={[0, colors.fill, .5, colors.fill, 1, "#eef0f6"]} />
    {size * scale >= 100 && <Rect x={-width / 2 + ring} y={-height / 2 + ring} width={width - ring * 2} height={height - ring * 2}
      cornerRadius={table.shape === "round" ? (width - ring * 2) / 2 : Math.min(5, size * .12)} stroke="#c8cbd6" strokeWidth={.65} />}
  </Group>;
}
