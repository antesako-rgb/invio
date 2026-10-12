/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "../../../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const dir = "docs/seating/install/hotfix_delete_invitation_guest/";
const source = read("src/features/invitation-guests/actions/guests/invitationGuestError.ts");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const mapError = context.exports.invitationGuestError;
const changed = "Gost je u međuvremenu promijenjen. Pokušajte ponovno.";

test("guest conflict maps to translated CONFLICT without exposing DB message", () => {
  assert.equal(mapError({ code: "PT409", message: changed }), "CONFLICT");
  assert.equal(mapError({ code: "40001", message: changed }), "CONFLICT");
  assert.equal(mapError({ code: "40001", message: "Storage transaction busy; retry the transaction" }), "GUEST_ACTION_FAILED");
  assert.equal(mapError({ code: "40001" }), "GUEST_ACTION_FAILED");
});

test("authorization, missing guest and validation retain existing classifications", () => {
  assert.equal(mapError({ code: "42501" }), "FORBIDDEN");
  assert.equal(mapError({ code: "P0002" }), "NOT_FOUND");
  assert.equal(mapError({ code: "23503" }), "INVALID_INPUT");
  assert.equal(mapError({ code: "23505" }, true), "GUEST_GROUP_EXISTS");
  assert.equal(mapError(null), "GUEST_ACTION_FAILED");
});

test("reviewed candidate changes exactly one literal and SQL guards preserve metadata", () => {
  const canonical = read("docs/seating/definitions/invitation_guests/public.delete_invitation_guest.sql");
  const body = canonical.match(/\bas\s+(\$[a-z_0-9]*\$)([\s\S]*?)\1/i)?.[2];
  assert.ok(body);
  const hash = text => crypto.createHash("md5").update(text.replace(/\s+/g, " ")).digest("hex");
  assert.equal(hash(body), "483a04ed8000a5a0e0ec186b0e7a88c6");
  assert.equal((body.match(/errcode = 'PT409'/g) || []).length, 1);
  assert.doesNotMatch(body, /40001/);
  assert.equal(hash(body.replace("errcode = 'PT409'", "errcode = '40001'")), "0720214c9d9dd275f78309af05382b23");
  const apply = read(dir + "APPLY.sql");
  for (const guard of ["7f3ed7d65b2d17a05e46e8c0a64a1e13", "75ca837ef7cd32a89d895ae474d0cd1a", "lock_timeout = '5s'", "statement_timeout = '15s'", "array['postgres=X/postgres', 'authenticated=X/postgres']::aclitem[]", "(to_jsonb(updated) - 'prosrc') is distinct from (to_jsonb(p) - 'prosrc')"])
    assert.ok(apply.includes(guard));
  assert.ok(apply.trim().endsWith("commit;"));
  const verify = read(dir + "VERIFY_READ_ONLY.sql");
  assert.ok(verify.includes("begin read only;"));
  assert.ok(verify.includes("75ca837ef7cd32a89d895ae474d0cd1a"));
  assert.doesNotMatch(verify, /(?:select|perform)\s+public\.delete_invitation_guest\s*\(/i);
});
