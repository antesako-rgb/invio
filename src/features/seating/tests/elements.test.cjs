/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
let enabled=false,clientCalls=0,result={data:null,error:null,status:200},calls=[];
const projectRoot=path.resolve(__dirname,'../../../..');
function load(file){
 const filename=path.resolve(__dirname,file);const mod=new Module(filename);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
 mod.require=function(request){
  if(request==='server-only')return {};
  if(request==='next/cache')return {revalidatePath(){}};
  if(request==='@/lib/supabase/server')return {createServerClient:async()=>{clientCalls++;return {rpc:async(name,args)=>{calls.push({name,args});return result;},from:()=>({select:()=>({eq:()=>({eq:async()=>result})})})};}};
  if(request.endsWith('/elements/release'))return {SEATING_ELEMENTS_RELEASE_ENABLED:enabled};
  if(request.startsWith('.'))return load(path.relative(__dirname,path.resolve(path.dirname(filename),request+'.ts')));
  if(request.startsWith('@/'))return load(path.relative(__dirname,path.resolve(projectRoot,'src',request.slice(2)+'.ts')));
  return Module.prototype.require.call(this,request);
 };
 mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
 return mod.exports;
}
const model=load('../elements/model.ts'),templates=load('../templates/seatingTemplate.schema.ts');
const uuid=n=>'40000000-0000-4000-8000-'+String(n).padStart(12,'0');
const doc=()=>model.initialElement('dj_booth','DJ',1000,1000);
test('kind bounds, integer dimensions and complete rotated footprint',()=>{
 for(const kind of Object.keys(model.ELEMENT_LIMITS)){
  const e=model.initialElement(kind,kind,1000,1000);assert.ok(model.elementFits(e,1000,1000));
  assert.equal(model.elementFits({...e,width_cm:model.ELEMENT_LIMITS[kind].maxWidth+1},10000,10000),false);
  assert.equal(model.elementFits({...e,height_cm:1},1000,1000),false);
 }
 assert.equal(model.elementFits({...doc(),x_cm:100,rotation_deg:45},1000,1000),false);
 assert.ok(model.elementFits({...doc(),x_cm:150,rotation_deg:90},1000,1000));
 assert.equal(model.elementFits({...doc(),rotation_deg:NaN},1000,1000),false);
 assert.equal(model.elementFits({...doc(),width_cm:150.5},1000,1000),false);
 assert.equal(model.initialElement('stage','Stage',100,100),null);
});
test('z order never moves a floor above fixtures',()=>{
 const e=(kind,z_index,id)=>({...doc(),kind,z_index,id});
 const elements=[e('stage',0,'b'),e('dance_floor',10000,'c'),e('dj_booth',0,'a')];
 assert.deepEqual(model.orderedElements(elements,'floor').map(e=>e.id),['c']);
 assert.deepEqual(model.orderedElements(elements,'fixtures').map(e=>e.id),['a','b']);
});
test('one current template requires room and element appearance, with tables inheriting from the plan',()=>{
 const legacy={width_cm:1000,height_cm:1000,tables:[]};
 assert.equal(templates.seatingTemplateDocumentSchema.safeParse(legacy).success,false);
 const current={...legacy,appearance:{},elements:[{...doc(),appearance:{}}]};
 assert.ok(templates.seatingTemplateDocumentSchema.safeParse(current).success);
 assert.equal(templates.seatingTemplateDocumentSchema.safeParse({...current,elements:[{...doc(),appearance:{},x_cm:0}]}).success,false);
 assert.equal(templates.seatingTemplateDocumentSchema.safeParse({...current,appearance:{guest_id:uuid(1)}}).success,false);
});

test('template export preserves layout and lock but excludes identities',()=>{
 const {buildSeatingTemplate}=load('../templates/buildSeatingTemplate.ts');
 const e={...doc(),id:uuid(1),project_id:uuid(2),plan_id:uuid(3),locked:true};
 const exported=buildSeatingTemplate(1000,1000,[],[e]);assert.equal(exported.elements[0].locked,true);
 assert.equal('id' in exported.elements[0],false);assert.equal('project_id' in exported.elements[0],false);
});
test('disabled release gate performs no DB calls even for a direct action',async()=>{
 enabled=false;clientCalls=0;
 const action=load('../actions/manageSeatingElementAction.ts').manageSeatingElementAction;
 assert.equal((await action({})).code,'ELEMENTS_UNAVAILABLE');assert.equal(clientCalls,0);
 const repo=load('../repositories/getSeatingElements.ts').getSeatingElements;
 assert.deepEqual(await repo(uuid(1),uuid(2)),{elements:[],elementsAvailable:false});assert.equal(clientCalls,0);
});
test('action validates revisions and never retries business conflicts',async()=>{
 enabled=true;const previous=process.env.PROJECT_GUESTS_ENABLED;process.env.PROJECT_GUESTS_ENABLED='true';
 try {
  const action=load('../actions/manageSeatingElementAction.ts').manageSeatingElementAction;
  const input={operation:'create',planId:uuid(1),revision:4,element:doc()};
  calls=[];result={data:null,error:{code:'PT409'},status:409};
  assert.equal((await action(input)).code,'REVISION_CONFLICT');assert.equal(calls.length,1);
  result={data:{id:uuid(2),revision:5},error:null,status:200};assert.equal((await action(input)).success,true);
  result={data:{id:uuid(2),revision:7},error:null,status:200};assert.equal((await action(input)).code,'SEATING_UNCONFIRMED');
  const before=calls.length;assert.equal((await action({...input,element:{...doc(),width_cm:900}})).success,false);assert.equal(calls.length,before);
 } finally {if(previous===undefined)delete process.env.PROJECT_GUESTS_ENABLED;else process.env.PROJECT_GUESTS_ENABLED=previous;}
});
test('missing model hides features; permission failures are not hidden',async()=>{
 enabled=true;const repo=load('../repositories/getSeatingElements.ts').getSeatingElements;
 result={data:null,error:{code:'PGRST205'},status:404};assert.equal((await repo(uuid(1),uuid(2))).elementsAvailable,false);
 result={data:null,error:{code:'42501'},status:403};await assert.rejects(repo(uuid(1),uuid(2)));
});
