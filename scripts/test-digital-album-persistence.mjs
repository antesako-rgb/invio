import "./digital-album-test-loader.mjs";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "@/lib/supabase/server")
      return { url: "fixture:supabase", shortCircuit: true };
    if (specifier === "next/cache")
      return { url: "fixture:cache", shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === "fixture:supabase")
      return {
        format: "module",
        source:
          "export async function createServerClient(){return globalThis.albumRepositoryFixture}",
        shortCircuit: true,
      };
    if (url === "fixture:cache")
      return {
        format: "module",
        source: "export function revalidatePath(){}",
        shortCircuit: true,
      };
    return next(url, context);
  },
});
const { updateDigitalAlbumDocument } = await import(
  "../src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts"
);
const { updateDigitalAlbumDocumentAction } = await import(
  "../src/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction.ts"
);
const { DigitalAlbumSaveConflict } = await import(
  "../src/features/digital-albums/utils/digitalAlbumRevision.ts"
);
const calls = [];
let response;
globalThis.albumRepositoryFixture = {
  rpc: async (name, args) => {
    calls.push({ name, args });
    return response;
  },
};
const document = {
  theme: "classic",
  pages: [
    {
      id: "p",
      layout: "quote",
      layoutVersion: 2,
      photos: [],
      unplacedPhotos: [],
      content: { text: "Fixture" },
    },
  ],
};
const input = {
  albumId: "fixture",
  document,
  documentVersion: 1,
  documentRevision: 8,
};
const previous = process.env.DIGITAL_ALBUM_EXTENDED_DOCUMENTS;
try {
  delete process.env.DIGITAL_ALBUM_EXTENDED_DOCUMENTS;
  response = {
    data: { document, document_version: 1, document_revision: 9 },
    error: null,
  };
  const result = await updateDigitalAlbumDocument(input);
  assert.equal(result.document_revision, 9);
  assert.deepEqual(calls[0], {
    name: "update_digital_album_document",
    args: {
      p_album_id: "fixture",
      p_document: document,
      p_document_version: 1,
      p_expected_revision: 8,
    },
  });
  response = { data: null, error: { code: "PT409", message: "conflict" } };
  await assert.rejects(
    updateDigitalAlbumDocument(input),
    DigitalAlbumSaveConflict,
  );
  const conflict = await updateDigitalAlbumDocumentAction(input);
  assert.equal(conflict.success, false);
  assert.equal(conflict.code, "CONFLICT");
  response = {
    data: { document, document_version: 1, document_revision: 8 },
    error: null,
  };
  await assert.rejects(
    updateDigitalAlbumDocument(input),
    /Unexpected album revision/,
  );
  await assert.rejects(
    updateDigitalAlbumDocument({ ...input, documentRevision: undefined }),
    /Invalid or missing/,
  );
  console.log(
    "PASS: repository expected revision mapping; response revision validation; action conflict code; extended document saves without the retired feature flag.",
  );
} finally {
  if (previous === undefined)
    delete process.env.DIGITAL_ALBUM_EXTENDED_DOCUMENTS;
  else process.env.DIGITAL_ALBUM_EXTENDED_DOCUMENTS = previous;
  delete globalThis.albumRepositoryFixture;
}

// Exercise the real action/repository/parser/session boundary against a JSON transport fixture.
const { DigitalAlbumSession } = await import("../src/features/digital-albums/editor/state/DigitalAlbumSession.ts");
const { changeDigitalAlbumPageLayout } = await import("../src/features/digital-albums/utils/digitalAlbumDocumentOperations.ts");
const { getPublicDigitalAlbum } = await import("../src/features/digital-albums/repositories/album/getPublicDigitalAlbum.ts");
const sourceSlots = [1,2,3].map(i=>({
 id:"slot"+i,photoId:"40000000-0000-4000-8000-"+String(i).padStart(12,"0"),
 position:{x:.2*i,y:.8},fit:"contain",caption:"Caption "+i,
}));
const initial = {theme:"classic",pages:[{id:"page",layout:"collage",layoutVersion:2,photos:sourceSlots,content:{title:"Wedding",date:"2026"}}]};
let stored={document:initial,document_version:1,document_revision:1};
const revisions=[];
globalThis.albumRepositoryFixture={rpc:async(name,args)=>{
 if(name==="get_public_digital_album")return {data:{album:JSON.parse(JSON.stringify(stored)),photos:[]},error:null};
 revisions.push(args.p_expected_revision);
 if(args.p_expected_revision!==stored.document_revision)return {data:null,error:{code:"PT409"}};
 stored=JSON.parse(JSON.stringify({document:args.p_document,document_version:args.p_document_version,document_revision:stored.document_revision+1}));
 return {data:stored,error:null};
}};
const save=async(document,version,revision)=>{
 const result=await updateDigitalAlbumDocumentAction({albumId:"fixture",document,documentVersion:version,documentRevision:revision});
 if(!result.success)throw result.code==="CONFLICT"?new DigitalAlbumSaveConflict():Error("save");
 return {document:result.data.document,version:result.data.document_version,revision:result.data.document_revision};
};
try{
 let session=new DigitalAlbumSession(initial,1,1,save);
 for(const layout of ["full-photo","story"]){
  session.commit(d=>({...d,pages:[changeDigitalAlbumPageLayout(d.pages[0],layout)]}));
  assert.equal(await session.flush(),true);
 }
 session=new DigitalAlbumSession(JSON.parse(JSON.stringify(stored.document)),stored.document_version,stored.document_revision,save);
 session.commit(d=>({...d,pages:[changeDigitalAlbumPageLayout(d.pages[0],"collage")]}));
 assert.equal(await session.flush(),true);
 assert.deepEqual(stored.document.pages[0].photos,sourceSlots);
 const viewer=await getPublicDigitalAlbum({publicId:"fixture"});
 assert.deepEqual(viewer.album.document,stored.document);
 assert.deepEqual(revisions,[1,2,3]);
 assert.equal(stored.document_version,1);
 console.log("PASS: real action/repository/session JSON round-trip 3->1->0->reload->3; slot metadata retained; public reader parity; revisions 1,2,3.");
}finally{delete globalThis.albumRepositoryFixture;}
