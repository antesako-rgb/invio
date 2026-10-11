/* eslint-disable @typescript-eslint/no-require-imports */
const {test,beforeEach,after}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript");
const root=path.resolve(__dirname,"../../../.."),modules=new Map();
const id=n=>"10000000-0000-4000-8000-"+String(n).padStart(12,"0");
let state;
function load(filename){
 filename=path.resolve(filename);if(modules.has(filename))return modules.get(filename).exports;
 const instance=new Module(filename);instance.filename=filename;instance.paths=Module._nodeModulePaths(path.dirname(filename));
 instance.require=function(request){
  if(request==="server-only")return {};
  if(request==="next/cache")return {revalidatePath:(...args)=>state.revalidated.push(args)};
  if(request==="@/lib/supabase/server")return {createServerClient:async()=>{state.clients++;return {
   from(table){assert.equal(table,"invitations");let project;return {select(){return this;},eq(key,value){assert.equal(key,"project_id");project=value;return this;},limit(limit){state.reads.push({table,project,limit});return Promise.resolve({data:state.invitations.filter(item=>item.project_id===project).slice(0,limit),error:state.readError});}};},
   rpc:async(name,args)=>{state.calls.push({name,args});if(state.throws)throw Error("Transport interrupted");return state.result;},
  };}};
  if(request.startsWith(".")||request.startsWith("@/")){
   const base=request.startsWith("@/")?path.resolve(root,"src",request.slice(2)):path.resolve(path.dirname(filename),request);
   for(const extension of [".ts",".tsx"])if(fs.existsSync(base+extension))return load(base+extension);
  }
  return Module.prototype.require.call(this,request);
 };
 modules.set(filename,instance);instance._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);return instance.exports;
}
const {syncSeatingRsvpGuestsAction}=load(path.resolve(__dirname,"../actions/syncSeatingRsvpGuestsAction.ts"));
const {includeGenericSeatingGuestAction}=load(path.resolve(__dirname,"../actions/includeGenericSeatingGuestAction.ts"));
const {setGuestAttendanceAction}=load(path.resolve(__dirname,"../../project-guests/actions/attendanceActions.ts"));
const {manageSeatingPlanAction}=load(path.resolve(__dirname,"../actions/seatingActions.ts"));
const {createPlanFromTemplateAction}=load(path.resolve(__dirname,"../actions/createPlanFromTemplateAction.ts"));
const input={p_project_id:id(1),p_plan_id:id(2),p_revision:12};
const create={p_project_id:id(1),p_plan_id:null,p_revision:null,p_operation:"create",p_name:"Plan",p_width_cm:2000,p_height_cm:1500,p_rsvp_invitation_id:null};
const previousFlag=process.env.PROJECT_GUESTS_ENABLED;
beforeEach(()=>{process.env.PROJECT_GUESTS_ENABLED="true";state={clients:0,calls:[],reads:[],invitations:[],revalidated:[],result:{data:{revision:13,added_count:3},error:null,status:200},readError:null,throws:false};});
after(()=>{if(previousFlag===undefined)delete process.env.PROJECT_GUESTS_ENABLED;else process.env.PROJECT_GUESTS_ENABLED=previousFlag;});

test("automatic synchronization calls only one authenticated RPC without client-provided identities or statuses",async()=>{
 assert.deepEqual(await syncSeatingRsvpGuestsAction(input),{success:true,data:{revision:13,added_count:3}});
 assert.deepEqual(state.calls,[{name:"sync_seating_rsvp_guests",args:input}]);assert.equal(state.reads.length,0);assert.equal(state.revalidated.length,1);
});
test("no new arrivals acknowledge the same revision and do not invalidate the plan list",async()=>{
 state.result.data={revision:12,added_count:0};assert.deepEqual(await syncSeatingRsvpGuestsAction(input),{success:true,data:state.result.data});assert.deepEqual(state.revalidated,[]);
});
test("unsafe inputs and feature flags stop synchronization before a database client is created",async()=>{
 for(const patch of [{p_project_id:null},{p_plan_id:"bad"},{p_revision:0},{p_revision:Number.MAX_SAFE_INTEGER},{guest_ids:[id(3)]}])assert.equal((await syncSeatingRsvpGuestsAction({...input,...patch})).success,false);
 process.env.PROJECT_GUESTS_ENABLED="false";assert.equal((await syncSeatingRsvpGuestsAction(input)).success,false);assert.equal(state.clients,0);
});
test("malformed or implausible acknowledgement requires reload and never invalidates confirmed state",async()=>{
 for(const data of [null,{revision:12,added_count:1},{revision:13,added_count:0},{revision:14,added_count:1},{revision:13,added_count:-1},{revision:13,added_count:1.5},{revision:"13",added_count:1}]){
  state.result.data=data;assert.equal((await syncSeatingRsvpGuestsAction(input)).code,"SEATING_UNCONFIRMED");
 }
 assert.equal(state.revalidated.length,0);
});
test("missing model, revision conflict and transport failures remain distinct and never retry a write",async()=>{
 for(const [error,status,code]of [[{code:"PGRST202"},404,"SEATING_RSVP_SETUP_REQUIRED"],[{code:"42883"},400,"SEATING_RSVP_SETUP_REQUIRED"],[{code:"40001"},400,"REVISION_CONFLICT"],[{message:"Gateway timeout"},504,"SEATING_UNCONFIRMED"]]){
  state.calls=[];state.result={error,data:null,status};assert.equal((await syncSeatingRsvpGuestsAction(input)).code,code);assert.equal(state.calls.length,1);
 }
 state.throws=true;assert.equal((await syncSeatingRsvpGuestsAction(input)).code,"SEATING_UNCONFIRMED");assert.equal(state.revalidated.length,0);
});
test("a sole invitation in the same project is automatically saved as the new plan's source",async()=>{
 state.invitations=[{id:id(3),project_id:id(1)},{id:id(4),project_id:id(9)}];
 await manageSeatingPlanAction(create);
 assert.equal(state.calls[0].args.p_rsvp_invitation_id,id(3));assert.deepEqual(state.reads,[{table:"invitations",project:id(1),limit:2}]);
});
test("zero or several invitations leave the new plan disconnected until a deliberate choice",async()=>{
 for(const count of [0,2,10]){
  state.invitations=Array.from({length:count},(_,i)=>({id:id(10+i),project_id:id(1)}));state.calls=[];
  await manageSeatingPlanAction(create);assert.equal(state.calls[0].args.p_rsvp_invitation_id,null);
 }
});
test("template plans get the same sole-invitation default as blank plans",async()=>{
 state.invitations=[{id:id(3),project_id:id(1)}];state.result.data={id:id(2),project_id:id(1),revision:1};
 assert.equal((await createPlanFromTemplateAction({projectId:id(1),templateId:id(5),name:"Plan",rsvpInvitationId:null})).success,true);
 assert.equal(state.calls[0].name,"create_seating_plan_from_template");assert.equal(state.calls[0].args.p_rsvp_invitation_id,id(3));
});
test("an explicit source and a disconnected plan update never get overwritten by the automatic default",async()=>{
 state.invitations=[{id:id(3),project_id:id(1)}];
 await manageSeatingPlanAction({...create,p_rsvp_invitation_id:id(4)});
 await manageSeatingPlanAction({...create,p_operation:"update",p_plan_id:id(2),p_revision:12});
 assert.equal(state.calls[0].args.p_rsvp_invitation_id,id(4));assert.equal(state.calls[1].args.p_rsvp_invitation_id,null);assert.deepEqual(state.reads,[]);
});
test("failure reading invitation defaults prevents creation rather than saving an unintended source",async()=>{
 state.readError=Error("Read failed");await assert.rejects(manageSeatingPlanAction(create),/Read failed/);assert.equal(state.calls.length,0);
});

test("public guest identity and seating inclusion use a single RPC and validate the acknowledged person and revision",async()=>{
 const data={revision:13,project_guest_id:id(8)};state.result.data=data;
 const args={p_plan_id:id(2),p_revision:12,p_response_guest_id:id(6),p_project_guest_id:null,p_create_new:true};
 assert.deepEqual(await includeGenericSeatingGuestAction(args),{success:true,data});assert.deepEqual(state.calls,[{name:"include_generic_seating_guest",args}]);
 state.result.data={...data,revision:12};assert.equal((await includeGenericSeatingGuestAction(args)).code,"SEATING_UNCONFIRMED");
 assert.equal((await includeGenericSeatingGuestAction({...args,p_project_guest_id:id(8)})).success,false);
});
test("manual attendance writes and clears an override without submitting or rewriting public answers",async()=>{
 const args={invitationId:id(3),personId:id(8),status:"not_attending"};state.result.data={project_guest_id:id(8),status:"not_attending"};
 assert.equal((await setGuestAttendanceAction(args)).success,true);
 assert.deepEqual(state.calls[0],{name:"set_invitation_guest_attendance",args:{p_invitation_id:id(3),p_project_guest_id:id(8),p_status:"not_attending"}});
 state.result.data={project_guest_id:id(8),status:null};assert.equal((await setGuestAttendanceAction({...args,status:null})).success,true);
 assert.equal((await setGuestAttendanceAction({...args,status:"pending"})).success,false);
 assert.equal((await setGuestAttendanceAction({...args,projectId:id(1)})).success,false);
});
test("manual status distinguishes missing setup and unconfirmed outcomes without retrying",async()=>{
 const args={invitationId:id(3),personId:id(8),status:"attending"};
 for(const [error,status,expected]of [[{code:"PGRST202"},404,"ATTENDANCE_SETUP_REQUIRED"],[{message:"Gateway failure"},504,"ATTENDANCE_UNCONFIRMED"]]){
  state.calls=[];state.result={error,status,data:null};assert.equal((await setGuestAttendanceAction(args)).code,expected);assert.equal(state.calls.length,1);
 }
 state.result={data:{project_guest_id:id(9),status:"attending"},error:null,status:200};assert.equal((await setGuestAttendanceAction(args)).code,"ATTENDANCE_UNCONFIRMED");
});
