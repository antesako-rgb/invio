/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript");
let owner;const modules=new Map(),root=path.resolve(__dirname,"../../../..");
const react={
 useState(initial){const state=owner,index=state.index++;if(!(index in state.slots))state.slots[index]=initial;return [state.slots[index],value=>{state.slots[index]=value;}];},
 useRef(initial){const index=owner.index++;return owner.slots[index]??={current:initial};},
 useTransition(){const state=owner;state.index++;return [false,fn=>{state.pending.push(Promise.resolve(fn()));}];},
};
const runtime={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
function load(filename){filename=path.resolve(filename);if(modules.has(filename))return modules.get(filename).exports;
 const instance=new Module(filename);instance.paths=Module._nodeModulePaths(path.dirname(filename));
 instance.require=request=>{
  if(request==="react")return react;if(request==="react/jsx-runtime")return runtime;
  if(request==="next-intl")return {useTranslations:()=>key=>key};
  if(request==="lucide-react"||request.startsWith("@/components/ui/"))return new Proxy({},{get:(_,key)=>key});
  if(request==="sonner")return {toast:{success:msg=>owner.toasts.push(msg),error:msg=>owner.toasts.push(msg)}};
  if(request.endsWith(".module.css"))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
  if(request.includes("attendanceActions"))return {setGuestAttendanceAction:async args=>{const state=owner;state.calls.push(args);if(state.pause)await state.pause;return state.result;}};
  if(request.startsWith(".")||request.startsWith("@/")){const file=request.startsWith("@/")?path.join(root,"src",request.slice(2)):path.resolve(path.dirname(filename),request);return load(file+(file.endsWith(".ts")?"":".ts"));}
  return Module.prototype.require.call(instance,request);
 };modules.set(filename,instance);instance._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);return instance.exports;
}
const Control=load(path.resolve(__dirname,"../../project-guests/components/GuestAttendanceControl.tsx")).default;
const PublicList=load(path.resolve(__dirname,"../components/GenericRsvpImportList.tsx")).default;
function fixture(Component,props){const state={slots:[],index:0,calls:[],pending:[],toasts:[],result:{success:true},pause:null};return {state,render(){owner=state;state.index=0;return Component(props);},async settle(){await Promise.all(state.pending);}};}
function nodes(node){if(Array.isArray(node))return node.flatMap(nodes);if(!node?.type)return [];return [node,...Object.values(node.props).flatMap(nodes)];}
test("manual attendance controls target the canonical person, preserve the original-response option and lock simultaneous clicks",async()=>{
 const view=fixture(Control,{invitationId:"invite",personId:"person",name:"Guest",status:"attending",manualStatus:"not_attending"});
 let release;view.state.pause=new Promise(done=>{release=done;});
 const items=nodes(view.render()).filter(node=>node.type==="DropdownMenuItem");
 assert.deepEqual(items.map(node=>node.props.children),["attending","not_attending","useResponse"]);
 items[1].props.onClick();items[0].props.onClick();assert.equal(view.state.calls.length,1);
 assert.deepEqual(view.state.calls[0],{invitationId:"invite",personId:"person",status:"not_attending"});
 release();await view.settle();view.state.pause=null;
 items[2].props.onClick();await view.settle();assert.equal(view.state.calls[1].status,null);
});
test("an unconfirmed manual decision blocks further changes until explicit reload",async()=>{
 const view=fixture(Control,{invitationId:"invite",personId:"person",name:"Guest",status:"attending"});view.state.result={success:false,code:"ATTENDANCE_UNCONFIRMED"};
 nodes(view.render()).find(node=>node.type==="DropdownMenuItem").props.onClick();await view.settle();
 const tree=nodes(view.render());assert.ok(tree.some(node=>node.props.role==="alert"));
 const item=tree.find(node=>node.type==="DropdownMenuItem");assert.equal(item.props.disabled,true);item.props.onClick();assert.equal(view.state.calls.length,1);
});
test("public response import offers new and existing identity explicitly and resumes only with a confirmed person",async()=>{
 const calls=[],added=[];const view=fixture(PublicList,{current:{people:[{id:"existing",first_name:"Existing",archived_at:null},{id:"archive",first_name:"Archive",archived_at:"now"}],unlinkedGenericGuests:[{id:"answer",first_name:"Generic",last_name:"Test",status:"attending"}]},disabled:false,onInclude:async(...args)=>{calls.push(args);return "confirmed-person";},onAdded:ids=>added.push(ids)});
 nodes(view.render()).find(node=>node.type==="Button"&&node.props.children==="linkPublicGuest").props.onClick();
 const select=nodes(view.render()).find(node=>node.type==="Select");assert.deepEqual(select.props.options.map(o=>o.value),["","existing"]);
 select.props.onValueChange("existing");await nodes(view.render()).find(node=>node.type==="Button"&&node.props.children==="linkAndInclude").props.onClick();
 // onClick intentionally launches an async operation; flush its completion.
 await Promise.resolve();assert.deepEqual(calls,[["answer","existing"]]);assert.deepEqual(added,[["confirmed-person"]]);
});
