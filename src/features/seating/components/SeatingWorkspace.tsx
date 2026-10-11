"use client";
import { startTransition, useRef, useState, type FormEvent, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Copy, Circle, RectangleHorizontal, Settings, UsersRound, Armchair, ZoomIn, ZoomOut, Maximize2, Move, RefreshCw } from "lucide-react";
import EditorShell from "@/features/editor/components/EditorShell/EditorShell";
import EditorWorkspace from "@/features/editor/components/EditorWorkspace/EditorWorkspace";
import EditorSidebar from "@/features/editor/components/EditorSidebar/EditorSidebar";
import EditorToolRail from "@/features/editor/components/EditorToolRail/EditorToolRail";
import EditorMobileNavigation from "@/features/editor/components/EditorMobileNavigation/EditorMobileNavigation";
import EditorHeader from "@/features/editor/components/header/EditorHeader/EditorHeader";
import EditorSaveStatus from "@/features/editor/components/header/EditorSaveStatus/EditorSaveStatus";
import EditorTooltip from "@/features/editor/components/EditorTooltip/EditorTooltip";
import EditorMobilePanel from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
import { DrawerTitle } from "@/components/ui/drawer/Drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import type { SeatingCanvasControls } from "./SeatingCanvas";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import * as actions from "../actions/seatingActions";
import { loadSeatingWorkspaceAction } from "../actions/loadSeatingWorkspaceAction";
import { syncSeatingRsvpGuestsAction } from "../actions/syncSeatingRsvpGuestsAction";
import { includeGenericSeatingGuestAction } from "../actions/includeGenericSeatingGuestAction";
import { manageProjectGuestAction } from "@/features/project-guests/actions/projectGuestActions";
import { seatingGeometryFits } from "../validation/seatingGeometry";
import { getStandardTableDimensions, getStandardTableUpdates, withTableCapacity } from "../validation/tableDimensions";
import { sortSeatingTables, getGuestDropIntent, getSeatingSaveStatus, type GuestFilter } from "../validation/seatingUx";
import { useSeatingMobile } from "./useSeatingMobile";
import { changeSeatTable, type SeatAssignmentChoice, type SeatAssignmentRequest } from "../validation/seatAssignmentChoices";
import { getSeatAssignmentIssue, getMinimumTableCapacity, isSeatRevisionConfirmed } from "../validation/seatAssignment";
import { getDuplicateTable, getDuplicateTableName } from "../validation/duplicateTable";
import { useGuestCanvasDrag } from "./useGuestCanvasDrag";
import type { ProjectGuest } from "@/features/project-guests/types/database";
import { tableSchema } from "../validation/seating.schema";
import type { SeatingWorkspace as WorkspaceData, SeatingTable } from "../types";
import SeatingTablesPanel from "./SeatingTablesPanel";
import SeatAssignmentForm from "./SeatAssignmentForm";
import SeatingBatchForm, { type BatchRequest, type BatchDraft } from "./SeatingBatchForm";
import type { ManualSeat } from "../validation/manualSeating";
import { type BatchSeatMode } from "../validation/automaticSeating";
import { isRsvpSyncConfirmed } from "../validation/rsvpSync";
import { useSeatingRsvpSync } from "./useSeatingRsvpSync";
import seatDialogStyles from "./SeatAssignmentDialog.module.css";
import AddPlanGuestDialog from "./AddPlanGuestDialog";
import ux from "./SeatingUx.module.css";
import ParticipantsPanel from "./ParticipantsPanel";
import CreateSeatingTableDialog from "./CreateSeatingTableDialog";
import SeatAssignmentDialog from "./SeatAssignmentDialog";
import SeatingPlanSettingsPanel, { getPlanSettingsDraft, isPlanSettingsDraftUnchanged, type PlanSettingsDraft } from "./SeatingPlanSettingsPanel";
import styles from "./SeatingWorkspace.module.css";

const Canvas = dynamic(() => import("./SeatingCanvas"), { ssr: false });
const createdTableSchema = z.object({ id: z.string().uuid(), revision: z.number().int().positive() });
type Result = { success: boolean; code?: string; data?: unknown };
type Operation = () => Promise<Result>;

export default function SeatingWorkspace({ projectId, initial }: { projectId: string; initial: WorkspaceData }) {
  const t = useTranslations("Seating");
  const router = useRouter();
  const base = "/dashboard/projects/" + projectId + "/seating";
  const controls = useRef<SeatingCanvasControls>(null);
  const [pan, setPan] = useState(false);
  const isMobile = useSeatingMobile();
  const [seatDraft, setSeatDraft] = useState<SeatAssignmentChoice | null>(null);
  const [seatReturn, setSeatReturn] = useState<"guests" | "table">("guests");
  const [query, setQuery] = useState("");
  const [guestFilter, setGuestFilter] = useState<GuestFilter>("all");
  const [invitationGroup,setInvitationGroup]=useState("");
  const [openGroups, setOpenGroups] = useState<string[]>([""]);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [addGuestMode, setAddGuestMode] = useState<"existing" | "new">("existing");
  const [addGuestResume, setAddGuestResume] = useState<SeatAssignmentRequest | null>(null);
  const addGuestTarget = useRef<string | null>(null);
  const [batchDraft,setBatchDraft]=useState<BatchDraft|null>(null);
  const [batchPicker,setBatchPicker]=useState<BatchRequest|null>(null);
  const [seatPicker, setSeatPicker] = useState<SeatAssignmentRequest | null>(null);
  const [tab, setTab] = useState<"guests" | "table" | "settings">("guests");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState<PlanSettingsDraft>(() => initial.current ? getPlanSettingsDraft(initial.current.plan) : { name:"",source:"" });
  const [createTableShape, setCreateTableShape] = useState<SeatingTable["shape"] | null>(null);
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [rsvpChecking, setRsvpChecking] = useState(false);
  const lock = useRef(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [rsvpRefresh, setRsvpRefresh] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removal, setRemoval] = useState<{ name: string; action: Operation; deletesPlan?: boolean } | null>(null);
  const [standardize, setStandardize] = useState<{ shape: SeatingTable["shape"]; count: number; minWidth: number; maxWidth: number; height: number; revision: number } | null>(null);
  const current = data.current;
  const disabled = busy || blocked;
  const tables = sortSeatingTables((current?.tables ?? []).map(table => {
    if (table.shape !== "round" && table.shape !== "rectangle") throw new Error("Invalid table shape");
    return { ...table, shape: table.shape } as SeatingTable;
  }));
  const selected = tables.find(table => table.id === selectedId) ?? null;
  async function assignGuestToSeat(guestId: string, tableId: string | null, seatNumber: number | null) {
    if (!current || disabled || lock.current) return false;
    const person = current.people.find(item => item.id === guestId);
    const previous = current.assignments.find(item => item.project_guest_id === guestId);
    if (!person || !current.participants.some(item => item.project_guest_id === guestId)) { setMessage("seatParticipantError"); return false; }
    if (person.archived_at && tableId !== null && !(previous?.table_id === tableId && seatNumber === null)) { setMessage("archivedError"); return false; }
    if (tableId) {
      const table = tables.find(item => item.id === tableId);
      if (!table) { setMessage("seatTableError"); return false; }
      const issue = getSeatAssignmentIssue(table, guestId, seatNumber, current.assignments);
      if (issue) { setMessage(issue); return false; }
    } else if (seatNumber !== null) { setMessage("seatRangeError"); return false; }
    return mutate(() => actions.assignSeatingGuestToSeatAction({
      p_plan_id: current.plan.id, p_revision: current.plan.revision, p_guest_id: guestId, p_table_id: tableId, p_seat_number: seatNumber,
    }), { expectedRevision: current.plan.revision });
  }

  async function assignGuestBatch(ids:string[],tableId:string|null,mode:BatchSeatMode) {
    if (!current || disabled || lock.current) return false;
    return mutate(()=>actions.assignSeatingGuestsAction({p_plan_id:current.plan.id,p_revision:current.plan.revision,p_guest_ids:ids,p_table_id:tableId,p_mode:mode}),{expectedRevision:current.plan.revision});
  }
  async function includeGenericGuest(responseGuestId:string,personId:string|null) {
    if(!current||disabled||lock.current)return null;
    let included:string|null=null;
    const confirmed=await mutate(async()=>{
      const result=await includeGenericSeatingGuestAction({p_plan_id:current.plan.id,p_revision:current.plan.revision,p_response_guest_id:responseGuestId,p_project_guest_id:personId,p_create_new:personId===null});
      if(result.success){included=result.data.project_guest_id;return {success:true,data:result.data.revision};}
      return result;
    },{expectedRevision:current.plan.revision});
    return confirmed?included:null;
  }
  async function synchronizeRsvpGuests() {
    if (!current || disabled || lock.current || !current.plan.rsvp_invitation_id || message === "rsvpSetupRequired") return false;
    let added = 0;
    const result = await mutate(async () => {
      const synced = await syncSeatingRsvpGuestsAction({ p_project_id:projectId,p_plan_id:current.plan.id,p_revision:current.plan.revision });
      if (synced.success) added = synced.data.added_count;
      return synced;
    }, { rsvpSyncRevision:current.plan.revision });
    if (result && added > 0) toast.success(t("rsvpGuestsAdded", { count: added }));
    return result;
  }
  async function assignGuestManualBatch(tableId:string,seats:ManualSeat[]){
    if(!current||disabled||lock.current)return false;
    return mutate(()=>actions.assignSeatingGuestsToSeatsAction({p_plan_id:current.plan.id,p_revision:current.plan.revision,p_table_id:tableId,p_seats:seats}),{expectedRevision:current.plan.revision});
  }
  function openBatchPicker(tableId:string|null,guestIds:string[] = [],exact=false) {
    if(disabled || lock.current) return;
    setBatchDraft(null);setBatchPicker({tableId,guestIds,exact});setSeatPicker(null);setMobileOpen(false);setMessage("");setPan(false);
    setSidebarCollapsed(false);
    if(tableId){setSelectedId(tableId);setTab("table");}
  }
  function closeBatchPicker() {
    if(busy || lock.current)return;
    setBatchPicker(null);setBatchDraft(null); if(isMobile)setMobileOpen(true);
  }
  function openSeatPicker(request: SeatAssignmentRequest, returnTo: "guests" | "table" = tab === "table" ? "table" : "guests") {
    if (!current || disabled || lock.current) return;
    if (!seatPicker) { setSeatReturn(returnTo); setTab(returnTo); }
    setBatchPicker(null); setSeatDraft(null);
    setSeatPicker(request); setPan(false); setMobileOpen(false); setMessage("");
    setSidebarCollapsed(false);
    if (request.tableId) setSelectedId(request.tableId);
  }
  function closeSeatPicker() {
    if (busy || lock.current) return;
    setSeatPicker(null); setSeatDraft(null); setTab(seatReturn);
    if (isMobile) setMobileOpen(true);
  }
  function chooseGuestSeat(person: ProjectGuest) {
    const assignment = current?.assignments.find(item => item.project_guest_id === person.id);
    openSeatPicker({ guestId: person.id, tableId: assignment?.table_id ?? null, seatNumber: assignment?.seat_number ?? null });
  }
  function chooseCanvasSeat(tableId: string, seatNumber: number) {
    if (batchPicker) return;
    const occupant = current?.assignments.find(item => item.table_id === tableId && item.seat_number === seatNumber);
    openSeatPicker({ tableId, seatNumber, seatMode: "manual", guestId: seatPicker ? seatDraft?.guestId || seatPicker.guestId : occupant?.project_guest_id ?? null }, "table");
  }
  function openAddGuest(tableId: string | null = null, mode: "existing" | "new" = "existing") {
    if (disabled || lock.current) return;
    addGuestTarget.current = tableId;
    setAddGuestMode(mode);
    setAddGuestResume(seatPicker && seatDraft ? { ...seatPicker, tableId: seatDraft.tableId, seatNumber: seatDraft.seatNumber, seatMode: seatDraft.seatMode } : seatPicker);
    setSeatPicker(null); setMobileOpen(false); setAddGuestOpen(true); setMessage("");
  }
  const guestGesture = useGuestCanvasDrag({
    onStarted: () => { setMobileOpen(false); setMessage(""); },
    onCancelled: () => { if (isMobile) setMobileOpen(true); },
    onPlace: chooseGuestSeat,
    onDrop: (id, x, y, pointerType) => {
      if (!current || disabled || lock.current) return;
      const target = controls.current?.hitTarget(x, y, pointerType) ?? null;
      const intent = getGuestDropIntent(target, isMobile, pointerType);
      if (!target || intent === "miss") {
        toast.info(t("dropMiss"), { id: "seating-drop-miss" });
        if (isMobile) setMobileOpen(true);
        return;
      }
      const table = tables.find(item => item.id === target.tableId);
      const issue = table ? getSeatAssignmentIssue(table,id,target.seatNumber,current.assignments) : "seatTableError";
      if (issue) { setMessage(issue); if (isMobile) setMobileOpen(true); return; }
      if (intent === "assign") void assignGuestToSeat(id, target.tableId, target.seatNumber);
      else openSeatPicker({ guestId: id, tableId: target.tableId, seatNumber: target.seatNumber, seatMode: target.seatNumber === null ? "auto" : "manual" });
    },
  });
  function saveRoom(width: number, height: number) {
    if (!current || disabled || lock.current) return;
    if (width === current.plan.width_cm && height === current.plan.height_cm) return;
    if (tables.some(table => !seatingGeometryFits(table, width, height))) { setMessage("geometry"); return; }
    const previous = data;
    setData({ ...data, current: { ...current, plan: { ...current.plan, width_cm: width, height_cm: height } } });
    void mutate(() => actions.manageSeatingPlanAction({
      p_project_id: projectId, p_plan_id: current.plan.id, p_revision: current.plan.revision,
      p_operation: "update", p_name: current.plan.name, p_width_cm: width, p_height_cm: height, p_rsvp_invitation_id: current.plan.rsvp_invitation_id,
    }), { rollback: () => setData(previous) });
  }
  async function createAndInclude(first: string, last: string) {
    let createdId: string | null = null;
    let inclusionConfirmed = false;
    const included = await mutate(async () => {
      const person = await manageProjectGuestAction({ p_project_id: projectId, p_guest_id: null, p_operation: "create", p_first_name: first, p_last_name: last || null, p_notes: null });
      if (!person.success) return person;
      createdId = person.data;
      const membership = await actions.manageSeatingParticipantAction({ p_plan_id: current!.plan.id, p_revision: current!.plan.revision, p_guest_id: person.data, p_operation: "add" });
      inclusionConfirmed = membership.success;
      return membership;
    });
    return { included: included || inclusionConfirmed, createdId };
  }

  async function reload(planId = current?.plan.id ?? null) {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    let loaded = false;
    try {
      const result = await loadSeatingWorkspaceAction(projectId, planId);
      if (!result.success) { setMessage("loadFailed"); return; }
      if (!result.data.current) { router.replace(base); return; }
      setData(result.data); setPlanDraft(getPlanSettingsDraft(result.data.current.plan)); setBlocked(false); setMessage("");
      loaded = true;
      // An unconfirmed create may already exist. Review the reloaded plan before creating again.
      if (blocked) { setCreateTableShape(null); setSeatPicker(null); setBatchPicker(null); }
      if (planId !== current?.plan.id) setSelectedId(null);
    } catch { setMessage("loadFailed"); }
    finally { lock.current = false; setBusy(false); if (loaded) setRsvpRefresh(value => value + 1); }
  }

  async function mutate(operation: Operation, options: { deletedPlan?: boolean; rollback?: () => void; expectedRevision?: number; afterConfirmed?: () => void; resetPlanDraft?: boolean; rsvpSyncRevision?:number } = {}) {
    if (lock.current || blocked) return false;
    lock.current = true; setBusy(true);
    const backgroundSync = options.rsvpSyncRevision !== undefined;
    setRsvpChecking(backgroundSync);
    if (!backgroundSync) setMessage("");
    try {
      const result = await new Promise<Result>((resolve, reject) => {
        startTransition(async () => { try { resolve(await operation()); } catch (error) { reject(error); } });
      });
      if (!result.success) {
        options.rollback?.();
        if (result.code === "REVISION_CONFLICT") { setBlocked(true); setMessage("conflict"); }
        else if (result.code === "SEATING_UNCONFIRMED") { setBlocked(true); setMessage("reloadRequired"); }
        else if (result.code === "STANDARDIZE_PARTIAL") { setBlocked(true); setMessage("standardizePartial"); }
        else if (result.code === "STANDARDIZE_GEOMETRY") setMessage("standardizeGeometry");
        else {
          const errors: Record<string, string> = { CAPACITY: "capacityError", ARCHIVED: "archivedError", SEAT_OCCUPIED: "seatOccupiedError", SEAT_RANGE: "seatRangeError", SEAT_CAPACITY: "seatCapacityError", SEAT_SHAPE: "seatShapeError", PARTICIPANT_MISSING: "seatParticipantError", SEATING_UPGRADE_REQUIRED: "batchUpgradeRequired", SEATING_MANUAL_UPGRADE_REQUIRED: "manualBatchUpgradeRequired", SEATING_RSVP_SETUP_REQUIRED:"rsvpSetupRequired",ATTENDANCE_SETUP_REQUIRED:"attendanceSetupRequired" };
          setMessage(errors[result.code ?? ""] ?? "saveFailed");
        }
        return false;
      }
      if (options.expectedRevision !== undefined && !isSeatRevisionConfirmed(result.data, options.expectedRevision)) throw new Error("Unconfirmed seat assignment");
      let rsvpAdded: number | null = null;
      if (options.rsvpSyncRevision !== undefined) {
        if (!isRsvpSyncConfirmed(result.data, options.rsvpSyncRevision)) throw new Error("Unconfirmed RSVP sync");
        rsvpAdded = result.data.added_count;
      }
      options.afterConfirmed?.();
      if (options.deletedPlan) { router.replace(base); return true; }
      const newPlan = current?.plan.id ?? null;
      const loaded = await loadSeatingWorkspaceAction(projectId, newPlan);
      if (!loaded.success) { setBlocked(true); setMessage("reloadRequired"); return false; }
      if (!loaded.data.current) { router.replace(base); return true; }
      setData(loaded.data); setMessage(rsvpAdded !== null ? message : "saved");
      if (options.resetPlanDraft || (current && isPlanSettingsDraftUnchanged(planDraft,current.plan))) {
        setPlanDraft(getPlanSettingsDraft(loaded.data.current.plan));
      }
      setRemoval(null);
      return true;
    } catch {
      options.rollback?.();
      // A transport error may occur after COMMIT; refresh before any further writes.
      setBlocked(true); setMessage("reloadRequired");
      return false;
    } finally { lock.current = false; setBusy(false); setRsvpChecking(false); }
  }

  function tableInput(table: SeatingTable, operation: "create" | "update" | "delete") {
    return { p_plan_id: current!.plan.id, p_revision: current!.plan.revision, p_table_id: operation === "create" ? null : table.id,
      p_operation: operation, p_name: table.name, p_shape: table.shape, p_capacity: table.capacity,
      p_x_cm: table.x_cm, p_y_cm: table.y_cm, p_width_cm: table.width_cm, p_height_cm: table.height_cm, p_rotation_deg: table.rotation_deg };
  }
  function saveTable(table: SeatingTable, preview = false) {
    if (!current || disabled || lock.current) return;
    const stored = tables.find(item => item.id === table.id);
    const capacityChanged = !!stored && stored.capacity !== table.capacity;
    const assignments = current.assignments.filter(item => item.table_id === table.id);
    if (table.capacity < getMinimumTableCapacity(assignments)) { setMessage(assignments.some(item => (item.seat_number ?? 0) > table.capacity) ? "seatCapacityError" : "capacityError"); return; }
    if (stored && stored.shape !== table.shape && assignments.some(item => item.seat_number !== null)) { setMessage("seatShapeError"); return; }
    if (capacityChanged) table = withTableCapacity({ ...table,capacity:stored.capacity,width_cm:stored.width_cm,height_cm:stored.height_cm },table.capacity);
    if (!tableSchema.safeParse(tableInput(table, "update")).success || !seatingGeometryFits(table, current.plan.width_cm, current.plan.height_cm)) {
      setMessage(capacityChanged && table.shape === "rectangle" ? "longTableNoSpace" : "geometry"); return;
    }
    const previous = data;
    if (preview || capacityChanged) setData({ ...data, current: { ...current, tables: current.tables.map(item => item.id === table.id ? table : item) } });
    void mutate(() => actions.manageSeatingTableAction(tableInput(table, "update")), { rollback: () => setData(previous) });
  }
  function openCreateTable(shape: SeatingTable["shape"]) {
    if (!current || disabled || lock.current) return;
     setPan(false); setMobileOpen(false); setMessage("");
    setCreateTableShape(shape);
  }
  async function addTable(table: SeatingTable) {
    if (!current || disabled || lock.current) return false;
    const input = tableInput(table, "create");
    if (!tableSchema.safeParse(input).success) { setMessage("saveFailed"); return false; }
    if (!seatingGeometryFits(table,current.plan.width_cm,current.plan.height_cm)) { setMessage("newTableNoSpace"); return false; }
    let createdId: string | null = null;
    await mutate(async () => {
      const result = await actions.manageSeatingTableAction(input);
      if (result.success) {
        const confirmation = createdTableSchema.safeParse(result.data);
        if (!confirmation.success || confirmation.data.revision !== current.plan.revision+1) throw new Error("Unconfirmed table creation");
        createdId = confirmation.data.id;
      }
      return result;
    });
    // A confirmed create is not repeated if loading the updated plan subsequently fails.
    if (createdId) { setCreateTableShape(null); setSelectedId(createdId); setTab("table"); setSidebarCollapsed(false); }
    return createdId !== null;
  }
  async function duplicateTable(source: SeatingTable) {
    if (!current || disabled || lock.current) return;
    const name = getDuplicateTableName(source.name,tables.map(table => table.name),number => t("tableCopySuffix",{ number }));
    const copy = getDuplicateTable(source,tables,current.plan.width_cm,current.plan.height_cm,name);
    if (!copy) { setMessage("duplicateNoSpace"); return; }
     setPan(false);
    if (await addTable(copy)) setMobileOpen(false);
  }
  function requestStandardize(shape: SeatingTable["shape"]) {
    if (!current || disabled || lock.current) return;
    const updates = getStandardTableUpdates(tables,shape,current.plan.width_cm,current.plan.height_cm);
    if (!updates.length) return;
    if (updates.some(table => !seatingGeometryFits(table,current.plan.width_cm,current.plan.height_cm))) { setMessage("standardizeGeometry"); return; }
    const dimensions = getStandardTableDimensions(shape,current.plan.width_cm,current.plan.height_cm);
    setStandardize({ shape,count:updates.length,minWidth:Math.min(...updates.map(table => table.width_cm)),maxWidth:Math.max(...updates.map(table => table.width_cm)),height:dimensions.height_cm,revision:current.plan.revision });
  }
  async function updatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!current || disabled || lock.current) return;
    const form = new FormData(event.currentTarget);
    const { width_cm:width,height_cm:height } = current.plan;
    if (tables.some(table => !seatingGeometryFits(table, width, height))) { setMessage("geometry"); return; }
    await mutate(() => actions.manageSeatingPlanAction({ p_project_id: projectId, p_plan_id: current.plan.id, p_revision: current.plan.revision,
      p_operation: "update", p_name: String(form.get("name") ?? ""), p_width_cm: width, p_height_cm: height, p_rsvp_invitation_id: String(form.get("source") ?? "") || null }), { resetPlanDraft:true });
  }

  useSeatingRsvpSync({ planId:current?.plan.id ?? null,source:current?.plan.rsvp_invitation_id ?? null,refresh:rsvpRefresh,
    enabled:!disabled && message !== "rsvpSetupRequired" && tab !== "table" && !seatPicker && !batchPicker && !addGuestOpen && !createTableShape && !removal && !standardize && !guestGesture.drag
      && planDraft.source === (current?.plan.rsvp_invitation_id ?? ""),
    onSync:synchronizeRsvpGuests });


  if (!current) return null;
  function selectTable(id: string | null, openDetails = true) {
    if (busy || lock.current) return;
    setSelectedId(id);
    if (openDetails && id) setSidebarCollapsed(false);
    if(openDetails && id && batchPicker){if(id!==batchPicker.tableId)setBatchDraft(previous=>previous?{...previous,choices:{}}:null);setBatchPicker({tableId:id,guestIds:batchDraft?.ids??batchPicker.guestIds,exact:batchDraft?.exact??batchPicker.exact});return;}
    if (openDetails && id && seatPicker) {
      if (id === (seatDraft?.tableId ?? seatPicker.tableId)) return;
      const next = changeSeatTable(seatDraft ?? { ...seatPicker, guestId: seatPicker.guestId ?? "" }, id, current!.assignments);
      openSeatPicker({ ...next, guestId: next.guestId || null });
      return;
    }
    if (openDetails && id) { if (!busy) { setSeatPicker(null); setSeatDraft(null); } setTab("table"); if (isMobile) setMobileOpen(true); }
  }
  const navigationItems = [
    { id:"guests",href:"#guests",label:t("guestsTab"),icon:UsersRound },
    { id:"table",href:"#table",label:t("tableTab"),icon:Armchair },
    { id:"settings",href:"#settings",label:t("settingsTab"),icon:Settings },
  ];
  const panelTitle = tab === "guests" ? "guestsTab" : tab === "table" ? "tableTab" : "planSettings";
  function navigatePanel(id: string, mobile = false) {
    if (busy || lock.current || (id !== "guests" && id !== "table" && id !== "settings")) return;
    setSeatPicker(null); setSeatDraft(null); setBatchPicker(null); setBatchDraft(null);
    setTab(id); setSidebarCollapsed(false);
    if (id === "table") setSelectedId(null);
    if (mobile || isMobile) setMobileOpen(true);
  }

  function focusTable(id: string) { setMobileOpen(false); controls.current?.focusTable(id); }
  function requestRemove(person: ProjectGuest) {
    setRemoval({ name: [person.first_name,person.last_name].filter(Boolean).join(" "), action: () => actions.manageSeatingParticipantAction({ p_plan_id: current!.plan.id, p_revision: current!.plan.revision, p_guest_id: person.id, p_operation:"remove" }) });
  }
  const rowActions = { onChooseSeat:chooseGuestSeat, onAssignSeat:assignGuestToSeat, onRemove:requestRemove,
    onDragClick:guestGesture.consumePointerClick,
    onDragStart:(event:PointerEvent<HTMLButtonElement>,person:ProjectGuest)=>{ if (!disabled) guestGesture.start(event,person); } };
  const batchForm = (request:BatchRequest) => <SeatingBatchForm key={JSON.stringify(request)} request={request} initialDraft={batchDraft} onDraftChange={setBatchDraft} current={current} tables={tables} saving={busy} blocked={blocked} error={message&&message!=="saved"?message:null} onClose={closeBatchPicker} onReload={()=>void reload()} onSave={assignGuestBatch} onManualSave={assignGuestManualBatch} onNewGuest={draft=>{setBatchDraft(draft);setBatchPicker({...request,guestIds:draft.ids,exact:draft.exact});openAddGuest(request.tableId,"new");}}/>;
  const panel = (mobile = false) => <div className={mobile ? styles.mobileInspector : styles.inspector} data-assignment={!!seatPicker||!!batchPicker}>
    <EditorSidebar title={!mobile && !isMobile && batchPicker ? t("addGuests") : !mobile && !isMobile && seatPicker ? t("seatAssignmentTitle") : t(panelTitle)} mobileScrollOwner={mobile ? "parent" : "sidebar"}>
      {!mobile && !isMobile && batchPicker ? <div className={ux.assignmentPanel}><Button type="button" variant="ghost" className={ux.back} disabled={busy} onClick={closeBatchPicker}><ArrowLeft aria-hidden="true"/>{t("backToTable")}</Button>{batchForm(batchPicker)}</div> : !mobile && !isMobile && seatPicker ? <div className={ux.assignmentPanel}>
        <Button variant="ghost" className={ux.back} disabled={busy} onClick={closeSeatPicker}><ArrowLeft aria-hidden="true"/>{t(seatReturn==="table"?"backToTable":"backToGuests")}</Button>
        <SeatAssignmentForm key={JSON.stringify(seatPicker)+":"+current.plan.revision} request={seatPicker} current={current} tables={tables} saving={busy} blocked={blocked} error={message && message!=="saved"?message:null} fixedGuest={!!seatPicker.guestId} onClose={closeSeatPicker} onReload={()=>void reload()} onAssign={assignGuestToSeat} onAutoAssign={(id,tableId)=>assignGuestBatch([id],tableId,"auto")} initialChoice={seatDraft} onChoiceChange={setSeatDraft} onAddGuest={()=>openAddGuest(seatDraft ? seatDraft.tableId : seatPicker.tableId)}/>
      </div> : <div className={styles.panelContent}>
        {tab === "settings" ? <SeatingPlanSettingsPanel plan={current.plan} invitations={data.invitations} tables={tables} draft={planDraft} disabled={disabled} saving={busy}
          onDraftChange={patch => setPlanDraft(previous => ({ ...previous,...patch }))} onReset={() => setPlanDraft(getPlanSettingsDraft(current.plan))}
          onSubmit={updatePlan} onStandardize={requestStandardize}
          onDelete={() => setRemoval({ name:current.plan.name,deletesPlan:true,action:() => actions.manageSeatingPlanAction({ p_project_id:projectId,p_plan_id:current.plan.id,p_revision:current.plan.revision,p_operation:"delete",p_name:null,p_width_cm:null,p_height_cm:null,p_rsvp_invitation_id:null }) })}/>
          : tab === "table" ? <SeatingTablesPanel current={current} tables={tables} selected={selected} disabled={disabled} error={message && message!=="saved"?message:null}
          onSelect={selectTable} onFocus={focusTable} onAddGuest={tableId=>openBatchPicker(tableId)} onSelectSeat={chooseCanvasSeat}
          onSave={table=>saveTable(table)} onDuplicate={table=>void duplicateTable(table)}
          onDelete={table=>setRemoval({name:table.name,action:()=>actions.manageSeatingTableAction(tableInput(table,"delete"))})}/>
          : <ParticipantsPanel current={current} tables={tables} disabled={disabled} query={query} filter={guestFilter} openGroups={openGroups} invitationGroup={invitationGroup} onInvitationGroupChange={setInvitationGroup}
            onGroupToggle={(id,open)=>setOpenGroups(previous=>previous.includes(id)===open?previous:open?[...previous,id]:previous.filter(item=>item!==id))}
            onQueryChange={setQuery} onFilterChange={setGuestFilter} onAddGuest={()=>openAddGuest()} {...rowActions}/>}
      </div>}
    </EditorSidebar>
  </div>;

  return <div className={styles.fullscreenEditor}>
    <EditorShell header={<EditorHeader
      start={<div className={styles.headerIdentity}><Button size="icon" variant="ghost" aria-label={t("backToPlans")} disabled={busy} onClick={() => router.push(base)}><ArrowLeft aria-hidden="true" /></Button>
        <EditorTooltip content={current.plan.name}><button className={styles.planName} disabled={busy} onClick={() => navigatePanel("settings")}>{current.plan.name}</button></EditorTooltip>
        <EditorSaveStatus status={getSeatingSaveStatus(busy && !rsvpChecking,message)} savingLabel={t("saving")} savedLabel={t(message === "saved" ? "saved" : "ready")} errorLabel={t(message || "saveFailed")} />
      </div>}
      end={<div className={styles.toolbar}>
        <EditorTooltip content={t("addRound")}><Button size="sm" variant="outline" disabled={disabled} aria-label={t("addRound")} onClick={() => openCreateTable("round")}><Circle aria-hidden="true" /><span className={styles.actionLabel}>{t("addRound")}</span></Button></EditorTooltip>
        <EditorTooltip content={t("addRectangle")}><Button size="sm" variant="outline" disabled={disabled} aria-label={t("addRectangle")} onClick={() => openCreateTable("rectangle")}><RectangleHorizontal aria-hidden="true" /><span className={styles.actionLabel}>{t("addRectangle")}</span></Button></EditorTooltip>
        {selected && <EditorTooltip content={t("duplicateTable")}><Button size="icon" variant="outline" disabled={disabled} aria-label={t("duplicateTable")} onClick={() => void duplicateTable(selected)}><Copy aria-hidden="true" /></Button></EditorTooltip>}
        <EditorTooltip content={t("fit")}><Button size="icon" variant="outline" aria-label={t("fit")} onClick={() => controls.current?.fit()}><Maximize2 aria-hidden="true" /></Button></EditorTooltip>
        <EditorTooltip content={t("zoomIn")}><Button size="icon" variant="ghost" aria-label={t("zoomIn")} onClick={() => controls.current?.zoom(1.2)}><ZoomIn aria-hidden="true" /></Button></EditorTooltip>
        <EditorTooltip content={t("zoomOut")}><Button size="icon" variant="ghost" aria-label={t("zoomOut")} onClick={() => controls.current?.zoom(1 / 1.2)}><ZoomOut aria-hidden="true" /></Button></EditorTooltip>
        
        <EditorTooltip content={t("pan")}><Button size="icon" variant={pan ? "default" : "ghost"} aria-label={t("pan")} aria-pressed={pan} onClick={() => { setPan(value => !value); }}><Move aria-hidden="true" /></Button></EditorTooltip>
        <EditorTooltip content={t("resizeRoom")}><Button size="icon" variant="ghost" disabled={disabled} aria-label={t("resizeRoom")} onClick={() => { setPan(false); setSelectedId(null); }}><RectangleHorizontal aria-hidden="true" /></Button></EditorTooltip>
        <EditorTooltip content={t("reload")}><Button size="icon" variant="ghost" disabled={busy} aria-label={t("reload")} onClick={() => void reload()}><RefreshCw aria-hidden="true" /></Button></EditorTooltip>
      </div>} />}
      mobileControls={<>
        <EditorMobileNavigation items={navigationItems} activeId={tab} ariaLabel={t("inspector")} onNavigate={id => navigatePanel(id,true)}/>
        <EditorMobilePanel open={isMobile && mobileOpen && !seatPicker && !batchPicker && !addGuestOpen} onOpenChange={open => { if (!busy && !lock.current) setMobileOpen(open); }} defaultSnapPoint={0.7} scrollResetKey={tab} handleOnly>
          <DrawerTitle className={styles.srOnly}>{t(panelTitle)}</DrawerTitle>{panel(true)}
        </EditorMobilePanel>
      </>}>
      <div className={styles.editorBody}>
        {message && message !== "saved" && <div className={styles.editorNotice} role={message === "dropMiss" ? "status" : "alert"}>{t(message)}{blocked && <> {t("conflictHelp")} <Button size="sm" disabled={busy} onClick={() => void reload()}>{t("reload")}</Button></>}</div>}
        <EditorWorkspace sidebarPosition="left" sidebarCollapsed={sidebarCollapsed} sidebar={panel()}
          toolRail={<EditorToolRail items={navigationItems} activeId={tab} ariaLabel={t("inspector")} collapsed={sidebarCollapsed} disabled={busy}
            onToggleCollapsed={() => setSidebarCollapsed(value => !value)} onNavigate={navigatePanel}/>}>
          <Canvas key={current.plan.id} controlsRef={controls} pan={pan} mobile={isMobile} guestDrag={guestGesture.drag} editingSeat={!!seatPicker || !!batchPicker} seatClicksDisabled={!!batchPicker} onSeatSelect={chooseCanvasSeat} people={current.people} onRoomChange={saveRoom} widthCm={current.plan.width_cm} heightCm={current.plan.height_cm} tables={tables} assignments={current.assignments} selectedId={selectedId} disabled={disabled || !!createTableShape || (isMobile && (!!seatPicker || !!batchPicker)) || addGuestOpen || !!removal || !!standardize} onSelect={selectTable} onChange={table => saveTable(table, true)} onInvalid={() => setMessage("geometry")} />
        </EditorWorkspace>
      </div>
    </EditorShell>


    {isMobile && batchPicker && !addGuestOpen && <Dialog open onOpenChange={value=>{if(!value)closeBatchPicker();}}><DialogContent positioning="custom" className={seatDialogStyles.dialog}><DialogHeader className={seatDialogStyles.header}><DialogTitle>{t("addGuests")}</DialogTitle><DialogDescription>{t("batchHelp")}</DialogDescription></DialogHeader>{batchForm(batchPicker)}</DialogContent></Dialog>}
    {isMobile && seatPicker && <SeatAssignmentDialog key={JSON.stringify(seatPicker)+":"+current.plan.revision} request={seatPicker} current={current} tables={tables} saving={busy} blocked={blocked} error={message && message!=="saved"?message:null} fixedGuest={!!seatPicker.guestId} onClose={closeSeatPicker} onReload={()=>void reload()} onAssign={assignGuestToSeat} onAutoAssign={(id,tableId)=>assignGuestBatch([id],tableId,"auto")} initialChoice={seatDraft} onChoiceChange={setSeatDraft} onAddGuest={()=>openAddGuest(seatDraft ? seatDraft.tableId : seatPicker.tableId)}/>}
    {addGuestOpen && <AddPlanGuestDialog current={current} initialMode={addGuestMode} disabled={disabled} saving={busy} error={message && message!=="saved"?message:null} onReload={()=>void reload()}
      tables={tables} onIncludeGeneric={includeGenericGuest} onAddMany={ids=>assignGuestBatch(ids,null,"include")} onCreate={createAndInclude} onClose={()=>{if(!busy && !lock.current){setAddGuestOpen(false);setSeatPicker(addGuestResume);if(isMobile && !addGuestResume && !batchPicker)setMobileOpen(true);}}}
      onAdded={ids=>{setAddGuestOpen(false); if(batchPicker){const merged=Array.from(new Set([...(batchDraft?.ids??batchPicker.guestIds??[]),...ids]));setBatchDraft(previous=>previous?{...previous,ids:merged}:null);setBatchPicker({...batchPicker,guestIds:merged});return;} if(addGuestTarget.current){if(ids.length>1)openBatchPicker(addGuestTarget.current,ids,seatDraft?.seatMode === "manual");else openSeatPicker({guestId:ids[0],tableId:addGuestTarget.current,seatNumber:seatDraft?.seatMode==="auto"?null:addGuestResume?.seatNumber ?? null,seatMode:seatDraft?.seatMode ?? addGuestResume?.seatMode});}}}/>}

    {createTableShape && <CreateSeatingTableDialog initialShape={createTableShape} defaultName={t("tableDefault", { number: tables.length+1 })} plan={current.plan}
      saving={busy} blocked={blocked} error={message && message !== "saved" ? message : null} onCreate={async table => { await addTable(table); }}
      onClose={() => { if (!busy && !lock.current) setCreateTableShape(null); }} onReload={() => void reload()} />}
    <ConfirmDialog open={!!standardize} title={t("standardizeTitle")} description={t(standardize?.shape === "rectangle" ? "standardizeLongHelp" : "standardizeHelp",{ count:standardize?.count ?? 0,width:standardize?.minWidth ?? 0,minWidth:standardize?.minWidth ?? 0,maxWidth:standardize?.maxWidth ?? 0,height:standardize?.height ?? 0 })}
      confirmText={t("standardizeConfirm")} cancelText={t("cancel")} loading={busy} loadingText={t("saving")}
      onClose={() => { if (!busy) setStandardize(null); }} onConfirm={async () => {
        if (!standardize) return;
        await mutate(() => actions.standardizeSeatingTablesAction({ p_plan_id:current.plan.id,p_revision:standardize.revision,p_shape:standardize.shape }));
        setStandardize(null);
      }} />
    <ConfirmDialog variant="danger" loadingText={t("saving")} open={!!removal} title={t("deleteTitle")} description={t("deleteHelp", { name: removal?.name ?? "" })} confirmText={t("remove")} cancelText={t("cancel")} loading={busy}
      onClose={() => { if (!busy) setRemoval(null); }} onConfirm={() => { if (removal) void mutate(removal.action, { deletedPlan: removal.deletesPlan }); }} />
  </div>;
}
