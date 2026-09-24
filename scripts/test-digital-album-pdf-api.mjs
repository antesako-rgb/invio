// Exercise the real route control flow with isolated auth/repository/browser doubles.
// No Supabase connection, credentials, or production data.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHmac, randomBytes } from "node:crypto";
import ts from "typescript";

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const stateUrl = moduleUrl(`export const state = { user: true, userId: '550e8400-e29b-41d4-a716-446655440001', album: true, mode: 'success', generated: 0, queries: 0, authCalls: 0 };`);
const { state } = await import(stateUrl);
const replacements = {
  "next/headers": moduleUrl(`import {state} from '${stateUrl}';
    export async function headers() { const h = new Headers({host:'trusted.example'}); if(state.token) h.set('x-invio-pdf-render',state.token); return h; }
    export async function cookies() { return { getAll: () => [
    {name:'sb-test-auth-token.0',value:'fake-session'}, {name:'unrelated-cookie',value:'private'}
  ] }; }`),
  "next/server": moduleUrl(`export const NextResponse = { json: (value, init) => Response.json(value, init) };`),
  "zod": import.meta.resolve("zod"),
  "@/lib/supabase/server": moduleUrl(`import { state } from '${stateUrl}'; export async function createServerClient() {
    return { auth: { getUser: async () => { state.authCalls++; return { data: { user: state.user ? { id: state.userId } : null }, error: null }; } } };
  }`),
  "@/features/digital-albums/repositories/album/getDigitalAlbum": moduleUrl(`import {state} from '${stateUrl}';
    export async function getDigitalAlbum(id) { state.queries++; return state.album ? {id} : null; }`),
  "@/features/digital-albums/server/pdf/getDigitalAlbumPrintUrl": moduleUrl(`export function getDigitalAlbumPrintUrl(_, id) {
    return new URL('https://trusted.example/internal/digital-albums/'+id+'/render'); }`),
  "@/features/digital-albums/server/pdf/generateDigitalAlbumPdf": moduleUrl(`import {state} from '${stateUrl}';
    export class DigitalAlbumPdfError extends Error { constructor(stage,status) { super('secret-must-not-leak'); this.stage=stage; this.status=status; } }
    export async function generateDigitalAlbumPdf({ cookies }) {
      state.generated++; state.cookies = cookies;
      if (state.mode === 'capacity') throw new DigitalAlbumPdfError('capacity',503);
      if (state.mode === 'error') throw new Error('sensitive-url?token=secret');
      return Buffer.from('%PDF-fixture');
    }`),
};
const path = new URL("../src/app/api/digital-albums/[albumId]/pdf/route.ts", import.meta.url);
let source = ts.transpileModule(readFileSync(path, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
for (const [name, url] of Object.entries(replacements)) source = source.replaceAll(`"${name}"`, JSON.stringify(url));
const route = await import(moduleUrl(source));
const id = "550e8400-e29b-41d4-a716-446655440000";
const call = (albumId = id) => route.POST(new Request(`https://trusted.example/api/digital-albums/${albumId}/pdf`, { method: "POST" }), { params: Promise.resolve({ albumId }) });
const check = async (response, status) => {
  assert.equal(response.status, status);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.doesNotMatch(await response.text(), /secret|sensitive-url|fake-session/);
};

await check(await route.POST(new Request("https://trusted.example/api/pdf", {
  method: "POST", headers: { "Sec-Fetch-Site": "cross-site" },
}), { params: Promise.resolve({ albumId: id }) }), 403);
await check(await call("not-a-uuid"), 400);
assert.equal(state.authCalls, 0);
assert.equal(state.queries, 0);
state.user = false;
await check(await call(), 401);
assert.equal(state.queries, 0);
state.user = true; state.album = false;
await check(await call(), 404);
assert.equal(state.generated, 0);
state.album = true; state.mode = "capacity";
const capacity = await call();
assert.equal(capacity.headers.get("retry-after"), "10");
await check(capacity, 503);
state.mode = "error";
await check(await call(), 500);
state.mode = "success";
const success = await call();
assert.equal(success.status, 200);
assert.equal(success.headers.get("content-type"), "application/pdf");
assert.equal(success.headers.get("x-content-type-options"), "nosniff");
assert.equal(success.headers.get("content-disposition"), `attachment; filename="digital-album-${id}.pdf"`);
assert.equal(await success.text(), "%PDF-fixture");
assert.equal(state.cookies.length, 1);
assert.equal(state.cookies[0].domain, "trusted.example");
assert.equal(state.cookies[0].httpOnly, true);
assert.equal(state.cookies[0].secure, true);
assert.deepEqual(Object.keys(route).sort(), ["POST", "maxDuration", "runtime"]);
console.log("PASS: UUID rejection, 401, inaccessible-album 404, no premature browser launch, 503 Retry-After, sanitized errors, PDF headers, session-cookie filtering, POST-only route.");

function compiledModule(relativePath, imports) {
  let code = ts.transpileModule(readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  for (const [name, url] of Object.entries(imports)) code = code.replaceAll(`"${name}"`, JSON.stringify(url));
  return moduleUrl(code);
}

const previousEnv = { ...process.env };
try {
  process.env.PDF_RENDER_SECRET = randomBytes(32).toString("hex");
  process.env.VERCEL = "1";
  process.env.VERCEL_URL = "trusted.example";
  process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example";
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET = "fixture-bypass";
  const emptyModule = moduleUrl("export {};");
  const tokenModule = compiledModule("../src/features/digital-albums/server/pdf/pdfRenderAuthorization.ts", {
    "server-only": emptyModule, "zod": import.meta.resolve("zod"),
  });
  const { createPdfRenderToken, verifyPdfRenderToken } = await import(tokenModule);
  const originModule = compiledModule("../src/features/digital-albums/server/pdf/getDigitalAlbumPrintUrl.ts", { "server-only": emptyModule });
  const { getDigitalAlbumPrintUrl } = await import(originModule);
  const internalUrl = getDigitalAlbumPrintUrl("https://untrusted.example", id).href;
  assert.equal(internalUrl, `https://trusted.example/internal/digital-albums/${id}/render`);
  const rendererModule = moduleUrl("export default function PrintRenderer() {};");
  const { default: renderer } = await import(rendererModule);
  const pageModule = compiledModule("../src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx", {
    ...replacements,
    "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"),
    "next/navigation": moduleUrl("export function notFound() { const error = new Error('not found'); error.status = 404; throw error; }"),
    "@/features/digital-albums/server/pdf/getDigitalAlbumPrintUrl": originModule,
    "@/features/digital-albums/server/pdf/pdfRenderAuthorization": tokenModule,
    "@/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer": rendererModule,
    "@/features/digital-albums/repositories/photos/getDigitalAlbumPhotos": moduleUrl("export async function getDigitalAlbumPhotos() {return [];}"),
    "@/features/digital-albums/utils/parseDigitalAlbumDocument": moduleUrl("export function parseDigitalAlbumDocument() {return {theme:'classic',pages:[]};}"),
  });
  const { default: renderPage } = await import(pageModule);
  const callPage = () => renderPage({ params: Promise.resolve({albumId:id}) });
  const valid = createPdfRenderToken({albumId:id, userId:state.userId, origin:"https://trusted.example"});
  const signedChange = (changes) => {
    const claims = JSON.parse(Buffer.from(valid.split('.')[0], 'base64url').toString());
    const payload = Buffer.from(JSON.stringify({...claims,...changes})).toString('base64url');
    return `${payload}.${createHmac('sha256',Buffer.from(process.env.PDF_RENDER_SECRET,'hex')).update(payload).digest('base64url')}`;
  };
  const now = Math.floor(Date.now()/1000);
  for (const token of [null, "invalid", `${valid.slice(0,-4)}AAAA`,
    signedChange({iat:now-180,exp:now-60}),
    signedChange({albumId:"550e8400-e29b-41d4-a716-446655440002"}),
    signedChange({userId:"550e8400-e29b-41d4-a716-446655440002"}),
    signedChange({origin:"https://another-deployment.example"}),
    signedChange({purpose:"another-purpose"}),
    signedChange({iat:now+60,exp:now+120}), signedChange({exp:now+600})]) {
    state.token = token;
    await assert.rejects(callPage(), {status:404});
  }
  state.token = valid; state.user = false;
  await assert.rejects(callPage(), {status:404});
  state.user = true; state.album = false;
  await assert.rejects(callPage(), {status:404});
  state.album = true;
  assert.equal((await callPage()).type, renderer);
  assert.equal(existsSync(new URL("../src/app/[locale]/(standalone)/editor/album/[albumId]/print/page.tsx",import.meta.url)),false);

  // Exercise the actual generator's interceptor with browser doubles. All asset
  // requests start with forged sensitive headers, to prove explicit stripping.
  const browserModule = moduleUrl(`import {state} from '${stateUrl}';
    const frame={}; let handler;
    const page={ setDefaultTimeout(){},setDefaultNavigationTimeout(){},async setRequestInterception(){},
      on(event, fn){handler=fn;}, mainFrame(){return frame;}, async emulateMediaType(){},
      async goto(url){state.intercepted=[];
        const cases=[['main',url,true,frame,[]],['image',new URL('/image.png',url).href,false,frame,[]],
          ['cdn','https://cdn.example/photo.jpg',false,frame,[]],['other',new URL('/other',url).href,false,frame,[]],
          ['same-path-fetch',url,false,frame,[]],['iframe',url,true,{},[]],['redirect',url,true,frame,[{}]],
          ['external','https://other.example',true,frame,[]]];
        for(const [name,target,nav,requestFrame,chain] of cases){
          const result={name}; state.intercepted.push(result);
          handler({url:()=>target,method:()=> 'GET',isNavigationRequest:()=>nav,frame:()=>requestFrame,redirectChain:()=>chain,
            headers:()=>({'x-invio-pdf-render':'forged','x-vercel-protection-bypass':'forged',cookie:'fake',authorization:'fake'}),
            abort:async()=>{result.aborted=true;},continue:async({headers})=>{result.headers=headers;}});
        } state.printUrl=url; return {ok:()=>true}; },url:()=>state.printUrl,async pdf(){return new Uint8Array([37,80,68,70]);}};
    export default {async launch(){return {async newPage(){return page;},defaultBrowserContext(){return {async setCookie(){}};},async close(){}};}};`);
  const generatorModule = compiledModule("../src/features/digital-albums/server/pdf/generateDigitalAlbumPdf.ts", {
    "server-only": emptyModule, "puppeteer-core": browserModule,
    "./getPdfBrowserLaunchOptions": moduleUrl("export async function getPdfBrowserLaunchOptions(){return {}; }"),
    "./waitForDigitalAlbumPrintReady": moduleUrl("export async function waitForDigitalAlbumPrintReady(){}"),
    "./pdfRenderAuthorization": tokenModule,
  });
  const { generateDigitalAlbumPdf: generateInternal } = await import(generatorModule);
  await generateInternal({printUrl:internalUrl,albumId:id,userId:state.userId,cookies:[]});
  for(const result of state.intercepted) {
    if(result.name==='main') assert.ok(verifyPdfRenderToken(result.headers['x-invio-pdf-render'],{albumId:id,origin:'https://trusted.example'}));
    else assert.equal(result.headers?.['x-invio-pdf-render'],undefined,result.name);
    if(result.name==='cdn') for(const name of ['cookie','authorization','x-vercel-protection-bypass']) assert.equal(result.headers[name],undefined);
    if(result.name==='external') assert.equal(result.aborted,true);
  }
  console.log("PASS: internal page 404 for missing/invalid/tampered/expired/wrong album/user/origin/purpose tokens, invalid lifetime, missing session and denied RLS; authorized render; old route removed; token absent from assets/CDN/fetch/iframes/redirects.");
} finally {
  for(const key of ['PDF_RENDER_SECRET','VERCEL','VERCEL_URL','NEXT_PUBLIC_CDN_URL','VERCEL_AUTOMATION_BYPASS_SECRET']) {
    if(previousEnv[key]===undefined) delete process.env[key]; else process.env[key]=previousEnv[key];
  }
}
