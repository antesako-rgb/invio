/* eslint-disable @typescript-eslint/no-require-imports */
const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Exercise validation and the server/RPC boundary without a database or credentials.
const projectRoot = path.resolve(__dirname, "../../../..");
const modules = new Map();
const calls = [];
const revalidations = [];
let clientCalls = 0;
let rpcResult = { data: 13, error: null };
let rpcThrows = false;
const overrides = {
  "next/cache": { revalidatePath: (...args) => revalidations.push(args) },
  "@/lib/supabase/server": {
    createServerClient: async () => {
      clientCalls++;
      return { rpc: async (name, args) => { calls.push({ name, args }); if (rpcThrows) throw new Error("Transport interruption"); return rpcResult; } };
    },
  },
};
function load(filename) {
  filename = path.resolve(filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  compiledModule.require = function(request) {
    if (request in overrides) return overrides[request];
    if (request.startsWith(".") || request.startsWith("@/")) {
      const dependency = request.startsWith("@/")
        ? path.resolve(projectRoot, "src", request.slice(2))
        : path.resolve(path.dirname(filename), request);
      for (const extension of ["", ".ts", ".tsx"]) {
        if (fs.existsSync(dependency + extension) && fs.statSync(dependency + extension).isFile())
          return load(dependency + extension);
      }
    }
    return Module.prototype.require.call(this, request);
  };
  modules.set(filename, compiledModule);
  compiledModule._compile(compiled, filename);
  return compiledModule.exports;
}
const { seatAssignmentSchema } = load(path.resolve(__dirname, "../validation/seating.schema.ts"));
const { getSeatingErrorCode, getSeatingAssignmentErrorCode } = load(path.resolve(__dirname, "../services/seatingError.ts"));
const { assignSeatingGuestToSeatAction, assignSeatingGuestAction } = load(path.resolve(__dirname, "../actions/seatingActions.ts"));
const input = {
  p_plan_id: "10000000-0000-4000-8000-000000000001",
  p_revision: 12,
  p_guest_id: "10000000-0000-4000-8000-000000000002",
  p_table_id: "10000000-0000-4000-8000-000000000003",
  p_seat_number: 8,
};
const previousFlag = process.env.PROJECT_GUESTS_ENABLED;
beforeEach(() => {
  calls.length = 0;
  revalidations.length = 0;
  clientCalls = 0;
  rpcResult = { data: 13, error: null };
  rpcThrows = false;
  process.env.PROJECT_GUESTS_ENABLED = "true";
});
after(() => {
  if (previousFlag === undefined) delete process.env.PROJECT_GUESTS_ENABLED;
  else process.env.PROJECT_GUESTS_ENABLED = previousFlag;
});

test("seat validation accepts a concrete chair, table-only placement and full unassignment", () => {
  for (const change of [{ p_seat_number: 1 }, { p_seat_number: 100 }, { p_seat_number: null }, { p_table_id: null, p_seat_number: null }]) {
    const payload = { ...input, ...change };
    assert.deepEqual(seatAssignmentSchema.parse(payload), payload);
  }
});

test("invalid chair references, unsafe revisions and extra fields are rejected before a client is created", async () => {
  for (const change of [
    { p_table_id: null }, { p_seat_number: 0 }, { p_seat_number: 101 },
    { p_seat_number: 1.5 }, { p_seat_number: "8" }, { p_seat_number: undefined },
    { p_revision: 0 }, { p_revision: Number.MAX_SAFE_INTEGER + 1 },
    { p_guest_id: "other-project-person" }, { p_plan_id: null }, { automatic: true },
  ]) {
    assert.deepEqual(await assignSeatingGuestToSeatAction({ ...input, ...change }), { success: false, code: "SEATING_FAILED" });
  }
  assert.equal(clientCalls, 0);
  assert.deepEqual(calls, []);
  assert.deepEqual(revalidations, []);
});

test("seat action sends only validated arguments and returns the committed revision", async () => {
  assert.deepEqual(await assignSeatingGuestToSeatAction(input), { success: true, data: 13 });
  assert.equal(clientCalls, 1);
  assert.deepEqual(calls, [{ name: "assign_seating_guest_to_seat", args: input }]);
  assert.equal(revalidations.length, 1);
});

test("releasing a chair and unassigning retain explicit NULL arguments for the RPC", async () => {
  for (const p_table_id of [input.p_table_id, null]) {
    const payload = { ...input, p_table_id, p_seat_number: null };
    assert.equal((await assignSeatingGuestToSeatAction(payload)).success, true);
    assert.deepEqual(calls.at(-1), { name: "assign_seating_guest_to_seat", args: payload });
  }
});

test("a seat RPC failure preserves its distinct code and does not invalidate successful state", async () => {
  rpcResult = { data: null, error: { code: "23505", message: "Seat occupied", details: "Internal SQL detail" } };
  assert.deepEqual(await assignSeatingGuestToSeatAction(input), { success: false, code: "SEAT_OCCUPIED" });
  assert.equal(calls.length, 1);
  assert.deepEqual(revalidations, []);
});

test("a stale expected revision surfaces a conflict without retrying the write", async () => {
  rpcResult = { data: null, error: { code: "40001", message: "Revision conflict" } };
  assert.deepEqual(await assignSeatingGuestToSeatAction(input), { success: false, code: "REVISION_CONFLICT" });
  assert.equal(calls.length, 1);
  assert.deepEqual(revalidations, []);
});

test("returned transport failures require a reload for both chair and table assignment", async () => {
  rpcResult = { data: null, error: { code: "", message: "TypeError: fetch failed" }, status: 0 };
  assert.deepEqual(await assignSeatingGuestToSeatAction(input), { success: false, code: "SEATING_UNCONFIRMED" });
  const { p_seat_number, ...tableInput } = input;
  assert.equal(p_seat_number, 8);
  assert.deepEqual(await assignSeatingGuestAction(tableInput), { success: false, code: "SEATING_UNCONFIRMED" });
  assert.equal(calls.length, 2);
  assert.deepEqual(revalidations, []);
});

test("a thrown RPC transport error does not become a retryable validation failure", async () => {
  rpcThrows = true;
  assert.deepEqual(await assignSeatingGuestToSeatAction(input), { success: false, code: "SEATING_UNCONFIRMED" });
  const { p_seat_number, ...tableInput } = input;
  assert.equal(p_seat_number, 8);
  assert.deepEqual(await assignSeatingGuestAction(tableInput), { success: false, code: "SEATING_UNCONFIRMED" });
  assert.equal(calls.length, 2);
  assert.deepEqual(revalidations, []);
});

test("gateway timeouts are unconfirmed while explicit SQL failures remain definite rejections", () => {
  assert.equal(getSeatingAssignmentErrorCode({ code: "", message: "Gateway timeout" }, 504), "SEATING_UNCONFIRMED");
  assert.equal(getSeatingAssignmentErrorCode({ code: "XX000", message: "SQL transaction failed" }, 500), "SEATING_FAILED");
  assert.equal(getSeatingAssignmentErrorCode({ code: "23505", message: "Seat occupied" }, 409), "SEAT_OCCUPIED");
  assert.equal(getSeatingAssignmentErrorCode({ code: "42501", message: "Access denied" }, 403), "SEATING_FAILED");
});

test("the feature flag gates both assignment actions before contacting the database", async () => {
  process.env.PROJECT_GUESTS_ENABLED = "false";
  assert.deepEqual(await assignSeatingGuestToSeatAction(input), { success: false, code: "SEATING_FAILED" });
  const { p_seat_number, ...tableInput } = input;
  assert.equal(p_seat_number, 8);
  assert.deepEqual(await assignSeatingGuestAction(tableInput), { success: false, code: "SEATING_FAILED" });
  assert.equal(clientCalls, 0);
});

test("the existing table-only action keeps its four-argument RPC contract", async () => {
  const { p_seat_number, ...tableInput } = input;
  assert.equal(p_seat_number, 8);
  assert.deepEqual(await assignSeatingGuestAction(tableInput), { success: true, data: 13 });
  assert.deepEqual(calls, [{ name: "assign_seating_guest", args: tableInput }]);
});

test("SQL guards map to actionable editor codes without exposing raw SQL messages", () => {
  const expected = [
    ["Seat occupied", "SEAT_OCCUPIED"],
    ["Seat outside table capacity", "SEAT_RANGE"],
    ["Seat requires a table", "SEAT_RANGE"],
    ["Seat would be removed", "SEAT_CAPACITY"],
    ["Seated guests prevent shape change", "SEAT_SHAPE"],
    ["Participant missing", "PARTICIPANT_MISSING"],
    ["Table full", "CAPACITY"],
    ["Capacity below occupancy", "CAPACITY"],
    ["Active person missing", "ARCHIVED"],
    ["Person archived", "ARCHIVED"],
    ["Access denied", "SEATING_FAILED"],
    ["Unexpected internal SQL information", "SEATING_FAILED"],
  ];
  for (const [message, code] of expected) assert.equal(getSeatingErrorCode({ message }), code);
  for (const value of [null, undefined, "Seat occupied", {}, { message: null }])
    assert.equal(getSeatingErrorCode(value), "SEATING_FAILED");
  assert.equal(getSeatingErrorCode({ code: "40001", message: "Table full" }), "REVISION_CONFLICT");
});
