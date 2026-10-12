"use client";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { TableChairs, TableLabel, type VisualTable } from "../TableDecorations";
import TableSurface from "../TableSurface";
import TableThemeRenderer from "./TableThemeRenderer";
import { PresetDanceFloor } from "./DanceFloorAppearanceRenderer";
import { TABLE_PRESETS, FLOOR_PRESETS, type TableTheme } from "../../appearance/presets";
import { presetPattern } from "../../appearance/presetPatterns";
import { patternImage } from "../../appearance/patterns";
import { getTablePreviewBounds } from "../../validation/canvasInteraction";
import styles from "./MaterialPanel.module.css";

export default function PresetPreview({target,value}:{target:"room"|"table_theme"|"dance_floor";value:string}) {
 const host=useRef<HTMLDivElement>(null),[width,setWidth]=useState(120);
 useEffect(()=>{
  if(!host.current)return;
  const observer=new ResizeObserver(entries=>{const w=entries[0]?.contentRect.width;if(w>0)setWidth(w);});
  observer.observe(host.current);return()=>observer.disconnect();
 },[]);
 const ratio=width/120;
 const table:VisualTable={shape:"round",width_cm:200,height_cm:200,x_cm:0,y_cm:0,rotation_deg:0,capacity:6,name:"1"};
 const bounds=getTablePreviewBounds(table),tableScale=Math.min(104/bounds.width,74/ratio/bounds.height);
 const floorScale=Math.min(104/510,74/ratio/350);
 const theme=value as TableTheme,skin=TABLE_PRESETS[theme];
 const colors={fill:"#ffffff",text:skin?.text??"#242424",accent:"#6557ff",accentText:"#ffffff"};
 return <div ref={host} className={styles.previewHost} aria-hidden="true"><Stage width={width} height={86} listening={false}><Layer><Group scaleX={ratio} scaleY={ratio} y={(86-86*ratio)/2}>
  <Rect width={120} height={86} fill="#f5f3ed"/>
  {target === "table_theme" ? <Group x={60} y={43} scaleX={tableScale} scaleY={tableScale}>
   <TableChairs table={table} colors={colors} theme={theme} scale={tableScale*ratio}/>
   <TableSurface table={table} colors={colors} scale={tableScale*ratio}/>
   <TableThemeRenderer table={table} theme={theme} scale={tableScale*ratio}/>
   <TableLabel table={table} occupancy={0} colors={colors}/>
  </Group> : target === "dance_floor" ? <Group x={60} y={43} scaleX={floorScale} scaleY={floorScale}>
   <PresetDanceFloor width={510} height={350} style={value as keyof typeof FLOOR_PRESETS}/>
  </Group> : <Rect width={120} height={86} fill={value === "neutral"?"#ffffff":"#f5f3ed"}
   fillPatternImage={patternImage(presetPattern(value))} fillPatternScaleX={.28} fillPatternScaleY={.28} fillPriority={value === "neutral"?"color":"pattern"}/>} 
 </Group></Layer></Stage></div>;
}
