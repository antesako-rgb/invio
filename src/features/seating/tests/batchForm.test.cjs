/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const runtime = require("react/jsx-runtime");
const root = path.resolve(__dirname, "../../../..");
const modules = new Map();
let submit, searchKeyDown, selectVisibleClick,selectGroupClick;
const overrides = {
  "react/jsx-runtime": Object.fromEntries(Object.entries(runtime).map(([name, value]) => [name, name === "jsx" || name === "jsxs" ? (...args) => {
    if (args[0] === "form") submit = args[1].onSubmit;
    return value(...args);
  } : value])),
  "next-intl": { useTranslations: () => (key, args) => key + (args ? " " + JSON.stringify(args) : "") },
  "@/components/ui/button": { Button: ({ children, ...props }) => { if(typeof children === "string" && children.startsWith("selectVisibleGuests")) selectVisibleClick = props.onClick; if(typeof children === "string" && children.startsWith("selectInvitationGroup"))selectGroupClick=props.onClick; for (const key of ["variant", "size", "loading"]) delete props[key]; return React.createElement("button", props, children); } },
  "@/components/ui/input": { Input: props => { searchKeyDown = props.onKeyDown; return React.createElement("input", props); } },
  "@/components/ui/select": { Select: ({ options, onValueChange, ...props }) => React.createElement("select", { ...props, onChange: event => onValueChange?.(event.target.value) }, options.map(option => React.createElement("option", { key: option.value, value: option.value }, option.label))) },
  "@/components/ui/field": { Field: ({ id, label, description, children, ...props }) => React.createElement("div", props, React.createElement("label", { htmlFor: id }, label), React.cloneElement(children, { id }), description && React.createElement("p", null, description)) },
  "./SeatingGuestRow": { GuestRsvpStatus: () => null },
};
function load(filename) {
  filename = path.resolve(filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  compiledModule.require = function(request) {
    if (request in overrides) return overrides[request];
    if (request.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, name) => name }) };
    if (request.startsWith(".") || request.startsWith("@/")) {
      const base = request.startsWith("@/") ? path.resolve(root, "src", request.slice(2)) : path.resolve(path.dirname(filename), request);
      for (const extension of ["", ".ts", ".tsx"]) if (fs.existsSync(base + extension)) return load(base + extension);
    }
    return Module.prototype.require.call(this, request);
  };
  modules.set(filename, compiledModule);
  compiledModule._compile(compiled, filename);
  return compiledModule.exports;
}
const Form = load(path.resolve(__dirname, "../components/SeatingBatchForm.tsx")).default;
const Picker = load(path.resolve(__dirname, "../components/SeatingGuestPicker.tsx")).default;
const SingleForm = load(path.resolve(__dirname, "../components/SeatAssignmentForm.tsx")).default;
const people = ["one", "two", "project"].map(id => ({ id, first_name: id, last_name: "", archived_at: null }));
function render(changes = {}) {
  const calls = [], closes = [];
  const current = { people, participants: people.slice(0, 2).map(person => ({ project_guest_id: person.id })), assignments: [], attendance: {}, plan: { revision: 1 } };
  const props = {
    current, tables: [{ id: "table", name: "Stol 1", capacity: 3 }], request: { tableId: "table", guestIds: ["one", "two"] },
    saving: false, blocked: false, error: null, onClose: () => closes.push(true), onReload: () => {},
    onSave: async (...args) => { calls.push(["auto", ...args]); return true; },
    onManualSave: async (...args) => { calls.push(["exact", ...args]); return true; }, ...changes,
  };
  const html = renderToStaticMarkup(React.createElement(Form, props));
  return { html, calls, closes, submit, searchKeyDown };
}
test("one confirmation adds the whole group without a review step or a write during selection", async () => {
  const view = render();
  assert.deepEqual(view.calls, []);
  assert.match(view.html, /addGuestsCount/);
  assert.doesNotMatch(view.html, /reviewSelectedGuests|placeReviewStep|placementMode/);
  await view.submit({ preventDefault() {} });
  assert.deepEqual(view.calls, [["auto", ["one", "two"], "table", "auto"]]);
  assert.deepEqual(view.closes, [true]);
});
test("project guests can be selected and included in the same table confirmation", async () => {
  const view = render({ request: { tableId: "table", guestIds: ["one", "project"] } });
  assert.match(view.html, /notInPlan/);
  await view.submit({ preventDefault() {} });
  assert.deepEqual(view.calls, [["auto", ["one", "project"], "table", "auto"]]);
});
test("optional exact places save the entire group once on the same form", async () => {
  const view = render({ initialDraft: { ids: ["one", "two"], exact: true, choices: { one: 3, two: 1 }, browse: { query: "", scope: "unassigned" } } });
  assert.match(view.html, /seatForGuest/);
  assert.doesNotMatch(view.html, /reviewSelectedGuests|placementMode/);
  await view.submit({ preventDefault() {} });
  assert.deepEqual(view.calls, [["exact", "table", [{ guest_id: "one", seat_number: 3 }, { guest_id: "two", seat_number: 1 }]]]);
});
test("incomplete exact places never fall back to automatic placement", async () => {
  const view = render({ request: { tableId: "table", guestIds: ["one", "two"], exact: true } });
  assert.match(view.html, /manualSeatsIncomplete/);
  await view.submit({ preventDefault() {} });
  assert.deepEqual(view.calls, []);
});
test("overflow, blocked, saving, empty and missing-table forms reject submission", async () => {
  for (const changes of [{ tables: [{ id: "table", capacity: 1 }] }, { blocked: true }, { saving: true }, { request: { tableId: "table", guestIds: [] } }, { tables: [] }]) {
    const view = render(changes);
    await view.submit({ preventDefault() {} });
    assert.deepEqual(view.calls, []);
    assert.deepEqual(view.closes, []);
  }
});
test("project inclusion remains one confirmation without assigning a table", async () => {
  const view = render({ request: { tableId: null, guestIds: ["project"] } });
  await view.submit({ preventDefault() {} });
  assert.deepEqual(view.calls, [["auto", ["project"], null, "include"]]);
});

test("project guest selection displays RSVP status before the guest is included in the plan",()=>{
  const html=renderToStaticMarkup(React.createElement(Picker,{
    current:{people,participants:[],assignments:[],attendance:{one:{status:"attending",hasInvitationLink:true},two:{status:undefined,hasInvitationLink:true}}},
    tables:[],tableId:null,selected:[],onChange(){},multiple:true,projectOnly:true,
  }));
  assert.match(html,/<strong>one<\/strong><small>notInPlan · attending<\/small>/);
  assert.match(html,/<strong>two<\/strong><small>notInPlan · pending<\/small>/);
});
test("searching keeps selected guests visible and Enter in search cannot submit placement", () => {
  const view = render({ initialDraft: { ids: ["one"], exact: false, choices: {}, browse: { query: "two", scope: "unassigned" } } });
  assert.match(view.html, /<strong>one<\/strong>/);
  assert.match(view.html, /<strong>two<\/strong>/);
  assert.doesNotMatch(view.html, /<strong>project<\/strong>/);
  let prevented = false;
  view.searchKeyDown({ key: "Enter", preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.deepEqual(view.calls, []);
});

test("select visible fills only available places and includes eligible project people", () => {
  const choices=[];
  renderToStaticMarkup(React.createElement(Picker, {
    current:{people,participants:[],assignments:[],attendance:{}},tables:[{id:"table",capacity:2}],tableId:"table",
    selected:[],onChange:ids=>choices.push(ids),multiple:true,allowProject:true,simpleScope:true,
  }));
  selectVisibleClick();
  assert.deepEqual(choices,[["one","project"]]);
});

test("a full table can select its own occupants without adding people from other tables", () => {
  const choices=[];
  renderToStaticMarkup(React.createElement(Picker, {
    current:{people,participants:people.map(p=>({project_guest_id:p.id})),assignments:[
      {table_id:"table",project_guest_id:"one",seat_number:1},{table_id:"table",project_guest_id:"two",seat_number:2},
      {table_id:"other",project_guest_id:"project",seat_number:1},
    ],attendance:{}},tables:[{id:"table",capacity:2}],tableId:"table",browse:{query:"",scope:"all"},
    selected:["one"],onChange:ids=>choices.push(ids),multiple:true,simpleScope:true,
  }));
  selectVisibleClick();
  assert.deepEqual(choices,[["one","two"]]);
});

function renderSingle(changes = {}) {
  const calls = [];
  const current = { people, participants: people.slice(0, 2).map(person => ({ project_guest_id: person.id })), assignments: [{ project_guest_id: "one", table_id: "table", seat_number: 8 }], attendance: {}, plan: { revision: 1 } };
  const props = {
    current, tables: [{ id: "table", name: "Stol 1", capacity: 8 }],
    request: { guestId: "one", tableId: "table", seatNumber: 8 }, fixedGuest: true,
    saving: false, blocked: false, error: null, onClose: () => {}, onReload: () => {},
    onAssign: async (...args) => { calls.push(["manual", ...args]); return true; },
    onAutoAssign: async (...args) => { calls.push(["auto", ...args]); return true; }, ...changes,
  };
  const html = renderToStaticMarkup(React.createElement(SingleForm, props));
  return { html, calls, submit };
}

test("opening a seated guest shows their saved chair in the dropdown and saves nothing unchanged", async () => {
  for (const request of [{ guestId: "one", tableId: "table", seatNumber: 8 }, { guestId: "one", tableId: null, seatNumber: null }]) {
    const view = renderSingle({ request });
    assert.match(view.html, /<option value="8" selected="">/);
    assert.doesNotMatch(view.html, /<option value="auto" selected="">/);
    await view.submit({ preventDefault() {} });
    assert.deepEqual(view.calls, []);
  }
});

test("new guests default to automatic placement while an explicit chair target is selected", () => {
  assert.match(renderSingle({ request: { guestId: "two", tableId: "table", seatNumber: null } }).html, /<option value="auto" selected="">/);
  assert.match(renderSingle({ request: { guestId: null, tableId: "table", seatNumber: 3 }, fixedGuest: false }).html, /<option value="3" selected="">/);
});

test("explicit automatic mode and a restored draft take precedence over a guest's saved chair", () => {
  assert.match(renderSingle({ request: { guestId: "one", tableId: "table", seatNumber: null, seatMode: "auto" } }).html, /<option value="auto" selected="">/);
  assert.match(renderSingle({ initialChoice: { guestId: "one", tableId: "table", seatNumber: 4 } }).html, /<option value="4" selected="">/);
  assert.match(renderSingle({ initialChoice: { guestId: "one", tableId: "table", seatNumber: null, seatMode: "manual" } }).html, /<option value="" selected="">/);
});

test("selecting a whole invitation group never silently trims it to table capacity",async()=>{
 const current={people,participants:[],assignments:[],attendance:{},plan:{revision:1},invitationGroups:[{id:"family",name:"Family"}],guestGroups:{one:"family",two:"family",project:"other"}};
 const choices=[];
 const html=renderToStaticMarkup(React.createElement(Picker,{current,tables:[{id:"table",capacity:1}],tableId:"table",selected:[],onChange:ids=>choices.push(ids),multiple:true,allowProject:true,simpleScope:true,browse:{query:"one",scope:"unassigned",groupId:"family"}}));
 assert.match(html,/selectInvitationGroup/);selectGroupClick();assert.deepEqual(choices,[["one","two"]]);
 const view=render({current,tables:[{id:"table",capacity:1}],request:{tableId:"table",guestIds:choices[0]}});
 assert.match(view.html,/batchOverflow/);await view.submit({preventDefault(){}});assert.deepEqual(view.calls,[]);
});
test("group filtering keeps already selected people from other groups visible",()=>{
 const current={people,participants:[],assignments:[],attendance:{},invitationGroups:[{id:"family",name:"Family"}],guestGroups:{one:"family"}};
 const html=renderToStaticMarkup(React.createElement(Picker,{current,tables:[],tableId:null,selected:["two"],onChange(){},multiple:true,projectOnly:true,browse:{query:"",scope:"project",groupId:"family"}}));
 assert.match(html,/<strong>one/);assert.match(html,/<strong>two/);assert.doesNotMatch(html,/<strong>project/);
});
