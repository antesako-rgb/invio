/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const modules = new Map();
function load(relative) {
  const filename = path.resolve(__dirname, relative);
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  compiledModule.require = function(request) {
    const dependency = path.resolve(path.dirname(filename), request + ".ts");
    if (request.startsWith(".") && fs.existsSync(dependency)) return load(path.relative(__dirname, dependency));
    return Module.prototype.require.call(this, request);
  };
  modules.set(filename, compiledModule);
  compiledModule._compile(compiled, filename);
  return compiledModule.exports;
}
const { changeSeatTable, getInitialSeatChoice, getSeatPickerIssue, isSeatChoiceUnchanged } = load("../validation/seatAssignmentChoices.ts");
const { getMinimumTableCapacity, isSeatRevisionConfirmed } = load("../validation/seatAssignment.ts");
const tables = [{ id: "one", capacity: 8 }, { id: "two", capacity: 1 }];
const active = { id: "active", first_name: "Active", archived_at: null };
const archived = { id: "archived", first_name: "Archived", archived_at: "2026-10-11T12:00:00Z" };
function current(assignments = []) {
  return { people: [active, archived, { id: "not-in-plan", archived_at: null }], participants: [{ project_guest_id: "active" }, { project_guest_id: "archived" }], assignments };
}
const assigned = { project_guest_id: "active", table_id: "one", seat_number: 8 };
test("opening an empty chair requires an explicit guest choice", () => {
  assert.deepEqual(getInitialSeatChoice({ tableId: "one", seatNumber: 3, guestId: null }, current([assigned]), tables), { guestId: "", tableId: "one", seatNumber: 3 });
});
test("opening an occupied chair chooses its guest and preserved identity", () => {
  assert.deepEqual(getInitialSeatChoice({ tableId: "one", seatNumber: 8, guestId: null }, current([assigned]), tables), { guestId: "active", tableId: "one", seatNumber: 8 });
});
test("opening a guest retains their concrete chair rather than generating another one", () => {
  assert.deepEqual(getInitialSeatChoice({ tableId: null, seatNumber: null, guestId: "active" }, current([assigned]), tables), { guestId: "active", tableId: "one", seatNumber: 8 });
});

test("an unassigned guest does not silently select the first table", () => {
  const request = { tableId: null, seatNumber: null, guestId: "active" };
  assert.deepEqual(getInitialSeatChoice(request, current(), tables), { guestId: "active", tableId: null, seatNumber: null });
  assert.deepEqual(getInitialSeatChoice(request, current(), tables.toReversed()), { guestId: "active", tableId: null, seatNumber: null });
});

test("manual mode survives a changed target and restoration before a chair has been chosen", () => {
  const draft = { guestId: "active", tableId: "one", seatNumber: 3, seatMode: "manual" };
  const next = changeSeatTable(draft, "two", [assigned]);
  assert.deepEqual(next, { guestId: "active", tableId: "two", seatNumber: null, seatMode: "manual" });
  assert.deepEqual(getInitialSeatChoice(next, current([assigned]), tables), next);
  assert.deepEqual(draft, { guestId: "active", tableId: "one", seatNumber: 3, seatMode: "manual" });
});

test("reselecting the same table keeps its draft chair while returning to the saved table restores its own chair", () => {
  const draft = { guestId: "active", tableId: "two", seatNumber: 1, seatMode: "manual" };
  assert.equal(changeSeatTable(draft, "two", [assigned]), draft);
  assert.deepEqual(changeSeatTable(draft, "one", [assigned]), { guestId: "active", tableId: "one", seatNumber: 8, seatMode: "manual" });
  assert.deepEqual(changeSeatTable({ ...draft, seatMode: "auto" }, "one", [assigned]), { guestId: "active", tableId: "one", seatNumber: 8, seatMode: "auto" });
});
test("a project person outside the plan is rejected even if present in the people lookup", () => {
  const state = current();
  assert.equal(getSeatPickerIssue({ tableId: "one", seatNumber: 1, guestId: "not-in-plan" }, state, tables), "seatParticipantError");
  assert.equal(getInitialSeatChoice({ tableId: "one", seatNumber: 1, guestId: "not-in-plan" }, state, tables).guestId, "");
});
test("archived people can release a chair or table but cannot move or gain assignments", () => {
  const assignment = { project_guest_id: "archived", table_id: "one", seat_number: 8 };
  const state = current([assignment]);
  assert.equal(getSeatPickerIssue({ tableId: "one", seatNumber: null, guestId: "archived" }, state, tables), null);
  assert.equal(getSeatPickerIssue({ tableId: null, seatNumber: null, guestId: "archived" }, state, tables), null);
  assert.equal(getSeatPickerIssue({ tableId: "one", seatNumber: 2, guestId: "archived" }, state, tables), "archivedError");
  assert.equal(getSeatPickerIssue({ tableId: "two", seatNumber: null, guestId: "archived" }, state, tables), "archivedError");
  assert.equal(getSeatPickerIssue({ tableId: "one", seatNumber: null, guestId: "archived" }, current(), tables), "archivedError");
  assert.deepEqual(state.assignments, [assignment]);
});
test("table-only people consume capacity and occupied chairs cannot displace another person", () => {
  const occupied = { project_guest_id: "archived", table_id: "two", seat_number: 1 };
  const state = current([assigned, occupied]);
  assert.equal(getSeatPickerIssue({ tableId: "two", seatNumber: 1, guestId: "active" }, state, tables), "seatOccupiedError");
  assert.equal(getSeatPickerIssue({ tableId: "two", seatNumber: null, guestId: "active" }, state, tables), "capacityError");
  assert.equal(getSeatPickerIssue({ tableId: "one", seatNumber: 9, guestId: "active" }, state, tables), "seatRangeError");
  assert.equal(getSeatPickerIssue({ tableId: null, seatNumber: 1, guestId: "active" }, state, tables), "seatRangeError");
  assert.equal(getSeatPickerIssue({ tableId: "missing", seatNumber: null, guestId: "active" }, state, tables), "seatTableError");
  assert.deepEqual(state.assignments, [assigned, occupied]);
});
test("unchanged picker choices do not submit another revision while release and move do", () => {
  assert.equal(isSeatChoiceUnchanged({ guestId: "active", tableId: "one", seatNumber: 8 }, [assigned]), true);
  assert.equal(isSeatChoiceUnchanged({ guestId: "active", tableId: "one", seatNumber: null }, [assigned]), false);
  assert.equal(isSeatChoiceUnchanged({ guestId: "active", tableId: "two", seatNumber: 1 }, [assigned]), false);
  assert.equal(isSeatChoiceUnchanged({ guestId: "active", tableId: null, seatNumber: null }, []), true);
});

test("a full table allows its existing table-only guest to choose a free chair", () => {
  const tableOnly = { project_guest_id: "active", table_id: "two", seat_number: null };
  assert.equal(getSeatPickerIssue({ guestId: "active", tableId: "two", seatNumber: 1 }, current([tableOnly]), tables), null);
  assert.equal(getSeatPickerIssue({ guestId: "archived", tableId: "two", seatNumber: 1 }, {
    ...current([tableOnly]), people: [{ ...archived, archived_at: null }],
  }, tables), "capacityError");
});

test("capacity preserves the highest occupied chair until it is explicitly released", () => {
  const tableOnly = { project_guest_id: "archived", table_id: "one", seat_number: null };
  assert.equal(getMinimumTableCapacity([assigned, tableOnly]), 8);
  assert.equal(getMinimumTableCapacity([{ ...assigned, seat_number: null }, tableOnly]), 2);
  assert.equal(getMinimumTableCapacity([]), 1);
});

test("a seat save requires the exact next safe revision acknowledgement", () => {
  assert.equal(isSeatRevisionConfirmed(12, 11), true);
  for (const value of [11, 13, "12", null, undefined, NaN, Infinity, 12.5]) {
    assert.equal(isSeatRevisionConfirmed(value, 11), false);
  }
  assert.equal(isSeatRevisionConfirmed(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER), false);
});

const { sortSeatingTables, getGuestDropIntent, matchesGuestFilter, getTableSeatRows, getSeatingSaveStatus } = load("../validation/seatingUx.ts");
const { focusTableViewport } = load("../validation/editorGeometry.ts");
const { getTablePreviewBounds } = load("../validation/canvasInteraction.ts");

test("the chair overview includes every empty position for capacities one through one hundred", () => {
  for (let capacity = 1; capacity <= 100; capacity++) {
    const rows = getTableSeatRows({ id: "one", capacity }, [], []);
    assert.deepEqual(rows.map(row => row.seatNumber), Array.from({ length: capacity }, (_, i) => i + 1));
    assert.ok(rows.every(row => !row.assignment && !row.person));
  }
});

test("sparse chair assignments keep their identities, gaps and names after movement and rename", () => {
  const sparse = [assigned, { project_guest_id: "archived", table_id: "one", seat_number: 4 }, { project_guest_id: "not-in-plan", table_id: "two", seat_number: 1 }];
  const before = JSON.stringify(sparse);
  const state = current(sparse);
  const rows = getTableSeatRows({ id: "one", capacity: 8 }, sparse, state.people);
  assert.deepEqual(rows.filter(row => row.assignment).map(row => [row.seatNumber, row.person.id]), [[4, "archived"], [8, "active"]]);
  assert.ok(rows[0].assignment === undefined);
  const renamed = state.people.map(person => person.id === "active" ? { ...person, first_name: "Renamed" } : person);
  assert.equal(getTableSeatRows({ id: "one", capacity: 8, x_cm: 999 }, sparse.toReversed(), renamed)[7].person.first_name, "Renamed");
  assert.equal(JSON.stringify(sparse), before);
});

test("an occupied chair remains occupied if its person is missing and NULL assignments never invent chairs", () => {
  const rows = getTableSeatRows({ id: "one", capacity: 3 }, [
    { project_guest_id: "unknown", table_id: "one", seat_number: 2 },
    { project_guest_id: "active", table_id: "one", seat_number: null },
    { project_guest_id: "archived", table_id: "one", seat_number: 99 },
  ], []);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map(row => !!row.assignment), [false, true, false]);
  assert.equal(rows[1].person, undefined);
});
test("table order is numeric, deterministic and independent of moved coordinates or query order", () => {
 const input=[{id:"10",name:"Stol 10",x_cm:0},{id:"vip",name:"VIP",x_cm:1},{id:"2",name:"Stol 2",x_cm:100},{id:"1",name:"Stol 1",x_cm:200},{id:"a",name:"Ante",x_cm:10}];
 assert.deepEqual(sortSeatingTables(input).map(t=>t.id),["1","2","10","a","vip"]);
 assert.deepEqual(sortSeatingTables(input.toReversed().map(t=>({...t,x_cm:9999}))).map(t=>t.id),["1","2","10","a","vip"]);
 assert.equal(input[0].id,"10");
 assert.deepEqual(sortSeatingTables([{id:"b",name:"Stol 2"},{id:"a",name:"Stol 2"}]).map(t=>t.id),["a","b"]);
});
test("mobile and touch drops require a picker; only precise desktop chair drops assign directly", () => {
 const chair={tableId:"one",seatNumber:8},body={tableId:"one",seatNumber:null};
 assert.equal(getGuestDropIntent(chair,true,"mouse"),"choose");
 assert.equal(getGuestDropIntent(chair,false,"touch"),"choose");
 assert.equal(getGuestDropIntent(body,true,"touch"),"choose");
 assert.equal(getGuestDropIntent(body,false,"mouse"),"choose");
 assert.equal(getGuestDropIntent(chair,false,"mouse"),"assign");
 assert.equal(getGuestDropIntent(null,true,"touch"),"miss");
});
test("guest filters distinguish no table from membership at a table without a chair", () => {
 const tableOnly={seat_number:null},seated={seat_number:8};
 assert.equal(matchesGuestFilter("unassigned",undefined),true);
 assert.equal(matchesGuestFilter("unassigned",tableOnly),false);



 assert.equal(matchesGuestFilter("all",seated),true);
});
test("a missed drop does not report a failed save while real errors and pending writes do", () => {
  for (const message of ["","saved","dropMiss"]) assert.equal(getSeatingSaveStatus(false,message),"saved");
  for (const message of ["saveFailed","seatOccupiedError","capacityError","reloadRequired","conflict"]) assert.equal(getSeatingSaveStatus(false,message),"error");
  assert.equal(getSeatingSaveStatus(true,"dropMiss"),"saving");
});
test("table focus fits rotated furniture and chairs without changing persisted geometry", () => {
 for(const shape of ["round","rectangle"]) for(const rotation_deg of [0,45,90,135]) for(const size of [{width:320,height:480},{width:900,height:650}]){
  const table={shape,capacity:17,width_cm:shape==="round"?229:550,height_cm:shape==="round"?229:206,x_cm:1000,y_cm:750,rotation_deg};
  const before={...table},view=focusTableViewport(table,size),bounds=getTablePreviewBounds(table);
  const angle=rotation_deg*Math.PI/180;
  const width=Math.abs(Math.cos(angle))*bounds.width+Math.abs(Math.sin(angle))*bounds.height;
  const height=Math.abs(Math.sin(angle))*bounds.width+Math.abs(Math.cos(angle))*bounds.height;
  assert.ok(width*view.scale<=size.width+1e-8 && height*view.scale<=size.height+1e-8);
  assert.ok(Math.abs(table.x_cm*view.scale+view.x-size.width/2)<1e-8);
  assert.ok(Math.abs(table.y_cm*view.scale+view.y-size.height/2)<1e-8);
  assert.deepEqual(table,before);
 }
});

const {previewAutomaticSeats,guestMatchesScope}=load("../validation/automaticSeating.ts");
test("automatic groups preserve manual seats and fill holes in selected order without mutating data",()=>{
 const assignments=[{project_guest_id:"manual",table_id:"one",seat_number:2},{project_guest_id:"moving",table_id:"two",seat_number:1}];
 const before=JSON.stringify(assignments);
 assert.deepEqual(previewAutomaticSeats({id:"one",capacity:8},["new","manual","moving"],assignments),{seats:[{guestId:"new",seatNumber:1},{guestId:"manual",seatNumber:2},{guestId:"moving",seatNumber:3}],occupancy:3,overflow:0});
 assert.equal(JSON.stringify(assignments),before);
});
test("automatic preview counts target members once and refuses overflowing groups",()=>{
 const assignments=[{project_guest_id:"one",table_id:"one",seat_number:1},{project_guest_id:"two",table_id:"one",seat_number:2}];
 const preview=previewAutomaticSeats({id:"one",capacity:2},["one","new"],assignments);
 assert.equal(preview.occupancy,3);assert.equal(preview.overflow,1);assert.deepEqual(preview.seats.map(s=>s.seatNumber),[1,null]);
});
test("every automatic place is concrete when the selected group fits capacities 1 through 100",()=>{
 for(let capacity=1;capacity<=100;capacity++){
 const ids=Array.from({length:capacity},(_,i)=>"person-"+i),preview=previewAutomaticSeats({id:"one",capacity},ids,[]);
 assert.equal(preview.overflow,0);assert.equal(new Set(preview.seats.map(s=>s.seatNumber)).size,capacity);
 assert.deepEqual(preview.seats.map(s=>s.seatNumber),Array.from({length:capacity},(_,i)=>i+1));
 }
});
test("guest scopes separate free members, current table, other tables and project people",()=>{
 const state={participants:[{project_guest_id:"free"},{project_guest_id:"here"},{project_guest_id:"other"}],assignments:[{project_guest_id:"here",table_id:"one",seat_number:2},{project_guest_id:"other",table_id:"two",seat_number:1}]};
 const ids=["free","here","other","project"];
 for(const [scope,expected] of [["unassigned",["free"]],["here",["here"]],["other",["other"]],["all",["free","here","other"]],["project",["project"]]])assert.deepEqual(ids.filter(id=>guestMatchesScope(id,scope,"one",state)),expected);
});

const {getManualSeatOptions,getManualSeatIssue}=load("../validation/manualSeating.ts");
test("manual choices exclude occupied and draft-reserved chairs but retain the guest's own chair",()=>{
 const target={id:"one",capacity:8},assigned=[{project_guest_id:"own",table_id:"one",seat_number:2},{project_guest_id:"other",table_id:"one",seat_number:4}];
 assert.deepEqual(getManualSeatOptions(target,"own",["own","new"],{new:6},assigned),[1,2,3,5,7,8]);
 assert.deepEqual(getManualSeatOptions(target,"new",["own","new"],{own:6},assigned),[1,3,5,7,8]);
});
test("manual groups require one valid unique chair for every selected guest",()=>{
 const target={id:"one",capacity:8},ids=["one","two"];
 assert.equal(getManualSeatIssue(target,ids,{one:1},[]),"manualSeatsIncomplete");
 assert.equal(getManualSeatIssue(target,ids,{one:1,two:1},[]),"seatOccupiedError");
 for(const n of [0,9,1.5])assert.equal(getManualSeatIssue(target,ids,{one:n,two:2},[]),"seatRangeError");
 assert.equal(getManualSeatIssue(target,ids,{one:1,two:2},[]),null);
});
test("manual selection never allows displacement or an implicit swap of existing guests",()=>{
 const target={id:"one",capacity:8},assigned=[{project_guest_id:"one",table_id:"one",seat_number:1},{project_guest_id:"two",table_id:"one",seat_number:2}];
 assert.equal(getManualSeatIssue(target,["one","two"],{one:2,two:1},assigned),"seatOccupiedError");
 assert.equal(getManualSeatIssue(target,["one","two"],{one:1,two:3},assigned),null);
});
