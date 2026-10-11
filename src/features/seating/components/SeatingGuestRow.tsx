"use client";
import { useRef, type PointerEvent, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, GripVertical, MoreHorizontal, UserRound, UserRoundMinus, Trash2, CircleAlert } from "lucide-react";
import EditorTooltip from "@/features/editor/components/EditorTooltip/EditorTooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { ProjectGuest } from "@/features/project-guests/types/database";
import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatingUx.module.css";

export function GuestRsvpStatus({ current, person }: { current: PlanData; person: ProjectGuest }) {
  const t = useTranslations("Seating");
  const response = current.attendance[person.id];
  const assigned = current.assignments.some(item => item.project_guest_id === person.id);
  return <div className={styles.badges}>
    {person.archived_at && <Badge variant="warning">{t("archived")}</Badge>}
    <Badge variant="muted">{t(!current.plan.rsvp_invitation_id ? "noSource" : !response?.hasInvitationLink ? "notLinked" : response.status ?? "pending")}</Badge>
    {response?.conflict && <Badge variant="warning">{t("rsvpConflict")}</Badge>}
    {assigned && response?.status === "not_attending" && <Badge variant="warning">{t("absentAssigned")}</Badge>}
    {response?.manual&&<Badge variant="soft">{t("manualAttendance")}</Badge>}
  </div>;
}

export type GuestRowActions = {
  onChooseSeat: (person: ProjectGuest) => void;
  onAssignSeat: (id: string, tableId: string | null, seat: number | null) => Promise<boolean>;
  onRemove: (person: ProjectGuest) => void;
  onDragStart?: (event: PointerEvent<HTMLButtonElement>, person: ProjectGuest) => void;
  onDragClick?: (event: MouseEvent<HTMLButtonElement>) => boolean;
};
export default function SeatingGuestRow({ person, current, tables, disabled, onChooseSeat, onAssignSeat, onRemove, onDragStart, onDragClick }: GuestRowActions & {
  person: ProjectGuest; current: PlanData; tables: SeatingTable[]; disabled: boolean;
}) {
  const t = useTranslations("Seating");
  const pointerDrag = useRef(false);
  const assignment = current.assignments.find(item => item.project_guest_id === person.id);
  const table = tables.find(item => item.id === assignment?.table_id);
  const name = [person.first_name, person.last_name].filter(Boolean).join(" ");
  const caption = table ? table.name + " · " + (assignment?.seat_number == null ? t("noSpecificSeat") : t("seatNumber", { number: assignment.seat_number })) : t("unassigned");
  const response = current.attendance[person.id];
  const warnings = [person.archived_at ? t("seatArchivedHelp") : "", response?.conflict ? t("rsvpConflictHelp") : "", assignment && response?.status === "not_attending" ? t("absentAssignedHelp") : ""].filter(Boolean);
  const action = !assignment ? "assignPlace" : assignment.seat_number === null ? "chooseSeat" : "moveGuest";
  return <li className={styles.guestRow}>
    {onDragStart && <Button size="icon" variant="ghost" className={styles.grip} disabled={disabled || !!person.archived_at}
      aria-label={t("dragGuest", { name })} onPointerDown={event => onDragStart(event, person)} onClick={event => { if (event.detail === 0) onChooseSeat(person); }}><GripVertical aria-hidden="true" /></Button>}
    <Button variant="ghost" className={styles.guestMain} disabled={disabled}
      onPointerDown={event => {
        pointerDrag.current = !!onDragStart && !disabled && !person.archived_at && event.pointerType === "mouse" && event.button === 0;
        if (pointerDrag.current) onDragStart?.(event,person);
      }}
      onClick={event => { const started = pointerDrag.current; pointerDrag.current=false; if (!started || !onDragClick?.(event)) onChooseSeat(person); }}
      aria-label={name + ", " + caption + ", " + t(action)}>
      <UserRound size={14} aria-hidden="true" /><span className={styles.identity}><span className={styles.name}>{name}</span><span className={styles.caption}>{caption}</span>{current.guestGroups?.[person.id]&&<span className={styles.caption}>{current.invitationGroups?.find(g=>g.id===current.guestGroups[person.id])?.name}</span>}</span>
      <ChevronRight size={14} aria-hidden="true" />
    </Button>
    {warnings.length > 0 && <EditorTooltip tapToOpen content={<div className={styles.warningDetails}><strong>{t("guestWarning")}</strong>{warnings.map(warning => <p key={warning}>{warning}</p>)}</div>}>
      <Button type="button" variant="ghost" size="icon" className={styles.warning} aria-label={name + ": " + t("guestWarning")}><CircleAlert size={16} aria-hidden="true" /></Button>
    </EditorTooltip>}
    <DropdownMenu><DropdownMenuTrigger disabled={disabled} render={<Button variant="ghost" size="icon" aria-label={t("guestActions", { name })} />}><MoreHorizontal aria-hidden="true" /></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {assignment && <DropdownMenuItem disabled={disabled} onClick={() => void onAssignSeat(person.id, null, null)}><UserRoundMinus aria-hidden="true" />{t("removeFromTable")}</DropdownMenuItem>}
        {assignment && <DropdownMenuSeparator />}
        <DropdownMenuItem variant="destructive" disabled={disabled} onClick={() => onRemove(person)}><Trash2 aria-hidden="true" />{t("removeParticipant")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </li>;
}
