/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const dir = "docs/seating/install/hotfix_revision_conflict/";
const md5 = value => crypto.createHash("md5").update(value.replace(/\s+/g, " ")).digest("hex");

test("canonical hotfix changes only the audited revision SQLSTATE", () => {
 const definition = read("docs/seating/definitions/seating_plans/private.lock_seating_plan.sql");
 const body = definition.split("$$")[1];
 assert.equal(md5(body), "92e8c1d8e8e377943c9d8373d37e9990");
 assert.equal(md5(body.replace("errcode='PT409'", "errcode='40001'")), "d9e93383f3f0a64e0a3e5a810eeca238");
 assert.equal((body.match(/PT409/g) || []).length, 1);
 assert.doesNotMatch(body, /40001|40P01/);
 const apply = read(dir + "APPLY.sql");
 assert.ok(apply.includes("expected_source:=replace(p.prosrc,'errcode=''40001''','errcode=''PT409''')"));
 assert.ok(apply.includes("(to_jsonb(updated)-'prosrc') is distinct from (to_jsonb(p)-'prosrc')"));
 assert.ok(apply.includes("array['postgres=X/postgres']::aclitem[]"));
 assert.ok(apply.trim().endsWith("commit;"));
 const verify = read(dir + "VERIFY_READ_ONLY.sql");
 assert.ok(verify.includes(md5(body)));
 assert.ok(verify.includes("begin read only;"));
 assert.doesNotMatch(verify, /perform\s+private\.lock_seating_plan|select\s+private\.lock_seating_plan/i);
});

test("process identification is read-only and termination has inert identity guards", () => {
 const identify = read(dir + "IDENTIFY_PROCESSES_READ_ONLY.sql");
 assert.ok(identify.includes("begin read only;"));
 assert.doesNotMatch(identify, /pg_terminate_backend|pg_cancel_backend/);
 const terminate = read(dir + "TERMINATE_CONFIRMED_PROCESS_MANUAL.sql");
 assert.ok(terminate.includes("values (null::integer,null::timestamptz,null::timestamptz,null::text)"));
 for (const guard of ["a.pid=c.pid", "a.backend_start=c.backend_start", "a.query_start=c.query_start", "md5(a.query)=c.query_fingerprint", "a.usename='authenticator'", "a.pid<>pg_backend_pid()"])
  assert.ok(terminate.includes(guard));
 assert.equal((terminate.match(/pg_terminate_backend\(/g) || []).length, 1);
});
