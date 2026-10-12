"use client";

import { Circle, Group, Line, Path, Rect } from "react-konva";
import type { TableColors } from "../TableDecorations";

/** Pure drawing: all parts stay within the footprint. Scale is canvas pixels per unit.
 * Konva geometry props are canvas attributes, not inline DOM styles. */
export default function DjBoothVisual({ width = 200, height = 100, scale = 1, colors }: {
  width?: number; height?: number; scale?: number; colors: TableColors;
}) {
  const detailed = width * scale >= 180;
  const fine = width * scale >= 240;
  return <Group x={-width / 2} y={-height / 2} scaleX={width / 320} scaleY={height / 156} listening={false}>
    {/* Separate PA cabinets and a gently bowed booth front give a recognizable silhouette. */}
    {[5, 281].map(x => <Group key={x} x={x} y={18}>
      <Rect width={34} height={104} cornerRadius={7} fill={colors.text} opacity={.1} />
      <Rect x={3} y={3} width={28} height={98} cornerRadius={5} fill="#363a43" stroke={colors.text} strokeWidth={1} />
      <Circle x={17} y={65} radius={10} fill="#171b23" />
      <Circle x={17} y={65} radius={6} stroke="#a8aebb" strokeWidth={.8} opacity={.65} />
      <Rect x={10} y={18} width={14} height={9} cornerRadius={3} fill="#939aa9" opacity={.7} />
      {fine && [38, 44, 87].map(y => <Line key={y} points={[9, y, 25, y]} stroke="#a8aebb" opacity={.3} strokeWidth={.7} />)}
    </Group>)}
    <Path data="M 48 15 Q 48 8 56 8 L 264 8 Q 272 8 272 15 L 276 122 Q 276 139 160 145 Q 44 139 44 122 Z"
      fill="#e8dfcf" stroke={colors.text} strokeWidth={1.1} />
    <Path data="M 45 116 Q 160 126 275 116 L 275 122 Q 275 138 160 144 Q 45 138 45 122 Z"
      fill="#dfd2bd" />
    <Path data="M 49 118 Q 160 132 271 118" stroke="#b99a5e" strokeWidth={2} opacity={.8} />
    <Rect x={53} y={16} width={214} height={96} cornerRadius={8} fill="#242832" />
    {[61, 191].map((x, index) => <Group key={x} x={x} y={23}>
      <Rect width={68} height={82} cornerRadius={5} fill="#454b57" stroke="#a8aebb" strokeWidth={.8} />
      <Circle x={34} y={39} radius={24} fill="#20242d" />
      <Circle x={34} y={39} radius={20} stroke="#a8aebb" strokeWidth={.9} opacity={.75} />
      <Circle x={34} y={39} radius={9} fill="#c1c7d2" />
      <Circle x={34} y={39} radius={3} fill={colors.accent} />
      {detailed && <>
        <Line points={index === 0 ? [53, 21, 48, 30, 44, 43] : [15, 21, 20, 30, 24, 43]}
          stroke="#d6dae3" strokeWidth={1.5} lineCap="round" lineJoin="round" opacity={.85} />
        <Rect x={8} y={6} width={24} height={4} cornerRadius={1} fill={colors.accent} opacity={.35} />
        {[12, 23, 34, 45].map(px => <Rect key={px} x={px} y={69} width={6} height={5} cornerRadius={1}
          fill={px === 12 ? colors.accent : "#d6dae3"} opacity={px === 12 ? .9 : .55} />)}
      </>}
      {fine && <Circle x={56} y={71} radius={3} stroke="#d6dae3" strokeWidth={.8} opacity={.65} />}
    </Group>)}
    <Rect x={137} y={23} width={46} height={82} cornerRadius={4} fill="#454b57" stroke="#a8aebb" strokeWidth={.8} />
    {detailed ? <>
      {[148, 160, 172].map((x, index) => <Group key={x}>
        {[34, 46].map(y => <Circle key={y} x={x} y={y} radius={3} fill="#d6dae3" opacity={.65} />)}
        <Line points={[x, 57, x, 82]} stroke="#d6dae3" strokeWidth={1} opacity={.4} />
        <Rect x={x - 3} y={62 + index * 5} width={6} height={3} cornerRadius={1} fill={colors.accent} />
      </Group>)}
      <Line points={[147, 94, 173, 94]} stroke="#d6dae3" strokeWidth={1} opacity={.4} />
      <Rect x={156} y={91} width={7} height={5} cornerRadius={1} fill="#d6dae3" opacity={.8} />
    </> : <Rect x={149} y={35} width={22} height={57} cornerRadius={3} fill={colors.accent} opacity={.2} />}
    {fine && <Line points={[60, 12, 260, 12]} stroke={colors.fill} strokeWidth={2} opacity={.8} />}
  </Group>;
}
