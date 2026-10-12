/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),React=require('react');
function load(relative,options={},cache=new Map()) {
 const filename=path.resolve(__dirname,relative);if(cache.has(filename))return cache.get(filename).exports;
 const m=new Module(filename);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));cache.set(filename,m);
 m.require=request=>{
  if(request==='react-konva')return Object.fromEntries(['Group','Rect','Circle','Line','Text','Stage','Layer'].map(n=>[n,n]));
  if(request==='next/cache')return {revalidatePath:()=>options.revalidated?.push(true)};
  if(request.endsWith('/appearance/release'))return {SEATING_APPEARANCE_RELEASE_ENABLED:true,SEATING_PRESET_STYLES_RELEASE_ENABLED:options.enabled??true};
  if(request==='@/lib/supabase/server')return {createServerClient:async()=>{options.clients?.push(true);return options.db;}};
  if(request==='@/features/project-guests/types/database')return {nullableRpcArgs:a=>a};
  if(request.startsWith('.')) {
   const base=path.resolve(path.dirname(filename),request),resolved=['.ts','.tsx'].map(e=>base+e).find(f=>fs.existsSync(f));
   return load(path.relative(__dirname,resolved),options,cache);
  }
  return Module.prototype.require.call(m,request);
 };
 m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);return m.exports;
}
const presets=load('../appearance/presets.ts'),planId='50000000-0000-4000-8000-000000000001',id='50000000-0000-4000-8000-000000000002';
const table={shape:'rectangle',width_cm:400,height_cm:200,x_cm:600,y_cm:500,rotation_deg:0,capacity:8,name:'1'};
test('optional decoration defaults to the generic plan; invalid/legacy keys cannot enter presets',()=>{
 assert.deepEqual(presets.normalizePreset('room',{}),{floor_style:'neutral',table_theme:'generic'});
 assert.deepEqual(presets.normalizePreset('dance_floor',{}),{style:'classic_parquet'});
 for(const key of ['floor_color','guest_id','rsvp','x_cm','cloth'])assert.throws(()=>presets.normalizePreset('room',{[key]:'x'}));
 for(const value of [{style:null},{style:'unknown'},{border_color:'#ffffff'},{shadow:true}])assert.throws(()=>presets.normalizePreset('dance_floor',value));
 assert.throws(()=>presets.normalizePreset('stage',{style:'white'}));
});
function action(t,enabled=true,response={data:{revision:8,affected:1},error:null,status:200}) {
 const previous=process.env.PROJECT_GUESTS_ENABLED;process.env.PROJECT_GUESTS_ENABLED='true';t.after(()=>{if(previous===undefined)delete process.env.PROJECT_GUESTS_ENABLED;else process.env.PROJECT_GUESTS_ENABLED=previous;});
 const calls=[],clients=[],revalidated=[],filters=[];
 const query={select(){return this;},eq(...a){filters.push(a);return this;},async maybeSingle(){return {data:{kind:'dance_floor'},error:null};}};
 const db={from:()=>query,rpc:async(name,args)=>{calls.push({name,args});return response;}};
 return {calls,clients,revalidated,filters,run:load('../actions/setSeatingAppearanceAction.ts',{enabled,db,clients,revalidated}).setSeatingAppearanceAction};
}
test('the pending gate rejects shared-theme requests before any database call',async t=>{
 const a=action(t,false);assert.equal((await a.run({planId,revision:7,target:'table_theme',id:null,appearance:{table_theme:'rustic_green'}})).code,'APPEARANCE_UNAVAILABLE');assert.equal(a.clients.length,0);
});
test('shared table theme sends one plan-scoped RPC and one revision acknowledgement',async t=>{
 const a=action(t);assert.deepEqual(await a.run({planId,revision:7,target:'table_theme',id:null,appearance:{table_theme:'rustic_green'}}),{success:true,data:8});
 assert.equal(a.calls.length,1);assert.deepEqual(a.calls[0].args,{p_plan_id:planId,p_revision:7,p_target:'table_theme',p_object_id:null,p_appearance:{table_theme:'rustic_green'},p_all:false});assert.equal(a.revalidated.length,1);
});
test('a floor patch does not reset the shared table theme',async t=>{
 const a=action(t);await a.run({planId,revision:7,target:'room',id:null,appearance:{floor_style:'marble'}});
 assert.deepEqual(a.calls[0].args.p_appearance,{floor_style:'marble'});
});
test('per-table and bulk requests are rejected by the preset release',async t=>{
 const a=action(t);
 for(const input of [{target:'table',id,appearance:{}},{target:'table_theme',id,appearance:{}},{target:'table_theme',id:null,appearance:{table_theme:'generic'},all:true},{target:'room',id:null,appearance:{floor_color:null}}])assert.equal((await a.run({planId,revision:7,...input})).code,'APPEARANCE_INVALID');
 assert.equal(a.calls.length,0);
});
test('PT409, invalid acknowledgements and transport errors never trigger a retry or success refresh',async t=>{
 for(const response of [{data:null,error:{code:'PT409'},status:409},{data:{revision:8,affected:2},error:null,status:200},{data:{revision:7,affected:1},error:null,status:200}]) {
  const a=action(t,true,response);assert.equal((await a.run({planId,revision:7,target:'table_theme',id:null,appearance:{}})).success,false);assert.equal(a.calls.length,1);assert.equal(a.revalidated.length,0);
 }
});
test('floor appearance is saved separately under the plan-scoped RLS lookup',async t=>{
 const a=action(t);assert.equal((await a.run({planId,revision:7,target:'element',id,appearance:{style:'dark_wood'}})).success,true);
 assert.deepEqual(a.filters,[['id',id],['plan_id',planId]]);assert.deepEqual(a.calls[0].args.p_appearance,{style:'dark_wood'});
});
test('current template stores the theme once and omits table appearance, guests and identity',()=>{
 const build=load('../templates/buildSeatingTemplate.ts').buildSeatingTemplate;
 const doc=build(1200,1000,[{...table,id,project_id:id,plan_id:planId,appearance:{cloth:'sage'},guest_id:id}],[],{table_theme:'elegant_gold'});
 assert.deepEqual(doc.appearance,{floor_style:'neutral',table_theme:'elegant_gold'});
 assert.equal('appearance' in doc.tables[0],false);assert.equal('id' in doc.tables[0],false);assert.equal('guest_id' in doc.tables[0],false);
 const schema=load('../templates/seatingTemplate.schema.ts').seatingTemplateDocumentSchema;
 assert.equal(schema.safeParse({...doc,tables:[{...doc.tables[0],appearance:{}}]}).success,false);
 assert.equal(schema.safeParse({...doc,elements:[{kind:'stage',name:'Stage',x_cm:600,y_cm:500,width_cm:400,height_cm:240,rotation_deg:0,z_index:0,locked:false,appearance:{style:'white'}}]}).success,false);
});
function flatten(e,result=[]) { if(!e)return result; if(Array.isArray(e)){for(const c of e)flatten(c,result);return result;} if(typeof e.type==='function')return flatten(e.type(e.props),result);result.push(e);flatten(e.props?.children,result);return result; }
test('all themes preserve chair positions, selection IDs and pointer handling on both shapes',()=>{
 const {TableChairs}=load('../components/TableDecorations.tsx'),colors={fill:'white',text:'black',accent:'purple',accentText:'white'};
 for(const shape of ['round','rectangle'])for(const rotation_deg of [0,45,90,270]) {
  const t={...table,shape,rotation_deg,width_cm:shape==='round'?200:400},before=structuredClone(t);
  const generic=TableChairs({table:t,colors,selected:true,scale:1,onSeatSelect(){}});
  for(const theme of presets.TABLE_THEMES) {
   const themed=TableChairs({table:t,colors,selected:true,scale:1,theme,onSeatSelect(){}});
   assert.equal(themed.props.children.length,generic.props.children.length);
   themed.props.children.forEach((seat,i)=>{
    const original=generic.props.children[i];for(const k of ['x','y','rotation'])assert.equal(seat.props[k],original.props[k]);assert.equal(seat.key,original.key);
    assert.equal(typeof seat.props.onClick,'function');
    const num=seat.props.children.find(n=>n?.type==='Text');assert.equal(num.props.rotation,-rotation_deg-seat.props.rotation);
    assert.ok(flatten(seat).filter(n=>n.type==='Line'||n.type==='Rect').slice(1).every(n=>n.props.listening===false));
   });
  }
  assert.deepEqual(t,before);
 }
});
test('the same table renderer handles minimum sizes without invalid dimensions, and visuals never capture input',()=>{
 const render=load('../components/appearance/TableThemeRenderer.tsx').default;
 for(const theme of presets.TABLE_THEMES)for(const shape of ['round','rectangle']) {
  const result=render({table:{...table,shape,width_cm:10,height_cm:10},theme,scale:1});if(!result)continue;
  assert.equal(result.props.listening,false);
  for(const n of flatten(result)){if(n.props.width!==undefined)assert.ok(n.props.width>0);if(n.props.height!==undefined)assert.ok(n.props.height>0);if(n.props.radius!==undefined)assert.ok(n.props.radius>0);}
 }
});
test('theme decorations stay outside upright labels and inside both rotated table footprints',async()=>{
 const Konva=(await import('konva')).default,render=load('../components/appearance/TableThemeRenderer.tsx').default;
 const {tableContainsPoint,getTableLabelLayout}=load('../validation/canvasInteraction.ts');
 function tree(e){if(typeof e.type==='function')return tree(e.type(e.props));const {children,...attrs}=e.props,n=new (e.type===React.Fragment?Konva.Group:Konva[e.type])(attrs);for(const c of [children].flat(Infinity).filter(Boolean))n.add(tree(c));return n;}
 for(const shape of ['round','rectangle'])for(const rotation_deg of [0,30,45,90,135,270,359])for(const theme of ['classic_ivory','rustic_green','elegant_gold']) {
  const t={...table,shape,rotation_deg,width_cm:shape==='round'?200:400};const group=tree(render({table:t,theme,scale:1}));
  const decor=group.getChildren()[3],bounds=decor.getClientRect(),label=getTableLabelLayout(t);
  assert.ok(bounds.y+bounds.height<t.y_cm-label.height/2);
  for(const x of [bounds.x,bounds.x+bounds.width])for(const y of [bounds.y,bounds.y+bounds.height])assert.equal(tableContainsPoint(t,{x,y}),true);
  group.destroy();
 }
});
test('procedural tiles are reused across zoom/resize and their bitmap cache stays bounded',()=>{
 const previous=global.document;let allocations=0;
 const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 global.document={createElement:()=>{allocations++;return {getContext:()=>context};}};
 try {
  const {presetPattern}=load('../appearance/presetPatterns.ts');
  const tile=presetPattern('light_oak');assert.equal(presetPattern('light_oak'),tile);assert.equal(allocations,1);assert.equal(tile.width,240);assert.equal(tile.height,240);
  assert.equal(presetPattern('neutral'),undefined);assert.equal(allocations,1);
  for(let i=0;i<40;i++)presetPattern('linen','#'+String(i).padStart(6,'0'));
  assert.notEqual(presetPattern('light_oak'),tile);assert.equal(allocations,42);
 }finally{if(previous===undefined)delete global.document;else global.document=previous;}
});
