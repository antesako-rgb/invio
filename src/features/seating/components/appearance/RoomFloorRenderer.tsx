"use client";
import { Rect } from "react-konva";
import { patternImage } from "../../appearance/patterns";
import { presetRoomSchema } from "../../appearance/presets";
import { presetPattern } from "../../appearance/presetPatterns";
export default function RoomFloorRenderer({width,height,value}:{width:number;height:number;value:unknown}) {
 const a=presetRoomSchema.parse(value),pattern=presetPattern(a.floor_style);
 return a.floor_style === "neutral" ? null : <Rect width={width} height={height} fill="#f5f3ef" fillPatternImage={patternImage(pattern)} fillPriority={pattern?"pattern":"color"} listening={false}/>;
}
