"use client";
import { useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Circle, RectangleHorizontal, Settings, ZoomIn, ZoomOut, Maximize2, Move, RefreshCw } from "lucide-react";
import EditorShell from "@/features/editor/components/EditorShell/EditorShell";
import EditorWorkspace from "@/features/editor/components/EditorWorkspace/EditorWorkspace";
import EditorSidebar from "@/features/editor/components/EditorSidebar/EditorSidebar";
import EditorHeader from "@/features/editor/components/header/EditorHeader/EditorHeader";
import EditorSaveStatus from "@/features/editor/components/header/EditorSaveStatus/EditorSaveStatus";
import EditorMobilePanel from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
import { DrawerTitle } from "@/components/ui/drawer/Drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";
import type { SeatingCanvasControls } from "./SeatingCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import * as actions from "../actions/seatingActions";
import { loadSeatingWorkspaceAction } from "../actions/loadSeatingWorkspaceAction";
import { manageProjectGuestAction } from "@/features/project-guests/actions/projectGuestActions";
import { seatingGeometryFits } from "../validation/seatingGeometry";
import { canAssignToTable } from "../validation/canvasInteraction";
import { useGuestCanvasDrag } from "./useGuestCanvasDrag";
import type { ProjectGuest } from "@/features/project-guests/types/database";
import { tableSchema } from "../validation/seating.schema";
import type { SeatingWorkspace as WorkspaceData, SeatingTable } from "../types";
import TablePanel from "./TablePanel";
import ParticipantsPanel from "./ParticipantsPanel";
import styles from "./SeatingWorkspace.module.css";

const Canvas = dynamic(() => import("./SeatingCanvas"), { ssr: false });
type Result = { success: boolean; code?: string; data?: unknown };
type Operation = () => Promise<Result>;

export default function SeatingWorkspace({ projectId, initial }: { projectId: string; initial: WorkspaceData }) {
  const t = useTranslations("Seating");
  const router = useRouter();
  const base = "/dashboard/projects/" + projectId + "/seating";
  const controls = useRef<SeatingCanvasControls>(null);
  const [pan, setPan] = useState(false);
  const [placingGuest, setPlacingGuest] = useState<ProjectGuest | null>(null);
  const [tab, setTab] = useState<"guests" | "table">("guests");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removal, setRemoval] = useState<{ name: string; action: Operation; deletesPlan?: boolean } | null>(null);
  const current = data.current;
  const disabled = busy || blocked;
  const tables = (current?.tables ?? []).map(table => {
    if (table.shape !== "round" && table.shape !== "rectangle") throw new Error("Invalid table shape");
    return { ...table, shape: table.shape } as SeatingTable;
  });
  const selected = tables.find(table => table.id === selectedId) ?? null;
  function placeGuest(person: ProjectGuest) {
    if (disabled || person.archived_at) return;
    setPlacingGuest(person); setPan(false); setMobileOpen(false); setMessage("");
  }
  function assignGuest(guestId: string, tableId: string | null) {
    if (!current || disabled || lock.current) return;
    const table = tables.find(item => item.id === tableId);
    if (tableId && (!table || !canAssignToTable(table.capacity, tableId, guestId, current.assignments))) { setMessage("capacityError"); return; }
    setPlacingGuest(null);
    void mutate(() => actions.assignSeatingGuestAction({ p_plan_id: current.plan.id, p_revision: current.plan.revision, p_guest_id: guestId, p_table_id: tableId }));
  }
  const guestGesture = useGuestCanvasDrag({
    onStarted: () => { setMobileOpen(false); setPlacingGuest(null); setMessage(""); },
    onPlace: placeGuest,
    onDrop: (id, x, y) => {
      const target = controls.current?.hitTable(x, y);
      if (target) assignGuest(id, target); else setMessage("dropMiss");
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
  async function includeGuest(guestId: string) {
    if (!current) return false;
    return mutate(() => actions.manageSeatingParticipantAction({ p_plan_id: current.plan.id, p_revision: current.plan.revision, p_guest_id: guestId, p_operation: "add" }));
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
    try {
      const result = await loadSeatingWorkspaceAction(projectId, planId);
      if (!result.success) { setMessage("loadFailed"); return; }
      if (!result.data.current) { router.replace(base); return; }
      setData(result.data); setBlocked(false); setMessage("");
      if (planId !== current?.plan.id) setSelectedId(null);
    } catch { setMessage("loadFailed"); }
    finally { lock.current = false; setBusy(false); }
  }

  async function mutate(operation: Operation, options: { deletedPlan?: boolean; rollback?: () => void } = {}) {
    if (lock.current || blocked) return false;
    lock.current = true; setBusy(true); setMessage("");
    try {
      const result = await operation();
      if (!result.success) {
        options.rollback?.();
        if (result.code === "REVISION_CONFLICT") { setBlocked(true); setMessage("conflict"); }
        else setMessage(result.code === "CAPACITY" ? "capacityError" : result.code === "ARCHIVED" ? "archivedError" : "saveFailed");
        return false;
      }
      if (options.deletedPlan) { router.replace(base); return true; }
      const newPlan = current?.plan.id ?? null;
      const loaded = await loadSeatingWorkspaceAction(projectId, newPlan);
      if (!loaded.success) { setBlocked(true); setMessage("reloadRequired"); return false; }
      if (!loaded.data.current) { router.replace(base); return true; }
      setData(loaded.data); setMessage("saved");
      setRemoval(null);
      return true;
    } catch {
      options.rollback?.();
      // A transport error may occur after COMMIT; refresh before any further writes.
      setBlocked(true); setMessage("reloadRequired");
      return false;
    } finally { lock.current = false; setBusy(false); }
  }

  function tableInput(table: SeatingTable, operation: "create" | "update" | "delete") {
    return { p_plan_id: current!.plan.id, p_revision: current!.plan.revision, p_table_id: operation === "create" ? null : table.id,
      p_operation: operation, p_name: table.name, p_shape: table.shape, p_capacity: table.capacity,
      p_x_cm: table.x_cm, p_y_cm: table.y_cm, p_width_cm: table.width_cm, p_height_cm: table.height_cm, p_rotation_deg: table.rotation_deg };
  }
  function saveTable(table: SeatingTable, preview = false) {
    if (!current || disabled || lock.current) return;
    if (!tableSchema.safeParse(tableInput(table, "update")).success || !seatingGeometryFits(table, current.plan.width_cm, current.plan.height_cm)) { setMessage("geometry"); return; }
    const previous = data;
    if (preview) setData({ ...data, current: { ...current, tables: current.tables.map(item => item.id === table.id ? table : item) } });
    void mutate(() => actions.manageSeatingTableAction(tableInput(table, "update")), { rollback: () => setData(previous) });
  }
  function addTable(shape: "round" | "rectangle") {
    if (!current) return;
    // Match the user's edited tables in a 2000 × 1500 cm room (read-only sample).
    const defaultWidth = shape === "round" ? 229 : 237;
    const defaultHeight = shape === "round" ? 229 : 206;
    // Fit smaller rooms proportionally; defaults are cm and never depend on zoom.
    const factor = Math.min(1, (2*Math.floor(current.plan.width_cm/2))/defaultWidth, (2*Math.floor(current.plan.height_cm/2))/defaultHeight);
    const width = Math.max(10, Math.floor(defaultWidth*factor));
    const height = shape === "round" ? width : Math.max(10, Math.floor(defaultHeight*factor));
    const table: SeatingTable = { id: "", project_id: projectId, plan_id: current.plan.id, name: t("tableDefault", { number: tables.length + 1 }),
      shape, capacity: 8, x_cm: Math.floor(current.plan.width_cm / 2), y_cm: Math.floor(current.plan.height_cm / 2), width_cm: width, height_cm: height, rotation_deg: 0 };
    if (!seatingGeometryFits(table, current.plan.width_cm, current.plan.height_cm)) { setMessage("geometry"); return; }
    void mutate(() => actions.manageSeatingTableAction(tableInput(table, "create")));
  }
  async function updatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!current) return;
    const form = new FormData(event.currentTarget);
    const width = Number(form.get("width")), height = Number(form.get("height"));
    if (tables.some(table => !seatingGeometryFits(table, width, height))) { setMessage("geometry"); return; }
    const saved = await mutate(() => actions.manageSeatingPlanAction({ p_project_id: projectId, p_plan_id: current.plan.id, p_revision: current.plan.revision,
      p_operation: "update", p_name: String(form.get("name") ?? ""), p_width_cm: width, p_height_cm: height, p_rsvp_invitation_id: String(form.get("source") ?? "") || null }));
    if (saved) setSettingsOpen(false);
  }


  if (!current) return null;
  function selectTable(id: string | null) { setSelectedId(id); }
  const tabs = <span className={styles.panelTabs} role="tablist" aria-label={t("inspector")}>
    <Button size="sm" role="tab" aria-selected={tab === "guests"} variant={tab === "guests" ? "default" : "ghost"} onClick={() => setTab("guests")}>{t("guestsTab")}</Button>
    <Button size="sm" role="tab" aria-selected={tab === "table"} variant={tab === "table" ? "default" : "ghost"} onClick={() => setTab("table")}>{t("tableTab")}</Button>
  </span>;
  const panel = (mobile = false) => <div className={mobile ? styles.mobileInspector : styles.inspector}>
    <EditorSidebar title={tabs} mobileScrollOwner={mobile ? "parent" : "sidebar"}>
      <div role="tabpanel" aria-label={t(tab === "guests" ? "guestsTab" : "tableTab")} className={styles.panelContent}>
      {tab === "table" ? <>
        <Field label={t("selectTable")}><Select value={selectedId ?? ""} onValueChange={value => selectTable(value || null)} options={[{ value: "", label: t("selectTable") }, ...tables.map(table => ({ value: table.id, label: table.name + " · " + current.assignments.filter(a => a.table_id === table.id).length + "/" + table.capacity }))]} /></Field>
        <TablePanel occupancy={selected ? current.assignments.filter(item => item.table_id === selected.id).length : 0} key={(selected?.id ?? "none") + ":" + current.plan.revision} table={selected} disabled={disabled} onSave={table => saveTable(table)} onDelete={table => setRemoval({ name: table.name, action: () => actions.manageSeatingTableAction(tableInput(table, "delete")) })} />
      </> : <ParticipantsPanel current={current} tables={tables} disabled={disabled} saving={busy} onReload={() => void reload()}
        onAdd={includeGuest} onDragStart={(event, person) => { if (!disabled) guestGesture.start(event, person); }} onPlace={placeGuest} error={message && message !== "saved" ? message : null}
        onRemove={person => setRemoval({ name: person.first_name + " " + (person.last_name ?? ""), action: () => actions.manageSeatingParticipantAction({ p_plan_id: current.plan.id, p_revision: current.plan.revision, p_guest_id: person.id, p_operation: "remove" }) })}
        onAssign={assignGuest}
        onCreate={createAndInclude} />}
      </div>
    </EditorSidebar>
  </div>;

  return <div className={styles.fullscreenEditor}>
    <EditorShell header={<EditorHeader
      start={<div className={styles.headerIdentity}><Button size="icon" variant="ghost" aria-label={t("backToPlans")} disabled={busy} onClick={() => router.push(base)}><ArrowLeft aria-hidden="true" /></Button>
        <button className={styles.planName} title={current.plan.name} disabled={busy} onClick={() => setSettingsOpen(true)}>{current.plan.name}</button>
        <EditorSaveStatus status={busy ? "saving" : message && message !== "saved" ? "error" : "saved"} savingLabel={t("saving")} savedLabel={t(message === "saved" ? "saved" : "ready")} errorLabel={t("saveFailed")} />
      </div>}
      end={<div className={styles.toolbar}>
        <Button size="sm" variant="outline" disabled={disabled} aria-label={t("addRound")} title={t("addRound")} onClick={() => addTable("round")}><Circle aria-hidden="true" /><span className={styles.actionLabel}>{t("addRound")}</span></Button>
        <Button size="sm" variant="outline" disabled={disabled} aria-label={t("addRectangle")} title={t("addRectangle")} onClick={() => addTable("rectangle")}><RectangleHorizontal aria-hidden="true" /><span className={styles.actionLabel}>{t("addRectangle")}</span></Button>
        <Button size="icon" variant="outline" aria-label={t("fit")} title={t("fit")} onClick={() => controls.current?.fit()}><Maximize2 aria-hidden="true" /></Button>
        <Button size="icon" variant="ghost" aria-label={t("zoomIn")} title={t("zoomIn")} onClick={() => controls.current?.zoom(1.2)}><ZoomIn aria-hidden="true" /></Button>
        <Button size="icon" variant="ghost" aria-label={t("zoomOut")} title={t("zoomOut")} onClick={() => controls.current?.zoom(1 / 1.2)}><ZoomOut aria-hidden="true" /></Button>
        
        <Button size="icon" variant={pan ? "default" : "ghost"} aria-label={t("pan")} title={t("pan")} aria-pressed={pan} onClick={() => { setPlacingGuest(null); setPan(value => !value); }}><Move aria-hidden="true" /></Button>
        <Button size="icon" variant="ghost" disabled={disabled} aria-label={t("resizeRoom")} title={t("resizeRoom")} onClick={() => { setPan(false); setPlacingGuest(null); setSelectedId(null); }}><RectangleHorizontal aria-hidden="true" /></Button>
        <Button size="icon" variant="ghost" disabled={busy} aria-label={t("reload")} title={t("reload")} onClick={() => void reload()}><RefreshCw aria-hidden="true" /></Button>
        <Button size="icon" variant="ghost" disabled={busy} aria-label={t("planSettings")} title={t("planSettings")} onClick={() => setSettingsOpen(true)}><Settings aria-hidden="true" /></Button>
      </div>} />}
      mobileControls={<>
        <div className={styles.actions}><Button size="sm" variant="outline" onClick={() => { setTab("guests"); setMobileOpen(true); }}>{t("guestsTab")}</Button><Button size="sm" variant="outline" onClick={() => { setTab("table"); setMobileOpen(true); }}>{t("tableTab")}</Button></div>
        <EditorMobilePanel open={mobileOpen} onOpenChange={setMobileOpen} defaultSnapPoint={0.7} scrollResetKey={tab} handleOnly>
          <DrawerTitle className={styles.srOnly}>{t("inspector")}</DrawerTitle>{panel(true)}
        </EditorMobilePanel>
      </>}>
      <div className={styles.editorBody}>
        {placingGuest && <div className={styles.placementNotice} role="status">{t("chooseDropTable", { name: [placingGuest.first_name, placingGuest.last_name].filter(Boolean).join(" ") })}<Button size="sm" variant="outline" onClick={() => setPlacingGuest(null)}>{t("cancel")}</Button></div>}
        {message && message !== "saved" && <div className={styles.editorNotice} role="alert">{t(message)}{blocked && <> {t("conflictHelp")} <Button size="sm" disabled={busy} onClick={() => void reload()}>{t("reload")}</Button></>}</div>}
        <EditorWorkspace sidebarPosition="left" sidebar={panel()}>
          <Canvas key={current.plan.id} controlsRef={controls} pan={pan} guestDrag={guestGesture.drag} placingGuestId={placingGuest?.id ?? null} onPlace={id => { if (placingGuest) assignGuest(placingGuest.id, id); }} onRoomChange={saveRoom} widthCm={current.plan.width_cm} heightCm={current.plan.height_cm} tables={tables} assignments={current.assignments} selectedId={selectedId} disabled={disabled} onSelect={selectTable} onChange={table => saveTable(table, true)} onInvalid={() => setMessage("geometry")} />
        </EditorWorkspace>
      </div>
    </EditorShell>

    <Dialog open={settingsOpen} onOpenChange={value => { if (!busy) setSettingsOpen(value); }}>
      <DialogContent className={styles.dialog}><DialogHeader><DialogTitle>{t("planSettings")}</DialogTitle><DialogDescription>{t("sourceHelp")}</DialogDescription></DialogHeader>
        <form key={current.plan.id + ":" + current.plan.revision} onSubmit={updatePlan} className={styles.workspace}>
          <fieldset disabled={disabled} className={styles.grid}>
            <Field label={t("name")}><Input name="name" defaultValue={current.plan.name} maxLength={150} required /></Field>
            <Field label={t("rsvpSource")}><Select name="source" defaultValue={current.plan.rsvp_invitation_id ?? ""} options={[{ value: "", label: t("noSource") }, ...data.invitations.map(item => ({ value: item.id, label: item.name }))]} /></Field>
            <Field label={t("roomWidth")}><Input name="width" type="number" min={100} max={100000} step={1} defaultValue={current.plan.width_cm} required /></Field>
            <Field label={t("roomHeight")}><Input name="height" type="number" min={100} max={100000} step={1} defaultValue={current.plan.height_cm} required /></Field>
          </fieldset>
          <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setSettingsOpen(false)}>{t("cancel")}</Button><Button type="submit" disabled={disabled}>{t("savePlan")}</Button></DialogFooter>
          <div className={styles.dangerZone}><Button type="button" variant="destructiveOutline" disabled={disabled} onClick={() => setRemoval({ name: current.plan.name, deletesPlan: true, action: () => actions.manageSeatingPlanAction({ p_project_id: projectId, p_plan_id: current.plan.id, p_revision: current.plan.revision, p_operation: "delete", p_name: null, p_width_cm: null, p_height_cm: null, p_rsvp_invitation_id: null }) })}>{t("deletePlan")}</Button></div>
        </form>
        {message && message !== "saved" && <p role="alert" className={styles.warning}>{t(message)}</p>}
      </DialogContent>
    </Dialog>
    <ConfirmDialog variant="danger" loadingText={t("saving")} open={!!removal} title={t("deleteTitle")} description={t("deleteHelp", { name: removal?.name ?? "" })} confirmText={t("remove")} cancelText={t("cancel")} loading={busy}
      onClose={() => { if (!busy) setRemoval(null); }} onConfirm={() => { if (removal) void mutate(removal.action, { deletedPlan: removal.deletesPlan }); }} />
  </div>;
}
