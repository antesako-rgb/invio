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
const { getInitialSeatChoice, getSeatPickerIssue, isSeatChoiceUnchanged } = load("../validation/seatAssignmentChoices.ts");
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
