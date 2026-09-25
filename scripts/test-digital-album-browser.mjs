// Isolated browser regression harness. Actual album components/CSS/hooks; Next Image,
// next-intl, dialog chrome and server actions are doubles. No Supabase or user data.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  readFileSync,
  readdirSync,
  existsSync,
  statSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import puppeteer from "puppeteer-core";
import ts from "typescript";
const require = createRequire(import.meta.url);
const project = process.cwd();
const base = resolve(project, "src/features/digital-albums");
const modules = new Map();
const css = [];
const translations = JSON.parse(
  readFileSync("src/messages/hr/digital-album-editor.json", "utf8"),
);
const messages = translations.DigitalAlbumEditor ?? translations;
const virtual = {
  sonner: "exports.toast={error:()=>{},info:()=>{},success:()=>{}};",
  "editor-shell-double":
    'const R=require("react");module.exports={__esModule:true,default:(p)=>{R.useEffect(()=>{window.viewHeader=p.headerProps;window.viewMobile=p;});return R.createElement("div",null,p.sidebar,p.children,window.integratedMobile?R.createElement(require("@/features/editor/components/EditorMobilePanel/EditorMobilePanel").default,{open:p.mobilePanelOpen,onOpenChange:p.onMobilePanelOpenChange,snapPoint:p.mobileSnapPoint,onSnapPointChange:p.onMobileSnapPointChange,handleOnly:true},R.createElement("button",{id:"assign-mobile-photo",onClick:()=>window.viewSidebar.onSelectPhoto("photo0")},"Choose photo")):null);}};',
  "editor-sidebar-double":
    'const R=require("react");module.exports={__esModule:true,default:(p)=>{R.useEffect(()=>{window.viewSidebar=p;});return null;}};',
  "confirm-double":
    'const R=require("react");module.exports={__esModule:true,default:(p)=>{R.useEffect(()=>{window.viewConfirm=p;});return p.open?R.createElement("div",{role:"alertdialog"},R.createElement("button",{id:"confirm-cover",onClick:p.onConfirm},p.confirmText),R.createElement("button",{id:"cancel-cover",onClick:p.onClose},p.cancelText)):null;}};',

  "next/image":
    'const R=require("react"); module.exports={__esModule:true,default:({fill,sizes,style,...p})=>R.createElement("img",{...p,style:{...(fill?{position:"absolute",inset:0,width:"100%",height:"100%"}:{}),...style}})};',
  "next-intl":
    'exports.useTranslations=(namespace)=>(key,values={})=>{let v=window.messages;for(const part of (namespace.replace(/^DigitalAlbumEditor\\.?/,"")+"."+key).split(".").filter(Boolean))v=v?.[part];return typeof v==="string"?v.replace(/\\{(\\w+)\\}/g,(_,k)=>values[k]??k):key;};',
  "lucide-react":
    'const R=require("react"); module.exports=new Proxy({},{get:(_,name)=>name==="__esModule"?true:(p)=>R.createElement("svg",{...p,"data-icon":String(name)})});',
  "dialog-double":
    'const R=require("react");exports.Dialog=({open,children,onOpenChange})=>open?R.createElement("div",{"data-test-dialog":true},R.createElement("button",{"data-test-close":true,onClick:()=>onOpenChange(false)},"X"),children):null; exports.DialogContent=({children})=>R.createElement("section",null,children);exports.DialogHeader=({children})=>R.createElement("header",null,children);exports.DialogTitle=({children})=>R.createElement("h2",null,children);',
  "upload-double":
    'exports.uploadDigitalAlbumPhotoAction=async(_album,file)=>{window.uploadCalls.push(file.name);await new Promise(r=>setTimeout(r,30));const outcome=window.uploadOutcomes.shift();if(outcome==="throw")throw new Error("network uncertainty");return outcome==="fail"?{success:false,message:"failed"}:{success:true,data:{id:file.name}};};',
  "preview-double":
    'exports.createPhotoPreview=async(file)=>{if(file.name==="bad.jpg")throw new Error("decode");return URL.createObjectURL(file);};',
  "save-double":
    'exports.updateDigitalAlbumDocumentAction=async(input)=>{window.saveCalls.push(input);await new Promise(r=>setTimeout(r,25));return window.failSave?{success:false,message:"offline"}:await fetch("/save",{method:"POST",body:JSON.stringify(input)}).then(r=>r.json());};',
};
function resolveModule(specifier, parent) {
  if (virtual[specifier]) return specifier;
  if (specifier.endsWith("DigitalAlbumEditor/DigitalAlbumEditor"))
    return "editor-shell-double";
  if (specifier.endsWith("DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar"))
    return "editor-sidebar-double";
  if (specifier.endsWith("ui/common/ConfirmDialog")) return "confirm-double";
  if (specifier.includes("components/ui/dialog/dialog")) return "dialog-double";
  if (specifier.includes("uploadDigitalAlbumPhotoAction"))
    return "upload-double";
  if (specifier.includes("createPhotoPreview")) return "preview-double";
  if (specifier.includes("updateDigitalAlbumDocumentAction"))
    return "save-double";
  const candidate = specifier.startsWith("@/")
    ? resolve(project, "src", specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(parent), specifier)
      : null;
  if (candidate)
    for (const suffix of ["", ".ts", ".tsx", ".js", "/index.js"])
      if (
        existsSync(candidate + suffix) &&
        statSync(candidate + suffix).isFile()
      )
        return candidate + suffix;
  return require.resolve(specifier, { paths: [dirname(parent), project] });
}
function add(id) {
  if (modules.has(id)) return id;
  modules.set(id, "");
  let code;
  if (virtual[id]) code = virtual[id];
  else if (id.endsWith(".css")) {
    let text = readFileSync(id, "utf8");
    let mapping = {};
    if (id.endsWith(".module.css")) {
      const prefix = "c" + modules.size + "_";
      text = text.replace(/\.([A-Za-z_][\w-]*)/g, (_, name) => {
        mapping[name] = prefix + name;
        return "." + prefix + name;
      });
    }
    css.push(text);
    code = "module.exports=" + JSON.stringify(mapping) + ";";
  } else {
    code = readFileSync(id, "utf8");
    if (/\.[cm]?[jt]sx?$/.test(id))
      code = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      }).outputText;
  }
  code = code.replace(
    /require\(["']([^"']+)["']\)/g,
    (_, specifier) =>
      "require(" +
      JSON.stringify(
        add(
          resolveModule(
            specifier,
            id.startsWith(project) ? id : resolve(project, "entry.js"),
          ),
        ),
      ) +
      ")",
  );
  modules.set(id, code);
  return id;
}
const entries = {
  PagesPanel: add(
    resolve(
      base,
      "editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx",
    ),
  ),
  Panel: add(
    resolve(
      project,
      "src/features/editor/components/EditorMobilePanel/EditorMobilePanel.tsx",
    ),
  ),

  View: add(
    resolve(
      base,
      "editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx",
    ),
  ),
  React: add(require.resolve("react")),
  client: add(require.resolve("react-dom/client")),
  Page: add(
    resolve(
      base,
      "components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer.tsx",
    ),
  ),
  Book: add(
    resolve(
      base,
      "components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx",
    ),
  ),
  Print: add(
    resolve(
      base,
      "components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer.tsx",
    ),
  ),
  Upload: add(resolve(base, "editor/hooks/useDigitalAlbumUpload.ts")),
  Editor: add(
    resolve(base, "editor/hooks/album-editor/useDigitalAlbumEditor.ts"),
  ),
  Crop: add(
    resolve(
      base,
      "editor/components/DigitalAlbumPhotoPositionEditor/DigitalAlbumPhotoPositionEditor.tsx",
    ),
  ),
  Overflow: add(resolve(base, "utils/getDigitalAlbumTextOverflow.ts")),
  Layouts: add(resolve(base, "config/digitalAlbumLayouts.ts")),
};
add(
  resolve(
    base,
    "components/album-renderer/themes/classic/DigitalAlbumClassicTheme.css",
  ),
);
add(
  resolve(base, "components/album-renderer/themes/DigitalAlbumPageTokens.css"),
);
const app = `
const R=req(${JSON.stringify(entries.React)}), {createRoot}=req(${JSON.stringify(entries.client)});
const useUpload=req(${JSON.stringify(entries.Upload)}).useDigitalAlbumUpload;
const View=req(${JSON.stringify(entries.View)}).default;
const Book=req(${JSON.stringify(entries.Book)}).default;
const Page=req(${JSON.stringify(entries.Page)}).default, Print=req(${JSON.stringify(entries.Print)}).default;
const useEditor=req(${JSON.stringify(entries.Editor)}).default,Crop=req(${JSON.stringify(entries.Crop)}).default;
const {getDigitalAlbumTextOverflow}=req(${JSON.stringify(entries.Overflow)});
const definitions=req(${JSON.stringify(entries.Layouts)}).DIGITAL_ALBUM_LAYOUTS;
const pages=[];
for(const d of Object.values(definitions))for(const version of d.legacy?[1,2]:[2])pages.push({
 id:d.id+"-"+version,layout:d.id,...(version===2?{layoutVersion:2}:{}),
 photos:d.slots.map((_,i)=>({id:d.id+"-"+version+"-slot"+i,photoId:"photo"+i,position:{x:.25,y:.75},caption:""})),
 content:{title:"\u017deljka & \u0160ime",subtitle:"Na\u0161 dan",date:"24. rujna 2026.",text:d.id==="collage"?"09":"Jedan dan. Tisu\u0107u uspomena."}
});
const photos=[0,1,2].map(i=>({id:"photo"+i,imagePath:"photo"+i+".svg",description:null}));
window.fixtures={pages,photos};window.saveCalls=[];window.failSave=false;
window.uploadCalls=[];window.uploadOutcomes=[];window.uploadProgress=[];
function UploadFixture(){
 const upload=useUpload({albumId:"fixture",invalidFilesError:"invalid",tooManyFilesError:"too many",uploadError:"failed",uncertainError:"uncertain",onSuccess:()=>{},onProgress:photos=>window.uploadProgress.push(...photos)});
 R.useEffect(()=>{window.upload=upload;});return R.createElement("div",null,upload.error);
}
function EdgeBook(){
 const [count,setCount]=R.useState(0),[active,setActive]=R.useState(0),[visible,setVisible]=R.useState([]);
 R.useEffect(()=>{window.edge={count,active,visible,setCount,setActive,setVisible};});
 return R.createElement(Book,{key:count,document:{theme:"classic",pages:pages.slice(0,count)},photos,activePageIndex:active,onPageChange:setActive,onVisiblePagesChange:setVisible});
}
const PagesPanel=req(${JSON.stringify(entries.PagesPanel)}).default;
const Panel=req(${JSON.stringify(entries.Panel)}).default;
function DrawerFixture(){
 const [open,setOpen]=R.useState(true),[snap,setSnap]=R.useState(.23),[tab,setTab]=R.useState("photos"),[items,setItems]=R.useState(pages.slice(0,6));
 R.useEffect(()=>{window.drawerFixture={open,snap,setOpen,setSnap,tab,setTab,items};});
 return R.createElement(Panel,{open,onOpenChange:setOpen,snapPoint:snap,onSnapPointChange:setSnap,handleOnly:true},
 tab==="pages"?R.createElement(PagesPanel,{pages:items,photos:[],activePageId:items[0].id,visiblePageIndexes:[0],onSelectPage:()=>{},onAddPage:()=>{},onDuplicatePage:()=>{},onDeletePage:()=>{},onSwapPages:(a,b)=>setItems(current=>{const next=[...current],i=next.findIndex(p=>p.id===a),j=next.findIndex(p=>p.id===b);[next[i],next[j]]=[next[j],next[i]];return next;})}):R.createElement("div",{id:"drawer-scroll-content"},Array.from({length:50},(_,i)=>R.createElement("p",{key:i},"Content "+i))));
}
function App(){
 const [mode,setMode]=R.useState("gallery"),[crop,setCrop]=R.useState(false),[cropOptions,setCropOptions]=R.useState({ratio:.5,image:0});
 const editor=useEditor({albumId:"fixture",initialDocument:window.savedAlbum?.document??{theme:"classic",pages},documentVersion:window.savedAlbum?.document_version??1,documentRevision:window.savedAlbum?.document_revision??1});
 const page=editor.document.pages.find(p=>p.id===editor.activePageId)||editor.document.pages[0];
 R.useEffect(()=>{window.harness={editor,setMode,setCrop,setCropOptions,overflow:()=>getDigitalAlbumTextOverflow(document)};});
 if(mode==="drawer")return R.createElement(DrawerFixture);
 if(mode==="view")return R.createElement(View,{albumId:"fixture",document:window.savedAlbum.document,documentVersion:1,documentRevision:window.savedAlbum.document_revision,photos:photos.map(p=>({photo_id:p.id,description:p.description,photo:{image_path:p.imagePath}})),photoWalls:[]});
 if(mode==="edges")return R.createElement(EdgeBook);
 if(mode==="upload")return R.createElement(UploadFixture);
 if(mode==="viewer")return R.createElement(Book,{document:editor.document,photos});
 if(mode==="book")return R.createElement(Book,{document:editor.document,photos,activePageIndex:editor.activePageIndex,
 activePhotoSlotId:editor.activePhotoSlotId,visiblePageIndexes:editor.visiblePageIndexes,onPageChange:editor.handleFlipBookPageChange,
 onVisiblePagesChange:editor.handleVisiblePagesChange,onSelectPhotoSlot:editor.selectPhotoSlot,onPageContentChange:editor.updatePageContent});
 if(mode==="print")return R.createElement(Print,{document:editor.document,photos});
 if(mode==="gallery")return R.createElement("main",{className:"gallery","data-album-theme":"classic"},editor.document.pages.map(p=>R.createElement("section",{key:p.id},
 R.createElement("p",null,p.id),R.createElement("div",{className:"sheet","data-album-page":p.id},R.createElement(Page,{page:p,photos})))));
 return R.createElement("main",{"data-album-theme":"classic"},
 R.createElement("button",{id:"undo",onClick:editor.undo},"Undo"),
 R.createElement("div",{id:"status"},editor.saveStatus),
 R.createElement("div",{className:"sheet editing","data-album-page":page.id},R.createElement(Page,{
 page,photos,activePhotoSlotId:editor.activePhotoSlotId,onSelectPhotoSlot:id=>editor.selectPhotoSlot(page.id,id),
 onPageContentChange:content=>editor.updatePageContent(page.id,content)})),
 crop?R.createElement(Crop,{slot:page.photos[0],imageUrl:location.origin+"/photo"+cropOptions.image+".svg",aspectRatio:cropOptions.ratio,allowContain:page.layout!=="full-photo",inheritedCaption:"Inherited caption",
 onApply:slot=>{editor.updateSlot(slot.id,()=>slot);setCrop(false)},onCancel:()=>setCrop(false)}):null);
}
createRoot(document.getElementById("app")).render(R.createElement(App));
`;
const bundle = `window.messages=${JSON.stringify(messages)};const process={env:{NODE_ENV:"production",NEXT_PUBLIC_CDN_URL:location.origin}};const mods={${[...modules].map(([id, code]) => JSON.stringify(id) + ":function(module,exports,require){" + code + "\n}").join(",")}};const cache={};function req(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};mods[id](m,m.exports,req);return m.exports;}\n${app}`;
const fontFaces = existsSync(".next/static/chunks")
  ? readdirSync(".next/static/chunks")
      .filter((name) => name.endsWith(".css"))
      .flatMap((name) =>
        (
          readFileSync(".next/static/chunks/" + name, "utf8").match(
            /@font-face\{[^}]+\}/g,
          ) ?? []
        )
          .filter((block) => /font-family:(Marcellus|Allura);/.test(block))
          .map((block) => block.replaceAll("../media/", "/fonts/")),
      )
  : [];
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#e9e7e1}button{padding:8px}textarea{font:16px sans-serif}[data-slot="switch"]{display:inline-block;width:44px;height:24px}.gallery{display:grid;grid-template-columns:repeat(3,220px);gap:20px}.gallery p{font:12px sans-serif}.sheet{width:220px;height:320px;container-type:inline-size;overflow:hidden;position:relative;background:#fff8f8}.editing{width:min(440px,100vw - 32px);height:min(640px,calc((100vw - 32px) * 16 / 11));aspect-ratio:11/16}.sheet img{max-width:100%}[data-album-theme]{--font-marcellus:Marcellus,Georgia;--font-allura:Allura,cursive}${fontFaces.join("\n")}${css.join("\n")}</style><div id="app"></div><script>${bundle.replaceAll("</script", "<\\/script")}</script>`;
let savedAlbum = null;
const server = createServer((request, response) => {
  if (request.url === "/save" && request.method === "POST") {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const input = JSON.parse(body);
      response.setHeader("Content-Type", "application/json");
      if (input.documentRevision !== (savedAlbum?.document_revision ?? 1)) {
        response.end(
          JSON.stringify({
            success: false,
            code: "CONFLICT",
            message: "Conflict",
          }),
        );
        return;
      }
      savedAlbum = {
        document: input.document,
        document_version: input.documentVersion,
        document_revision: input.documentRevision + 1,
      };
      response.end(JSON.stringify({ success: true, data: savedAlbum }));
    });
    return;
  }
  if (request.url?.match(/^\/photo[0-2]\.svg/)) {
    const index = Number(request.url[6]);
    const [w, h] = [
      [600, 900],
      [900, 600],
      [700, 700],
    ][index];
    response.setHeader("Content-Type", "image/svg+xml");
    response.end(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${["#768675", "#c2aa8b", "#8f929b"][index]}"/><path d="M0 ${h} L${w / 2} ${h / 3} L${w} ${h}" fill="#f1eee3"/><circle cx="${w * 0.3}" cy="${h * 0.3}" r="${w * 0.13}" fill="#e3d4bd"/><text x="20" y="40" font-size="24">Photo ${index} ? ${w} ? ${h}</text></svg>`,
    );
  } else if (request.url?.match(/^\/fonts\/[\w.-]+\.woff2$/)) {
    response.setHeader("Content-Type", "font/woff2");
    response.end(
      readFileSync(
        resolve(project, ".next/static/media", request.url.slice(7)),
      ),
    );
  } else if (request.url?.startsWith("/digital-albums/")) {
    const path = resolve(project, "public", request.url.slice(1));
    if (existsSync(path)) {
      response.setHeader(
        "Content-Type",
        extname(path) === ".avif" ? "image/avif" : "image/png",
      );
      response.end(readFileSync(path));
    } else {
      response.writeHead(404);
      response.end();
    }
  } else {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      html.replace(
        "<script>",
        "<script>window.savedAlbum=" +
          JSON.stringify(savedAlbum).replaceAll("<", "\\u003c") +
          ";",
      ),
    );
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const executablePath =
  process.env.PDF_BROWSER_EXECUTABLE_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
let browser;
let stage = "launch";
try {
  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("fixture browser:", e.message);
  });
  await page.setViewport({ width: 1000, height: 900 });
  stage = "initial navigation";
  await page.goto("http://127.0.0.1:" + server.address().port, {
    waitUntil: "networkidle0",
  });
  stage = "mount";
  await page.waitForFunction(() => !!window.harness);
  assert.deepEqual(errors, []);
  if (process.argv.includes("--mobile-flow")) {
    stage = "integrated touch slot + real Drawer";
    await page.setViewport({
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
    });
    await page.waitForFunction(() => !!window.harness);
    await page.evaluate(() => {
      window.integratedMobile = true;
      const original = window.fixtures.pages.find(
        (p) => p.layout === "two-photos",
      );
      const empty = {
        ...original,
        photos: original.photos.map((s) => ({ ...s, photoId: null })),
      };
      window.savedAlbum = {
        document: { theme: "classic", pages: [empty] },
        document_revision: 1,
      };
      window.harness.setMode("view");
    });
    await page.waitForSelector("[data-album-photo-select]");
    for (let i = 0; i < 4; i++) {
      if (i) {
        await page.evaluate(() => window.viewSidebar.onRemovePhotoFromPage());
        await page.evaluate(() =>
          window.viewMobile.onMobilePanelOpenChange(false),
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      const bounds = await page.$eval("[data-album-photo-select]", (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      if (process.argv.includes("--mouse"))
        await page.mouse.click(bounds.x, bounds.y);
      else await page.touchscreen.tap(bounds.x, bounds.y);
      await new Promise((r) => setTimeout(r, 500));
      assert.deepEqual(
        await page.evaluate(() => ({
          open: window.viewMobile.mobilePanelOpen,
          snap: window.viewMobile.mobileSnapPoint,
        })),
        { open: true, snap: 1 },
      );
      assert.ok(
        Math.abs(
          await page.$eval(
            "[data-base-ui-swipe-ignore]",
            (el) => el.parentElement.getBoundingClientRect().top,
          ),
        ) < 2,
      );
      await page.tap("#assign-mobile-photo");
      await page.waitForFunction(
        () => window.viewMobile.mobileSnapPoint === 0.23,
      );
      assert.equal(
        await page.evaluate(
          () => window.viewSidebar.pages[0].photos[0].photoId,
        ),
        "photo0",
      );
      await page.waitForFunction(() => {
        const top = document
          .querySelector("[data-base-ui-swipe-ignore]")
          .parentElement.getBoundingClientRect().top;
        return Math.abs(top - innerHeight * 0.77) < 2;
      });
      await page.click("[data-base-ui-swipe-ignore] ~ button");
      await new Promise((r) => setTimeout(r, 400));
      assert.equal(
        await page.evaluate(() => window.viewMobile.mobilePanelOpen),
        false,
      );
      if (process.argv.includes("--mouse"))
        await page.mouse.click(bounds.x, bounds.y);
      else await page.touchscreen.tap(bounds.x, bounds.y);
      await new Promise((r) => setTimeout(r, 500));
      assert.deepEqual(
        await page.evaluate(() => ({
          open: window.viewMobile.mobilePanelOpen,
          snap: window.viewMobile.mobileSnapPoint,
        })),
        { open: true, snap: 0.23 },
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      `PASS: repeated ${process.argv.includes("--mouse") ? "mouse" : "touch"} empty/filled slots; full -> assignment -> default; explicit close/reopen`,
    );
  } else {
    assert.equal(
      await page.$$eval(".sheet", (elements) => elements.length),
      19,
    );
    const initialOverflow = await page.evaluate(() =>
      window.harness.overflow(),
    );
    assert.deepEqual(
      initialOverflow,
      [],
      "Short fixture text must fit every composition",
    );
    const artifactDir = resolve(project, ".next/album-audit");
    mkdirSync(artifactDir, { recursive: true });
    await page.screenshot({
      path: resolve(artifactDir, "layouts-desktop.png"),
      fullPage: true,
    });
    const before = await page.$eval(
      '[data-album-page="portrait-plate-2"] img',
      (img) => ({
        position: getComputedStyle(img).objectPosition,
        fit: getComputedStyle(img).objectFit,
      }),
    );
    stage = "print";
    await page.evaluate(() => window.harness.setMode("print"));
    await page.waitForSelector('[data-album-print-hydrated="true"]');
    const printStyle = await page.$eval(
      '[data-album-page="portrait-plate-2"] img',
      (img) => ({
        position: getComputedStyle(img).objectPosition,
        fit: getComputedStyle(img).objectFit,
      }),
    );
    assert.deepEqual(printStyle, before);
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
    });
    assert.equal(Buffer.from(pdf).subarray(0, 4).toString(), "%PDF");
    writeFileSync(resolve(artifactDir, "all-layouts.pdf"), pdf);
    await page.emulateMediaType("screen");
    await page.evaluate(() => {
      window.harness.editor.selectPage("editorial-2");
      window.harness.setMode("edit");
    });
    await page.waitForSelector(".editing [data-album-text] button");
    stage = "text editing";
    await page.click(".editing [data-album-text] button");
    await page.waitForFunction(
      () => document.activeElement?.getAttribute("contenteditable") === "true",
    );
    await page.keyboard.press("End");
    await page.keyboard.type(" TEST");
    await page.click("#status");
    await page.waitForFunction(() =>
      window.harness.editor.document.pages
        .find((p) => p.id === "editorial-2")
        .content.title.endsWith("TEST"),
    );
    await page.waitForFunction(
      () => window.harness.editor.saveStatus === "saved",
    );
    await page.click("#undo");
    await page.waitForFunction(
      () =>
        !window.harness.editor.document.pages
          .find((p) => p.id === "editorial-2")
          .content.title.endsWith("TEST"),
    );
    stage = "mobile editing";
    await page.setViewport({ width: 390, height: 844 });
    await page.click(".editing [data-album-text] button");
    await page.waitForSelector("[data-test-dialog] textarea");
    await page.$eval("[data-test-dialog] textarea", (el) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      ).set;
      setter.call(el, "\u010carobna pri\u010da");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    // Use actual keyboard input to exercise React's controlled textarea.
    await page.click("[data-test-dialog] textarea");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("Mobile story");
    await page.$$eval("[data-test-dialog] button", (buttons) =>
      buttons.at(-1).click(),
    );
    await page.waitForFunction(
      () =>
        window.harness.editor.document.pages.find((p) => p.id === "editorial-2")
          .content.title === "Mobile story",
    );
    await page.evaluate(() => {
      window.harness.editor.selectPage("portrait-plate-2");
      window.harness.setCrop(true);
    });
    await page.waitForSelector('input[type="range"]');
    await page.$eval('input[type="range"]', (el) => {
      el.focus();
    });
    await page.keyboard.press("ArrowRight");
    await page.$$eval("button", (buttons) =>
      buttons.find((b) => b.textContent === "Primijeni").click(),
    );
    await page.waitForFunction(
      () =>
        window.harness.editor.document.pages.find(
          (p) => p.id === "portrait-plate-2",
        ).photos[0].position.x > 0.25,
    );

    stage = "crop axes and frame ratios";
    for (const [image, ratio, disabled] of [
      [0, 1.5, [true, false]],
      [1, 2 / 3, [false, true]],
      [2, 2 / 3, [false, true]],
      [2, 1.5, [true, false]],
      [0, 2 / 3, [true, true]],
      [1, 1.5, [true, true]],
    ]) {
      await page.evaluate(
        ({ image, ratio }) => {
          window.harness.setCropOptions({ image, ratio });
          window.harness.setCrop(true);
        },
        { image, ratio },
      );
      await page.waitForFunction(
        (expected) => {
          const controls = [
            ...document.querySelectorAll('input[type="range"]'),
          ];
          const image = document.querySelector('img[draggable="false"]');
          return (
            image?.complete &&
            image.naturalWidth &&
            controls.length === 2 &&
            controls.every((el, i) => el.disabled === expected[i])
          );
        },
        {},
        disabled,
      );
      const frame = await page.$eval('img[draggable="false"]', (el) => {
        const r = el.parentElement.getBoundingClientRect();
        return { ratio: r.width / r.height, height: r.height, width: r.width };
      });
      assert.ok(Math.abs(frame.ratio - ratio) < 0.01);
      assert.ok(
        frame.height <= 288 && frame.width <= 390,
        "Bounded crop frame",
      );
      await page.locator(`button::-p-text(${messages.upgrade.cancel})`).click();
      await page.waitForFunction(
        () => !document.querySelector('input[type="range"]'),
      );
    }
    await page.evaluate(() =>
      window.harness.setCropOptions({ ratio: 0.5, image: 0 }),
    );
    stage = "framing save and reload";
    assert.equal(
      await page.evaluate(() => window.harness.editor.flush()),
      true,
    );
    const savedSlot = await page.evaluate(
      () =>
        window.harness.editor.document.pages.find(
          (p) => p.id === "portrait-plate-2",
        ).photos[0],
    );
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => !!window.harness);
    assert.deepEqual(
      await page.evaluate(
        () =>
          window.harness.editor.document.pages.find(
            (p) => p.id === "portrait-plate-2",
          ).photos[0],
      ),
      savedSlot,
    );
    await page.evaluate(() => {
      window.harness.editor.selectPage("portrait-plate-2");
      window.harness.setMode("edit");
    });
    await page.waitForSelector(".editing");
    await page.evaluate(() => window.harness.setCrop(true));
    await page.waitForSelector('input[type="range"]');
    const cropRatio = await page.$eval('img[draggable="false"]', (image) => {
      const b = image.parentElement.getBoundingClientRect();
      return b.width / b.height;
    });
    assert.ok(
      Math.abs(cropRatio - 1 / 2) < 0.01,
      "Mobile crop preview must preserve slot ratio",
    );
    await page.focus('input[type="range"]');
    await page.keyboard.press("Home");
    await page.locator(`button::-p-text(${messages.upgrade.cancel})`).click();
    assert.deepEqual(
      await page.evaluate(
        () =>
          window.harness.editor.document.pages.find(
            (p) => p.id === "portrait-plate-2",
          ).photos[0],
      ),
      savedSlot,
      "Cancel must not mutate the slot",
    );
    await page.evaluate(() => window.harness.setCrop(true));
    await page.waitForSelector('input[type="range"]');
    await page.click("textarea");
    await page.keyboard.type("Caption test");
    await page.locator(`button::-p-text(${messages.upgrade.reset})`).click();
    assert.equal(
      await page.$eval("textarea", (el) => el.value),
      "Caption test",
      "Reset only changes framing",
    );
    await page.locator('[role="switch"]').click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[role="switch"]')
          ?.getAttribute("aria-checked") === "true",
    );
    await page.locator(`button::-p-text(${messages.upgrade.apply})`).click();
    await page.waitForFunction(
      () => !document.querySelector('input[type="range"]'),
    );
    assert.equal(
      await page.evaluate(() => window.harness.editor.flush()),
      true,
    );
    assert.equal(
      await page.evaluate(
        () =>
          window.harness.editor.document.pages.find(
            (p) => p.id === "portrait-plate-2",
          ).photos[0].fit,
      ),
      "contain",
    );
    await page.evaluate(() =>
      window.harness.editor.changePageLayout("portrait-plate-2", "full-photo"),
    );
    await page.waitForFunction(
      () =>
        window.harness.editor.document.pages.find(
          (p) => p.id === "portrait-plate-2",
        ).layout === "full-photo",
    );
    await page.evaluate(() => window.harness.setCrop(true));
    await page.waitForSelector('[role="switch"]');
    assert.equal(
      await page.$eval(
        '[role="switch"]',
        (el) => el.getAttribute("aria-checked") === "true",
      ),
      true,
    );
    await page.locator('[role="switch"]').click();
    await page.locator(`button::-p-text(${messages.upgrade.apply})`).click();
    await page.waitForFunction(
      () => !document.querySelector('input[type="range"]'),
    );
    assert.equal(
      await page.evaluate(() => window.harness.editor.flush()),
      true,
    );
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => !!window.harness);
    const persisted = await page.evaluate(() =>
      window.harness.editor.document.pages.find(
        (p) => p.id === "portrait-plate-2",
      ),
    );
    assert.equal(persisted.layout, "full-photo");
    assert.equal(persisted.photos[0].fit, "cover");
    assert.deepEqual(persisted.photos[0].position, { x: 0.5, y: 0.5 });
    assert.equal(persisted.photos[0].caption, "Caption test");
    const viewerFrame = await page.$eval(
      '[data-album-page="portrait-plate-2"] img',
      (img) => ({
        fit: getComputedStyle(img).objectFit,
        position: getComputedStyle(img).objectPosition,
      }),
    );
    await page.evaluate(() => window.harness.setMode("viewer"));
    await page.waitForSelector('[data-album-page="portrait-plate-2"] img');
    assert.deepEqual(
      await page.$eval('[data-album-page="portrait-plate-2"] img', (img) => ({
        fit: getComputedStyle(img).objectFit,
        position: getComputedStyle(img).objectPosition,
      })),
      viewerFrame,
    );
    await page.evaluate(() => window.harness.setMode("print"));
    await page.waitForSelector('[data-album-print-hydrated="true"]');
    assert.deepEqual(
      await page.$eval('[data-album-page="portrait-plate-2"] img', (img) => ({
        fit: getComputedStyle(img).objectFit,
        position: getComputedStyle(img).objectPosition,
      })),
      viewerFrame,
    );
    await page.evaluate(() => window.harness.setMode("edit"));

    stage = "overflow";
    await page.evaluate(() => {
      window.harness.editor.selectPage("editorial-2");
      window.harness.editor.updatePageContent("editorial-2", {
        text: "Long text ".repeat(500),
      });
    });
    await page.waitForFunction(() => window.harness.overflow().length > 0);
    await page.evaluate(() => window.harness.editor.undo());
    await page.waitForFunction(
      () =>
        window.harness.editor.document.pages.find((p) => p.id === "editorial-2")
          .content.text.length < 100,
    );
    await page.waitForFunction(() => window.harness.overflow().length === 0);
    await page.screenshot({
      path: resolve(artifactDir, "mobile-editor.png"),
      fullPage: true,
    });
    stage = "page flip";
    await page.setViewport({ width: 1100, height: 900 });
    await page.evaluate(() => {
      window.harness.editor.selectPage("cover-2");
      window.harness.setMode("book");
    });
    await page.waitForFunction(
      () => window.harness.editor.visiblePageIndexes.length === 2,
    );
    await page.screenshot({
      path: resolve(artifactDir, "desktop-spread.png"),
      fullPage: true,
    });
    await page.setViewport({ width: 820, height: 1180 });
    await page.waitForFunction(
      () => window.harness.editor.visiblePageIndexes.length === 2,
    );
    await page.setViewport({ width: 390, height: 844 });
    await page.waitForFunction(
      () =>
        window.harness.editor.visiblePageIndexes.length === 1 &&
        window.harness.editor.visiblePageIndexes[0] ===
          window.harness.editor.activePageIndex,
    );
    const previousPage = await page.evaluate(
      () => window.harness.editor.activePageIndex,
    );
    await page.click(`button[aria-label="${messages.navigation.nextPage}"]`);
    await page.waitForFunction(
      (previous) => window.harness.editor.activePageIndex !== previous,
      {},
      previousPage,
    );
    await page.screenshot({
      path: resolve(artifactDir, "mobile-single.png"),
      fullPage: true,
    });
    stage = "text over photo and full-photo drag";
    await page.setViewport({ width: 1100, height: 900 });
    await page.evaluate(() => window.harness.editor.selectPage("cover-2"));
    await page.waitForFunction(() =>
      window.harness.editor.visiblePageIndexes.includes(1),
    );
    const coverText = '[data-album-page="cover-2"] [data-album-text] button';
    await page.click(coverText);
    await page.waitForFunction(() => document.activeElement?.isContentEditable);
    await page.keyboard.press("Escape");
    await page.setViewport({ width: 390, height: 844 });
    await page.waitForFunction(
      () =>
        window.harness.editor.visiblePageIndexes.length === 1 &&
        window.harness.editor.visiblePageIndexes[0] === 1,
    );
    await page.evaluate(() => window.harness.editor.selectPage("full-photo-2"));
    await page.waitForFunction(
      () =>
        window.harness.editor.visiblePageIndexes.length === 1 &&
        window.harness.editor.visiblePageIndexes[0] === 3,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    const photoBox = await page.$eval(
      '[data-album-slot="full-photo-2-slot0"]',
      (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      },
    );
    const photoY = photoBox.y + photoBox.height * 0.45;
    assert.equal(
      await page.evaluate(
        ({ x, y }) =>
          Boolean(
            document
              .elementFromPoint(x, y)
              ?.closest("[data-album-photo-select]"),
          ),
        { x: photoBox.x + photoBox.width * 0.9, y: photoY },
      ),
      true,
      "Drag must start on the photo overlay",
    );
    await page.mouse.click(photoBox.x + photoBox.width * 0.6, photoY);
    assert.equal(
      await page.evaluate(() => window.harness.editor.activePhotoSlotId),
      "full-photo-2-slot0",
    );
    assert.equal(
      await page.evaluate(() => window.harness.editor.activePageIndex),
      3,
    );
    await page.mouse.move(photoBox.x + photoBox.width * 0.9, photoY);
    await page.mouse.down();
    await page.mouse.move(photoBox.x + photoBox.width * 0.1, photoY, {
      steps: 12,
    });
    await page.mouse.up();
    await page.waitForFunction(
      () => window.harness.editor.activePageIndex === 4,
    );
    stage = "navigation edge cases";
    await page.evaluate(() => window.harness.setMode("edges"));
    await page.waitForFunction(() => !!window.edge);
    assert.equal(
      await page.$$eval("button[aria-label]", (nodes) => nodes.length),
      0,
    );
    for (const width of [769, 768]) {
      await page.setViewport({ width, height: 1000 });
      for (const count of [1, 2, 3, 5]) {
        await page.evaluate((count) => {
          window.edge.setActive(0);
          window.edge.setVisible([]);
          window.edge.setCount(count);
        }, count);
        await page.waitForFunction(() => window.edge.visible.includes(0));
        const next = `button[aria-label="${messages.navigation.nextPage}"]`;
        const previous = `button[aria-label="${messages.navigation.previousPage}"]`;
        assert.equal(
          await page.$eval(previous, (el) => el.disabled),
          true,
          `first page: ${count} pages at ${width}px`,
        );
        for (let step = 0; step < count; step++) {
          if (await page.$eval(next, (el) => el.disabled)) break;
          const before = await page.evaluate(() =>
            window.edge.visible.join(","),
          );
          await page.click(next);
          await page.waitForFunction(
            (before) => window.edge.visible.join(",") !== before,
            {},
            before,
          );
        }
        assert.equal(
          await page.$eval(next, (el) => el.disabled),
          true,
          `last page: ${count} pages at ${width}px`,
        );
        for (let step = 0; step < count; step++) {
          if (await page.$eval(previous, (el) => el.disabled)) break;
          const before = await page.evaluate(() =>
            window.edge.visible.join(","),
          );
          await page.click(previous);
          await page.waitForFunction(
            (before) => window.edge.visible.join(",") !== before,
            {},
            before,
          );
        }
        assert.equal(
          await page.$eval(previous, (el) => el.disabled),
          true,
          `first page: ${count} pages at ${width}px`,
        );
      }
    }
    await page.evaluate(() => window.edge.setActive(2));
    await page.waitForFunction(
      () => window.edge.visible.length === 1 && window.edge.visible[0] === 2,
    );
    await page.setViewport({ width: 769, height: 1000 });
    await page.waitForFunction(
      () =>
        window.edge.visible.length === 2 &&
        window.edge.visible.includes(window.edge.active),
    );
    await page.setViewport({ width: 768, height: 1000 });
    await page.waitForFunction(
      () =>
        window.edge.visible.length === 1 &&
        window.edge.visible[0] === window.edge.active,
    );
    stage = "editor cover confirmation and keyboard history";
    assert.equal(
      await page.evaluate(() => window.harness.editor.flush()),
      true,
    );
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => !!window.harness);
    await page.evaluate(() => window.harness.setMode("view"));
    await page.waitForFunction(
      () => !!window.viewSidebar && !!window.viewHeader,
    );
    stage = "crop preserves page and spread";
    for (const width of [1100, 390]) {
      await page.setViewport({ width, height: 900 });
      await page.waitForFunction(
        (width) =>
          window.viewSidebar.visiblePageIndexes.length ===
            (width > 768 ? 2 : 1) ||
          window.viewSidebar.activePageId === window.viewSidebar.pages[0].id,
        {},
        width,
      );
      await page.evaluate(() =>
        window.viewSidebar.onSelectPage(window.viewSidebar.pages[5].id),
      );
      await page.waitForFunction(
        () =>
          window.viewSidebar.activePageId === window.viewSidebar.pages[5].id &&
          window.viewSidebar.visiblePageIndexes.includes(5),
      );
      const pageId = await page.evaluate(() => window.viewSidebar.activePageId);
      for (const action of ["apply", "cancel", "close"]) {
        const before = await page.evaluate(() => ({
          visible: window.viewSidebar.visiblePageIndexes,
          pages: window.viewSidebar.pages,
        }));
        await page
          .locator(`button::-p-text(${messages.upgrade.position})`)
          .click();
        await page.waitForSelector('[data-test-dialog] input[type="range"]');
        assert.equal(
          await page.evaluate(() => window.viewSidebar.activePageId),
          pageId,
        );
        assert.deepEqual(
          await page.evaluate(() => window.viewSidebar.visiblePageIndexes),
          before.visible,
        );
        await page.focus("[data-test-dialog] textarea");
        await page.keyboard.down("Control");
        await page.keyboard.press("a");
        await page.keyboard.up("Control");
        await page.keyboard.type(
          action === "apply" ? "Crop page 6" : "Discard this draft",
        );
        if (action === "apply")
          before.pages[5].photos[0].caption = "Crop page 6";
        if (action === "close") await page.click("[data-test-close]");
        else
          await page
            .locator(`button::-p-text(${messages.upgrade[action]})`)
            .click();
        await page.waitForFunction(
          () =>
            !document.querySelector('[data-test-dialog] input[type="range"]'),
        );
        assert.equal(
          await page.evaluate(() => window.viewSidebar.activePageId),
          pageId,
        );
        assert.deepEqual(
          await page.evaluate(() => window.viewSidebar.visiblePageIndexes),
          before.visible,
        );
        assert.deepEqual(
          await page.evaluate(() => window.viewSidebar.pages),
          before.pages,
        );
      }
    }
    stage = "filled photo opens mobile Photos panel at default snap";
    await page.evaluate(() => {
      window.viewMobile.onMobilePanelOpenChange(false);
      window.viewMobile.onStepChange("pages");
    });
    await page.evaluate(() =>
      document
        .querySelector('[data-album-slot][data-active="true"] button')
        .click(),
    );
    await page.waitForFunction(
      () =>
        window.viewMobile.mobilePanelOpen &&
        window.viewMobile.mobileSnapPoint === 0.23 &&
        window.viewMobile.activeStep === "photos",
    );
    await page.evaluate(() => window.viewMobile.onMobilePanelOpenChange(false));
    stage = "empty slot opens full mobile panel and placement restores default";
    await page.evaluate(() => window.viewSidebar.onRemovePhotoFromPage());
    await page.waitForSelector('[data-album-slot][data-empty="true"] button');
    await page.evaluate(() =>
      document
        .querySelector('[data-album-slot][data-empty="true"] button')
        .click(),
    );
    await page.waitForFunction(
      () =>
        window.viewMobile.mobilePanelOpen &&
        window.viewMobile.mobileSnapPoint === 1,
    );
    await page.evaluate(() => window.viewSidebar.onSelectPhoto("photo0"));
    await page.waitForFunction(
      () => window.viewMobile.mobileSnapPoint === 0.23,
    );
    await page.evaluate(() => window.viewMobile.onMobilePanelOpenChange(false));
    stage = "editor cover confirmation and keyboard history";
    const initialIds = await page.evaluate(() =>
      window.viewSidebar.pages.map((p) => p.id),
    );
    await page.evaluate(() =>
      window.viewSidebar.onDeletePage(window.viewSidebar.pages[0].id),
    );
    await page.waitForSelector("#cancel-cover");
    await page.click("#cancel-cover");
    assert.deepEqual(
      await page.evaluate(() => window.viewSidebar.pages.map((p) => p.id)),
      initialIds,
    );
    await page.evaluate(() =>
      window.viewSidebar.onDeletePage(window.viewSidebar.pages[0].id),
    );
    await page.waitForSelector("#confirm-cover");
    await page.evaluate(() => {
      const confirm = window.viewConfirm.onConfirm;
      confirm();
      confirm();
    });
    await page.waitForFunction(
      (n) => window.viewSidebar.pages.length === n - 1,
      {},
      initialIds.length,
    );
    await page.keyboard.down("Control");
    await page.keyboard.press("z");
    await page.keyboard.up("Control");
    await page.waitForFunction(
      (n) => window.viewSidebar.pages.length === n,
      {},
      initialIds.length,
    );
    await page.keyboard.down("Control");
    await page.keyboard.down("Shift");
    await page.keyboard.press("z");
    await page.keyboard.up("Shift");
    await page.keyboard.up("Control");
    await page.waitForFunction(
      (n) => window.viewSidebar.pages.length === n - 1,
      {},
      initialIds.length,
    );
    const beforeMove = await page.evaluate(() =>
      window.viewSidebar.pages.map((p) => p.id),
    );
    await page.evaluate(() =>
      window.viewSidebar.onSwapPages(
        window.viewSidebar.pages[0].id,
        window.viewSidebar.pages[1].id,
      ),
    );
    await page.waitForSelector("#cancel-cover");
    await page.click("#cancel-cover");
    assert.deepEqual(
      await page.evaluate(() => window.viewSidebar.pages.map((p) => p.id)),
      beforeMove,
    );
    await page.evaluate(() =>
      window.viewSidebar.onSwapPages(
        window.viewSidebar.pages[0].id,
        window.viewSidebar.pages[1].id,
      ),
    );
    await page.waitForSelector("#confirm-cover");
    await page.click("#confirm-cover");
    await page.waitForFunction(
      (first) => window.viewSidebar.pages[0].id !== first,
      {},
      beforeMove[0],
    );
    assert.equal(
      await page.evaluate(() => window.viewHeader.beforeExport()),
      true,
    );
    await page.evaluate(() => {
      const input = document.createElement("textarea");
      input.id = "native-history";
      document.body.append(input);
      input.focus();
    });
    const beforeNativeUndo = await page.evaluate(() =>
      window.viewSidebar.pages.map((p) => p.id),
    );
    await page.keyboard.down("Control");
    await page.keyboard.press("z");
    await page.keyboard.up("Control");
    assert.deepEqual(
      await page.evaluate(() => window.viewSidebar.pages.map((p) => p.id)),
      beforeNativeUndo,
    );
    await page.evaluate(() =>
      document.getElementById("native-history").remove(),
    );
    await page.evaluate(() => {
      window.failSave = true;
      window.viewSidebar.onDuplicatePage(window.viewSidebar.pages[1].id);
    });
    assert.equal(
      await page.evaluate(() => window.viewHeader.beforeExport()),
      false,
      "Failed save blocks export",
    );
    await page.evaluate(() => {
      window.failSave = false;
      window.viewHeader.onRetry();
    });
    await page.waitForFunction(() => window.viewHeader.saveStatus === "saved");
    assert.equal(
      await page.evaluate(() => window.viewHeader.beforeExport()),
      true,
    );
    await page.evaluate(() => {
      const text = [
        ...document.querySelectorAll("[data-album-text-value]"),
      ].find((el) => el.getBoundingClientRect().width > 0);
      window.overflowText = text;
      window.previousText = text.textContent;
      text.textContent = "Overflow ".repeat(2000);
    });
    assert.equal(
      await page.evaluate(() => window.viewHeader.beforeExport()),
      false,
      "Overflow blocks export",
    );
    await page.evaluate(() => {
      window.overflowText.textContent = window.previousText;
    });
    stage = "upload lifecycle";
    await page.evaluate(() => window.harness.setMode("upload"));
    await page.waitForFunction(() => !!window.upload);
    await page.evaluate(() =>
      window.upload.addFiles([
        new File(["one"], "one.jpg", { type: "image/jpeg" }),
        new File(["bad"], "bad.jpg", { type: "image/jpeg" }),
        new File(["two"], "two.jpg", { type: "image/jpeg" }),
      ]),
    );
    await page.waitForFunction(
      () =>
        window.upload.photos.length === 2 && window.upload.error === "invalid",
    );
    await page.evaluate(async () => {
      window.uploadOutcomes = ["ok", "fail"];
      await Promise.all([window.upload.submit(), window.upload.submit()]);
    });
    await page.waitForFunction(
      () => window.upload.photos.length === 1 && !window.upload.isSubmitting,
    );
    assert.deepEqual(await page.evaluate(() => window.uploadCalls), [
      "one.jpg",
      "two.jpg",
    ]);
    await page.evaluate(() => window.upload.submit());
    await page.waitForFunction(() => window.upload.photos.length === 0);
    assert.deepEqual(await page.evaluate(() => window.uploadCalls), [
      "one.jpg",
      "two.jpg",
      "two.jpg",
    ]);
    assert.equal(await page.evaluate(() => window.uploadProgress.length), 2);
    await page.evaluate(() =>
      window.upload.addFiles([
        new File(["three"], "three.jpg", { type: "image/jpeg" }),
      ]),
    );
    await page.waitForFunction(() => window.upload.photos.length === 1);
    await page.evaluate(async () => {
      window.uploadOutcomes = ["throw"];
      await window.upload.submit();
    });
    await page.waitForFunction(
      () => window.upload.isUncertain && window.upload.error === "uncertain",
    );
    const calls = await page.evaluate(() => window.uploadCalls.length);
    await page.evaluate(() => window.upload.submit());
    assert.equal(
      await page.evaluate(() => window.uploadCalls.length),
      calls,
      "Uncertain requests must not be automatically retried",
    );
    stage = "real mobile Drawer gestures and scrolling";
    await page.setViewport({
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
    });
    await page.evaluate(() => window.harness.setMode("drawer"));
    await page.waitForSelector("[data-base-ui-swipe-ignore]");
    const cdp = await page.createCDPSession();
    async function swipe(x, y, endY, hold = 0) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      if (hold) await new Promise((resolve) => setTimeout(resolve, hold));
      for (let i = 1; i <= 12; i++) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: y + ((endY - y) * i) / 12 }],
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    const handle = await page.evaluate(() => {
      const r = document
        .querySelector("[data-base-ui-swipe-ignore]")
        .previousElementSibling.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await swipe(handle.x, handle.y, 25);
    await page.waitForFunction(() => window.drawerFixture.snap === 1);
    const top = await page.$eval(
      "[data-base-ui-swipe-ignore]",
      (el) => el.parentElement.getBoundingClientRect().top,
    );
    assert.ok(Math.abs(top) < 2, "Full snap must reach viewport top");
    for (const tab of ["photos", "design"]) {
      await page.evaluate((tab) => window.drawerFixture.setTab(tab), tab);
      await swipe(180, 650, 160);
      assert.equal(await page.evaluate(() => window.drawerFixture.snap), 1);
      assert.ok(
        await page.$eval(
          "[data-base-ui-swipe-ignore]",
          (el) => el.scrollTop > 0,
        ),
        "Content must scroll without swiping Drawer",
      );
    }
    await page.evaluate(() => {
      window.drawerFixture.setTab("pages");
      document.querySelector("[data-base-ui-swipe-ignore]").scrollTop = 0;
    });
    await page.waitForSelector(
      'button[aria-label="' +
        messages.pages.move.replace("{number}", "1") +
        '"]',
    );
    const order = await page.evaluate(() =>
      window.drawerFixture.items.map((p) => p.id),
    );
    const handles = await page.$$eval(
      'button[aria-label^="' + messages.pages.move.split("{number}")[0] + '"]',
      (els) =>
        els.slice(0, 3).map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }),
    );
    await swipe(handles[0].x, handles[0].y, handles[2].y, 300);
    assert.equal(
      await page.evaluate(() => window.drawerFixture.snap),
      1,
      "Reorder must not move Drawer",
    );
    assert.notDeepEqual(
      await page.evaluate(() => window.drawerFixture.items.map((p) => p.id)),
      order,
      "Touch reorder must change page order",
    );
    await cdp.detach();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: 19 actual layout variants; portrait/landscape/square assets; Chrome PDF; crop parity; desktop inline text/undo; mobile text/apply; keyboard crop; text overflow/recovery; upload duplicate-submit/partial-success/retry/uncertainty; framing/layout HTTP save+reload; crop Cancel/Reset/contain; six crop-axis cases; page 6 preserved through crop Apply/Cancel/X on desktop/mobile; tablet spread; text-over-photo hit testing; full-photo drag; cover Cancel/Confirm; keyboard undo/redo; empty-slot full/default flow; real Drawer touch swipe/scroll/reorder. Artifacts: .next/album-audit",
    );
  }
} catch (error) {
  console.error("Failed browser stage:", stage);
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
