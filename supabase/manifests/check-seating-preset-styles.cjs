/* eslint-disable @typescript-eslint/no-require-imports */
// Local integrity only: no network, credentials or SQL execution.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const change=JSON.parse(read('supabase/manifests/seating-preset-styles.change.json'));
const expected=JSON.parse(read(change.expected)),baseline=JSON.parse(read(change.baseline));
const sql=read(change.apply),pre=read(change.preflight),verify=read(change.verify),errors=[];
if(crypto.createHash('sha256').update(sql).digest('hex')!==change.apply_sha256)errors.push('Migration checksum drift');
for(const source of change.canonical_apply_sources) {
 const definition=read(source),name=path.basename(source,'.sql');
 if(change.status==='prepared_not_applied'&&!sql.includes(definition.trim()))errors.push('Canonical/migration drift: '+source);
 const body=definition.match(/\bas\s+(\$[a-z_0-9]*\$)([\s\S]*?)\1/i)?.[2];
 const fn=expected.functions.find(f=>f.signature.startsWith(name+'('));
 if(change.status==='prepared_not_applied'&&(!fn||!body||crypto.createHash('md5').update(body).digest('hex')!==fn.md5))errors.push('Canonical/expected drift: '+source);
}
for(const tag of ['authorization_verify','baseline_check','preflight']) {
 const block=sql.match(new RegExp('do \\$'+tag+'\\$[\\s\\S]*?end \\$'+tag+'\\$;'))?.[0];
 if(!block||!pre.includes(block))errors.push('Preflight drift: '+tag);
}
const post=verify.match(/do \$verify\$[\s\S]*?end \$verify\$;/)?.[0];
if(!post||!sql.includes(post))errors.push('Postflight drift');
const embedded=verify.match(/\$expected\$([\s\S]*?)\$expected\$::jsonb/)?.[1];
const before=pre.match(/\$expected\$([\s\S]*?)\$expected\$::jsonb/)?.[1];
if(!embedded||JSON.stringify(JSON.parse(embedded))!==JSON.stringify(expected))errors.push('Expected/assert drift');
if(!before||JSON.stringify(JSON.parse(before))!==JSON.stringify(baseline))errors.push('Baseline/preflight drift');
for(const file of [change.preflight,change.verify])if(!/^-- READ ONLY/m.test(read(file))||!read(file).includes('begin read only;'))errors.push('Missing read-only transaction: '+file);
if(!sql.includes('DROP COLUMN appearance RESTRICT;')||!pre.includes('seating data present'))errors.push('Missing column removal/empty-data safety guard');
const table=expected.tables.find(t=>t.name==='seating_tables');
if(table.columns.some(c=>c.name==='appearance')||table.constraints.some(c=>c.name==='seating_tables_appearance_check'))errors.push('Expected table still duplicates appearance');
if(change.status==='prepared_not_applied'&&(/\bappearance jsonb\b/.test(read(change.canonical_table_source))||change.release_enabled||change.applied_projects.length))errors.push('Premature activation or table canonical drift');
if(change.status==='prepared_not_applied'&&!read('src/features/seating/appearance/release.ts').includes('SEATING_PRESET_STYLES_RELEASE_ENABLED: boolean = false'))errors.push('Premature preset frontend activation');
if(change.status==='applied_dev_verified') {
 const proof=JSON.parse(read(change.evidence_path)),ledger=JSON.parse(read('supabase/manifests/applications.json'));
 const application=ledger.applications.find(a=>a.migration_id===change.id&&a.project_ref===change.project_ref);
 if(!application||application.sha256!==change.apply_sha256||application.result!=='PASS')errors.push('Missing verified manual preset application');
 if(proof.result!=='PASS'||!proof.read_only_comparison?.exact_match||!proof.read_only_comparison?.authorization_helpers_verified||proof.project_ref!==change.project_ref||proof.migration_sha256!==change.apply_sha256)errors.push('Missing exact DEV catalog/security verification');
 if(crypto.createHash('sha256').update(read(proof.snapshot_path)).digest('hex')!==proof.snapshot_sha256)errors.push('Verified preset snapshot checksum drift');
 const types=read('src/lib/supabase/database.types.ts'),tableBlock=types.match(/seating_tables: \{([\s\S]*?)seating_templates:/)?.[1];
 if(!tableBlock||/\bappearance\??:/.test(tableBlock)||!types.includes('set_seating_appearance: {')||!proof.user_reported_types_regenerated||!change.native_rpc_types)errors.push('Native preset type drift');
 if(read('src/features/seating/appearance/release.ts').includes('SEATING_PRESET_STYLES_RELEASE_ENABLED: boolean = true')!==change.release_enabled)errors.push('Preset release status drift');
}
if(errors.length){errors.forEach(e=>console.error('FAIL: '+e));process.exitCode=1;}else console.log('PASS: preset-style SQL/canonical/preflight/verify/proposal integrity; no remote access');
