/* eslint-disable @typescript-eslint/no-require-imports */
// Reuse the existing isolated DEV fixture bootstrap. No network or credentials.
const fs=require('node:fs'),path=require('node:path');
const fixture=fs.readFileSync(path.join(__dirname,'seating_elements.local.cjs'),'utf8');
const prefix=fixture.slice(0,fixture.indexOf(' for(const [kind'))
 .replace('p_project uuid,p_user uuid default auth.uid()','p_project_id uuid,p_user_id uuid default auth.uid()')
 .replace('project_id=p_project and user_id=p_user','project_id=p_project_id and user_id=p_user_id');
const tests=`
 await db.exec('alter table public.seating_assignments add column seat_number integer');
 await db.exec(read('supabase/schemas/seating/seating_tables/functions/private.seating_table_seat_guard.sql'));
 await db.exec(read('supabase/schemas/seating/seating_tables/triggers.sql'));
 await db.exec('alter table public.projects add column owner_id uuid;create table public.project_collaborators(project_id uuid,profile_id uuid);');
 await db.exec(read('supabase/schemas/global_functions/private.is_project_owner.sql'));
 await db.exec(read('supabase/schemas/global_functions/private.is_project_member.sql'));
 // Real DEV service_role lacks private schema USAGE. CHECK invokes the pure,
 // explicitly granted SECURITY DEFINER validator through its stored OID.
 await db.exec('revoke usage on schema private from service_role');
 const apply=read('supabase/migrations/20261012210000_seating_appearance.sql');
 await db.query('insert into public.seating_templates(id,name,slug,document_version,document,is_active) values($1,$2,$3,2,$4::jsonb,true)',[id(80),'Existing','existing',JSON.stringify({width_cm:1000,height_cm:1000,tables:[],elements:[]})]);
 await assert.rejects(db.exec(read('supabase/verify/assert/seating_appearance_preflight.sql')),/Stored templates present/);await db.exec('rollback');checks++;
 await db.query('delete from public.seating_templates where id=$1',[id(80)]);
 await db.exec(\`insert into public.projects values('\${id(90)}');insert into public.seating_plans(id,project_id,name,width_cm,height_cm) values('\${id(91)}','\${id(90)}','Existing',2000,1500);insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm) values('\${id(92)}','\${id(90)}','\${id(91)}','Existing','round',8,400,400,200,200);insert into public.seating_elements(id,project_id,plan_id,kind,name,x_cm,y_cm,width_cm,height_cm,rotation_deg,z_index,locked) values('\${id(93)}','\${id(90)}','\${id(91)}','stage','Existing',800,700,400,240,45,0,true);\`);
 const originalRows=await db.query("select jsonb_build_object('plan',(select to_jsonb(p) from public.seating_plans p where id=$1),'table',(select to_jsonb(t) from public.seating_tables t where id=$2),'element',(select to_jsonb(e) from public.seating_elements e where id=$3)) data",[id(91),id(92),id(93)]);
 await db.exec(read('supabase/verify/assert/seating_appearance_preflight.sql'));checks++;
 await assert.rejects(db.exec(apply.replace('commit;','select 1/0;commit;')));await db.exec('rollback');
 assert.equal((await db.query("select count(*)::int n from pg_attribute where attrelid='public.seating_plans'::regclass and attname='appearance' and not attisdropped")).rows[0].n,0);checks++;
 await db.exec(apply);checks++;
 const preservedRows=await db.query("select jsonb_build_object('plan',(select to_jsonb(p)-'appearance' from public.seating_plans p where id=$1),'table',(select to_jsonb(t)-'appearance' from public.seating_tables t where id=$2),'element',(select to_jsonb(e)-'appearance' from public.seating_elements e where id=$3)) data",[id(91),id(92),id(93)]);
 assert.deepEqual(preservedRows.rows,originalRows.rows);checks++;
 await db.query('delete from public.seating_plans where id=$1',[id(91)]);await db.query('delete from public.projects where id=$1',[id(90)]);
 const query=read('supabase/verify/inspect/seating_appearance.sql').split('set local search_path=pg_catalog,public;')[1].split(';\\nrollback;')[0];
 const snapshot=(await db.query(query)).rows[0].snapshot;
 if(process.argv.includes('--capture-expected')) {
  fs.writeFileSync(path.join(root,'supabase/manifests/seating-appearance.expected.json'),JSON.stringify(snapshot,null,2)+'\\n');
 } else {await db.exec(read('supabase/verify/assert/seating_appearance.sql'));checks++;}
 await assert.rejects(db.exec(apply),/already present|baseline.*changed/);await db.exec('rollback');checks++;
 for(const target of ['room','table','dance_floor','stage','dj_booth']) {
  const norm=(await db.query('select private.normalize_seating_appearance($1,$2::jsonb) a',[target,'{}'])).rows[0].a;
  assert.ok(norm);await assert.rejects(db.query('select private.normalize_seating_appearance($1,$2::jsonb)',[target,'{"guest_id":"x"}']),e=>e.code==='22023');checks++;
 }
 // Compare real frontend normalization with PostgreSQL for every exposed enum.
 const Module=require('node:module'),ts=require('typescript');
 const modelFile=path.join(root,'src/features/seating/appearance/model.ts'),compiled=new Module(modelFile);
 compiled.filename=modelFile;compiled.paths=Module._nodeModulePaths(path.dirname(modelFile));
 compiled._compile(ts.transpileModule(fs.readFileSync(modelFile,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,modelFile);
 const appearance=compiled.exports;
 for(const [target,key,values] of [['room','floor_style',appearance.ROOM_STYLES],['dance_floor','style',appearance.FLOOR_STYLES],['table','cloth',appearance.CLOTH_STYLES],['table','texture',appearance.TEXTURES],['table','decoration',appearance.DECORATIONS]]) {
  for(const value of values) {
   const input={[key]:value};const sqlValue=(await db.query('select private.normalize_seating_appearance($1,$2::jsonb) a',[target,JSON.stringify(input)])).rows[0].a;
   assert.deepEqual(sqlValue,appearance.normalizeAppearance(target,input));
  }checks++;
 }
 for(const input of [{floor_style:'unknown'},{floor_color:'#bad'},{floor_color:3},{floor_style:null}]) {await assert.rejects(db.query("select private.normalize_seating_appearance('room',$1::jsonb)",[JSON.stringify(input)]),e=>e.code==='22023');checks++;}
 await db.exec(\`insert into public.projects values('\${project}'),('\${other}');insert into public.project_members values('\${project}','\${member}');insert into public.seating_plans(id,project_id,name,width_cm,height_cm) values('\${plan}','\${project}','Appearance',1600,1200);insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm) values('\${id(20)}','\${project}','\${plan}','Round','round',8,400,400,200,200),('\${id(21)}','\${project}','\${plan}','Rectangle','rectangle',12,800,400,300,150);\`);
 await db.query('insert into public.project_collaborators values($1,$2)',[project,member]);
 const before=(await db.query('select id,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg from public.seating_tables order by id')).rows;
 const rpc=async(target,rev,obj,appearance,all=false)=>(await db.query('select public.set_seating_appearance($1,$2,$3,$4,$5::jsonb,$6) r',[plan,rev,target,obj,JSON.stringify(appearance),all])).rows[0].r;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await db.exec('set role authenticated');await assert.rejects(rpc('room',1,null,{}),e=>e.code==='42501');checks++;
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec('set role authenticated');
 assert.equal((await rpc('room',1,null,{floor_style:'light_oak'})).revision,2);checks++;
 await assert.rejects(rpc('table',1,null,{},true),e=>e.code==='PT409');checks++;
 const result=await rpc('table',2,null,{cloth:'sage',texture:'linen',decoration:'greenery'},true);assert.equal(result.revision,3);assert.equal(result.affected,2);checks++;
 assert.deepEqual((await db.query('select id,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg from public.seating_tables order by id')).rows,before);checks++;
 await assert.rejects(rpc('table',3,id(99),{}),e=>e.code==='P0002');await assert.rejects(rpc('room',3,null,{guest_id:'x'}),e=>e.code==='22023');checks++;
 await assert.rejects(db.exec("update public.seating_tables set appearance='{}'"),e=>e.code==='42501');checks++;
 await db.exec('reset role');
 await db.exec('set role service_role');
 await db.exec("update public.seating_tables set appearance='{}'");checks++;
 await db.exec('reset role');
 const lockedDoc={kind:'dance_floor',name:'Floor',x_cm:800,y_cm:700,width_cm:400,height_cm:400,rotation_deg:0,z_index:0,locked:true};
 await db.exec('set role authenticated');
 const created=(await db.query('select public.manage_seating_element($1,3,null,$2,$3::jsonb) r',[plan,'create',JSON.stringify(lockedDoc)])).rows[0].r;
 assert.equal((await rpc('element',4,created.id,{style:'dark_wood',shadow:true})).revision,5);checks++;
 await assert.rejects(db.query('select public.manage_seating_element($1,5,$2,$3,$4::jsonb)',[plan,created.id,'update',JSON.stringify({...lockedDoc,x_cm:850})]),/Element locked/);checks++;
 assert.equal((await db.query('select appearance from public.seating_elements where id=$1',[created.id])).rows[0].appearance.style,'dark_wood');checks++;
 await db.exec('reset role');
 const doc={width_cm:1600,height_cm:1200,appearance:{floor_style:'marble'},tables:[],elements:[]};
 await db.query('select private.validate_seating_template($1::jsonb,2)',[JSON.stringify(doc)]);checks++;
 await assert.rejects(db.query('select private.validate_seating_template($1::jsonb,1)',[JSON.stringify(doc)]),e=>e.code==='22023');checks++;
 doc.tables=[{name:'T',shape:'round',capacity:8,x_cm:400,y_cm:400,width_cm:200,height_cm:200,rotation_deg:0,appearance:{cloth:'ivory'}}];
 doc.elements=[{kind:'dance_floor',name:'Floor',x_cm:800,y_cm:700,width_cm:400,height_cm:400,rotation_deg:0,z_index:0,locked:true,appearance:{style:'herringbone',shadow:true}}];
 await db.query('select private.validate_seating_template($1::jsonb,2)',[JSON.stringify(doc)]);checks++;
 await db.query('insert into public.seating_templates(id,name,slug,document,is_active) values($1,$2,$3,$4::jsonb,true)',[id(40),'Template','appearance',JSON.stringify(doc)]);
 await db.exec('set role authenticated');
 const cloned=(await db.query('select public.create_seating_plan_from_template($1,$2,$3,null) p',[project,id(40),'Clone'])).rows[0].p;
 assert.equal(cloned.appearance.floor_style,'marble');
 assert.equal((await db.query('select appearance from public.seating_tables where plan_id=$1',[cloned.id])).rows[0].appearance.cloth,'ivory');
 assert.equal((await db.query('select appearance from public.seating_elements where plan_id=$1',[cloned.id])).rows[0].appearance.style,'herringbone');checks++;
 await db.exec('reset role');
 await assert.rejects(db.query('select private.validate_seating_template($1::jsonb,2)',[JSON.stringify({...doc,tables:[{...doc.tables[0],appearance:{guest_id:'x'}}]})]),e=>e.code==='22023');checks++;
 console.log(JSON.stringify({result:'PASS',checks,remote_access:false,concurrency_verified:false}));
 } finally {await db.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
`;
new Function('require','process','__dirname',prefix+tests)(require,process,__dirname);
