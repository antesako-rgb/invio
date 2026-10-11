/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript");
let owner;
const react={
 useState(initial){const state=owner,index=state.index++;if(!(index in state.slots))state.slots[index]=initial;return [state.slots[index],value=>{state.slots[index]=value;}];},
 useRef(initial){const index=owner.index++;return owner.slots[index]??={current:initial};},
};
const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
function load(relative){
 const filename=path.resolve(__dirname,relative),instance=new Module(filename);
 instance.require=request=>{
  if(request==="react")return react;
  if(request==="react/jsx-runtime")return jsx;
  if(request==="next-intl")return {useTranslations:()=>key=>key};
  if(request==="lucide-react" || request.startsWith("@/components/ui/"))return new Proxy({},{get:(_,key)=>key});
  if(request.endsWith(".module.css"))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
  if(request.includes("EditorTooltip"))return {__esModule:true,default:"EditorTooltip"};
  return Module.prototype.require.call(instance,request);
 };
 instance._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
 return instance.exports.default;
}
const Hint=load("../../editor/components/EditorTooltip/EditorTooltip.tsx"),Row=load("../components/SeatingGuestRow.tsx");
function fixture(Component,props){const state={slots:[],index:0};return ()=>{owner=state;state.index=0;return Component(props);};}
function nodes(node){if(Array.isArray(node))return node.flatMap(nodes);if(!node?.type)return [];return [node,...Object.values(node.props).flatMap(nodes)];}
test("a dedicated warning opens on tap and stays readable until second tap, outside press, Escape or focus leaves",()=>{
 const render=fixture(Hint,{children:jsx.jsx("button",{}),content:"Warning",tapToOpen:true});
 let prevented=0,stopped=0;const event={preventDefault(){prevented++;},stopPropagation(){stopped++;}};
 let tree=render(),trigger=nodes(tree).find(node=>node.type==="TooltipTrigger");
 trigger.props.onPointerDown(event);trigger.props.onClick(event);tree=render();assert.equal(tree.props.open,true);assert.equal(prevented,2);assert.equal(stopped,2);
 tree.props.onOpenChange(false);assert.equal(render().props.open,true);
 nodes(tree).find(node=>node.type==="TooltipTrigger").props.onClick(event);assert.equal(render().props.open,false);
 for(const dismiss of ["onEscapeKeyDown","onPointerDownOutside"]){
  nodes(render()).find(node=>node.type==="TooltipTrigger").props.onClick(event);
  nodes(render()).find(node=>node.type==="TooltipContent").props[dismiss](event);assert.equal(render().props.open,false);
 }
 nodes(render()).find(node=>node.type==="TooltipTrigger").props.onClick(event);
 nodes(render()).find(node=>node.type==="TooltipTrigger").props.onBlur();assert.equal(render().props.open,false);
});
test("action tooltips use hover and focus without intercepting the action click",()=>{
 const render=fixture(Hint,{children:jsx.jsx("button",{}),content:"Zoom"});
 let tree=render();tree.props.onOpenChange(true);assert.equal(render().props.open,true);
 const trigger=nodes(tree).find(node=>node.type==="TooltipTrigger");assert.equal(trigger.props.onClick,undefined);assert.equal(trigger.props.onPointerDown,undefined);
 tree.props.onOpenChange(false);assert.equal(render().props.open,false);
});
test("guest warning is separate from assignment and explains each applicable reason",()=>{
 let assigned=0;const person={id:"guest",first_name:"Ante",archived_at:"2026-10-11"};
 const render=fixture(Row,{person,current:{assignments:[{project_guest_id:"guest",table_id:"table",seat_number:5}],attendance:{guest:{status:"not_attending",conflict:true}},plan:{}},tables:[{id:"table",name:"Stol 1"}],disabled:false,onChooseSeat(){assigned++;}});
 const tree=render(),hint=tree.props.children.find(node=>node?.type==="EditorTooltip");assert.ok(hint);assert.equal(hint.props.tapToOpen,true);
 assert.deepEqual(nodes(hint.props.content).filter(node=>node.type==="p").map(node=>node.props.children),["seatArchivedHelp","rsvpConflictHelp","absentAssignedHelp"]);
 assert.equal(hint.props.children.props.title,undefined);assert.equal(assigned,0);
 const action=tree.props.children.find(node=>node?.props.className==="guestMain");assert.ok(!nodes(action).some(node=>node.type==="EditorTooltip"));
 action.props.onClick({});assert.equal(assigned,1);
});
