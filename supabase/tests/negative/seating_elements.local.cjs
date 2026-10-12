/* eslint-disable @typescript-eslint/no-require-imports */
// Isolated in-memory PostgreSQL only. Existing PGlite module path is required.
// No network, environment credentials, remote clients, or persistent database.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { PGlite } = require(path.resolve(process.argv[2]));
const root = path.resolve(__dirname, '../../..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const capture = JSON.parse(read('supabase/manifests/seating-elements.dev-capture.json'));
const id = n => '30000000-0000-4000-8000-'+String(n).padStart(12,'0');
const project=id(1), other=id(2), member=id(3), outsider=id(4), plan=id(5);
let checks=0;
(async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role;
 create schema private; create schema auth;
 create table public.projects(id uuid primary key);
 create table public.invitations(project_id uuid,id uuid,unique(project_id,id));
 create table public.project_members(project_id uuid,user_id uuid);
 create table public.seating_assignments(plan_id uuid,table_id uuid);
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function private.is_project_member(p_project uuid,p_user uuid default auth.uid()) returns boolean language sql security definer set search_path='' as $$select exists(select 1 from public.project_members where project_id=p_project and user_id=p_user)$$;
 grant usage on schema public,auth,private to authenticated,anon,service_role;`);
 // Table and function bodies come from the fresh DEV capture, never old docs SQL.
 for(const t of capture.tables){
  await db.exec(`create table public.${t.relname} (${t.columns.map(c=>c.name+' '+c.type+(c.default?' default '+c.default:'')+(c.not_null?' not null':'')).concat(t.constraints.map(c=>'constraint '+c.name+' '+c.definition)).join(',')});`);
  for(const index of t.indexes??[]) await db.exec(index);
  await db.exec(`revoke all on public.${t.relname} from public,anon,authenticated,service_role;grant select on public.${t.relname} to authenticated;grant all on public.${t.relname} to service_role;alter table public.${t.relname} enable row level security;`);
  for(const p of t.policies??[]) await db.exec(`create policy ${p.name} on public.${t.relname} for select to authenticated using (${p.qual});`);
 }
 for(const f of capture.functions){
  const sig=f.schema==='public'?'public.'+f.signature:f.signature;
  await db.exec(f.definition+`;revoke all on function ${sig} from public,anon,authenticated,service_role;${f.member_execute?'grant execute on function '+sig+' to authenticated;':''}`);
 }
 await db.exec(capture.tables.find(t=>t.relname==='seating_plans').triggers.join(';'));
 await db.exec(capture.tables.find(t=>t.relname==='seating_templates').triggers.join(';'));
 // Exercise wide platform defaults: APPLY must revoke them before COMMIT.
 await db.exec('alter default privileges in schema public grant all on tables to anon,authenticated,service_role; alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;');
 await db.exec(read('supabase/verify/assert/seating_elements_preflight.sql')); checks++;
 const migration=read('supabase/migrations/20261012180000_seating_elements.sql');
 // An error at the end must undo the entire migration, including new objects.
 await assert.rejects(db.exec(migration.replace('commit;','select 1/0; commit;'))); await db.exec('rollback');
 assert.equal((await db.query("select to_regclass('public.seating_elements') t")).rows[0].t,null); checks++;
 await db.exec(migration); checks++;
 for(const [kind,minW,minH,maxW,maxH] of [['dance_floor',200,200,2000,2000],['stage',200,120,2000,1200],['dj_booth',120,60,500,300]]){
  const base={kind,name:kind,x_cm:50000,y_cm:50000,width_cm:minW,height_cm:minH,rotation_deg:45,z_index:0,locked:false};
  const valid=async e=>(await db.query('select private.seating_element_valid($1::jsonb,100000,100000) v',[JSON.stringify(e)])).rows[0].v;
  assert.equal(await valid(base),true);assert.equal(await valid({...base,width_cm:maxW,height_cm:maxH}),true);checks++;
  assert.equal(await valid({...base,width_cm:minW-1}),false);assert.equal(await valid({...base,height_cm:maxH+1}),false);checks++;
  assert.equal(await valid({...base,plan_id:plan}),false);assert.equal(await valid({...base,locked:null}),false);checks++;
 }
 const inspect=read('supabase/verify/inspect/seating_elements.sql');
 await db.exec('begin read only;set local search_path=pg_catalog,public;');
 const snapshot=(await db.query(inspect.split('set local search_path=pg_catalog,public;')[1].split(';\nrollback;')[0])).rows[0].snapshot;
 await db.exec('rollback;');
 if(process.argv.includes('--capture-expected')){
  fs.writeFileSync(path.join(root,'supabase/manifests/seating-elements.expected.json'),JSON.stringify(snapshot,null,2)+'\n');
 } else {
  await db.exec(read('supabase/verify/assert/seating_elements.sql'));checks++;
  await db.exec('grant insert on public.seating_elements to authenticated');
  await assert.rejects(db.exec(read('supabase/verify/assert/seating_elements.sql')),/source\/schema\/security mismatch/);await db.exec('rollback');
  await db.exec('revoke insert on public.seating_elements from authenticated');checks++;
  await db.exec('alter table public.seating_elements drop constraint seating_elements_dimensions_check');
  await assert.rejects(db.exec(read('supabase/verify/assert/seating_elements.sql')),/source\/schema\/security mismatch/);await db.exec('rollback');checks++;
  // Restore the exact CHECK from the expected catalog snapshot.
  const constraints=JSON.parse(read('supabase/manifests/seating-elements.expected.json')).table.constraints;
  await db.exec('alter table public.seating_elements add constraint seating_elements_dimensions_check '+constraints.find(c=>c.name==='seating_elements_dimensions_check').def);
  await db.exec(read('supabase/verify/assert/seating_elements.sql'));checks++;
 }
 await assert.rejects(db.exec(migration),/already present/);await db.exec('rollback');checks++;
 await db.exec(`insert into public.projects values('${project}'),('${other}');insert into public.project_members values('${project}','${member}'); insert into public.seating_plans(id,project_id,name,width_cm,height_cm) values('${plan}','${project}','Test plan',1600,1200);`);
 const doc={kind:'dj_booth',name:'DJ',x_cm:400,y_cm:400,width_cm:200,height_cm:100,rotation_deg:45,z_index:0,locked:false};
 const rpc=async(op,rev,eid=null,e=doc)=>(await db.query('select public.manage_seating_element($1,$2,$3,$4,$5::jsonb) result',[plan,rev,eid,op,JSON.stringify(e)])).rows[0].result;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await db.exec('set role authenticated');
 await assert.rejects(rpc('create',1),e=>e.code==='42501');checks++;
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec('set role authenticated');
 let result=await rpc('create',1);assert.equal(result.revision,2); const element=result.id;checks++;
 await assert.rejects(rpc('update',1,element),e=>e.code==='PT409');checks++;
 await assert.rejects(db.query("select public.manage_seating_table($1,1,null,'create','Table','round',8,700,700,200,200,0)",[plan]),e=>e.code==='PT409');checks++;
 await assert.rejects(rpc('update',2,id(99)),e=>e.code==='P0002');checks++;
 await assert.rejects(db.query('delete from public.seating_elements'),e=>e.code==='42501');checks++;
 await assert.rejects(rpc('update',2,element,{...doc,x_cm:20}),e=>e.code==='22023');checks++;
 result=await rpc('update',2,element,{...doc,locked:true});assert.equal(result.revision,3);checks++;
 await assert.rejects(rpc('update',3,element,{...doc,locked:false,x_cm:500}),/Element locked/);checks++;
 result=await rpc('update',3,element,doc);assert.equal(result.revision,4);checks++;
 await db.exec('reset role');
 await assert.rejects(db.query('update public.seating_plans set width_cm=300 where id=$1',[plan]),/Room too small/);checks++;
 const template={width_cm:1600,height_cm:1200,tables:[],elements:[doc]};
 await db.query("insert into public.seating_templates(name,slug,document,document_version,is_active) values('v2','test-v2',$1::jsonb,2,true)",[JSON.stringify(template)]);
 await assert.rejects(db.query('select private.validate_seating_template($1,1)',[JSON.stringify(template)]),/Invalid template elements/);checks++;
 await assert.rejects(db.query('select private.validate_seating_template($1,2)',[JSON.stringify({...template,elements:[{...doc,width_cm:900}]})]),/Invalid element geometry/);checks++;
 await db.query('select private.validate_seating_template($1,1)',[JSON.stringify({width_cm:1600,height_cm:1200,tables:[]})]);checks++;
 await db.exec('set role authenticated');
 const tid=(await db.query('select id from public.seating_templates where slug=$1',['test-v2'])).rows[0]?.id;
 // Fixture template read ACL mirrors DEV (the migration does not alter it).
 await db.exec('reset role; grant select on public.seating_templates to authenticated;');
 const templateId=tid??(await db.query("select id from public.seating_templates where slug='test-v2'")).rows[0].id;
 await db.exec('set role authenticated');
 const newPlan=(await db.query('select public.create_seating_plan_from_template($1,$2,$3,null) result',[project,templateId,'From template'])).rows[0].result;
 assert.equal((await db.query('select count(*)::int n from public.seating_elements where plan_id=$1',[newPlan.id])).rows[0].n,1);checks++;
 await db.query("select public.manage_seating_table($1,1,null,'create','Table','round',8,700,700,200,200,0)",[newPlan.id]);checks++;
 await assert.rejects(db.query("select public.manage_seating_element($1,1,null,'create',$2::jsonb)",[newPlan.id,JSON.stringify(doc)]),e=>e.code==='PT409');checks++;
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await db.exec('set role authenticated');
 assert.equal((await db.query('select count(*)::int n from public.seating_elements')).rows[0].n,0);checks++;
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec('set role authenticated');
 result=await rpc('delete',4,element,null);assert.equal(result.revision,5);checks++;
 const version=(await db.query("select current_setting('server_version') version")).rows[0].version;
 console.log(JSON.stringify({result:'PASS',checks,postgres_version:version,remote_access:false,concurrency_verified:false}));
 } finally { await db.close(); }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
