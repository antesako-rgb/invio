"use client";

import { Group, Line, Rect } from "react-konva";
import type { TableColors } from "../TableDecorations";

/** The stairs are part of the total footprint, not an external decoration. */
export default function StageVisual({ width = 400, height = 240, scale = 1, colors }: {
  width?: number; height?: number; scale?: number; colors: TableColors;
}) {
  const detailed = width * scale >= 170;
  return <Group x={-width / 2} y={-height / 2} scaleX={width / 320} scaleY={height / 180} listening={false}>
    <Rect x={1} y={1} width={318} height={148} cornerRadius={6} fill="#56505a" stroke={colors.text} strokeWidth={1} />
    <Rect x={7} y={7} width={306} height={132} cornerRadius={3} fill="#80727b" />
    {/* A quiet warm surface; board seams disappear before becoming visual noise. */}
    {detailed && Array.from({ length: 7 }, (_, row) => <Group key={row}>
      <Rect x={8} y={8 + row * 18} width={304} height={17} fill={row % 2 ? "#92818a" : "#887982"} opacity={.55} />
      <Line points={[8, 26 + row * 18, 312, 26 + row * 18]} stroke="#504852" opacity={.3} strokeWidth={.6} />
      {[76, 152, 228].map(x => <Line key={x} points={[x + (row % 2) * 32, 8 + row * 18, x + (row % 2) * 32, 26 + row * 18]} stroke="#504852" opacity={.2} strokeWidth={.6} />)}
    </Group>)}
    <Rect x={7} y={7} width={306} height={4} fill="#c6b5bc" opacity={.65} />
    <Rect x={7} y={139} width={306} height={8} fill="#403b46" />
    <Line points={[8, 141, 312, 141]} stroke={colors.accent} strokeWidth={1.5} opacity={.7} />
    {/* Three nested treads and side cheeks make the access direction readable. */}
    <Rect x={108} y={147} width={104} height={32} cornerRadius={[0, 0, 3, 3]} fill="#49434e" stroke={colors.text} strokeWidth={.8} />
    {[0, 1, 2].map(step => <Group key={step}>
      <Rect x={111} y={148 + step * 10} width={98} height={8} fill={step % 2 ? "#8d7e87" : "#a0939b"} />
      <Line points={[112, 149 + step * 10, 208, 149 + step * 10]} stroke="#d7cdd2" strokeWidth={.8} opacity={.65} />
    </Group>)}
  </Group>;
}
