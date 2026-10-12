"use client";
import { Circle, Group, Line, Rect } from "react-konva";
import { TABLE_PRESETS, type TableTheme } from "../../appearance/presets";
import { presetPattern } from "../../appearance/presetPatterns";
import { patternImage } from "../../appearance/patterns";
import { getTableLabelLayout } from "../../validation/canvasInteraction";
import type { VisualTable } from "../TableDecorations";

export default function TableThemeRenderer({ table, theme, scale }: { table: VisualTable; theme: TableTheme; scale: number }) {
  if (theme === "generic") return null;
  const p = TABLE_PRESETS[theme], w = table.width_cm, h = table.height_cm, size = Math.min(w, h);
  const inset = Math.min(6, size*.06), ring = Math.min(12, size*.12);
  const radius = table.shape === "round" ? (w - inset*2) / 2 : Math.min(8,size*.08);
  const texture = presetPattern(p.texture, p.surface);
  const y = -getTableLabelLayout(table).height / 2 - size * .15;
  return <Group x={table.x_cm} y={table.y_cm} rotation={table.rotation_deg} listening={false}>
    <Rect x={-w / 2 + inset/2} y={-h / 2 + inset/2} width={w - inset} height={h - inset} cornerRadius={table.shape === "round" ? (w - inset) / 2 : Math.min(9,size*.09)}
      fill={p.rim} shadowColor="#30281f" shadowOpacity={.1} shadowBlur={3} shadowOffsetY={2} />
    <Rect x={-w / 2 + inset} y={-h / 2 + inset} width={w - inset*2} height={h - inset*2} cornerRadius={radius}
      fill={p.surface} fillPatternImage={patternImage(texture)} fillPriority={texture ? "pattern" : "color"} />
    {table.shape === "round" ? <Circle radius={w / 2 - ring} stroke={p.rim} strokeWidth={.8} opacity={.45}/>
      : <Rect x={-w / 2 + ring} y={-h / 2 + ring} width={w - ring*2} height={h - ring*2} cornerRadius={Math.min(4,size*.04)} stroke={p.rim} strokeWidth={.8} opacity={.45}/>}
    {size * scale >= 45 && <Group rotation={-table.rotation_deg} y={0}>
      <Group y={y}>
        <Line points={[-size * .16, size*.012, 0, -size*.012, size * .16, size*.012]} stroke="#879779" strokeWidth={size * .009} tension={.4} lineCap="round" />
        {[-1, 0, 1].map((i) => <Group key={i} x={i * size * .085}>
          <Line points={[-size * .042, 0, -size*.018, -size*.034, size * .035, 0, size*.012, size * .032]} tension={.45} closed fill={i % 2 ? "#879c82" : "#aab797"} />
          {p.decoration === "greenery" && <>
            <Line points={[-size*.035,-size*.025,size*.035,size*.025]} stroke="#697f61" strokeWidth={size*.006}/>
            <Circle x={size*.012} radius={size*.013} fill="#faf3e5"/>
          </>}
          {p.decoration === "floral" && <>
            {[0,1,2,3,4].map(petal=><Circle key={petal} x={Math.cos(petal*Math.PI*2/5)*size*.022} y={Math.sin(petal*Math.PI*2/5)*size*.022}
              radius={size*.021} fill={theme === "classic_ivory" && i===0 ? "#eed6cb" : "#fff9ef"} stroke="#ddcfb9" strokeWidth={size*.003}/>)}
            <Circle radius={size * .017} fill="#fcf5e6"/><Circle radius={size*.007} fill="#d2b781"/>
          </>}
          {p.decoration === "candles" && <>
            <Circle radius={size * .032} fill="#dfc58e" stroke={p.rim} strokeWidth={size*.006}/>
            <Circle radius={size*.023} fill="#fffbef"/><Circle radius={size * .006} fill="#bda066"/>
            <Circle x={size*.036} y={-size*.021} radius={size*.013} fill="#fcf5e7"/>
          </>}
        </Group>)}
      </Group>
    </Group>}
  </Group>;
}
