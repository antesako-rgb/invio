/* eslint-disable @typescript-eslint/no-require-imports */
// Local-only validation. No networking, SQL execution, environment or CLI access.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const repository = path.dirname(root);
const json = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const coverage = json("coverage.json");
const expected = json("profiles-projects.expected.json");
const errors = [];
const fail = message => errors.push(message);
const statuses = new Set(coverage.status_values);
const ids = new Set();
const counts = {};
const resolve = relative => {
  const full = path.resolve(repository, relative);
  if (!full.startsWith(root + path.sep)) throw new Error("Path outside supabase: " + relative);
  return full;
};

for (const object of coverage.objects) {
  if (ids.has(object.id)) fail("Duplicate object: " + object.id);
  ids.add(object.id);
  for (const field of ["status", "preparation_status", "dev_comparison_status"])
    if (!statuses.has(object[field])) fail("Invalid " + field + ": " + object.id);
  if (object.status === "verified" && (object.preparation_status !== "prepared" || object.dev_comparison_status !== "verified"))
    fail("Unjustified verified state: " + object.id);
  if (object.preparation_status !== "not_started" && !fs.existsSync(resolve(object.canonical_path)))
    fail("Missing prepared canonical file: " + object.canonical_path);
  counts[object.type] ??= { total: 0, verified: 0 };
  counts[object.type].total++;
  if (object.status === "verified") counts[object.type].verified++;
}
for (const object of coverage.objects) {
  for (const dependency of object.dependencies)
    if (!ids.has(dependency) && !/^(platform|external):/.test(dependency)) fail("Unknown dependency: " + dependency);
}
for (const type of Object.keys(counts)) {
  if (JSON.stringify(counts[type]) !== JSON.stringify(coverage.counts[type])) fail("Stale count: " + type);
}

const declarations = new Map();
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === ".temp") return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
for (const file of walk(path.join(root, "schemas")).filter(f => f.endsWith(".sql"))) {
  const sql = fs.readFileSync(file, "utf8");
  for (const match of sql.matchAll(/\bcreate\s+(?:or\s+replace\s+)?(table|function)\s+((?:public|private)\.[a-z_][a-z_0-9]*)/gi)) {
    const id = match[1].toLowerCase() + ":" + match[2];
    if (declarations.has(id)) fail("Duplicate canonical declaration: " + id);
    declarations.set(id, file);
  }
}
for (const fn of expected.functions) {
  const object = coverage.objects.find(o => o.type === "function" && o.schema === fn.schema && o.name === fn.name);
  if (!object) { fail("Function missing from coverage: " + fn.name); continue; }
  const sql = fs.readFileSync(resolve(object.canonical_path), "utf8");
  const body = sql.match(/\bas\s+(\$[a-z_0-9]*\$)([\s\S]*?)\1/i)?.[2];
  if (body === undefined || crypto.createHash("md5").update(body.replace(/\r/g, "")).digest("hex") !== fn.body_lf_md5)
    fail("Function body differs from expected DEV capture: " + fn.name);
  const signature = fn.signature.startsWith(fn.schema + ".") ? fn.signature : fn.schema + "." + fn.signature;
  if (!sql.includes("REVOKE ALL ON FUNCTION " + signature + " FROM PUBLIC, anon, authenticated, service_role;"))
    fail("Missing explicit function ACL: " + fn.name);
}
for (const table of expected.tables) {
  const object = coverage.objects.find(o => o.type === "table" && o.name === table.name && o.schema === table.schema);
  const sql = fs.readFileSync(resolve(object.canonical_path), "utf8");
  for (const constraint of table.constraints)
    if (!sql.includes("CONSTRAINT " + constraint.name + " ")) fail("Constraint missing from canonical: " + constraint.name);
}
const assertSql = fs.readFileSync(path.join(root, "verify/assert/profiles_projects.sql"), "utf8");
const embedded = assertSql.match(/\$expected\$([\s\S]*?)\$expected\$::jsonb/)?.[1];
if (!embedded || JSON.stringify(JSON.parse(embedded)) !== JSON.stringify(expected)) fail("Assert and expected JSON drift");
for (const file of walk(path.join(root, "verify")).filter(f => f.endsWith(".sql"))) {
  const sql = fs.readFileSync(file, "utf8");
  if (!sql.includes("begin read only;") || !sql.trimEnd().endsWith("rollback;")) fail("Missing read-only transaction: " + file);
  if (/^\s*(create|alter|drop|truncate|insert|update|delete|grant|revoke|execute|perform)\b/im.test(sql)) fail("Unexpected SQL command in verify: " + file);
}

const hashFiles = walk(root).filter(f => /\.(sql|json|cjs|md)$/.test(f) && path.basename(f) !== "files.sha256.json");
const currentFiles = hashFiles.map(file => ({ path: path.relative(repository, file).split(path.sep).join("/"),
  sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") })).sort((a, b) => a.path.localeCompare(b.path));
const checksumPath = path.join(__dirname, "files.sha256.json");
if (process.argv.includes("--record-checksums")) {
  if (errors.length) fail("Checksums not recorded because validation failed");
  else fs.writeFileSync(checksumPath, JSON.stringify({ schema_version: 1, algorithm: "SHA-256", files: currentFiles }, null, 2) + "\n");
} else if (!fs.existsSync(checksumPath)) fail("Missing checksum manifest");
else if (JSON.stringify(json("files.sha256.json").files) !== JSON.stringify(currentFiles)) fail("Local file checksums changed; review SQL/statuses before recording new checksums");

if (errors.length) {
  errors.forEach(message => console.error("FAIL: " + message));
  process.exitCode = 1;
} else console.log(JSON.stringify({ result: "PASS", counts, remote_access: false, runtime_verified: false }, null, 2));
