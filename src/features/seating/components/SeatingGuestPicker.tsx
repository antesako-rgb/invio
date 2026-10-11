"use client";
import { useId,useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { guestOptions } from "@/features/project-guests/utils/guestOptions";
import { guestMatchesScope,previewAutomaticSeats,type GuestScope } from "../validation/automaticSeating";
import { getManualSeatOptions, type ManualSeats } from "../validation/manualSeating";
import type { PlanData,SeatingTable } from "../types";
import styles from "./SeatingBatch.module.css";
export type GuestBrowse={query:string;scope:GuestScope;groupId?:string};
export default function SeatingGuestPicker({ current,tables,tableId,selected,onChange,multiple=false,projectOnly=false,allowProject=false,disabled=false,hideSelection=false,browse,onBrowseChange,simpleScope=false,manualTable,choices={},onSeatChange,proposedSeats,className }: {
 current:PlanData;tables:SeatingTable[];tableId:string|null;selected:string[];onChange:(ids:string[])=>void;
 multiple?:boolean;projectOnly?:boolean;allowProject?:boolean;disabled?:boolean;hideSelection?:boolean;
 browse?:GuestBrowse;onBrowseChange?:(value:GuestBrowse)=>void;
 simpleScope?:boolean;manualTable?:SeatingTable;choices?:ManualSeats;onSeatChange?:(id:string,seat:number|null)=>void;
 proposedSeats?:{guestId:string;seatNumber:number|null}[];
 className?:string;
}) {
 const t=useTranslations("Seating"),id=useId();
 const [localBrowse,setLocalBrowse]=useState<GuestBrowse>({query:"",scope:projectOnly?"project":"unassigned"});
 const state=browse??localBrowse;const changeBrowse=onBrowseChange??setLocalBrowse;
 const groups=current.invitationGroups??[];
 const groupId=groups.some(group=>group.id===state.groupId)?state.groupId:"";
 const groupNames=new Map(groups.map(group=>[group.id,group.name]));
 const options=new Map(guestOptions(current.people).map(p=>[p.value,p.label]));
 const scopes:GuestScope[]=projectOnly?["project"]:tableId?["unassigned","here","other","all",...(allowProject?["project" as const]:[])]:["unassigned","all",...(allowProject?["project" as const]:[])];
 const scope=scopes.includes(state.scope)?state.scope:scopes[0];
 const effectiveScope=simpleScope&&!projectOnly?(state.scope==="all"?"all":"unassigned"):scope;
 const people=current.people.filter(p=>{
  const member=current.participants.some(item=>item.project_guest_id===p.id);
  if(!member&&!allowProject&&!projectOnly)return false;
  const matches=simpleScope&&!projectOnly
   ? effectiveScope==="all"||!current.assignments.some(item=>item.project_guest_id===p.id)
   : guestMatchesScope(p.id,effectiveScope,tableId,current);
  return selected.includes(p.id)||(matches&&(!groupId||current.guestGroups?.[p.id]===groupId)&&(options.get(p.id)??"").toLocaleLowerCase().includes(state.query.trim().toLocaleLowerCase()));
 }).sort((a,b)=>(options.get(a.id)??"").localeCompare(options.get(b.id)??"","hr"));
 const target=tables.find(table=>table.id===tableId);
 let remaining=target?Math.max(0,target.capacity-previewAutomaticSeats(target,selected,current.assignments).occupancy):Infinity;
 const selectable=people.filter(p=>{
  if(p.archived_at||selected.includes(p.id))return false;
  const alreadyHere=!!target&&current.assignments.some(item=>item.project_guest_id===p.id&&item.table_id===target.id);
  if(!alreadyHere&&remaining===0)return false;
  if(!alreadyHere)remaining--;
  return true;
 }).slice(0,Math.max(0,100-selected.length));
 const groupCandidates=groupId?current.people.filter(p=>!p.archived_at&&current.guestGroups?.[p.id]===groupId
  && (current.participants.some(m=>m.project_guest_id===p.id)||allowProject||projectOnly)
  && (simpleScope&&!projectOnly?(effectiveScope==="all"||!current.assignments.some(a=>a.project_guest_id===p.id)):guestMatchesScope(p.id,effectiveScope,tableId,current))).map(p=>p.id):[];
 const wholeGroup=Array.from(new Set([...selected,...groupCandidates]));
 return <div className={[styles.picker,className].filter(Boolean).join(" ")}>
  <Input value={state.query} disabled={disabled} onChange={e=>changeBrowse({...state,query:e.target.value})} onKeyDown={event=>{if(event.key==="Enter")event.preventDefault();}} aria-label={t("searchPeople")} placeholder={t("searchPeople")}/>
  {groups.length>0&&<div className={styles.scope}><label htmlFor={id+"-group"}>{t("invitationGroup")}</label><Select id={id+"-group"} value={groupId??""} disabled={disabled} onValueChange={value=>changeBrowse({...state,groupId:value??""})} options={[{value:"",label:t("allInvitationGroups")},...groups.map(group=>({value:group.id,label:group.name}))]}/></div>}
  {!projectOnly&&(simpleScope?<label className={styles.exactOption}><input type="checkbox" checked={effectiveScope==="all"} disabled={disabled} onChange={event=>changeBrowse({...state,scope:event.target.checked?"all":"unassigned"})}/><span>{t("showAllGuests")}</span></label>:<div className={styles.scope}><label htmlFor={id+"-scope"}>{t("guestSource")}</label><Select id={id+"-scope"} value={scope} disabled={disabled} onValueChange={value=>changeBrowse({...state,scope:value as GuestScope})} options={scopes.map(s=>({value:s,label:t({unassigned:"unassigned",here:"guestsAtTable",other:"guestsOtherTables",all:"allGuests",project:"addFromProject"}[s])}))}/></div>)}
  {multiple&&(selectable.length>0||selected.length>0||groupCandidates.length>0)&&<div className={styles.selectionTools}>
   {groupId?groupCandidates.length>0&&<Button type="button" variant="ghost" size="sm" className={styles.selectVisible} disabled={disabled||wholeGroup.length>100} onClick={()=>onChange(wholeGroup)}>{t("selectInvitationGroup",{count:groupCandidates.length})}</Button>:selectable.length>0&&<Button type="button" variant="ghost" size="sm" className={styles.selectVisible} disabled={disabled} onClick={()=>onChange([...selected,...selectable.map(p=>p.id)])}>{t("selectVisibleGuests",{count:selectable.length})}</Button>}
   {selected.length>0&&<Button type="button" variant="ghost" size="sm" className={styles.selectVisible} disabled={disabled} onClick={()=>onChange([])}>{t("clearGuestSelection")}</Button>}
  </div>}
  <ul className={styles.people} data-slot="seating-guest-options">{people.map(p=>{
   const assignment=current.assignments.find(a=>a.project_guest_id===p.id),table=tables.find(v=>v.id===assignment?.table_id);
   const member=current.participants.some(a=>a.project_guest_id===p.id);
   const caption=!member?t("notInPlan"):table?table.name+" · "+(assignment?.seat_number==null?t("noSpecificSeat"):t("seatNumber",{number:assignment.seat_number})):t("unassigned");
   const checked=selected.includes(p.id);
   const proposal=proposedSeats?.find(item=>item.guestId===p.id)?.seatNumber;
   return <li key={p.id}><label className={styles.person} data-selected={checked}>
    <input type={multiple?"checkbox":"radio"} name={id} checked={checked} disabled={disabled||!!p.archived_at||(multiple&&!checked&&selected.length>=100)} onChange={()=>onChange(multiple?(checked?selected.filter(v=>v!==p.id):[...selected,p.id]):[p.id])}/>
    <span><strong>{options.get(p.id)}</strong><small>{caption}{current.guestGroups?.[p.id]?" · "+groupNames.get(current.guestGroups[p.id]):""}{p.archived_at?" · "+t("archived"):""}{current.attendance[p.id]?.hasInvitationLink?" · "+t(current.attendance[p.id].status??"pending"):""}{current.attendance[p.id]?.manual?" · "+t("manualAttendance"):""}{current.attendance[p.id]?.conflict?" · "+t("rsvpConflict"):""}</small>{checked&&proposal!=null&&<small>{t("proposedSeat",{number:proposal})}</small>}</span>
   </label>{checked&&manualTable&&<div className={styles.manualChoice}><label htmlFor={id+p.id}>{t("seatForGuest",{name:options.get(p.id)??""})}</label><Select id={id+p.id} value={choices[p.id]?.toString()??""} disabled={disabled} onValueChange={value=>onSeatChange?.(p.id,value?Number(value):null)} options={[{value:"",label:t("chooseSeat")},...getManualSeatOptions(manualTable,p.id,selected,choices,current.assignments).map(number=>({value:number.toString(),label:t("seatNumber",{number})}))]}/></div>}</li>;
  })}</ul>
  {!people.length&&<p className={styles.emptySelection} data-slot="seating-guest-empty">{t("noGuestResults")}</p>}
  {!hideSelection&&selected.length>0&&<div className={styles.selectionCount} role="status"><span>{t("selectedGuests",{count:selected.length})}</span>{!multiple&&<Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={()=>onChange([])}>{t("clearGuestSelection")}</Button>}</div>}
 </div>;
}
