/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { File } = require("node:buffer");
const root = path.resolve(__dirname, "../../../..");
const id = "00000000-0000-4000-8000-000000000001";
const key = `projects/${id}/photos/${id}.webp`;

function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(code, {
      exports, Buffer, File, AbortSignal, Response,
      process: { env: {} },
      fetch() { throw new Error("REAL NETWORK IS FORBIDDEN IN TESTS"); },
      ...globals,
      require(name) {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name === "server-only") return {};
        if (name === "zod") return require("zod");
        if (name === "crypto") return { randomUUID: () => id, timingSafeEqual: require("node:crypto").timingSafeEqual };
        const target = name.startsWith("@/") ? path.join(root, "src", name.slice(2))
          : name.startsWith(".") ? path.resolve(path.dirname(file), name) : null;
        if (!target) throw new Error(`Unmocked import: ${name}`);
        return load(`${target}.ts`);
      },
    });
    return exports;
  }
  return load;
}

function uploadHarness({ denied = false, reserveFail = false, putFail = false, finalizeFailures = 0, expired = false } = {}) {
  const events = [];
  let finalizeCalls = 0;
  const result = { kind: "invitation", relation: { photo_id: id } };
  const load = loader({
    "@/lib/supabase/server": { createServerClient: async () => ({ auth: { getUser: async () => ({
      data: { user: denied ? null : { id } }, error: null,
    }) } }) },
    "@/lib/upload/validateImage": { validateImage() {} },
    "@/lib/upload/optimizeImage": { optimizeImage: async () => { events.push(["optimize"]); return Buffer.from("image"); } },
    "@/lib/upload/bunny": {
      uploadToBunny: async (_, storageKey) => { events.push(["put", storageKey]); if (putFail) throw new Error("put failed"); },
      deleteFromBunny: async () => { throw new Error("Upload must NEVER delete"); },
    },
    "./storageLifecycleRepository": {
      reserveStorageUpload: async args => { events.push(["reserve", args]); if (reserveFail) throw new Error("forbidden"); return { id, storage_key: key, expires_at: new Date(Date.now() + (expired ? -1 : 86400000)).toISOString() }; },
      finalizeStorageUpload: async args => { events.push(["finalize", args]); if (finalizeCalls++ < finalizeFailures) throw new Error("timeout after possible commit"); return result; },
    },
  });
  return { events, result, upload: load("src/features/project-photos/storage/uploadProjectPhoto.ts").uploadProjectPhoto };
}
const file = () => new File(["image"], "photo.png", { type: "image/png" });
const target = { kind: "invitation", productId: id, description: "  description  " };

test("auth and reservation/membership denial occur BEFORE optimization and Bunny PUT", async () => {
  for (const options of [{ denied: true }, { reserveFail: true }]) {
    const h = uploadHarness(options);
    await assert.rejects(h.upload(target, file()));
    assert.ok(h.events.every(([event]) => event === "reserve"));
    if (options.reserveFail) assert.equal(h.events[0][1].p_id, h.events[1][1].p_id);
  }
});

test("server uses reserved canonical key; finalization retry after possible commit preserves ID and uploads once", async () => {
  const h = uploadHarness({ finalizeFailures: 1 });
  assert.equal(await h.upload(target, file()), h.result);
  assert.deepEqual(h.events.map(([event]) => event), ["reserve", "optimize", "put", "finalize", "finalize"]);
  assert.equal(h.events[2][1], key);
  assert.deepEqual(h.events[3][1], h.events[4][1]);
  assert.equal(h.events[3][1].p_description, "description");
});

test("ambiguous commit or failed PUT NEVER triggers Bunny deletion", async () => {
  for (const options of [{ finalizeFailures: 2 }, { putFail: true }]) {
    const h = uploadHarness(options);
    await assert.rejects(h.upload(target, file()));
    assert.equal(h.events.filter(([event]) => event === "put").length, 1);
  }
});

test("expired reservation does not start Bunny PUT", async () => {
  const h = uploadHarness({ expired: true });
  await assert.rejects(h.upload(target, file()), /expired/);
  assert.equal(h.events.filter(([event]) => event === "put").length, 0);
});

test("all three upload adapters retain existing UI return shapes and reject wrong-kind results", async () => {
  for (const [feature, name, kind] of [
    ["invitations", "uploadInvitationPhoto", "invitation"],
    ["digital-albums", "uploadDigitalAlbumPhoto", "digital-album"],
    ["photo-walls", "uploadPhotoWallPhoto", "photo-wall"],
  ]) {
    const expected = { photo_id: id };
    let wrong = false;
    const load = loader({ "@/features/project-photos/storage/uploadProjectPhoto": {
      uploadProjectPhoto: async target => {
        assert.equal(target.kind, kind);
        return { kind: wrong ? "invalid" : kind, relation: expected, photo: expected };
      },
    } });
    const upload = load(`src/features/${feature}/repositories/photos/${name}.ts`)[name];
    const args = kind === "invitation" ? [id, file()] : [{ albumId: id, publicId: "wall", file: file() }];
    assert.equal(await upload(...args), expected);
    wrong = true;
    await assert.rejects(upload(...args));
  }
});

test("Photo Wall passes only public ID to reservation; no authenticated actor or arbitrary key", async () => {
  const h = uploadHarness();
  await h.upload({ kind: "photo-wall", publicId: "public-wall" }, file());
  const args = h.events[0][1];
  assert.equal(args.p_public_id, "public-wall");
  assert.equal(args.p_actor_id, null);
  assert.equal(args.p_product_id, null);
  assert.equal(Object.hasOwn(args, "p_image_path"), false);
  await assert.rejects(h.upload({ ...target, storageKey: "foreign/path" }, file()));
});

test("repository calls installed server RPC and rejects unchecked/malformed return data", async () => {
  const calls = [];
  let response = { id, storage_key: key, expires_at: new Date(Date.now() + 86400000).toISOString() };
  const load = loader({ "@/lib/supabase/admin": { createAdminClient: () => ({ rpc: async (name, args) => {
    calls.push({ name, args }); return { data: response, error: null };
  } }) } });
  const repo = load("src/features/project-photos/storage/storageLifecycleRepository.ts");
  const args = { p_id: id, p_kind: "invitation", p_product_id: id, p_public_id: null, p_actor_id: id };
  assert.equal((await repo.reserveStorageUpload(args)).storage_key, key);
  assert.equal(calls[0].name, "storage_reserve_upload");
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].args)), args);
  response = { id, storage_key: "../foreign/file.webp" };
  await assert.rejects(repo.reserveStorageUpload(args));
  response = { kind: "invitation", relation: { photo_id: id, invitation_id: id, created_at: "date", description: null } };
  assert.equal((await repo.finalizeStorageUpload({ p_id: id, p_file_size: 5, p_description: null })).kind, "invitation");
  assert.equal(calls.at(-1).name, "storage_finalize_upload");
});

test("worker only deletes claimed keys and reports success/failure with lease token", async () => {
  const calls = [];
  const load = loader({
    "./storageLifecycleRepository": {
      claimStorageCleanup: async () => [{ object_id: id, storage_key: key, lease_token: id, finalized: true }],
      finishStorageCleanup: async (...args) => calls.push(args),
    },
    "@/lib/upload/bunny": { deleteFromBunny: async value => { assert.equal(value, key); } },
  });
  const result = await load("src/features/project-photos/storage/runStorageCleanup.ts").runStorageCleanup();
  assert.equal(result.completed, 1);
  assert.deepEqual(calls[0], [id, id, true]);
  const failed = loader({
    "./storageLifecycleRepository": {
      claimStorageCleanup: async () => [{ object_id: id, storage_key: key, lease_token: id, finalized: true }],
      finishStorageCleanup: async (...args) => calls.push(args),
    },
    "@/lib/upload/bunny": { deleteFromBunny: async () => { throw new Error("mocked Bunny failure"); } },
  });
  assert.equal((await failed("src/features/project-photos/storage/runStorageCleanup.ts").runStorageCleanup()).failed, 1);
  assert.deepEqual(calls.at(-1), [id, id, false]);
});

test("Bunny adapter rejects foreign/traversal/URL/directory keys; accepts DELETE 404", async () => {
  const requests = [];
  const load = loader({}, {
    process: { env: { BUNNY_STORAGE_ZONE: "fake-zone", BUNNY_STORAGE_REGION: "de", BUNNY_STORAGE_PASSWORD: "fake-test-key" } },
    fetch: async (url, options) => { requests.push({ url, options }); return new Response(null, { status: 404 }); },
  });
  const bunny = load("src/lib/upload/bunny.ts");
  for (const invalid of ["../x.webp", "https://foreign/x.webp", `/${key}`, `projects/${id}/photos/`, key.replace("photos", "../photos")]) {
    await assert.rejects(bunny.deleteFromBunny(invalid));
  }
  assert.equal(requests.length, 0);
  await bunny.deleteFromBunny(key);
  assert.equal(requests[0].options.method, "DELETE");
  assert.equal(requests.length, 1);
});

test("Bunny failure does not expose response body; PUT uses canonical key and bounded request", async () => {
  let request;
  const load = loader({}, {
    process: { env: { BUNNY_STORAGE_ZONE: "fake", BUNNY_STORAGE_REGION: "de", BUNNY_STORAGE_PASSWORD: "fake-secret" } },
    fetch: async (_, options) => { request = options; return new Response("sensitive-upstream-body", { status: 500 }); },
  });
  await assert.rejects(load("src/lib/upload/bunny.ts").uploadToBunny(new ArrayBuffer(1), key, "image/webp"), error => {
    assert.equal(error.message, "Bunny upload failed");
    return true;
  });
  assert.equal(request.method, "PUT");
  assert.ok(request.signal);
});

test("scheduler endpoint is disabled by default and rejects missing/wrong credentials without running worker", async () => {
  let calls = 0;
  const worker = { runStorageCleanup: async () => { calls++; return { completed: 0, failed: 0 }; } };
  const route = "src/app/api/internal/storage-cleanup/route.ts";
  const mocks = { "@/features/project-photos/storage/runStorageCleanup": worker };
  assert.equal((await loader(mocks)(route).POST(new Request("http://local"))).status, 503);
  const secret = "x".repeat(32);
  const post = loader(mocks, { process: { env: { STORAGE_CLEANUP_ENABLED: "true", STORAGE_CLEANUP_SECRET: secret } } })(route).POST;
  assert.equal((await post(new Request("http://local"))).status, 401);
  assert.equal(calls, 0);
  assert.equal((await post(new Request("http://local", { headers: { authorization: `Bearer ${secret}` } }))).status, 200);
  assert.equal(calls, 1);
});

test("SQL package has durable ledger/jobs, alias guards, state gates and explicitly closed arbitrary-path RPCs (structural only)", () => {
  const install = path.join(root, "docs/storage-lifecycle/install");
  const prepare = fs.readdirSync(install, { recursive: true })
    .filter(file => file.endsWith(".sql") && !path.basename(file).startsWith("018"))
    .map(file => fs.readFileSync(path.join(install, file), "utf8")).join("\n");
  const activate = prepare + fs.readFileSync(path.join(install, "activation/018_ACTIVATE.sql"), "utf8");
  assert.match(prepare, /references private\.storage_objects\(id\)/);
  assert.doesNotMatch(prepare, /references public\.projects/);
  assert.match(prepare, /p\.id <> o\.id/);
  assert.match(prepare, /state = 'quarantined'/);
  assert.match(prepare, /if o\.state = 'ready' then return o\.result/);
  assert.match(prepare, /j\.lease_token is distinct from p_lease_token/);
  assert.match(activate, /o\.state <> 'ready'/);
  assert.match(activate, /from public, anon, authenticated, service_role/);
  assert.match(activate, /after delete on public\.projects/);
  assert.match(activate, /unplacedPhotos/);
});

test("cleanup rejects old/unproven claims before any DELETE", async () => {
  let deletes = 0;
  for (const proof of [undefined, false]) {
    const load = loader({
      "./storageLifecycleRepository": {
        claimStorageCleanup: async () => [{ object_id: id, storage_key: key, lease_token: id, finalized: proof }],
        finishStorageCleanup: async () => { throw new Error("No acknowledgement expected"); },
      },
      "@/lib/upload/bunny": { deleteFromBunny: async () => { deletes++; } },
    });
    await assert.rejects(load("src/features/project-photos/storage/runStorageCleanup.ts").runStorageCleanup());
  }
  assert.equal(deletes, 0);
});

