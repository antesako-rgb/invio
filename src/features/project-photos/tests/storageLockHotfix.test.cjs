/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const ts = require("typescript");
const { PostgrestClient } = require("@supabase/postgrest-js");
const root = path.resolve(__dirname, "../../../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const dir = "docs/storage-lifecycle/install/hotfix_storage_lock/";

test("reviewed storage candidate changes busy code and preserves nonwaiting gate", () => {
  const body = read("docs/storage-lifecycle/definitions/storage_lifecycle/private.storage_lock.sql").split("$$")[1];
  const md5 = value => crypto.createHash("md5").update(value.replace(/\s+/g, " ")).digest("hex");
  assert.equal(md5(body), "ce788c356d49b93f9f573f384b9952dd");
  assert.equal((body.match(/errcode = 'PT503'/g) || []).length, 1);
  assert.equal(md5(body.replace("errcode = 'PT503'", "errcode = '40001'")), "2af95ff8f8ed3e1b8eaa4bf65e49356c");
  const candidate = body;
  assert.equal(md5(candidate), "ce788c356d49b93f9f573f384b9952dd");
  assert.match(candidate, /pg_catalog\.pg_try_advisory_xact_lock\(79314, 1\)/);
  assert.doesNotMatch(candidate, /pg_advisory_xact_lock\(|pg_sleep|40001/);
  const apply = read(dir + "APPLY.sql");
  assert.ok(apply.includes("fcce7d0ec0683658afb9e435b42bcb83"));
  assert.ok(apply.includes("167fc0624f3dbedbe6d4c90096e8dffc"));
  assert.ok(apply.includes("or p.prosecdef")); // SECURITY INVOKER must remain.
  assert.ok(apply.includes("array['postgres=X/postgres']::aclitem[]"));
  assert.ok(apply.includes("(to_jsonb(updated) - 'prosrc') is distinct from (to_jsonb(p) - 'prosrc')"));
  assert.ok(apply.trim().endsWith("commit;"));
  const verify = read(dir + "VERIFY_READ_ONLY.sql");
  assert.ok(verify.includes("begin read only;"));
  assert.ok(verify.includes("167fc0624f3dbedbe6d4c90096e8dffc"));
  assert.doesNotMatch(verify, /(?:perform|select)\s+private\.storage_lock\(/i);
});

test("PT503 cleanup logging emits only approved code and stage, never original error", () => {
  const source = read("src/features/project-photos/storage/cleanupLogging.ts");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const logs = [];
  const context = { exports: {}, require: id => { assert.equal(id, "server-only"); return {}; }, console: { error: value => logs.push(JSON.parse(value)) } };
  vm.runInNewContext(compiled, context);
  context.exports.logCleanupFailure("claim", { code: "PT503", message: "sensitive message", details: "sensitive details" });
  assert.deepEqual(logs[0], { event: "storage_cleanup", stage: "claim", outcome: "failed", code: "PT503" });
  context.exports.logCleanupFailure("acknowledge", { code: "untrusted-secret-code" });
  assert.equal(logs[1].code, "UNCLASSIFIED");
});

test("lock inspection does not acquire locks, invoke RPCs or stop processes", () => {
  const audit = read(dir + "AUDIT_LOCK_READ_ONLY.sql");
  assert.ok(audit.includes("begin read only;"));
  assert.ok(audit.includes("l.classid = 79314 and l.objid = 1 and l.objsubid = 2"));
  assert.doesNotMatch(audit, /pg_try_advisory|pg_advisory_xact_lock|pg_terminate_backend|pg_cancel_backend/);
});

test("installed SDK does not automatically retry a POST RPC returning PT503", async () => {
  let attempts = 0;
  const db = new PostgrestClient("https://example.invalid/rest/v1", {
    fetch: async (_url, options) => {
      attempts++;
      assert.equal(options.method, "POST");
      return new Response(JSON.stringify({ code: "PT503", message: "Storage transaction busy; retry the transaction" }), {
        status: 503, headers: { "Content-Type": "application/json" },
      });
    },
  });
  const result = await db.rpc("storage_claim_cleanup", { p_limit: 1 });
  assert.equal(attempts, 1);
  assert.equal(result.status, 503);
  assert.equal(result.error.code, "PT503");
});
