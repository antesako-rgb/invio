/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
function load() {
  const calls = []; const exports = {};
  const code = ts.transpileModule(fs.readFileSync(__dirname + "/../repositories/photos/uploadInvitationPhoto.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, console, require(name) {
    if (name === "zod") return require("zod");
    if (name === "crypto") return { randomUUID: () => "unique" };
    if (name.endsWith("/server")) return { createServerClient: async () => ({ rpc: async (rpc, args) => { calls.push({ rpc, args }); return { data: { photo_id: "photo" }, error: null }; } }) };
    if (name.endsWith("/bunny")) return { uploadToBunny: async () => calls.push("upload") };
    if (name.endsWith("/optimizeImage")) return { optimizeImage: async () => Buffer.from("image") };
    if (name.endsWith("/validateImage")) return { validateImage: () => {} };
    throw new Error(name);
  } });
  return { upload: exports.uploadInvitationPhoto, calls };
}
const file = { arrayBuffer: async () => new ArrayBuffer(1) };
test("description is normalized and sent in the existing create RPC", async () => {
  const { upload, calls } = load();
  await upload("invitation", file, "  Our wedding  ");
  assert.equal(calls[1].rpc, "create_invitation_photo");
  assert.equal(calls[1].args.p_description, "Our wedding");
});
test("empty description stays optional; oversized input fails before storage upload", async () => {
  const empty = load(); await empty.upload("invitation", file, "  ");
  assert.equal(empty.calls[1].args.p_description, undefined);
  const invalid = load();
  await assert.rejects(() => invalid.upload("invitation", file, "x".repeat(301)));
  assert.equal(invalid.calls.length, 0);
});
