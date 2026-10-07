const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const path = require('node:path');
const root = process.cwd();
const target = 'c294d7d8-2d47-407a-a1fd-a99a7e9b397a';
const shared = '012b5612-6324-4953-9baf-0646d63cbbbd';
const key = id => 'projects/7456bd13-f497-48a4-850e-392fa50428fa/photos/'+id+'.webp';
(async () => {
 const envPath=path.join(root,'.env.local'); const original=await fs.readFile(envPath,'utf8');
 const env={}; for(const line of original.split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);if(m)env[m[1]]=m[2].trim().replace(/^['"]|['"]$/g,'');}
 if(env.STORAGE_CLEANUP_ENABLED==='true')throw Error('Cleanup already enabled; refuse');
 const host=env.BUNNY_STORAGE_REGION==='de'?'storage.bunnycdn.com':env.BUNNY_STORAGE_REGION+'.storage.bunnycdn.com';
 async function head(id){const r=await fetch('https://'+host+'/'+env.BUNNY_STORAGE_ZONE+'/'+key(id),{method:'GET',headers:{AccessKey:env.BUNNY_STORAGE_PASSWORD,Range:'bytes=0-0'},signal:AbortSignal.timeout(15000)});await r.body?.cancel();return r.status;}
 const before={target:await head(target),shared:await head(shared)};console.log(JSON.stringify({before}));
 if(![200,206].includes(before.target)||![200,206].includes(before.shared))throw Error('Baseline failed; no POST');
 const secret=crypto.randomBytes(32).toString('hex');
 const temporary=original.replace(/^STORAGE_CLEANUP_ENABLED\s*=.*\r?\n?/gm,'').replace(/^STORAGE_CLEANUP_SECRET\s*=.*\r?\n?/gm,'').trimEnd()+'\nSTORAGE_CLEANUP_ENABLED=true\nSTORAGE_CLEANUP_SECRET='+secret+'\n';
 let result;
 try{
  await fs.writeFile(envPath,temporary);console.log('Local cleanup temporarily enabled; secret withheld');
  await new Promise(r=>setTimeout(r,6000));
  const r=await fetch('http://localhost:3000/api/internal/storage-cleanup',{method:'POST',headers:{Authorization:'Bearer '+secret},signal:AbortSignal.timeout(180000)});
  result={status:r.status,body:await r.json()}; console.log(JSON.stringify({post:result}));
 }finally{await fs.writeFile(envPath,original);console.log('Original local configuration restored; cleanup disabled');}
 const after={target:await head(target),shared:await head(shared)};console.log(JSON.stringify({after}));
 if(result.status!==200||result.body.completed!==1||result.body.failed!==0||after.target!==404||![200,206].includes(after.shared))throw Error('Unexpected test outcome; do not retry POST');
})().catch(()=>{console.error('Controlled test failed; no automatic retry. Inspect sanitized output.');process.exitCode=1;});
