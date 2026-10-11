/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript");
let owner;
const react={
 useRef(initial){const slot=owner.index++;return owner.slots[slot]??={current:initial};},
 useEffectEvent(callback){const slot=owner.index++;const state=owner.slots[slot]??={callback,event:(...args)=>state.callback(...args)};state.callback=callback;return state.event;},
 useEffect(callback,deps){const slot=owner.index++;const state=owner.slots[slot]??={deps:null,cleanup:null};if(!state.deps||deps.some((value,index)=>value!==state.deps[index]))owner.pending.push(()=>{state.cleanup?.();state.deps=deps;state.cleanup=callback();});},
};
const filename=path.resolve(__dirname,"../components/useSeatingRsvpSync.ts"),instance=new Module(filename);
instance.require=request=>request==="react"?react:Module.prototype.require.call(instance,request);
instance._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {useSeatingRsvpSync}=instance.exports;
function fixture(t,initial={}){
 let now=100_000;t.mock.method(Date,"now",()=>now);
 const priorWindow=global.window,priorDocument=global.document;
 const browserWindow=new EventTarget(),browserDocument=new EventTarget();browserDocument.visibilityState="visible";
 global.window=browserWindow;global.document=browserDocument;
 const calls=[],state={slots:[],pending:[],index:0};
 let props={planId:"plan",source:"invitation",enabled:true,refresh:0,onSync:async()=>{calls.push("first");return true;},...initial};
 function render(patch={}){props={...props,...patch};owner=state;state.index=0;state.pending=[];useSeatingRsvpSync(props);for(const effect of state.pending)effect();}
 function dispose(){for(const slot of state.slots)slot?.cleanup?.();}
 t.after(()=>{dispose();global.window=priorWindow;global.document=priorDocument;});render();
 return {calls,render,dispose,window:browserWindow,document:browserDocument,advance:()=>{now+=30_001;},settle:()=>Promise.resolve()};
}
test("opening a connected plan syncs once; busy rerenders do not retry while source changes and explicit refresh sync again",async t=>{
 const view=fixture(t);assert.deepEqual(view.calls,["first"]);
 await view.settle();
 view.render({enabled:false});view.render({enabled:true});assert.equal(view.calls.length,1);
 view.render({source:"other"});assert.equal(view.calls.length,2);
 await view.settle();
 view.render({refresh:1});assert.equal(view.calls.length,3);
 view.render();assert.equal(view.calls.length,3);
});
test("no source or an active form waits until synchronization is enabled",t=>{
 const view=fixture(t,{source:null});assert.equal(view.calls.length,0);
 view.render({source:"invite",enabled:false});assert.equal(view.calls.length,0);
 view.render({enabled:true});assert.equal(view.calls.length,1);
});
test("returning to an active form queues a refresh until idle, and unmount removes listeners",async t=>{
 const view=fixture(t);view.document.visibilityState="hidden";view.window.dispatchEvent(new Event("focus"));assert.equal(view.calls.length,1);
 await view.settle();view.advance();
 view.document.visibilityState="visible";view.document.dispatchEvent(new Event("visibilitychange"));assert.equal(view.calls.length,2);
 await view.settle();view.advance();
 view.render({enabled:false});view.window.dispatchEvent(new Event("focus"));assert.equal(view.calls.length,2);
 view.render({enabled:true});assert.equal(view.calls.length,3);
 view.dispose();view.window.dispatchEvent(new Event("focus"));assert.equal(view.calls.length,3);
});
test("focus uses the latest committed synchronization callback after a plan update",async t=>{
 const view=fixture(t);view.render({onSync:async()=>{view.calls.push("latest");return true;}});
 await view.settle();view.advance();
 view.window.dispatchEvent(new Event("focus"));assert.deepEqual(view.calls,["first","latest"]);
});
test("paired browser return events and quick window changes produce one request; explicit refresh bypasses the cooldown",async t=>{
 const view=fixture(t);await view.settle();
 view.window.dispatchEvent(new Event("focus"));assert.equal(view.calls.length,1);
 view.advance();view.document.dispatchEvent(new Event("visibilitychange"));
 view.window.dispatchEvent(new Event("focus"));assert.equal(view.calls.length,2);
 await view.settle();view.window.dispatchEvent(new Event("focus"));assert.equal(view.calls.length,2);
 view.render({refresh:1});assert.equal(view.calls.length,3);
});
