/* eslint-disable @typescript-eslint/no-require-imports */
// Local integrity only. No network, credentials, SQL execution or activation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const change=JSON.parse(read('supabase/manifests/seating-appearance.change.json'));
const expected=JSON.parse(read('supabase/manifests/seating-appearance.expected.json'));
const sql=read(change.apply),verify=read(change.verify),preflight=read(change.preflight),errors=[];
if(crypto.createHash('sha256').update(sql).digest('hex')!==change.apply_sha256)errors.push('Migration checksum drift');
// Applied SQL is immutable; later pending migrations may advance the canonical definitions.
if(change.status==='prepared_not_applied')
 for(const file of change.canonical_apply_sources)if(!sql.includes(read(file).trim()))errors.push('Canonical/migration drift: '+file);
for(const tag of ['authorization_verify','baseline_check','preflight']) {
 const block=sql.match(new RegExp('do \\$'+tag+'\\$[\\s\\S]*?end \\$'+tag+'\\$;'))?.[0];
 if(!block||!preflight.includes(block))errors.push('Preflight drift: '+tag);
}
const auth=verify.match(/do \$authorization_verify\$[\s\S]*?end \$authorization_verify\$;/)?.[0];
if(!auth||!sql.includes(auth))errors.push('Authorization verify drift');
const block=verify.match(/do \$verify\$[\s\S]*?end \$verify\$;/)?.[0];
if(!block||!sql.includes(block))errors.push('Postflight drift');
const json=verify.match(/\$expected\$([\s\S]*?)\$expected\$::jsonb/)?.[1];
if(!json||JSON.stringify(JSON.parse(json))!==JSON.stringify(expected))errors.push('Expected/assert drift');
for(const file of [change.preflight,change.verify])if(!/^-- READ ONLY/m.test(read(file))||!read(file).includes('begin read only;'))errors.push('Missing read-only transaction: '+file);
if(change.status==='prepared_not_applied'&&!read('src/features/seating/appearance/release.ts').includes('SEATING_APPEARANCE_RELEASE_ENABLED: boolean = false'))errors.push('Premature activation');
if(change.status==='applied_dev_verified') {
 const proof=JSON.parse(read(change.evidence_path));
 const ledger=JSON.parse(read('supabase/manifests/applications.json'));
 const entry=ledger.applications.find(a=>a.migration_id===change.id&&a.project_ref===change.project_ref);
 if(!entry||entry.sha256!==change.apply_sha256||entry.result!=='PASS')errors.push('Missing verified manual application');
 if(proof.result!=='PASS'||!proof.read_only_comparison?.exact_match||!proof.read_only_comparison?.authorization_helpers_verified||proof.project_ref!==change.project_ref||proof.migration_sha256!==change.apply_sha256)errors.push('Missing DEV structural verification');
 if(crypto.createHash('sha256').update(read(proof.snapshot_path)).digest('hex')!==proof.snapshot_sha256)errors.push('Verified snapshot checksum drift');
 if(!proof.user_reported_types_regenerated||!change.native_rpc_types)errors.push('Missing native type regeneration confirmation');
 const types=read('src/lib/supabase/database.types.ts');
 const names=change.superseded_by ? ['seating_plans','seating_elements'] : ['seating_plans','seating_tables','seating_elements'];
 if(change.superseded_by) {
  const successor=JSON.parse(read('supabase/manifests/seating-preset-styles.change.json'));
  if(successor.id!==change.superseded_by||successor.status!=='applied_dev_verified'||successor.project_ref!==change.project_ref)errors.push('Unverified superseding appearance change');
 }
 for(const name of names)
  if(!new RegExp(name+': \\{\\s*Row: \\{[\\s\\S]*?appearance: Json').test(types))errors.push('Missing generated appearance column: '+name);
 if(!types.includes('set_seating_appearance: {'))errors.push('Missing generated appearance RPC');
 const flag=read('src/features/seating/appearance/release.ts').includes('SEATING_APPEARANCE_RELEASE_ENABLED: boolean = true');
 if(flag!==change.release_enabled)errors.push('Release status drift');
}
if(errors.length){errors.forEach(e=>console.error('FAIL: '+e));process.exitCode=1;}else console.log('PASS: appearance canonical/migration/preflight/verify/gate integrity; no remote access');
