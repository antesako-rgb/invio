"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge/badge";
import { guestOptions } from "@/features/project-guests/utils/guestOptions";
import type { PlanData } from "../types";
import styles from "./SeatingBatch.module.css";
export default function GenericRsvpImportList({current,disabled,onInclude,onAdded}:{current:PlanData;disabled:boolean;onInclude:(id:string,personId:string|null)=>Promise<string|null>;onAdded:(ids:string[])=>void}) {
 const t=useTranslations("Seating"),[query,setQuery]=useState(""),[linking,setLinking]=useState<string|null>(null),[person,setPerson]=useState("");
 const people=guestOptions(current.people.filter(p=>!p.archived_at));
 const answers=(current.unlinkedGenericGuests??[]).filter(g=>[g.first_name,g.last_name].filter(Boolean).join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 async function include(id:string,existing:string|null){if(disabled)return;const added=await onInclude(id,existing);if(added)onAdded([added]);}
 return <section className={styles.publicResponses}>
  <h3>{t("publicResponses")}</h3><p className={styles.emptySelection}>{t("publicResponsesHelp")}</p>
  <Input value={query} disabled={disabled} onChange={event=>setQuery(event.target.value)} aria-label={t("searchPublicResponses")} placeholder={t("searchPublicResponses")}/>
  <ul className={styles.publicList}>{answers.map(g=><li key={g.id}>
   <div className={styles.publicIdentity}><strong>{[g.first_name,g.last_name].filter(Boolean).join(" ")}</strong><Badge variant={g.status==="attending"?"success":"muted"}>{t(g.status)}</Badge></div>
   <div className={styles.publicActions}><Button type="button" size="sm" disabled={disabled} onClick={()=>void include(g.id,null)}>{t("addPublicGuest")}</Button><Button type="button" size="sm" variant="outline" disabled={disabled||!people.length} onClick={()=>{setLinking(linking===g.id?null:g.id);setPerson("");}}>{t("linkPublicGuest")}</Button></div>
   {linking===g.id&&<div className={styles.scope}><Select value={person} disabled={disabled} aria-label={t("existingPerson")} onValueChange={value=>setPerson(value??"")} options={[{value:"",label:t("selectGuest")},...people]}/><Button type="button" variant="outline" disabled={disabled||!person} onClick={()=>void include(g.id,person)}>{t("linkAndInclude")}</Button></div>}
  </li>)}</ul>
  {!answers.length&&<p className={styles.emptySelection}>{t("noGuestResults")}</p>}
 </section>;
}
