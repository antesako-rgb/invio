/* eslint-disable @typescript-eslint/no-require-imports */
// Isolated SQL integration runner; pass a PGlite module path. Never uses live credentials.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {PGlite}=require(path.resolve(process.argv[2]));
const root=path.resolve(__dirname,"../../../.."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const uuid=n=>"10000000-0000-4000-8000-"+String(n).padStart(12,"0");
const project=uuid(1),otherProject=uuid(2),member=uuid(3),outsider=uuid(4),plan=uuid(5),table=uuid(6),otherTable=uuid(7);
let checks=0;
(async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon;create role authenticated;create role service_role;
 create schema auth;create schema private;
 create table public.projects(id uuid primary key);
 create table public.invitations(project_id uuid,id uuid,unique(project_id,id));
 create table public.project_members(project_id uuid,user_id uuid);
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function private.is_project_member(p_project uuid,p_user uuid default auth.uid()) returns boolean language sql security definer set search_path='' as $$select exists(select 1 from public.project_members where project_id=p_project and user_id=p_user)$$;
 grant usage on schema public,auth,private to anon,authenticated,service_role;`);
 for(const entity of ["project_guests","seating_plans","seating_plan_guests","seating_tables","seating_assignments"]){
  for(const file of ["table","constraints","rls"])await db.exec(read("docs/seating/definitions/"+entity+"/"+file+".sql"));
  await db.exec("revoke all on public."+entity+" from public,anon,authenticated;grant select on public."+entity+" to authenticated;");
 }
 const baseline=[
  ["seating_plans","private.seating_authorize","uuid"],["seating_plans","private.lock_seating_project","uuid"],
  ["seating_plans","private.lock_seating_plan","uuid,bigint"],
  ["seating_assignments","private.assign_seating_guest_internal","uuid,bigint,uuid,uuid,integer,boolean"],
  ["seating_assignments","private.seating_assignment_seat_guard",""],["seating_tables","private.seating_table_seat_guard",""],
  ["seating_assignments","public.assign_seating_guest_to_seat","uuid,bigint,uuid,uuid,integer"]
 ];
 for(const [entity,name,args]of baseline){await db.exec(read("docs/seating/definitions/"+entity+"/"+name+".sql"));await db.exec("revoke all on function "+name+"("+args+") from public,anon,authenticated,service_role;");if(name.startsWith("public."))await db.exec("grant execute on function "+name+"("+args+") to authenticated;");}
 for(const entity of ["seating_assignments","seating_tables"])await db.exec(read("docs/seating/definitions/"+entity+"/trigger.sql"));
 await db.exec(read("docs/seating/install/007_preflight_read_only.sql"));checks++;
 await db.exec(read("docs/seating/install/007_bulk_seating_upgrade.sql"));checks++;
 await db.exec(read("docs/seating/install/007_verify_read_only.sql"));checks++;
 await assert.rejects(db.exec(read("docs/seating/install/007_bulk_seating_upgrade.sql")),/007 already installed/);await db.exec("rollback");checks++;
 await db.exec(`insert into public.projects values ('${project}'),('${otherProject}');insert into public.project_members values ('${project}','${member}');
 insert into public.seating_plans(id,project_id,name,width_cm,height_cm)values('${plan}','${project}','Test',2000,1500);
 insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm)values
 ('${table}','${project}','${plan}','Stol 1','rectangle',8,300,300,200,200),('${otherTable}','${project}','${plan}','Stol 2','round',8,700,700,200,200);`);
 for(let i=10;i<120;i++)await db.query("insert into public.project_guests(id,project_id,first_name)values($1,$2,$3)",[uuid(i),project,"Guest"+i]);
 await db.query("insert into public.project_guests(id,project_id,first_name)values($1,$2,'Cross')",[uuid(200),otherProject]);
 await db.query("update public.project_guests set archived_at=now() where id=$1",[uuid(119)]);
 await db.exec("set role authenticated");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);
 async function revision(){return Number((await db.query("select revision from public.seating_plans where id=$1",[plan])).rows[0].revision);}
 async function snapshot(){return JSON.stringify((await db.query("select (select jsonb_agg(a order by a.project_guest_id) from public.seating_assignments a) assignments,(select jsonb_agg(m order by m.project_guest_id) from public.seating_plan_guests m) members,(select revision from public.seating_plans where id=$1) revision",[plan])).rows);}
 async function call(ids,target=table,mode="auto",rev){return db.query("select public.assign_seating_guests($1,$2,$3::uuid[],$4,$5) revision",[plan,rev??await revision(),ids,target,mode]);}
 async function rejected(ids,target,mode,pattern,rev){const before=await snapshot();await assert.rejects(call(ids,target,mode,rev),pattern);assert.equal(await snapshot(),before);checks++;}
 async function seats(){return(await db.query("select project_guest_id,table_id,seat_number from public.seating_assignments order by project_guest_id")).rows;}
 let result=await call([uuid(10),uuid(11),uuid(12)]);assert.equal(Number(result.rows[0].revision),2);assert.deepEqual((await seats()).map(a=>a.seat_number),[1,2,3]);checks++;
 await call([uuid(13),uuid(14)],otherTable);checks++;
 await call([uuid(11),uuid(14),uuid(15)]);let rows=await seats();assert.equal(rows.find(a=>a.project_guest_id===uuid(11)).seat_number,2);assert.equal(rows.find(a=>a.project_guest_id===uuid(14)).seat_number,4);assert.equal(rows.find(a=>a.project_guest_id===uuid(15)).seat_number,5);checks++;
 await rejected([uuid(16),uuid(17),uuid(18),uuid(19)],table,"auto",/Table full/);
 await rejected([uuid(16),uuid(200)],table,"auto",/Active person missing/);
 await rejected([uuid(16),uuid(119)],table,"auto",/Active person missing/);
 await rejected([uuid(16),uuid(16)],table,"auto",/Invalid batch arguments/);
 await rejected([],table,"auto",/Invalid batch arguments/);
 await rejected([null],table,"auto",/Invalid batch arguments/);
 await rejected(Array.from({length:101},(_,i)=>uuid(i+10)),table,"auto",/Invalid batch arguments/);
 await rejected([uuid(16)],table,"defer",/Invalid batch arguments/);
 await rejected([uuid(16)],null,"auto",/Invalid batch arguments/);
 await rejected([uuid(16)],table,"include",/Invalid batch arguments/);
 await rejected([uuid(16)],uuid(999),"auto",/Table missing/);
 await rejected([uuid(16)],table,"auto",/Revision conflict/,1);
 result=await call([uuid(20),uuid(21)],null,"include");assert.equal((await seats()).length,6);assert.equal((await db.query("select count(*) n from public.seating_plan_guests")).rows[0].n,8);checks++;
 await call([uuid(10),uuid(11)],table);assert.equal((await seats()).find(a=>a.project_guest_id===uuid(11)).seat_number,2);checks++;
 // Deliberately fail on the second insert to prove membership + first seat + revision all roll back.
 await db.exec("reset role");await db.exec(`create function private.test_batch_failure()returns trigger language plpgsql as $$begin if new.project_guest_id='${uuid(17)}'::uuid then raise exception 'Injected late failure';end if;return new;end$$;
 create trigger test_batch_failure before insert on public.seating_assignments for each row execute function private.test_batch_failure();`);
 await db.exec("set role authenticated");await rejected([uuid(16),uuid(17)],table,"auto",/Injected late failure/);
 await db.exec("reset role;drop trigger test_batch_failure on public.seating_assignments;drop function private.test_batch_failure();set role authenticated");
 await call([uuid(16),uuid(17),uuid(18)],table);assert.equal((await seats()).filter(a=>a.table_id===table).length,8);checks++;
 await rejected([uuid(19)],table,"auto",/Table full/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await assert.rejects(call([uuid(22)],otherTable,"auto",await revision().catch(()=>1)),/Access denied/);checks++;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec("set role anon");await assert.rejects(call([uuid(22)],otherTable,"auto",1),/permission denied/);checks++;
 await db.exec("set role service_role");await assert.rejects(call([uuid(22)],otherTable,"auto",1),/permission denied/);checks++;
 await db.exec("reset role");const counts=(await db.query("select count(*) filter(where seat_number is null) missing,count(*)-count(distinct(plan_id,table_id,seat_number)) duplicates from public.seating_assignments")).rows[0];assert.equal(counts.missing,0);assert.equal(counts.duplicates,0);checks++;
 await db.query("select set_config('request.jwt.claim.sub','',false)");await db.exec("set role authenticated");await assert.rejects(call([uuid(22)],otherTable,"auto",1),/Access denied/);checks++;
 await db.exec("reset role");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);
 const largeTable=uuid(8);await db.query("insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm)values($1,$2,$3,'Long','rectangle',100,900,900,200,200)",[largeTable,project,plan]);
 await db.exec("set role authenticated");const beforeLarge=await revision();await call(Array.from({length:100},(_,i)=>uuid(10+i)),largeTable);
 assert.equal(await revision(),beforeLarge+1);assert.deepEqual((await db.query("select seat_number from public.seating_assignments where table_id=$1 order by seat_number",[largeTable])).rows.map(a=>a.seat_number),Array.from({length:100},(_,i)=>i+1));checks++;
 await db.exec("reset role");await db.exec(read("docs/seating/install/007_verify_read_only.sql"));checks++;
 // 008 must preserve all existing data when installed after the populated 007 fixture.
 const before008=await snapshot();await db.exec(read("docs/seating/install/008_preflight_read_only.sql"));checks++;
 await db.exec(read("docs/seating/install/008_manual_bulk_upgrade.sql"));assert.equal(await snapshot(),before008);checks++;
 await db.exec(read("docs/seating/install/008_verify_read_only.sql"));checks++;
 await assert.rejects(db.exec(read("docs/seating/install/008_manual_bulk_upgrade.sql")),/008 already installed/);await db.exec("rollback");checks++;
 for(const n of [210,211,212])await db.query("insert into public.project_guests(id,project_id,first_name)values($1,$2,$3)",[uuid(n),project,"New"+n]);
 await db.exec("set role authenticated");
 const seat=(n,number)=>({guest_id:uuid(n),seat_number:number});
 async function manual(input,target=table,rev){return db.query("select public.assign_seating_guests_to_seats($1,$2,$3,$4::jsonb) revision",[plan,rev??await revision(),target,JSON.stringify(input)]);}
 async function manualReject(input,pattern,target=table,rev){const before=await snapshot();await assert.rejects(manual(input,target,rev),pattern);assert.equal(await snapshot(),before);checks++;}
 const manualRev=await revision();await manual([seat(10,3),seat(210,6)]);assert.equal(await revision(),manualRev+1);assert.equal((await seats()).find(a=>a.project_guest_id===uuid(210)).seat_number,6);checks++;
 await manual([seat(10,3),seat(210,4)]);assert.equal((await seats()).find(a=>a.project_guest_id===uuid(210)).seat_number,4);checks++;
 await manualReject([seat(11,4)],/Seat occupied/);
 await manualReject([seat(10,4),seat(210,3)],/Seat occupied/);
 await manualReject([seat(11,2),seat(12,2)],/Seat occupied/);
 await manualReject([seat(11,1),seat(11,2)],/Invalid batch arguments/);
 await manualReject([seat(11,9)],/Seat outside table capacity/);
 await manualReject([seat(11,0)],/Seat outside table capacity/);
 await manualReject([seat(11,1.5)],/Seat outside table capacity/);
 await manualReject([seat(200,1)],/Active person missing/);
 await manualReject([seat(119,1)],/Active person missing/);
 await manualReject([],/Invalid batch arguments/);
 await manualReject(null,/Invalid batch arguments/);
 await manualReject([null],/Invalid batch arguments/);
 await manualReject([{guest_id:uuid(11),seat_number:"1"}],/Invalid batch arguments/);
 await manualReject([{...seat(11,1),extra:true}],/Invalid batch arguments/);
 await manualReject([seat(11,1)],/Table missing/,uuid(999));
 await manualReject([seat(11,1)],/Revision conflict/,table,1);
 await manualReject(Array.from({length:7},(_,i)=>seat(100+i,i+1)),/Table full/);
 await manualReject(Array.from({length:101},(_,i)=>seat(10+i,1)),/Invalid batch arguments/);
 await db.exec("reset role");await db.exec(`create function private.test_manual_failure()returns trigger language plpgsql as $$begin if new.project_guest_id='${uuid(212)}'::uuid then raise exception 'Injected manual failure';end if;return new;end$$;
 create trigger test_manual_failure before insert on public.seating_assignments for each row execute function private.test_manual_failure();`);
 await db.exec("set role authenticated");await manualReject([seat(211,1),seat(212,2)],/Injected manual failure/);
 await db.exec("reset role;drop trigger test_manual_failure on public.seating_assignments;drop function private.test_manual_failure();set role authenticated");
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await assert.rejects(manual([seat(211,1)],table,1),/Access denied/);checks++;
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec("set role anon");await assert.rejects(manual([seat(211,1)],table,1),/permission denied/);checks++;
 await db.exec("set role service_role");await assert.rejects(manual([seat(211,1)],table,1),/permission denied/);checks++;
 await db.exec("reset role;set role authenticated");await call([uuid(211)],largeTable);assert.equal((await seats()).find(a=>a.project_guest_id===uuid(211)).seat_number,1);checks++;
 const hundredManual=(await db.query("select project_guest_id,seat_number from public.seating_assignments where table_id=$1",[largeTable])).rows.map(a=>({guest_id:a.project_guest_id,seat_number:a.seat_number}));const hundredManualRev=await revision();await manual(hundredManual,largeTable);assert.equal(await revision(),hundredManualRev+1);checks++;
 await db.exec("reset role");await db.exec(read("docs/seating/install/007_verify_read_only.sql"));await db.exec(read("docs/seating/install/008_verify_read_only.sql"));checks++;
 console.log(checks+" isolated PostgreSQL/PGlite checks PASS; no live DB access. Single connection only.");
 }finally{await db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
