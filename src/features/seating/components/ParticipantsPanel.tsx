"use client";
import { useTranslations } from "next-intl";
import { Plus, Search, ChevronDown, CircleCheck, UsersRound, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import EditorTooltip from "@/features/editor/components/EditorTooltip/EditorTooltip";
import type { PlanData, SeatingTable } from "../types";
import { matchesGuestFilter, type GuestFilter } from "../validation/seatingUx";
import SeatingGuestRow, { type GuestRowActions } from "./SeatingGuestRow";
import styles from "./SeatingWorkspace.module.css";
import ux from "./SeatingUx.module.css";
export default function ParticipantsPanel({ current, tables, disabled, query, filter, openGroups, onGroupToggle, onQueryChange, onFilterChange, onAddGuest, invitationGroup="",onInvitationGroupChange,...actions }: GuestRowActions & {
 current:PlanData; tables:SeatingTable[]; disabled:boolean; query:string; filter:GuestFilter; onQueryChange:(value:string)=>void; onFilterChange:(value:GuestFilter)=>void; onAddGuest:()=>void;
 openGroups:string[]; onGroupToggle:(id:string,open:boolean)=>void;
 invitationGroup?:string;onInvitationGroupChange?:(id:string)=>void;
}) {
 const t=useTranslations("Seating");
 const members=new Set(current.participants.map(member=>member.project_guest_id));
 const assigned=new Map(current.assignments.map(item=>[item.project_guest_id,item]));
 const participants=current.people.filter(person=>members.has(person.id));
 const unassignedCount=participants.filter(person=>!assigned.has(person.id)).length;
 function row(person:PlanData["people"][number]) { return <SeatingGuestRow key={person.id} person={person} current={current} tables={tables} disabled={disabled} {...actions} />; }
 const groupId=current.invitationGroups?.some(group=>group.id===invitationGroup)?invitationGroup:"";
 const visible=participants.filter(person=>matchesGuestFilter(filter,assigned.get(person.id)) && (!groupId||current.guestGroups?.[person.id]===groupId) && [person.first_name,person.last_name].filter(Boolean).join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
 const allHaveTables=participants.length>0 && filter==="unassigned" && unassignedCount===0 && !query.trim();
 const groups=[{id:"",label:t("unassignedCount",{count:unassignedCount})},...tables.map(table=>({id:table.id,label:table.name+" · "+current.assignments.filter(item=>item.table_id===table.id).length+" / "+table.capacity}))];
 return <div className={styles.workspace}>
 <div className={styles.guestSearch}><Search size={16} aria-hidden="true"/><Input aria-label={t("searchPeople")} placeholder={t("searchPeople")} value={query} onChange={event=>onQueryChange(event.target.value)}/><EditorTooltip content={t("addGuest")}><Button size="icon" disabled={disabled} aria-label={t("addGuest")} onClick={onAddGuest}><Plus aria-hidden="true"/></Button></EditorTooltip></div>
 <div className={ux.filters} role="group" aria-label={t("guestFilter")}>{(["all","unassigned"] as const).map(value=><Button key={value} size="sm" variant={filter===value?"default":"outline"} aria-pressed={filter===value} onClick={()=>onFilterChange(value)}>{t(value==="all"?"allGuests":"unassigned")} ({value==="all"?participants.length:unassignedCount})</Button>)}</div>
 {!!current.invitationGroups?.length&&<Select value={groupId} aria-label={t("invitationGroup")} onValueChange={value=>onInvitationGroupChange?.(value??"")} options={[{value:"",label:t("allInvitationGroups")},...current.invitationGroups.map(group=>({value:group.id,label:group.name}))]}/>}
 {visible.length>0 && <div className={ux.guestHelp}>
   <p className={styles.help}>{t("guestListHelp")}</p>
   <p className={ux.guestDragHelp}><GripVertical aria-hidden="true"/><span>{t("guestDragHelp")}</span></p>
 </div>}
    {visible.length>0 && (filter==="unassigned" ? <ul className={`${styles.compactList} ${ux.unassignedList}`}>{visible.map(row)}</ul> : <div className={styles.guestGroups}>{groups.map(group => {
      const people = visible.filter(person => (assigned.get(person.id)?.table_id ?? "") === group.id);
      if (query && !people.length) return null;
      return <details key={group.id} className={styles.guestGroup} open={!!query || openGroups.includes(group.id)}
        onToggle={event=>{if(!query)onGroupToggle(group.id,event.currentTarget.open);}}>
        <summary>{group.label}<ChevronDown size={14} aria-hidden="true" /></summary>
        {people.length ? <ul className={styles.compactList}>{[...people].sort((a,b)=>(assigned.get(a.id)?.seat_number??Infinity)-(assigned.get(b.id)?.seat_number??Infinity)).map(row)}</ul> :
          <div className={`${styles.emptyGroup} ${ux.emptyGuestGroup}`}>
            <p>{t("noGuests")}</p>
            {group.id==="" && participants.length>0 && <Button variant="ghost" size="sm" className={ux.emptyGroupAction} disabled={disabled} onClick={onAddGuest}><Plus aria-hidden="true"/>{t("addGuest")}</Button>}
          </div>}
      </details>;
    })}</div>)}
    {!visible.length && <EmptyState variant="card" className={ux.guestEmpty}
      icon={!participants.length ? UsersRound : allHaveTables ? CircleCheck : Search}
      title={t(!participants.length ? "noPlanGuests" : allHaveTables ? "allGuestsHaveTables" : "noGuestMatches")}
      description={t(!participants.length ? "noPlanGuestsHelp" : allHaveTables ? "allGuestsHaveTablesHelp" : "noGuestMatchesHelp")}
      action={<Button className={ux.addGuestAction} disabled={disabled} onClick={onAddGuest}><Plus aria-hidden="true"/>{t("addGuest")}</Button>} />}
 </div>;
}
