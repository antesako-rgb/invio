/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
let clients=0;
function load(relative, options={}) {
 const filename=path.resolve(__dirname,relative),m=new Module(filename);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));
 m.require=request=>{
  if(request==='next/cache')return {revalidatePath:(...args)=>options.revalidated?.push(args)};
  if(request.endsWith('/appearance/release'))return {SEATING_APPEARANCE_RELEASE_ENABLED:options.enabled??false,SEATING_PRESET_STYLES_RELEASE_ENABLED:options.enabled??false};
  if(request==='@/lib/supabase/server')return {createServerClient:async()=>{clients++;if(options.db)return options.db;throw Error('Unexpected DB access');}};
  if(request==='@/features/project-guests/types/database')return {nullableRpcArgs:args=>args};
  if(request.startsWith('.'))return load(path.relative(__dirname,path.resolve(path.dirname(filename),request+'.ts')),options);
  return Module.prototype.require.call(m,request);
 };
 m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);return m.exports;
}
const presets=load('../appearance/presets.ts');
const model={...load('../appearance/model.ts'),...presets,normalizeAppearance:presets.normalizePreset,appearanceActionSchema:presets.presetActionSchema};
test('neutral defaults preserve the generic room and undecorated tables',()=>{
 assert.deepEqual(model.normalizeAppearance('room',{}),{floor_style:'neutral',table_theme:'generic'});
 assert.deepEqual(model.normalizeAppearance('table_theme',{}),{table_theme:'generic'});
 assert.deepEqual(model.normalizeAppearance('dance_floor',{}),{style:'classic_parquet'});
});
test('all supported styles normalize without geometry or identity fields',()=>{
 for(const floor_style of model.ROOM_STYLES)assert.equal(model.normalizeAppearance('room',{floor_style}).floor_style,floor_style);
 for(const table_theme of model.TABLE_THEMES)assert.deepEqual(model.normalizeAppearance('table_theme',{table_theme}),{table_theme});
 for(const style of model.FLOOR_STYLES)assert.equal(model.normalizeAppearance('dance_floor',{style}).style,style);
});
test('appearance rejects guest, RSVP, geometry and unknown/null style values',()=>{
 for(const target of ['room','table_theme','dance_floor','stage','dj_booth'])for(const key of ['guest_id','rsvp','seat_number','x_cm','plan_id'])assert.throws(()=>model.normalizeAppearance(target,{[key]:'x'}));
 for(const value of [null,[],{floor_style:null},{floor_style:'unknown'},{floor_color:'#bad'},{floor_color:3}])assert.throws(()=>model.normalizeAppearance('room',value));
 assert.throws(()=>model.normalizeAppearance('dance_floor',{shadow:'true'}));
});
test('shared themes require plan identity and reject bulk/per-table requests',()=>{
 const base={planId:'50000000-0000-4000-8000-000000000001',revision:1,target:'table_theme',id:null,appearance:{},all:false};
 assert.equal(model.appearanceActionSchema.safeParse(base).success,true);
 assert.equal(model.appearanceActionSchema.safeParse({...base,all:true}).success,false);
 assert.equal(model.appearanceActionSchema.safeParse({...base,id:base.planId}).success,false);
});
test('pending appearance release makes no database calls',async()=>{
 const previous=process.env.PROJECT_GUESTS_ENABLED;process.env.PROJECT_GUESTS_ENABLED='true';clients=0;
 try {assert.equal((await load('../actions/setSeatingAppearanceAction.ts').setSeatingAppearanceAction({})).code,'APPEARANCE_UNAVAILABLE');assert.equal(clients,0);}
 finally {if(previous===undefined)delete process.env.PROJECT_GUESTS_ENABLED;else process.env.PROJECT_GUESTS_ENABLED=previous;}
});

function activeAction(t, response={data:{revision:8,affected:1},error:null,status:200}) {
 const previous=process.env.PROJECT_GUESTS_ENABLED;process.env.PROJECT_GUESTS_ENABLED='true';
 t.after(()=>{if(previous===undefined)delete process.env.PROJECT_GUESTS_ENABLED;else process.env.PROJECT_GUESTS_ENABLED=previous;});
 const calls=[],filters=[],revalidated=[];
 const query={select(){return this;},eq(...args){filters.push(args);return this;},async maybeSingle(){return {data:{kind:'dance_floor'},error:null};}};
 const db={from:name=>{filters.push(['from',name]);return query;},async rpc(name,args){calls.push({name,args});if(response instanceof Error)throw response;return response;}};
 return {calls,filters,revalidated,query,run:load('../actions/setSeatingAppearanceAction.ts',{enabled:true,db,revalidated}).setSeatingAppearanceAction};
}
const planId='50000000-0000-4000-8000-000000000001',objectId='50000000-0000-4000-8000-000000000002';
test('active room appearance sends SQL NULL identity and a validated patch through the native RPC',async t=>{
 const f=activeAction(t);
 assert.deepEqual(await f.run({planId,revision:7,target:'room',id:null,appearance:{floor_style:'light_oak'}}),{success:true,data:8});
 assert.deepEqual(f.calls,[{name:'set_seating_appearance',args:{p_plan_id:planId,p_revision:7,p_target:'room',p_object_id:null,p_appearance:{floor_style:'light_oak'},p_all:false}}]);
 assert.equal(f.revalidated.length,1);
});
test('active shared theme is one RPC with one revision acknowledgement and no geometry or guests',async t=>{
 const f=activeAction(t);
 assert.equal((await f.run({planId,revision:7,target:'table_theme',id:null,appearance:{table_theme:'rustic_green'}})).success,true);
 assert.equal(f.calls.length,1);assert.equal(f.calls[0].args.p_all,false);assert.equal(f.calls[0].args.p_object_id,null);
 assert.deepEqual(f.calls[0].args.p_appearance,{table_theme:'rustic_green'});
});
test('element appearance reads its kind under RLS and scopes lookup to the selected plan',async t=>{
 const f=activeAction(t);
 assert.equal((await f.run({planId,revision:7,target:'element',id:objectId,appearance:{style:'herringbone'}})).success,true);
 assert.deepEqual(f.filters,[['from','seating_elements'],['id',objectId],['plan_id',planId]]);
 assert.deepEqual(f.calls[0].args.p_appearance,{style:'herringbone'});
 f.query.maybeSingle=async()=>({data:null,error:null});
 assert.equal((await f.run({planId,revision:7,target:'element',id:objectId,appearance:{}})).code,'APPEARANCE_INVALID');
 assert.equal(f.calls.length,1);
});
test('appearance denies unknown keys and invalid bulk targets before invoking a mutation',async t=>{
 const f=activeAction(t);
 for(const p of [{target:'room',id:null,appearance:{guest_id:objectId}},{target:'element',id:objectId,appearance:{style:'marble'}},{target:'room',id:null,appearance:{},all:true}])
  assert.equal((await f.run({planId,revision:7,...p})).code,'APPEARANCE_INVALID');
 assert.equal(f.calls.length,0);
});
test('appearance PT409 and transport failures are not retried or reported as saved',async t=>{
 for(const [response,code] of [[{data:null,error:{code:'PT409'},status:409},'REVISION_CONFLICT'],[new Error('network'),'SEATING_UNCONFIRMED'],[{data:null,error:{message:'gateway'},status:502},'SEATING_UNCONFIRMED']]) {
  const f=activeAction(t,response);
  assert.equal((await f.run({planId,revision:7,target:'table_theme',id:null,appearance:{}})).code,code);
  assert.equal(f.calls.length,1);assert.equal(f.revalidated.length,0);
 }
});
test('malformed or stale RPC acknowledgements require reload rather than another write',async t=>{
 for(const data of [{revision:7,affected:1},{revision:8,affected:0},{revision:8},null]) {
  const f=activeAction(t,{data,error:null,status:200});
  assert.equal((await f.run({planId,revision:7,target:'table_theme',id:null,appearance:{}})).code,'SEATING_UNCONFIRMED');
  assert.equal(f.calls.length,1);assert.equal(f.revalidated.length,0);
 }
});
