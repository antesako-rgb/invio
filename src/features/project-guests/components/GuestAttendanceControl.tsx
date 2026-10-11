"use client";
import { useRef,useState,useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge/badge";
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { setGuestAttendanceAction } from "../actions/attendanceActions";
import type { AttendanceStatus } from "../types/attendance";
import styles from "./GuestAttendanceControl.module.css";
export default function GuestAttendanceControl({invitationId,personId,status,manualStatus,name,disabled=false}:{invitationId:string;personId:string;status?:AttendanceStatus;manualStatus?:AttendanceStatus;name:string;disabled?:boolean}) {
 const t=useTranslations("InvitationGuests.attendance");
 const [busy,start]=useTransition(),lock=useRef(false),[uncertain,setUncertain]=useState(false);
 function set(status:AttendanceStatus|null){
  if(lock.current || disabled || uncertain)return;
  lock.current=true;
  start(async()=>{
   try {
    const result=await setGuestAttendanceAction({invitationId,personId,status});
    if(result.success) toast.success(t("saved"));
    else if(result.code==="ATTENDANCE_UNCONFIRMED") setUncertain(true);
    else toast.error(t(result.code==="ATTENDANCE_SETUP_REQUIRED"?"setupRequired":"failed"));
   }catch{setUncertain(true);}finally{lock.current=false;}
  });
 }
 return <div className={styles.control}>
  <DropdownMenu><DropdownMenuTrigger disabled={disabled||busy||uncertain} render={<Button type="button" variant="outline" size="sm" className={styles.trigger} aria-label={t("change",{name})}/>}>{t(manualStatus??status??"pending")}<ChevronDown size={14} aria-hidden="true"/></DropdownMenuTrigger>
   <DropdownMenuContent align="end"><DropdownMenuItem disabled={disabled||busy||uncertain} onClick={()=>set("attending")}>{t("attending")}</DropdownMenuItem><DropdownMenuItem disabled={disabled||busy||uncertain} onClick={()=>set("not_attending")}>{t("not_attending")}</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem disabled={disabled||busy||uncertain||!manualStatus} onClick={()=>set(null)}>{t("useResponse")}</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenu>
  {manualStatus&&<Badge variant="soft">{t("manual")}</Badge>}
  {uncertain&&<div role="alert"><p>{t("unconfirmed")}</p><Button type="button" variant="outline" size="sm" onClick={()=>window.location.reload()}>{t("reload")}</Button></div>}
 </div>;
}
