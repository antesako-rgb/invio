"use client";

import { Group, Line, Rect } from "react-konva";
import type { TableColors } from "../TableDecorations";

export default function DanceFloorVisual({ width = 400, height = 400, scale = 1, colors }: {
  width?: number; height?: number; scale?: number; colors: TableColors;
}) {
  const detailed = Math.min(width, height) * scale >= 160;
  const fine = Math.min(width, height) * scale >= 260;
  return <Group x={-width / 2} y={-height / 2} scaleX={width / 320} scaleY={height / 320} listening={false}>
    <Rect x={1} y={1} width={318} height={318} cornerRadius={5} fill="#b5a18d" stroke={colors.text} strokeWidth={.8} opacity={.85} />
    <Rect x={7} y={7} width={306} height={306} cornerRadius={2} fill="#eadac5" />
    {/* Alternating parquet modules remain calm at medium zoom. */}
    {(detailed ? Array.from({ length: 36 }, (_, index) => index) : [0, 1, 2, 3]).map(index => {
      const count = detailed ? 6 : 2;
      const cell = 300 / count;
      const col = index % count;
      const row = Math.floor(index / count);
      return <Group key={index} x={10 + col * cell} y={10 + row * cell}>
        <Rect width={cell} height={cell} fill={(col + row) % 2 ? "#dfc9ad" : "#e6d2b6"} />
        {detailed && [1, 2, 3].map(seam => <Line key={seam} points={(col + row) % 2 ? [seam * cell / 4, 1, seam * cell / 4, cell - 1] : [1, seam * cell / 4, cell - 1, seam * cell / 4]} stroke="#ad9276" opacity={.45} strokeWidth={.7} />)}
        {fine && <Line points={(col + row) % 2 ? [cell / 8, 8, cell / 8, cell - 8] : [8, cell / 8, cell - 8, cell / 8]} stroke="#ad9276" opacity={.2} strokeWidth={.6} />}
      </Group>;
    })}
    <Rect x={9} y={9} width={302} height={302} stroke="#a98e71" strokeWidth={.6} opacity={.65} listening={false} />
    <Line points={[5, 315, 315, 315]} stroke="#8c7763" strokeWidth={1.3} opacity={.55} />
  </Group>;
}
