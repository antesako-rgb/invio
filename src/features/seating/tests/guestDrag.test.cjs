/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Exercise the real pointer listeners with isolated React scheduling and browser boundaries.
let context;
const react = {
  useState(initial) {
    const owner=context,index=owner.index++;
    if (!(index in owner.slots)) owner.slots[index]=typeof initial==="function"?initial():initial;
    return [owner.slots[index],value=>{owner.slots[index]=typeof value==="function"?value(owner.slots[index]):value;}];
  },
  useRef(value) {
    const index=context.index++;
    if (!(index in context.slots)) context.slots[index]={ current:value };
    return context.slots[index];
  },
  useLayoutEffect(effect) { effect(); },
  useEffect(effect) { if(!context.mounted)context.disposers.push(effect()); },
};
const filename=path.resolve(__dirname,"../components/useGuestCanvasDrag.ts");
const compiled=ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
const hookModule=new Module(filename);
hookModule.filename=filename;
hookModule.require=request=>request==="react"?react:Module.prototype.require.call(hookModule,request);
hookModule._compile(compiled,filename);
const { useGuestCanvasDrag }=hookModule.exports;
const person={id:"guest",first_name:"Marko",last_name:"Marić"};

function fixture(t) {
  const previousWindow=global.window,previousDocument=global.document;
  const pending=new Map(),captures=new Set(),listeners=new Set(),calls=[];
  let frameId=0,disposed=false;
  const browser=new EventTarget();
  const add=browser.addEventListener.bind(browser),remove=browser.removeEventListener.bind(browser);
  browser.addEventListener=(type,listener,options)=>{listeners.add(listener);add(type,listener,typeof options==="boolean"?{capture:options}:options);};
  browser.removeEventListener=(type,listener,options)=>{listeners.delete(listener);remove(type,listener,typeof options==="boolean"?{capture:options}:options);};
  browser.requestAnimationFrame=callback=>{const id=++frameId;pending.set(id,callback);return id;};
  browser.cancelAnimationFrame=id=>pending.delete(id);
  global.window=browser;
  global.document={
    documentElement:{setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)},
    body:{style:{userSelect:"text",cursor:"default"}},
  };
  const owner={slots:[],index:0,mounted:false,disposers:[]};
  let callbacks={onStarted:()=>calls.push(["start"]),onDrop:(...args)=>calls.push(["drop",...args]),onPlace:value=>calls.push(["place",value.id]),onCancelled:()=>calls.push(["cancel"])};
  function render() {context=owner;owner.index=0;const result=useGuestCanvasDrag(callbacks);owner.mounted=true;context=null;return result;}
  const source={isConnected:true};
  function start(extra={}) {render().start({button:0,pointerId:1,clientX:20,clientY:30,currentTarget:source,preventDefault(){},...extra},person);}
  function send(type,extra={}) {const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,clientX:80,clientY:90,pointerType:"mouse",...extra});browser.dispatchEvent(event);return event;}
  function flush() {const frames=[...pending.values()];pending.clear();frames.forEach(callback=>callback(0));}
  function dispose() {
    if(disposed)return;
    disposed=true;owner.disposers.forEach(cleanup=>cleanup?.());
    if(previousWindow===undefined)delete global.window;else global.window=previousWindow;
    if(previousDocument===undefined)delete global.document;else global.document=previousDocument;
  }
  t.after(dispose);
  render();
  return {calls,source,start,send,flush,render,pending,captures,listeners,dispose,update:value=>{callbacks={...callbacks,...value};render();}};
}

test("a short pointer press opens the guest once and suppresses its following native click", t=>{
  const drag=fixture(t);drag.start();
  drag.send("pointermove",{clientX:22,clientY:32});
  assert.equal(drag.pending.size,0);
  drag.send("pointerup",{clientX:22,clientY:32});
  assert.deepEqual(drag.calls,[["place","guest"]]);
  let suppressed=false;
  const click={detail:1,currentTarget:drag.source,preventDefault(){suppressed=true;},stopPropagation(){}};
  assert.equal(drag.render().consumePointerClick(click),true);
  assert.equal(suppressed,true);
  assert.equal(drag.render().consumePointerClick(click),false);
  assert.equal(drag.render().consumePointerClick({...click,detail:0}),false);
  assert.equal(drag.listeners.size,0);
});

test("fast moves update once per frame and release uses the final pointer position", t=>{
  const drag=fixture(t);drag.start();
  assert.equal(drag.captures.has(1),true);
  drag.send("pointermove",{clientX:50,clientY:60});
  drag.send("pointermove",{clientX:70,clientY:80});
  assert.deepEqual(drag.calls,[["start"]]);
  assert.equal(drag.pending.size,1);
  drag.flush();
  assert.deepEqual(drag.render().drag,{id:"guest",name:"Marko Marić",x:70,y:80,pointerType:"mouse"});
  drag.send("pointermove",{clientX:90,clientY:100});
  drag.source.isConnected=false; // A closing mobile panel cannot own pointer capture.
  drag.send("pointerup",{clientX:120,clientY:130});
  assert.deepEqual(drag.calls,[["start"],["drop","guest",120,130,"mouse"]]);
  assert.equal(drag.render().drag,null);
  assert.equal(drag.pending.size,0);
  assert.equal(drag.captures.size,0);
  assert.equal(drag.listeners.size,0);
  assert.deepEqual(document.body.style,{userSelect:"text",cursor:"default"});
});

test("another pointer's release or cancellation cannot complete the current drag", t=>{
  const drag=fixture(t);drag.start();drag.send("pointermove");
  drag.send("pointerup",{pointerId:2});drag.send("pointercancel",{pointerId:2});
  assert.equal(drag.captures.has(1),true);
  assert.deepEqual(drag.calls,[["start"]]);
  drag.send("pointerup");
  assert.equal(drag.calls.filter(call=>call[0]==="drop").length,1);
});

test("Escape, blur, capture loss, cancellation and a second pointer cancel without any drop", t=>{
  for(const [type,extra] of [["keydown",{key:"Escape"}],["blur",{}],["lostpointercapture",{}],["pointercancel",{}],["pointerdown",{pointerId:2}]]) {
    const drag=fixture(t);drag.start();drag.send("pointermove");
    drag.send(type,extra);drag.send("pointerup");drag.flush();
    assert.deepEqual(drag.calls,[["start"],["cancel"]]);
    assert.equal(drag.render().drag,null);
    assert.equal(drag.pending.size,0);
    assert.equal(drag.captures.size,0);
    assert.equal(drag.listeners.size,0);
    assert.deepEqual(document.body.style,{userSelect:"text",cursor:"default"});
    drag.dispose();
  }
});

test("the latest committed drop callback is used after a rerender during dragging", t=>{
  const drag=fixture(t),latest=[];drag.start();drag.send("pointermove");
  drag.update({onDrop:(...args)=>latest.push(args)});
  drag.send("pointerup",{clientX:150,clientY:160,pointerType:"touch"});
  assert.deepEqual(latest,[["guest",150,160,"touch"]]);
  assert.deepEqual(drag.calls,[["start"]]);
});

test("unmounting an active gesture releases capture and scheduled work without a drop", t=>{
  const drag=fixture(t);drag.start();drag.send("pointermove");
  const style=document.body.style;drag.dispose();drag.send("pointerup");drag.flush();
  assert.deepEqual(drag.calls,[["start"]]);
  assert.equal(drag.pending.size,0);
  assert.equal(drag.captures.size,0);
  assert.equal(drag.listeners.size,0);
  assert.deepEqual(style,{userSelect:"text",cursor:"default"});
});

test("window listeners keep drop working if pointer capture is unavailable", t=>{
  const drag=fixture(t);
  document.documentElement.setPointerCapture=()=>{throw new Error("unsupported");};
  drag.start();drag.send("pointermove");drag.send("pointerup");
  assert.deepEqual(drag.calls,[["start"],["drop","guest",80,90,"mouse"]]);
  assert.equal(drag.listeners.size,0);
});
