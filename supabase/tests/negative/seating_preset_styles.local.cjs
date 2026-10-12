/* eslint-disable @typescript-eslint/no-require-imports */
// Isolated in-memory PostgreSQL only, using an already installed PGlite module.
// Reconstructs the reviewed predecessor migrations; never accesses remote data.
const fs=require('node:fs'),path=require('node:path');
const fixture=fs.readFileSync(path.join(__dirname,'seating_elements.local.cjs'),'utf8');
const stop=fixture.indexOf(' for(const [kind');
if(stop<0)throw Error('Reviewed fixture bootstrap marker missing');
const prefix=fixture.slice(0,stop)
 .replace('p_project uuid,p_user uuid default auth.uid()','p_project_id uuid,p_user_id uuid default auth.uid()')
 .replace('project_id=p_project and user_id=p_user','project_id=p_project_id and user_id=p_user_id');
const tests=String.raw`
 await db.exec('alter table public.seating_assignments add column seat_number integer');
 await db.exec(read('supabase/schemas/seating/seating_tables/functions/private.seating_table_seat_guard.sql'));
 await db.exec(read('supabase/schemas/seating/seating_tables/triggers.sql'));
 await db.exec('alter table public.projects add column owner_id uuid;create table public.project_collaborators(project_id uuid,profile_id uuid);');
 await db.exec(read('supabase/schemas/global_functions/private.is_project_owner.sql'));
 await db.exec(read('supabase/schemas/global_functions/private.is_project_member.sql'));
 await db.exec('revoke usage on schema private from service_role');
 await db.exec(read('supabase/migrations/20261012210000_seating_appearance.sql'));
 await db.exec(read('supabase/verify/assert/seating_appearance.sql'));checks++;
 const apply=read('supabase/migrations/20261012223000_seating_preset_styles.sql');
 const preflight=read('supabase/verify/assert/seating_preset_styles_preflight.sql');
 await db.exec(preflight);checks++;
 const before=(await db.query("select md5(prosrc) hash from pg_proc where oid='private.normalize_seating_appearance(text,jsonb)'::regprocedure")).rows[0].hash;
 await assert.rejects(db.exec(apply.replace('commit;','select 1/0;commit;')));await db.exec('rollback');
 assert.equal((await db.query("select count(*)::int n from pg_attribute where attrelid='public.seating_tables'::regclass and attname='appearance' and not attisdropped")).rows[0].n,1);
 assert.equal((await db.query("select md5(prosrc) hash from pg_proc where oid='private.normalize_seating_appearance(text,jsonb)'::regprocedure")).rows[0].hash,before);checks++;
 // Template-only data also refuses the cleanup even when plans/tables are empty.
 const oldTemplate={width_cm:1600,height_cm:1200,appearance:{},tables:[],elements:[]};
 await db.query('insert into public.seating_templates(id,name,slug,document,is_active) values($1,$2,$3,$4::jsonb,true)',[id(70),'Old','old',JSON.stringify(oldTemplate)]);
 await assert.rejects(db.exec(preflight),/seating data present/);await db.exec('rollback');
 await assert.rejects(db.exec(apply),/seating data present/);await db.exec('rollback');checks++;
 await db.query('delete from public.seating_templates where id=$1',[id(70)]);
 await db.exec('create view public.local_appearance_reference as select appearance from public.seating_tables');
 await assert.rejects(db.exec(apply),/unexpected seating_tables.appearance dependency/);await db.exec('rollback');checks++;
 await db.exec('drop view public.local_appearance_reference');
 await db.query('insert into public.projects(id) values($1),($2)',[project,other]);
 await db.query('insert into public.project_collaborators values($1,$2)',[project,member]);
 await db.query('insert into public.seating_plans(id,project_id,name,width_cm,height_cm) values($1,$2,$3,1600,1200)',[plan,project,'Existing']);
 await db.query('insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm,appearance) values($1,$2,$3,$4,$5,8,400,400,200,200,$6::jsonb)',[id(20),project,plan,'Round','round',JSON.stringify({cloth:'sage',texture:'linen',decoration:'floral'})]);
 await assert.rejects(db.exec(apply),/seating data present/);await db.exec('rollback');
 assert.equal((await db.query('select appearance from public.seating_tables where id=$1',[id(20)])).rows[0].appearance.cloth,'sage');checks++;
 await db.query('delete from public.seating_plans where id=$1',[plan]);
 await db.exec(apply);checks++;
 await db.exec(read('supabase/verify/assert/seating_preset_styles.sql'));checks++;
 assert.equal((await db.query("select count(*)::int n from pg_attribute where attrelid='public.seating_tables'::regclass and attname='appearance' and not attisdropped")).rows[0].n,0);checks++;
 await assert.rejects(db.exec(apply),/baseline.*changed/);await db.exec('rollback');checks++;
 const normalize=async(target,value)=>(await db.query('select private.normalize_seating_appearance($1,$2::jsonb) a',[target,JSON.stringify(value)])).rows[0].a;
 assert.deepEqual(await normalize('room',{}),{floor_style:'neutral',table_theme:'generic'});
 assert.deepEqual(await normalize('dance_floor',{}),{style:'classic_parquet'});checks++;
 for(const table_theme of ['generic','classic_ivory','rustic_green','modern_white','elegant_gold'])assert.equal((await normalize('table_theme',{table_theme})).table_theme,table_theme);checks++;
 for(const [target,key] of [['room','floor_color'],['room','cloth'],['table_theme','decoration'],['dance_floor','border_color'],['dance_floor','shadow'],['room','guest_id'],['room','revision'],['room','rsvp']]) {
  await assert.rejects(normalize(target,{[key]:'x'}),e=>e.code==='22023');checks++;
 }
 await assert.rejects(normalize('table',{}),e=>e.code==='22023');checks++;
 await assert.rejects(normalize('room',{table_theme:'unknown'}),e=>e.code==='22023');checks++;
 await db.query('insert into public.seating_plans(id,project_id,name,width_cm,height_cm) values($1,$2,$3,1600,1200)',[plan,project,'Preset']);
 await db.query('insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg) values($1,$2,$3,$4,$5,8,400,400,200,200,45),($6,$2,$3,$7,$8,12,850,400,300,150,90)',[id(20),project,plan,'Round','round',id(21),'Rectangle','rectangle']);
 const geometryBefore=(await db.query('select * from public.seating_tables order by id')).rows;
 const rpc=async(target,revision,object,appearance,all=false)=>(await db.query('select public.set_seating_appearance($1,$2,$3,$4,$5::jsonb,$6) r',[plan,revision,target,object,JSON.stringify(appearance),all])).rows[0].r;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await db.exec('set role authenticated');
 await assert.rejects(rpc('table_theme',1,null,{table_theme:'elegant_gold'}),e=>e.code==='42501');checks++;
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec('set role authenticated');
 assert.deepEqual(await rpc('table_theme',1,null,{table_theme:'elegant_gold'}),{revision:2,affected:1});checks++;
 assert.deepEqual((await db.query('select * from public.seating_tables order by id')).rows,geometryBefore);checks++;
 await assert.rejects(rpc('table_theme',1,null,{table_theme:'rustic_green'}),e=>e.code==='PT409');checks++;
 assert.equal((await rpc('room',2,null,{floor_style:'marble'})).revision,3);
 assert.deepEqual((await db.query('select appearance from public.seating_plans where id=$1',[plan])).rows[0].appearance,{floor_style:'marble',table_theme:'elegant_gold'});checks++;
 await assert.rejects(rpc('table',3,id(20),{}),e=>e.code==='22023');
 await assert.rejects(rpc('table_theme',3,null,{table_theme:'generic'},true),e=>e.code==='22023');
 await assert.rejects(rpc('table_theme',3,id(20),{table_theme:'generic'}),e=>e.code==='22023');checks++;
 // Existing create RPC automatically inherits by membership in the plan,
 // never by copying appearance into a new row.
 const created=(await db.query("select public.manage_seating_table($1,3,null,'create','New','round',8,1200,700,200,200,0) r",[plan])).rows[0].r;
 assert.equal(created.revision,4);
 const inherited=(await db.query('select p.appearance->>\'table_theme\' as theme from public.seating_tables t join public.seating_plans p on p.id=t.plan_id where t.plan_id=$1',[plan])).rows;
 assert.equal(inherited.length,3);assert.ok(inherited.every(row=>row.theme==='elegant_gold'));checks++;
 const floor={kind:'dance_floor',name:'Floor',x_cm:800,y_cm:800,width_cm:400,height_cm:400,rotation_deg:45,z_index:0,locked:true};
 const element=(await db.query("select public.manage_seating_element($1,4,null,'create',$2::jsonb) r",[plan,JSON.stringify(floor)])).rows[0].r;
 assert.equal((await rpc('element',5,element.id,{style:'herringbone'})).revision,6);
 assert.deepEqual((await db.query('select appearance from public.seating_elements where id=$1',[element.id])).rows[0].appearance,{style:'herringbone'});checks++;
 await assert.rejects(db.query("select public.manage_seating_element($1,6,$2,'update',$3::jsonb)",[plan,element.id,JSON.stringify({...floor,x_cm:820})]),/Element locked/);checks++;
 await assert.rejects(db.exec("update public.seating_plans set appearance='{}'"),e=>e.code==='42501');checks++;
 await db.exec('reset role');
 const document={width_cm:1600,height_cm:1200,appearance:{floor_style:'light_oak',table_theme:'classic_ivory'},tables:[{name:'Template table',shape:'round',capacity:8,x_cm:400,y_cm:400,width_cm:200,height_cm:200,rotation_deg:0}],elements:[{...floor,appearance:{style:'dark_wood'}}]};
 await db.query('select private.validate_seating_template($1::jsonb,2)',[JSON.stringify(document)]);checks++;
 await assert.rejects(db.query('select private.validate_seating_template($1::jsonb,2)',[JSON.stringify({...document,tables:[{...document.tables[0],appearance:{}}]})]),/Invalid table fields/);checks++;
 await db.query('insert into public.seating_templates(id,name,slug,document,is_active) values($1,$2,$3,$4::jsonb,true)',[id(40),'Preset template','preset-template',JSON.stringify(document)]);
 await db.exec('set role authenticated');
 const cloned=(await db.query('select public.create_seating_plan_from_template($1,$2,$3,null) p',[project,id(40),'Clone'])).rows[0].p;
 assert.deepEqual(cloned.appearance,{floor_style:'light_oak',table_theme:'classic_ivory'});
 assert.ok(!('appearance' in (await db.query('select * from public.seating_tables where plan_id=$1',[cloned.id])).rows[0]));
 assert.deepEqual((await db.query('select appearance from public.seating_elements where plan_id=$1',[cloned.id])).rows[0].appearance,{style:'dark_wood'});checks++;
 console.log(JSON.stringify({result:'PASS',checks,remote_access:false,concurrency_verified:false,frontend_tested_by_this_sql_suite:false}));
 } finally {await db.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
`;
new Function('require','process','__dirname',prefix+tests)(require,process,__dirname);
