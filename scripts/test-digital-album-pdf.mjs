// Real local-Chrome smoke test of the production PDF generator, with isolated
// HTTP fixtures. No Supabase credentials, user data or running app required.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const pdfRoot = new URL("../src/features/digital-albums/server/pdf/", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(pdfRoot.href)) {
      if (specifier === "server-only") {
        return { url: "data:text/javascript,export{}", shortCircuit: true };
      }
      if (specifier.startsWith("./")) {
        return { url: new URL(`${specifier}.ts`, context.parentURL).href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(pdfRoot.href) && url.endsWith(".ts")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText;
      return { format: "module", source, shortCircuit: true };
    }
    return next(url, context);
  },
});

const { getDigitalAlbumPrintUrl } = await import(new URL("getDigitalAlbumPrintUrl.ts", pdfRoot));
const { generateDigitalAlbumPdf } = await import(new URL("generateDigitalAlbumPdf.ts", pdfRoot));
const savedEnv = { ...process.env };
const restore = (key) => {
  if (savedEnv[key] === undefined) delete process.env[key];
  else process.env[key] = savedEnv[key];
};

try {
  process.env.VERCEL = "1";
  process.env.VERCEL_URL = "invio-fixture.vercel.app";
  assert.equal(getDigitalAlbumPrintUrl("https://attacker.invalid", "album").origin,
    "https://invio-fixture.vercel.app");
  delete process.env.VERCEL_URL;
  assert.throws(() => getDigitalAlbumPrintUrl("https://attacker.invalid", "album"));
  delete process.env.VERCEL;
  process.env.NODE_ENV = "production";
  assert.equal(getDigitalAlbumPrintUrl("http://localhost:3000/api", "album").origin, "http://localhost:3000");
  process.env.NODE_ENV = "development";
  assert.throws(() => getDigitalAlbumPrintUrl("https://attacker.invalid", "album"));

  const loaded = new Set();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
  const server = createServer((req, res) => {
    if (req.url.startsWith("/image") || req.url === "/background") {
      setTimeout(() => {
        loaded.add(req.url);
        res.writeHead(200, { "Content-Type": "image/png" });
        res.end(png);
      }, 150);
      return;
    }
    if (req.url === "/broken-image") { res.writeHead(404); res.end(); return; }
    if (!req.headers.cookie?.includes("sb-fixture-auth-token=session")) {
      res.writeHead(401); res.end(); return;
    }
    if (req.url === "/redirect") { res.writeHead(302, { Location: "/login" }); res.end(); return; }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!doctype html><style>
      @page {size:440px 640px;margin:0} body{margin:0}
      section{width:440px;height:640px;break-after:page;background-image:url('/background')}
      section:last-child{break-after:auto} img{width:100px;height:100px}
      </style><div id="album">
      ${[0, 1, 2].map((i) => `<section>Page ${i + 1}<img loading="lazy" src="${req.url === "/broken" ? "/broken-image" : `/image${i}`}"></section>`).join("")}
      </div><script>setTimeout(()=>document.querySelector('#album').dataset.albumPrintHydrated='true',100)</script>`);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const cookies = [{ name: "sb-fixture-auth-token", value: "session", domain: "127.0.0.1", path: "/" }];
  try {
    const pdf = await generateDigitalAlbumPdf({ printUrl: `${origin}/album`, cookies });
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.equal((pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length, 3);
    for (const path of ["/image0", "/image1", "/image2", "/background"]) assert.ok(loaded.has(path), path);
    await assert.rejects(generateDigitalAlbumPdf({ printUrl: `${origin}/album`, cookies: [] }), { stage: "navigation" });
    await assert.rejects(generateDigitalAlbumPdf({ printUrl: `${origin}/redirect`, cookies }), { stage: "navigation" });
    await assert.rejects(generateDigitalAlbumPdf({ printUrl: `${origin}/broken`, cookies }), { stage: "assets" });
    console.log("PASS: trusted origins, local Chrome, session cookies, hydration, lazy images, CSS backgrounds, 3-page PDF, unauthorized/redirect/broken-image rejection.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
} finally {
  for (const key of ["VERCEL", "VERCEL_URL", "NODE_ENV"]) restore(key);
}
