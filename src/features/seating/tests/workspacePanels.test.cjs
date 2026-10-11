/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Exercise the real workspace handlers; rendering and server calls are isolated boundaries.
let context;
const react = {
  useState(initial) {
    const owner=context,index=owner.index++;
    if (!(index in owner.slots)) owner.slots[index]=typeof initial==="function"?initial():initial;
    return [owner.slots[index],value=>{owner.slots[index]=typeof value==="function"?value(owner.slots[index]):value;}];
  },
  useRef(initial) { const index=context.index++;return context.slots[index]??= {current:initial}; },
  useId(){return "source-toggle";},
  startTransition: callback=>callback(),
};
const root=path.resolve(__dirname,"../../../..");
const modules=new Map();
const runtime={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:"Fragment"};
const settingsFile=path.resolve(__dirname,"../components/SeatingPlanSettingsPanel.tsx");
function load(filename) {
  filename=path.resolve(filename);
  if(modules.has(filename))return modules.get(filename).exports;
  const compiled=ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const instance=new Module(filename);instance.filename=filename;instance.paths=Module._nodeModulePaths(path.dirname(filename));
  instance.require=function(request) {
    if(request==="react")return react;
    if(request==="react/jsx-runtime")return runtime;
    if(request==="next-intl")return {useTranslations:()=>key=>key};
    if(request==="next/dynamic")return {__esModule:true,default:()=>"Canvas"};
    if(request==="sonner")return {toast:{info(){},success:(...args)=>context.toasts.push(args)}};
    if(request==="lucide-react")return new Proxy({},{get:(_,key)=>key});
    if(request==="@/i18n/navigation")return {useRouter:()=>({replace:value=>context.routes.push(value),push:value=>context.routes.push(value)})};
    if(request==="../actions/seatingActions")return new Proxy({},{get:(_,key)=>input=>context.action(key,input)});
    if(request==="../actions/loadSeatingWorkspaceAction")return {loadSeatingWorkspaceAction:async()=>context.loadFailure?{success:false}:({success:true,data:structuredClone(context.confirmed)})};
    if(request==="../actions/syncSeatingRsvpGuestsAction")return {syncSeatingRsvpGuestsAction:input=>context.action("syncSeatingRsvpGuestsAction",input)};
    if(request==="../actions/includeGenericSeatingGuestAction")return {includeGenericSeatingGuestAction:input=>context.action("includeGenericSeatingGuestAction",input)};
    if(request==="@/features/project-guests/actions/projectGuestActions")return {};
    if(request==="./useSeatingMobile")return {useSeatingMobile:()=>context.mobile};
    if(request==="./useSeatingRsvpSync")return {useSeatingRsvpSync:props=>{context.rsvpSync=props;}};
    if(request==="./useGuestCanvasDrag")return {useGuestCanvasDrag:()=>({drag:null,start(){},consumePointerClick(){return false;}})};
    if(request.endsWith(".module.css"))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
    if(request==="./SeatingPlanSettingsPanel")return load(settingsFile);
    if(request==="@/components/ui/common/ConfirmDialog")return {__esModule:true,default:"ConfirmDialog"};
    if(request.startsWith("@/components/ui/"))return new Proxy({},{get:(_,key)=>key});
    if(request.startsWith("@/features/editor/components/"))return {__esModule:true,default:request.split("/").at(-1)};
    if(request.startsWith("./") && filename.includes(path.sep+"components"+path.sep))return {__esModule:true,default:request.slice(2)};
    if(request.startsWith("../validation/"))return load(path.resolve(path.dirname(filename),request)+".ts");
    if(request.startsWith(".") || request.startsWith("@/")) {
      const base=request.startsWith("@/")?path.resolve(root,"src",request.slice(2)):path.resolve(path.dirname(filename),request);
      for(const extension of [".ts",".tsx"])if(fs.existsSync(base+extension))return load(base+extension);
    }
    return Module.prototype.require.call(this,request);
  };
  modules.set(filename,instance);instance._compile(compiled,filename);return instance.exports;
}
const Workspace=load(path.resolve(__dirname,"../components/SeatingWorkspace.tsx")).default;
function nodes(node) {
  if(Array.isArray(node))return node.flatMap(nodes);
  if(!node || typeof node!=="object" || !("type" in node))return [];
  return [node,...Object.values(node.props??{}).flatMap(nodes)];
}
function fixture(t, changes={}) {
  const previousFormData=global.FormData;
  global.FormData=class {constructor(fields){this.fields=fields;}get(key){return this.fields[key]??null;}};
  t.after(()=>{global.FormData=previousFormData;});
  const table={id:"table",name:"Stol 1",shape:"round",capacity:8,width_cm:229,height_cm:229,x_cm:500,y_cm:500,rotation_deg:0};
  const initial={invitations:[{id:"invite",name:"RSVP"}],current:{
    tables:[table],people:[],participants:[],assignments:[],attendance:{},...changes,
    plan:{id:"plan",project_id:"project",name:"Plan",width_cm:2000,height_cm:1500,rsvp_invitation_id:null,revision:1,...changes.plan},
  }};
  const owner={slots:[],index:0,mobile:false,calls:[],routes:[],toasts:[],confirmed:structuredClone(initial),pause:null,excluded:new Set()};
  owner.action=async(name,input)=>{
    owner.calls.push({name,input});
    if(owner.pause)await owner.pause;
    if(name==="syncSeatingRsvpGuestsAction"){
      const current=owner.confirmed.current;
      const added=current.plan.rsvp_invitation_id?current.people.filter(person=>!person.archived_at&&!owner.excluded.has(person.id)&&current.attendance[person.id]?.hasInvitationLink&&current.attendance[person.id]?.status==="attending"&&!current.attendance[person.id]?.conflict&&!current.participants.some(member=>member.project_guest_id===person.id)):[];
      for(const person of added)current.participants.push({project_guest_id:person.id});
      if(added.length)current.plan.revision++;
      return {success:true,data:{revision:current.plan.revision,added_count:added.length}};
    }
    if(name==="manageSeatingPlanAction" && input.p_operation==="update")Object.assign(owner.confirmed.current.plan,{name:input.p_name.trim(),width_cm:input.p_width_cm,height_cm:input.p_height_cm,rsvp_invitation_id:input.p_rsvp_invitation_id});
    if(name==="assignSeatingGuestsAction" && input.p_mode==="include")for(const id of input.p_guest_ids) {
      if(!owner.confirmed.current.participants.some(member=>member.project_guest_id===id))owner.confirmed.current.participants.push({project_guest_id:id});
    }
    owner.confirmed.current.plan.revision++;
    return {success:true,data:owner.confirmed.current.plan.revision};
  };
  function render(){context=owner;owner.index=0;return Workspace({projectId:"project",initial});}
  function find(type){return nodes(render()).find(node=>(typeof node.type==="function"?node.type.name:node.type)===type);}
  function submit(){const settings=find("SeatingPlanSettingsPanel");return settings.props.onSubmit({preventDefault(){},currentTarget:settings.props.draft});}
  async function settle(){for(let i=0;i<8;i++)await Promise.resolve();}
  render();return {owner,find,render,submit,settle,navigate:id=>find("EditorToolRail").props.onNavigate(id),sync(){render();return owner.rsvpSync.enabled?owner.rsvpSync.onSync():Promise.resolve(false);}};
}

test("shared desktop and mobile tools expose settings, collapse, and canvas selection without the header gear",t=>{
  const view=fixture(t);
  assert.deepEqual(view.find("EditorToolRail").props.items.map(item=>item.id),["guests","table","settings"]);
  assert.deepEqual(view.find("EditorMobileNavigation").props.items.map(item=>item.id),["guests","table","settings"]);
  assert.ok(!nodes(view.find("EditorHeader").props.end).some(node=>node.props["aria-label"]==="planSettings"));
  view.find("EditorToolRail").props.onToggleCollapsed();assert.equal(view.find("EditorWorkspace").props.sidebarCollapsed,true);
  view.navigate("settings");assert.equal(view.find("EditorWorkspace").props.sidebarCollapsed,false);
  assert.ok(view.find("SeatingPlanSettingsPanel"));assert.equal(view.owner.calls.length,0);
  view.find("EditorToolRail").props.onToggleCollapsed();
  view.find("Canvas").props.onSelect("table",true);
  assert.equal(view.find("EditorWorkspace").props.sidebarCollapsed,false);
  assert.equal(view.find("EditorToolRail").props.activeId,"table");
});

test("unsaved settings survive navigation and both responsive panels without an RPC",t=>{
  const view=fixture(t);view.navigate("settings");
  view.find("SeatingPlanSettingsPanel").props.onDraftChange({name:"Draft",source:"invite"});
  view.navigate("guests");view.navigate("settings");
  view.owner.mobile=true;view.find("EditorMobileNavigation").props.onNavigate("settings");
  assert.equal(view.find("EditorMobilePanel").props.open,true);
  const panels=nodes(view.render()).filter(node=>node.type.name==="SeatingPlanSettingsPanel");
  assert.equal(panels.length,2);assert.deepEqual(panels[0].props.draft,panels[1].props.draft);
  assert.equal(panels[0].props.draft.name,"Draft");assert.equal(view.owner.calls.length,0);
  view.owner.mobile=false;assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.source,"invite");
  view.find("SeatingPlanSettingsPanel").props.onReset();assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.name,"Plan");
});

test("saving settings after canvas resize preserves confirmed dimensions and uses the current revision",async t=>{
  const view=fixture(t);view.find("Canvas").props.onRoomChange(2400,1700);await view.settle();
  view.navigate("settings");
  assert.equal(view.owner.calls.length,1);
  assert.deepEqual(Object.keys(view.find("SeatingPlanSettingsPanel").props.draft).sort(),["name","source"]);
  view.find("SeatingPlanSettingsPanel").props.onDraftChange({name:"Renamed"});
  await view.submit();
  assert.equal(view.owner.calls[1].input.p_width_cm,2400);
  assert.equal(view.owner.calls[1].input.p_height_cm,1700);
  assert.equal(view.owner.calls[1].input.p_revision,2);
  assert.equal(view.owner.confirmed.current.plan.width_cm,2400);
  assert.equal(view.owner.confirmed.current.plan.height_cm,1700);
});

test("an unrelated canvas save preserves dirty settings and explicit reload restores confirmed values",async t=>{
  const view=fixture(t);view.navigate("settings");
  view.find("SeatingPlanSettingsPanel").props.onDraftChange({name:"Draft",source:"invite"});
  view.find("Canvas").props.onRoomChange(2400,1700);await view.settle();
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.name,"Draft");
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.source,"invite");
  const reload=nodes(view.find("EditorHeader").props.end).find(node=>node.props["aria-label"]==="reload");
  await reload.props.onClick();await view.settle();
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.name,"Plan");
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.source,"");
});

test("settings submit once, lock navigation while pending, and show the confirmed normalized plan",async t=>{
  const view=fixture(t);view.navigate("settings");
  view.find("SeatingPlanSettingsPanel").props.onDraftChange({name:"  Updated  ",source:"invite"});
  let resolve;view.owner.pause=new Promise(done=>{resolve=done;});
  const saving=view.submit();
  assert.equal(view.find("SeatingPlanSettingsPanel").props.disabled,true);
  assert.equal(view.find("EditorToolRail").props.disabled,true);
  view.navigate("guests");assert.equal(view.find("EditorToolRail").props.activeId,"settings");
  await view.submit();assert.equal(view.owner.calls.length,1);
  resolve();await saving;
  const {input}=view.owner.calls[0];
  assert.equal(input.p_revision,1);assert.equal(input.p_width_cm,2000);assert.equal(input.p_height_cm,1500);assert.equal(input.p_rsvp_invitation_id,"invite");
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.name,"Updated");
  assert.equal(view.find("SeatingPlanSettingsPanel").props.disabled,false);
  assert.equal(view.find("EditorToolRail").props.activeId,"settings");
});

test("room bounds still reject unsafe canvas resizing and deleting waits for its existing confirmation",async t=>{
  const view=fixture(t);view.navigate("settings");
  view.find("Canvas").props.onRoomChange(100,100);
  assert.equal(view.owner.calls.length,0);
  view.find("SeatingPlanSettingsPanel").props.onDelete();
  const confirm=nodes(view.render()).find(node=>node.type==="ConfirmDialog" && node.props.variant==="danger");
  assert.equal(confirm.props.open,true);assert.equal(view.owner.calls.length,0);
  confirm.props.onConfirm();await view.settle();
  assert.equal(view.owner.calls[0].input.p_operation,"delete");
  assert.deepEqual(view.owner.routes,["/dashboard/projects/project/seating"]);
});

test("an opened connected plan adds attending people once while preserving existing seats and the user's view",async t=>{
  const existing={project_guest_id:"seated",table_id:"table",seat_number:4};
  const view=fixture(t,{
    plan:{rsvp_invitation_id:"invite"},
    people:["new","seated","declined"].map(id=>({id,archived_at:null})),
    participants:[{project_guest_id:"seated"}],assignments:[existing],
    attendance:{new:{status:"attending",hasInvitationLink:true,conflict:false},seated:{status:"attending",hasInvitationLink:true,conflict:false},declined:{status:"not_attending",hasInvitationLink:true,conflict:false}},
  });
  assert.equal(view.owner.rsvpSync.enabled,true);
  await view.sync();
  assert.deepEqual(view.owner.calls[0],{name:"syncSeatingRsvpGuestsAction",input:{p_project_id:"project",p_plan_id:"plan",p_revision:1}});
  assert.deepEqual(view.owner.confirmed.current.assignments,[existing]);
  assert.equal(view.find("ParticipantsPanel").props.current.participants.length,2);
  assert.equal(view.find("ParticipantsPanel").props.filter,"all");
  assert.equal(view.owner.toasts.length,1);
  await view.sync();assert.equal(view.owner.confirmed.current.plan.revision,2);assert.equal(view.owner.toasts.length,1);
});

test("source changes wait for saving; synchronization preserves a dirty name and locks simultaneous requests",async t=>{
  const view=fixture(t,{people:[{id:"new",archived_at:null}],attendance:{new:{status:"attending",hasInvitationLink:true,conflict:false}}});
  view.navigate("settings");view.find("SeatingPlanSettingsPanel").props.onDraftChange({source:"invite"});
  assert.equal(await view.sync(),false);assert.equal(view.owner.calls.length,0);
  await view.submit();
  view.find("SeatingPlanSettingsPanel").props.onDraftChange({name:"Draft name"});
  let resolve;view.owner.pause=new Promise(done=>{resolve=done;});
  const pending=view.sync();
  await view.sync();assert.equal(view.owner.calls.length,2);
  resolve();await pending;
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.name,"Draft name");
  assert.equal(view.find("EditorToolRail").props.activeId,"settings");
});

test("background RSVP checks preserve the header status while pending and still refresh changed attendance with no new guests",async t=>{
 const view=fixture(t,{plan:{rsvp_invitation_id:"invite"}});
 let resolve;view.owner.pause=new Promise(done=>{resolve=done;});
 const pending=view.sync();
 assert.equal(view.find("EditorSaveStatus").props.status,"saved");
 assert.equal(view.find("EditorSaveStatus").props.savedLabel,"ready");
 assert.equal(view.find("ParticipantsPanel").props.disabled,true);
 view.owner.confirmed.current.attendance={person:{status:"not_attending",hasInvitationLink:true,conflict:false}};
 resolve();await pending;
 assert.equal(view.find("EditorSaveStatus").props.savedLabel,"ready");
 assert.equal(view.find("ParticipantsPanel").props.current.attendance.person.status,"not_attending");
 assert.deepEqual(view.owner.toasts,[]);
});

test("single-invitation settings have a named connection switch and no import button or source dropdown",t=>{
  const view=fixture(t,{plan:{rsvp_invitation_id:"invite"}});view.navigate("settings");
  const panel=view.find("SeatingPlanSettingsPanel"),content=nodes(panel.type(panel.props));
  const toggle=content.find(node=>node.type==="Switch");
  assert.equal(toggle.props.checked,true);
  assert.ok(!content.some(node=>node.type==="Select" || node.props.children==="includeRsvpGuestsCount"));
  toggle.props.onCheckedChange(false);
  assert.equal(view.find("SeatingPlanSettingsPanel").props.draft.source,"");
  assert.equal(view.owner.calls.length,0);
});

test("automatic sync pauses during guest picking and resumes without losing the picker draft",t=>{
  const view=fixture(t,{plan:{rsvp_invitation_id:"invite"},people:[{id:"new",archived_at:null}]});
  view.find("ParticipantsPanel").props.onChooseSeat({id:"new",archived_at:null});
  view.render();assert.equal(view.owner.rsvpSync.enabled,false);
  view.find("SeatAssignmentForm").props.onClose();view.render();
  assert.equal(view.owner.rsvpSync.enabled,true);
  assert.equal(view.owner.calls.length,0);
});

test("an uncertain sync blocks all further writes without a retry, changed membership or success toast",async t=>{
  const view=fixture(t,{plan:{rsvp_invitation_id:"invite"}});
  view.owner.action=async(name,input)=>{view.owner.calls.push({name,input});return {success:false,code:"SEATING_UNCONFIRMED"};};
  await view.sync();assert.equal(await view.sync(),false);
  assert.equal(view.owner.calls.length,1);assert.deepEqual(view.owner.toasts,[]);
  assert.equal(view.find("ParticipantsPanel").props.disabled,true);
});

test("a missing final SQL setup reports the cause once while manual seating remains available",async t=>{
  const view=fixture(t,{plan:{rsvp_invitation_id:"invite"}});
  view.owner.action=async(name,input)=>{view.owner.calls.push({name,input});return {success:false,code:"SEATING_RSVP_SETUP_REQUIRED"};};
  await view.sync();assert.equal(await view.sync(),false);
  assert.equal(view.owner.calls.length,1);assert.equal(view.find("ParticipantsPanel").props.disabled,false);
  assert.equal(view.find("EditorSaveStatus").props.errorLabel,"rsvpSetupRequired");
});

test("an acknowledged sync with a failed refresh waits for explicit reload before another write",async t=>{
  const view=fixture(t,{plan:{rsvp_invitation_id:"invite"},people:[{id:"new",archived_at:null}],attendance:{new:{status:"attending",hasInvitationLink:true,conflict:false}}});
  view.owner.loadFailure=true;await view.sync();
  assert.equal(view.find("ParticipantsPanel").props.disabled,true);
  assert.equal(view.find("ParticipantsPanel").props.current.participants.length,0);
  assert.deepEqual(view.owner.toasts,[]);assert.equal(await view.sync(),false);
  view.owner.loadFailure=false;
  const reload=nodes(view.find("EditorHeader").props.end).find(node=>node.props["aria-label"]==="reload");
  await reload.props.onClick();await view.settle();
  assert.equal(view.find("ParticipantsPanel").props.current.participants.length,1);
  assert.equal(view.owner.rsvpSync.refresh,1);
  await view.sync();assert.equal(view.owner.confirmed.current.plan.revision,2);
});

test("public guest import is one atomic action and shows the confirmed person before resuming seating",async t=>{
 const view=fixture(t,{plan:{rsvp_invitation_id:"invite"}});
 view.owner.action=async(name,input)=>{view.owner.calls.push({name,input});view.owner.confirmed.current.plan.revision++;
  view.owner.confirmed.current.people.push({id:"created",first_name:"Generic",archived_at:null});
  view.owner.confirmed.current.participants.push({project_guest_id:"created"});
  return {success:true,data:{revision:2,project_guest_id:"created"}};
 };
 view.find("ParticipantsPanel").props.onAddGuest();
 const added=await view.find("AddPlanGuestDialog").props.onIncludeGeneric("answer",null);
 assert.equal(added,"created");assert.equal(view.owner.calls.length,1);
 assert.equal(view.owner.calls[0].name,"includeGenericSeatingGuestAction");
 assert.equal(view.find("ParticipantsPanel").props.current.participants[0].project_guest_id,"created");
});
