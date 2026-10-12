/* eslint-disable @typescript-eslint/no-require-imports */
// Local-only integrity check. Never executes SQL or reads environment credentials.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const change=JSON.parse(read('supabase/manifests/seating-elements.change.json'));
const expected=JSON.parse(read('supabase/manifests/seating-elements.expected.json'));
const inspect=read('supabase/verify/inspect/seating_elements.sql');
if(process.argv.includes('--record-assert')){
 const query=inspect.split('set local search_path=pg_catalog,public;')[1].split(';\nrollback;')[0].trim().replace(/ as snapshot$/,'');
 const sql=`-- READ ONLY. Structural PASS/FAIL against locally reconstructed canonical SQL.\n-- NOT NULL is checked through columns for PostgreSQL 17/18 compatibility.\n-- Does not invoke mutating RPCs; runtime isolation/concurrency are separate tests.\nbegin read only;\nset local search_path=pg_catalog,public;\ndo $verify$\ndeclare actual jsonb; expected constant jsonb := $expected$${JSON.stringify(expected)}$expected$::jsonb;\nbegin\n ${query} into actual;\n if actual is distinct from expected then raise exception 'FAIL: seating elements source/schema/security mismatch; run inspect and compare expected manifest'; end if;\nend $verify$;\nselect true as seating_elements_verified, 'PT409'::text as revision_conflict_sqlstate;\nrollback;\n`;
 fs.writeFileSync(path.join(root,change.verify),sql);
}
const errors=[],apply=read(change.apply),coverage=JSON.parse(read('supabase/manifests/coverage.json'));
if(change.status==='prepared_not_applied'){
 for(const p of change.canonical_apply_sources) if(!apply.includes(read(p).trim())) errors.push('Canonical/migration drift: '+p);
 for(const f of expected.functions){
  const sig=f.signature.replace(/\s/g,'');
  const obj=coverage.objects.find(o=>o.id.replace(/\s/g,'')==='function:'+sig);
  if(!obj){errors.push('Function missing from coverage: '+sig);continue;}
  const body=read(obj.canonical_path).match(/\bas\s+(\$[a-z_0-9]*\$)([\s\S]*?)\1/i)?.[2];
  if(body===undefined || crypto.createHash('md5').update(body.replace(/\r/g,'')).digest('hex')!==f.body_md5) errors.push('Canonical/expected function drift: '+sig);
 }
}
const assertSql=read(change.verify),embedded=assertSql.match(/\$expected\$([\s\S]*?)\$expected\$::jsonb/)?.[1];
if(!embedded || JSON.stringify(JSON.parse(embedded))!==JSON.stringify(expected)) errors.push('Expected/assert drift');
const postflight=assertSql.match(/do \$verify\$[\s\S]*?end \$verify\$;/)?.[0];
if(!postflight || !apply.includes(postflight))errors.push('Migration/postflight drift');
if(change.apply_sha256!==crypto.createHash('sha256').update(apply).digest('hex'))errors.push('Migration checksum drift');
const guard=apply.match(/do \$preflight\$[\s\S]*?end \$preflight\$;/)?.[0];
if(!guard || !read(change.preflight).includes(guard))errors.push('Migration/preflight drift');
if(!/SEATING_ELEMENTS_RELEASE_ENABLED: boolean = false/.test(read('src/features/seating/elements/release.ts')) && change.status==='prepared_not_applied')errors.push('Premature release activation');
if(errors.length){for(const e of errors)console.error('FAIL: '+e);process.exitCode=1;}else console.log('PASS: seating elements canonical/migration/verify/release integrity; no remote access');
