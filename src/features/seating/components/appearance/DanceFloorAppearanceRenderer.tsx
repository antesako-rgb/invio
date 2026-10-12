"use client";
import { Group,Rect } from "react-konva";
import { patternImage } from "../../appearance/patterns";
import { FLOOR_PRESETS, presetFloorSchema } from "../../appearance/presets";
import { presetPattern } from "../../appearance/presetPatterns";
export function PresetDanceFloor({width,height,style}:{width:number;height:number;style:keyof typeof FLOOR_PRESETS}) {
 const p=FLOOR_PRESETS[style],tile=presetPattern(style);
 return <Group x={-width/2} y={-height/2} listening={false}>
  <Rect x={1} y={1} width={width-2} height={height-2} cornerRadius={5} fill={p.border} shadowColor="#292321" shadowBlur={p.shadow} shadowOpacity={.12} shadowOffsetY={2}/>
  <Rect x={5} y={5} width={width-10} height={height-10} cornerRadius={3} stroke="#fff7e2" strokeWidth={1} opacity={.45}/>
  <Rect x={8} y={8} width={width-16} height={height-16} fillPatternImage={patternImage(tile)} fillPriority={tile?"pattern":"color"} fill="#eadac5" cornerRadius={2}/>
  <Rect x={11} y={11} width={width-22} height={height-22} cornerRadius={2} stroke={style === "white"?"#c5b89b":"#fff5dc"} strokeWidth={.8} opacity={.35}/>
 </Group>;
}
export default function DanceFloorAppearanceRenderer({width,height,value}:{width:number;height:number;value:unknown}) {
 return <PresetDanceFloor width={width} height={height} style={presetFloorSchema.parse(value).style}/>;
}
