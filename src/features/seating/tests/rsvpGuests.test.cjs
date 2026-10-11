/* eslint-disable @typescript-eslint/no-require-imports */
const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root=path.resolve(__dirname,"../../../.."),modules=new Map();
let rows,reads;
function load(filename) {
  filename=path.resolve(filename);
  if(modules.has(filename))return modules.get(filename).exports;
  const instance=new Module(filename);instance.filename=filename;instance.paths=Module._nodeModulePaths(path.dirname(filename));
  instance.require=function(request) {
    if(request==="server-only")return {};
    if(request==="@/lib/supabase/server")return {createServerClient:async()=>({from(table){
      const filters={},orders=[];
      function result(single=false){reads.push({table,filters:{...filters}});if(rows[table]===null)return {data:null,error:{code:"42P01"}};const data=rows[table].filter(row=>Object.entries(filters).every(([key,value])=>row[key]===value)).sort((a,b)=>{for(const key of orders){const result=String(a[key]).localeCompare(String(b[key]));if(result)return result;}return 0;});return {data:single?data[0]??null:data,error:null};}
      return {select(){return this;},eq(key,value){filters[key]=value;return this;},order(key){orders.push(key);return this;},maybeSingle(){return Promise.resolve(result(true));},then(resolve,reject){return Promise.resolve(result()).then(resolve,reject);}};
    }})};
    if(request.startsWith(".")||request.startsWith("@/")) {
      const base=request.startsWith("@/")?path.resolve(root,"src",request.slice(2)):path.resolve(path.dirname(filename),request);
      for(const extension of [".ts",".tsx"])if(fs.existsSync(base+extension))return load(base+extension);
    }
    return Module.prototype.require.call(this,request);
  };
  modules.set(filename,instance);
  instance._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
  return instance.exports;
}
const {getSeatingPlan}=load(path.resolve(__dirname,"../repositories/getSeatingPlan.ts"));
const previousFlag=process.env.PROJECT_GUESTS_ENABLED;
beforeEach(()=>{
  process.env.PROJECT_GUESTS_ENABLED="true";reads=[];
  rows={
    seating_plans:[{id:"plan",project_id:"project",rsvp_invitation_id:"invitation",revision:1}],
    project_guests:["new","seated","declined","pending","archived","generic","unlinked"].map(id=>({id,project_id:"project",archived_at:id==="archived"?"2026-10-11":null})),
    seating_plan_guests:[{plan_id:"plan",project_guest_id:"seated"}],
    seating_tables:[],seating_assignments:[{plan_id:"plan",project_guest_id:"seated",table_id:"table",seat_number:3}],
    invitation_guests:["new","seated","declined","pending","archived","generic"].map(id=>({id:"invite-"+id,invitation_id:"invitation",project_guest_id:id})),
    rsvp_responses:[{id:"personal",invitation_id:"invitation",response_type:"personalized",submitted_at:"2026-10-11T10:00:00Z",rsvp_response_guests:["new","seated","declined","archived"].map(id=>({id:"answer-"+id,invitation_guest_id:"invite-"+id,status:id==="declined"?"not_attending":"attending"}))},
      {id:"generic",invitation_id:"invitation",response_type:"generic",submitted_at:"2026-10-11T11:00:00Z",rsvp_response_guests:[{id:"linked-answer",invitation_guest_id:null,status:"attending"},{id:"unlinked-answer",invitation_guest_id:null,status:"attending"}]}],
    invitation_generic_guest_links:[{invitation_id:"invitation",response_guest_id:"linked-answer",project_guest_id:"generic"}],
    invitation_guest_groups:[],invitation_attendance_overrides:[],
  };
  for(const guest of rows.rsvp_responses[1].rsvp_response_guests){guest.first_name="Generic";guest.last_name="Test";}
});
after(()=>{if(previousFlag===undefined)delete process.env.PROJECT_GUESTS_ENABLED;else process.env.PROJECT_GUESTS_ENABLED=previousFlag;});

test("an RSVP attendee outside the plan receives their status and is eligible for explicit inclusion",async()=>{
  const current=await getSeatingPlan("plan");
  assert.deepEqual(current.attendance.new,{status:"attending",conflict:false,hasInvitationLink:true,manual:false});
  assert.deepEqual(current.participants,rows.seating_plan_guests);
  assert.deepEqual(current.assignments,rows.seating_assignments);
  assert.equal(current.attendance.generic.status,"attending");
});

test("generic attendance needs an explicit project identity link and never matches by name",async()=>{
  rows.project_guests.find(person=>person.id==="unlinked").first_name="same name";
  rows.rsvp_responses[1].rsvp_response_guests[1].first_name="same name";
  const current=await getSeatingPlan("plan");
  assert.equal(current.attendance.generic.status,"attending");
  assert.deepEqual(current.attendance.unlinked,{status:undefined,conflict:false,hasInvitationLink:false,manual:false});
});

test("declined, pending, archived and conflicting guests are excluded from automatic inclusion",async()=>{
  rows.rsvp_responses[1].rsvp_response_guests.push({id:"contradiction",invitation_guest_id:null,status:"not_attending"});
  rows.invitation_generic_guest_links.push({invitation_id:"invitation",response_guest_id:"contradiction",project_guest_id:"new"});
  const current=await getSeatingPlan("plan");
  assert.deepEqual(current.attendance.new,{status:"attending",conflict:true,hasInvitationLink:true,manual:false});
  assert.equal(current.attendance.declined.status,"not_attending");
  assert.equal(current.attendance.pending.status,undefined);
});

test("only the saved invitation supplies RSVP statuses; reads never create memberships",async()=>{
  rows.invitation_guests.push({id:"another-guest",invitation_id:"another",project_guest_id:"new"});
  rows.rsvp_responses.push({id:"another-response",invitation_id:"another",response_type:"personalized",submitted_at:"2026-10-11T12:00:00Z",rsvp_response_guests:[{id:"other-answer",invitation_guest_id:"another-guest",status:"not_attending"}]});
  const first=await getSeatingPlan("plan");assert.equal(first.attendance.new.status,"attending");
  rows.seating_plans[0].rsvp_invitation_id="another";
  const second=await getSeatingPlan("plan");assert.equal(second.attendance.new.status,"not_attending");
  assert.deepEqual(rows.seating_plan_guests,[{plan_id:"plan",project_guest_id:"seated"}]);
  const rsvpReads=reads.filter(read=>["invitation_guests","rsvp_responses","invitation_generic_guest_links"].includes(read.table));
  assert.deepEqual(rsvpReads.map(read=>read.filters.invitation_id),["invitation","invitation","invitation","another","another","another"]);
});

test("without a saved RSVP source there are no response reads or candidates",async()=>{
  rows.seating_plans[0].rsvp_invitation_id=null;
  const current=await getSeatingPlan("plan");
  assert.deepEqual(current.attendance,{});
  assert.ok(!reads.some(read=>read.table==="rsvp_responses"));
});

test("latest personalized responses use deterministic ordering and refresh without changing memberships",async()=>{
  rows.rsvp_responses.push({id:"older",invitation_id:"invitation",response_type:"personalized",submitted_at:"2026-10-11T09:00:00Z",rsvp_response_guests:[{id:"old-answer",invitation_guest_id:"invite-new",status:"not_attending"}]});
  assert.equal((await getSeatingPlan("plan")).attendance.new.status,"attending");
  rows.rsvp_responses.push({id:"newer",invitation_id:"invitation",response_type:"personalized",submitted_at:"2026-10-11T12:00:00Z",rsvp_response_guests:[{id:"new-answer",invitation_guest_id:"invite-new",status:"not_attending"}]});
  const refreshed=await getSeatingPlan("plan");
  assert.equal(refreshed.attendance.new.status,"not_attending");
  assert.deepEqual(refreshed.participants,rows.seating_plan_guests);
});

test("unlinked public answers are offered separately for explicit identity decisions",async()=>{
 const current=await getSeatingPlan("plan");
 assert.deepEqual(current.unlinkedGenericGuests,[{id:"unlinked-answer",first_name:"Generic",last_name:"Test",status:"attending",submitted_at:"2026-10-11T11:00:00Z"}]);
 assert.equal(current.participants.length,1);assert.equal(rows.project_guests.length,7);
});
test("manual status has precedence and groups come only from the saved invitation",async()=>{
 rows.invitation_attendance_overrides=[{invitation_id:"invitation",project_guest_id:"new",status:"not_attending"}];
 rows.invitation_guest_groups=[{invitation_id:"invitation",id:"family",name:"Family"},{invitation_id:"another",id:"other",name:"Other"}];
 rows.invitation_guests[0].group_id="family";
 const current=await getSeatingPlan("plan");
 assert.equal(current.attendance.new.status,"not_attending");assert.equal(current.attendance.new.manual,true);
 assert.equal(current.guestGroups.new,"family");assert.equal(current.invitationGroups.length,1);
 rows.invitation_attendance_overrides=[];
 assert.equal((await getSeatingPlan("plan")).attendance.new.status,"attending");
});
test("a missing attendance setup preserves existing seating and marks only the new feature unavailable",async()=>{
 rows.invitation_attendance_overrides=null;
 const current=await getSeatingPlan("plan");assert.equal(current.attendanceSetupRequired,true);
 assert.deepEqual(current.assignments,rows.seating_assignments);assert.equal(current.attendance.new.status,"attending");
});

test("an unsupported stored manual status never becomes a frontend attendance decision",async()=>{
 rows.invitation_attendance_overrides=[{invitation_id:"invitation",project_guest_id:"new",status:"pending"}];
 await assert.rejects(getSeatingPlan("plan"),/Invalid attendance override status/);
 assert.equal(rows.seating_plan_guests.length,1);
});
