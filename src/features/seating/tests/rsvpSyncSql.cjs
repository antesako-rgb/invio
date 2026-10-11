/* eslint-disable @typescript-eslint/no-require-imports */
// Isolated PostgreSQL runner. Pass a PGlite module directory; never uses live credentials.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {PGlite}=require(path.resolve(process.argv[2]));
const root=path.resolve(__dirname,"../../../.."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const uuid=n=>"10000000-0000-4000-8000-"+String(n).padStart(12,"0");
const project=uuid(1),otherProject=uuid(2),member=uuid(3),outsider=uuid(4),plan=uuid(5),invite=uuid(6),otherInvite=uuid(7),table=uuid(8);
let checks=0;
(async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema private;
   create table public.projects(id uuid primary key);
   create table public.invitations(project_id uuid,id uuid primary key,unique(project_id,id));
   create table public.project_members(project_id uuid,user_id uuid);
   create function auth.uid()returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   create function private.is_project_member(p_project uuid,p_user uuid default auth.uid())returns boolean language sql security definer set search_path='' as $$select exists(select 1 from public.project_members where project_id=p_project and user_id=p_user)$$;
   grant usage on schema public,auth,private to anon,authenticated,service_role;
   create table public.invitation_guests(id uuid primary key,project_id uuid,invitation_id uuid,project_guest_id uuid,unique(invitation_id,project_guest_id));
   create table public.rsvp_responses(id uuid primary key,project_id uuid,invitation_id uuid,response_type text,submitted_at timestamptz);
   create table public.rsvp_response_guests(id uuid primary key,response_id uuid,invitation_guest_id uuid,status text);
   create table public.invitation_generic_guest_links(project_id uuid,invitation_id uuid,response_guest_id uuid primary key,project_guest_id uuid);`);
  for(const entity of ["project_guests","seating_plans","seating_plan_guests","seating_tables","seating_assignments"]){
   for(const file of ["table","constraints","rls"])await db.exec(read(`docs/seating/definitions/${entity}/${file}.sql`));
   await db.exec(`revoke all on public.${entity} from public,anon,authenticated;grant select on public.${entity} to authenticated;`);
  }
  for(const [entity,name,args]of [
   ["seating_plans","private.seating_authorize","uuid"],["seating_plans","private.lock_seating_project","uuid"],
   ["seating_plans","private.lock_seating_plan","uuid,bigint"],
   ["seating_assignments","private.assign_seating_guest_internal","uuid,bigint,uuid,uuid,integer,boolean"],
   ["seating_assignments","private.seating_assignment_seat_guard",""],["seating_tables","private.seating_table_seat_guard",""],
   ["seating_assignments","public.assign_seating_guest_to_seat","uuid,bigint,uuid,uuid,integer"],
   ["seating_plans","public.manage_seating_plan","uuid,uuid,bigint,text,text,integer,integer,uuid"],
  ]){
   await db.exec(read(`docs/seating/definitions/${entity}/${name}.sql`));
   await db.exec(`revoke all on function ${name}(${args}) from public,anon,authenticated,service_role;`);
   if(name.startsWith("public."))await db.exec(`grant execute on function ${name}(${args}) to authenticated;`);
  }
  for(const entity of ["seating_assignments","seating_tables"])await db.exec(read(`docs/seating/definitions/${entity}/trigger.sql`));
  const original=read("docs/seating/install/002_functions_triggers.sql").match(/create or replace function public\.manage_seating_participant\([\s\S]*?end \$\$;/);
  assert.ok(original);await db.exec(original[0]);
  await db.exec("revoke all on function public.manage_seating_participant(uuid,bigint,uuid,text) from public,anon,authenticated,service_role;grant execute on function public.manage_seating_participant(uuid,bigint,uuid,text) to authenticated;");
  await db.exec(read("docs/seating/install/007_bulk_seating_upgrade.sql"));
  await db.exec(read("docs/seating/install/008_manual_bulk_upgrade.sql"));
  await db.exec(`insert into public.projects values('${uuid(701)}');
   insert into public.project_guests(id,project_id,first_name)values('${uuid(702)}','${uuid(701)}','Retained');
   insert into public.seating_plans(id,project_id,name,width_cm,height_cm)values('${uuid(703)}','${uuid(701)}','Retained plan',2000,1500);
   insert into public.seating_plan_guests values('${uuid(701)}','${uuid(703)}','${uuid(702)}');`);
  await assert.rejects(db.exec(read("docs/seating/install/APPLY_EMPTY_RSVP_MODEL.sql")),/expects empty/);await db.exec("rollback");checks++;
  await db.exec("delete from public.seating_plan_guests");
  const retainedBefore=(await db.query("select id,project_id,name,revision,rsvp_invitation_id from public.seating_plans")).rows;
  await db.exec(original[0].replace("Invalid operation","Changed operation"));
  await assert.rejects(db.exec(read("docs/seating/install/PREFLIGHT_EMPTY_RSVP_MODEL.sql")),/baseline changed/);await db.exec("rollback");checks++;
  await db.exec(original[0]);
  await db.exec(read("docs/seating/install/PREFLIGHT_EMPTY_RSVP_MODEL.sql"));checks++;
  // A changed plan must still abort and roll back the complete setup without temp tables.
  const setupSql=read("docs/seating/install/APPLY_EMPTY_RSVP_MODEL.sql");
  assert.ok(!/create temporary table/i.test(setupSql));
  await assert.rejects(db.exec(setupSql.replace('do $preserve$',
   'update public.seating_plans set revision=revision+1;\ndo $preserve$')),/changed existing plan or guest data/);
  await db.exec("rollback");
  assert.deepEqual((await db.query("select id,project_id,name,revision,rsvp_invitation_id from public.seating_plans")).rows,retainedBefore);
  assert.equal((await db.query("select to_regclass('private.seating_rsvp_exclusions') relation")).rows[0].relation,null);checks++;
  await db.exec(read("docs/seating/install/APPLY_EMPTY_RSVP_MODEL.sql"));checks++;
  assert.equal((await db.query("select nullif(current_setting('invio.seating_rsvp_plans_before',true),'') snapshot")).rows[0].snapshot,null);checks++;
  assert.deepEqual((await db.query("select id,project_id,name,revision,rsvp_invitation_id from public.seating_plans")).rows,retainedBefore);checks++;
  await db.query("delete from public.projects where id=$1",[uuid(701)]);
  await db.exec(read("docs/seating/install/VERIFY_RSVP_MODEL_READ_ONLY.sql"));checks++;
  await assert.rejects(db.exec(read("docs/seating/install/APPLY_EMPTY_RSVP_MODEL.sql")),/already configured/);await db.exec("rollback");checks++;
  await db.exec(`insert into public.projects values('${project}'),('${otherProject}');insert into public.project_members values('${project}','${member}');
   insert into public.invitations values('${project}','${invite}'),('${project}','${otherInvite}');
   insert into public.seating_plans(id,project_id,name,width_cm,height_cm,rsvp_invitation_id)values('${plan}','${project}','Plan',2000,1500,'${invite}');
   insert into public.seating_tables(id,project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm)values('${table}','${project}','${plan}','Stol 1','round',8,300,300,200,200);`);
  async function person(n,archived=false,owner=project){await db.query("insert into public.project_guests(id,project_id,first_name,archived_at)values($1,$2,$3,$4)",[uuid(n),owner,"Guest"+n,archived?"2026-10-11T00:00:00Z":null]);}
  async function link(n,source=invite){await db.query("insert into public.invitation_guests values($1,$2,$3,$4)",[uuid(10000+n),project,source,uuid(n)]);}
  async function answer(n,status="attending",kind="personalized",time="2026-10-11T10:00:00Z",source=invite,linked=true,offset=0){
   const response=uuid(20000+n+offset),answerId=uuid(30000+n+offset);
   await db.query("insert into public.rsvp_responses values($1,$2,$3,$4,$5)",[response,project,source,kind,time]);
   await db.query("insert into public.rsvp_response_guests values($1,$2,$3,$4)",[answerId,response,kind==="personalized"?uuid(10000+n):null,status]);
   if(kind==="generic"&&linked)await db.query("insert into public.invitation_generic_guest_links values($1,$2,$3,$4)",[project,source,answerId,uuid(n)]);
  }
  for(let n=10;n<=16;n++)await person(n,n===13);
  for(let n=10;n<=15;n++)await link(n);
  await answer(10);await answer(11,"not_attending");await answer(13);await answer(14,"attending","generic");
  await answer(15);await answer(15,"not_attending","generic","2026-10-11T11:00:00Z",invite,true,1000);
  await answer(16,"attending","generic","2026-10-11T11:00:00Z",invite,false);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);await db.exec("set role authenticated");
  const revision=async()=>(await db.query("select revision from public.seating_plans where id=$1",[plan])).rows[0].revision;
  const members=async()=>(await db.query("select project_guest_id from public.seating_plan_guests where plan_id=$1 order by project_guest_id",[plan])).rows.map(row=>row.project_guest_id);
  const sync=async(rev,owner=project)=>(await db.query("select public.sync_seating_rsvp_guests($1,$2,$3) result",[owner,plan,rev??await revision()])).rows[0].result;
  assert.deepEqual(await sync(),{revision:2,added_count:2});assert.deepEqual(await members(),[uuid(10),uuid(14)]);checks++;
  assert.deepEqual(await sync(),{revision:2,added_count:0});checks++;
  await db.query("select public.assign_seating_guest_to_seat($1,$2,$3,$4,3)",[plan,await revision(),uuid(10),table]);
  await db.exec("reset role");await person(17);await link(17);await answer(17);await db.exec("set role authenticated");
  const beforeSeat=(await db.query("select * from public.seating_assignments where plan_id=$1",[plan])).rows;
  assert.equal((await sync()).added_count,1);
  assert.deepEqual((await db.query("select * from public.seating_assignments where plan_id=$1",[plan])).rows,beforeSeat);checks++;
  await db.query("select public.manage_seating_participant($1,$2,$3,'remove')",[plan,await revision(),uuid(10)]);
  assert.ok(!(await members()).includes(uuid(10)));assert.equal((await sync()).added_count,0);checks++;
  await db.exec("reset role");assert.equal((await db.query("select count(*)::int count from private.seating_rsvp_exclusions")).rows[0].count,1);
  await db.exec("set role authenticated");await assert.rejects(db.query("select * from private.seating_rsvp_exclusions"),/permission denied/);checks++;
  // Manual bulk inclusion can explicitly return an excluded person; it remains a regular member.
  await db.query("select public.assign_seating_guests($1,$2,$3::uuid[],null,'include')",[plan,await revision(),[uuid(10)]]);
  assert.ok((await members()).includes(uuid(10)));assert.equal((await sync()).added_count,0);checks++;
  await db.query("select public.manage_seating_participant($1,$2,$3,'remove')",[plan,await revision(),uuid(10)]);
  await db.query("select public.manage_seating_participant($1,$2,$3,'add')",[plan,await revision(),uuid(10)]);
  await db.exec("reset role");assert.equal((await db.query("select count(*)::int count from private.seating_rsvp_exclusions")).rows[0].count,0);await db.exec("set role authenticated");checks++;
  await db.exec("reset role");await answer(17,"not_attending","personalized","2026-10-11T12:00:00Z",invite,true,1000);await db.exec("set role authenticated");
  assert.equal((await sync()).added_count,0);assert.ok((await members()).includes(uuid(17)));checks++;
  async function snapshot(){await db.exec("reset role");const result=JSON.stringify((await db.query("select (select jsonb_agg(m order by project_guest_id)from public.seating_plan_guests m)members,(select jsonb_agg(a order by project_guest_id)from public.seating_assignments a)assignments,(select jsonb_agg(e order by project_guest_id)from private.seating_rsvp_exclusions e)exclusions,(select jsonb_agg(p order by id)from public.seating_plans p)plans")).rows);await db.exec("set role authenticated");return result;}
  const beforeFailure=await snapshot();await assert.rejects(sync(1),/Revision conflict/);assert.equal(await snapshot(),beforeFailure);checks++;
  await assert.rejects(sync(undefined,otherProject),/Project mismatch/);assert.equal(await snapshot(),beforeFailure);checks++;
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await assert.rejects(sync(1),/Access denied/);checks++;
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[member]);
  for(const role of ["anon","service_role"]){await db.exec("set role "+role);await assert.rejects(sync(1),/permission denied/);checks++;}
  await db.exec("reset role");
  for(let n=100;n<201;n++){await person(n);await link(n);await answer(n);}
  await db.exec("set role authenticated");const largeRev=await revision();assert.deepEqual(await sync(),{revision:largeRev+1,added_count:101});checks++;
  await db.exec("reset role");for(const n of [211,212]){await person(n);await link(n);await answer(n);}
  await db.exec(`create function private.test_sync_failure()returns trigger language plpgsql as $$begin if new.project_guest_id='${uuid(212)}'::uuid then raise exception 'Injected sync failure';end if;return new;end$$;
   create trigger test_sync_failure before insert on public.seating_plan_guests for each row execute function private.test_sync_failure();set role authenticated;`);
  const beforeAtomic=await snapshot();await assert.rejects(sync(),/Injected sync failure/);assert.equal(await snapshot(),beforeAtomic);checks++;
  await db.exec("reset role;drop trigger test_sync_failure on public.seating_plan_guests;drop function private.test_sync_failure();set role authenticated;");
  assert.equal((await sync()).added_count,2);checks++;
  await db.query("select public.manage_seating_participant($1,$2,$3,'remove')",[plan,await revision(),uuid(10)]);
  await db.exec("reset role");
  await db.query("insert into public.invitation_guests values($1,$2,$3,$4)",[uuid(999),project,otherInvite,uuid(10)]);
  await db.query("insert into public.rsvp_responses values($1,$2,$3,'personalized','2026-10-11T13:00:00Z')",[uuid(998),project,otherInvite]);
  await db.query("insert into public.rsvp_response_guests values($1,$2,$3,'attending')",[uuid(997),uuid(998),uuid(999)]);
  await db.query("update public.seating_plans set rsvp_invitation_id=$1,revision=revision+1 where id=$2",[otherInvite,plan]);
  await db.exec("set role authenticated");assert.equal((await sync()).added_count,0);assert.ok(!(await members()).includes(uuid(10)));checks++;
  await db.exec("reset role");await db.query("update public.seating_plans set rsvp_invitation_id=null,revision=revision+1 where id=$1",[plan]);await db.exec("set role authenticated");
  const disconnectedRev=await revision();assert.deepEqual(await sync(),{revision:disconnectedRev,added_count:0});checks++;
  await db.exec("reset role");await db.query("delete from public.seating_plans where id=$1",[plan]);
  assert.equal((await db.query("select count(*)::int count from private.seating_rsvp_exclusions")).rows[0].count,0);checks++;
  await db.exec(read("docs/seating/install/VERIFY_RSVP_MODEL_READ_ONLY.sql"));checks++;
  if(process.argv[3]==="attendance") checks+=await require("./attendanceModelSql.cjs").run(db,root);
  console.log(checks+" isolated PostgreSQL/PGlite RSVP checks PASS. No live DB access; one connection only.");
 }finally{await db.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
