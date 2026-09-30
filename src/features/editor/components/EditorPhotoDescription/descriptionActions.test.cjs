/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const cases = [
  ["invitations", "updateInvitationPhotoDescriptionAction", "invitation_photos", "invitation_id"],
  ["digital-albums", "updateDigitalAlbumPhotoDescriptionAction", "digital_album_photos", "album_id"],
  ["photo-walls", "updatePhotoWallPhotoDescriptionAction", "photo_wall_photos", "photo_wall_id"],
];
function load(feature, name, denied = false, missing = false) {
  const writes = []; const exports = {}; let table; let args; let filters = [];
  const query = { select() { return query; }, eq(key, value) { filters.push([key, value]); return query; },
    update(value) { args = value; return query; }, async single() {
      if (!table.endsWith("_photos")) return { data: { project_id: "owned-project" } };
      writes.push({ table, args, filters }); return missing ? { data: null, error: new Error("missing") } : { data: args };
    } };
  const file = path.resolve(__dirname, `../../../${feature}/actions/photos/${name}.ts`);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require(id) {
    if (id === "zod") return require("zod");
    if (id === "next/cache") return { revalidatePath() {} };
    if (id.endsWith("requireProjectOwner")) return { requireProjectOwner: async project => { assert.equal(project, "owned-project"); if (denied) throw new Error("denied"); } };
    return { createServerClient: async () => ({
      from(name) { assert.equal(feature, "photo-walls", "Invitation/Album must use RPC only"); table = name; filters = []; return query; },
      rpc(name, parameters) {
        const invitation = feature === "invitations";
        assert.equal(name, invitation ? "update_invitation_photo" : "update_digital_album_photo");
        if (denied) return Promise.resolve({ data: null, error: { code: "42501" } });
        table = invitation ? "invitation_photos" : "digital_album_photos";
        args = { description: parameters.p_description || null };
        filters = [[invitation ? "invitation_id" : "album_id", invitation ? parameters.p_invitation_id : parameters.p_album_id], ["photo_id", parameters.p_photo_id]];
        return query.single();
      },
    }) };
  } });
  return { save: exports[name], writes };
}
const productId = "00000000-0000-4000-8000-000000000001";
const photoId = "00000000-0000-4000-8000-000000000002";
for (const [feature, name, table, key] of cases) {
  test(`${feature}: trims description and scopes update to its own relation and both IDs`, async () => {
    const { save, writes } = load(feature, name);
    assert.equal((await save(productId, photoId, "  Shared text  ")).success, true);
    assert.equal(writes[0].table, table);
    assert.equal(writes[0].args.description, "Shared text");
    assert.deepEqual(writes[0].filters, [[key, productId], ["photo_id", photoId]]);
    assert.equal((await save(productId, photoId, " ")).success, true);
    assert.equal(writes[1].args.description, null);
  });
  test(`${feature}: rejects invalid input, unauthorized access and missing relation`, async () => {
    const invalid = load(feature, name);
    assert.equal((await invalid.save(productId, photoId, "x".repeat(301))).success, false);
    assert.equal((await invalid.save("bad-id", photoId, "text")).success, false);
    assert.equal(invalid.writes.length, 0);
    const denied = load(feature, name, true);
    assert.equal((await denied.save(productId, photoId, "text")).success, false);
    assert.equal(denied.writes.length, 0);
    assert.equal((await load(feature, name, false, true).save(productId, photoId, "text")).success, false);
  });
}
