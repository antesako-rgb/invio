/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript");
let selected=0;
function load(relative) {
 const filename=path.resolve(__dirname,relative),mod=new Module(filename);
 mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
 mod.require=request=>{
  if(request==="react")return {useCallback:f=>f,useLayoutEffect(){},useRef:initial=>({current:initial}),useState:initial=>[initial,()=>{}]};
  if(request==="react/jsx-runtime")return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:"Fragment"};
  if(request==="react-konva")return {Group:"Group",Rect:"Rect",Transformer:"Transformer"};
  if(request==="konva")return {};
  if(/Visual$|Renderer$/.test(request))return ()=>null;
  if(request.startsWith("."))return load(path.relative(__dirname,path.resolve(path.dirname(filename),request+".ts")));
  return Module.prototype.require.call(mod,request);
 };
 mod._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
 return mod.exports;
}
const {elementFromBox,elementBoxFits,elementDragPosition}=load("../elements/interaction.ts");
const element={id:"element",project_id:"project",plan_id:"plan",kind:"dance_floor",name:"Floor",x_cm:500,y_cm:500,width_cm:400,height_cm:300,rotation_deg:0,z_index:0,locked:false};

test("real Konva rotated Transformer boxes preserve cm geometry at 60%, 100%, 150% and shifted views",async()=>{
 const {default:K}=await import("konva");
 for(const scale of [.6,1,1.5])for(const rotation of [0,45,90,359]) {
  const parent=new K.Group({x:-123,y:87,scaleX:scale,scaleY:scale});
  const n=new K.Rect({x:500,y:500,width:400,height:300,offsetX:200,offsetY:150,rotation});parent.add(n);
  const tr=new K.Transformer({ignoreStroke:true});parent.add(tr);tr.nodes([n]);
  const box=tr._getNodeRect(),view={x:-123,y:87,scale};
  assert.deepEqual(elementFromBox(element,box,view),{...element,rotation_deg:rotation});
  assert.equal(elementBoxFits(element,box,view,1200,1200),true);
  n.scaleX(1.2);n.scaleY(1.1);
  assert.deepEqual(elementFromBox(element,tr._getNodeRect(),view),{...element,width_cm:480,height_cm:330,rotation_deg:rotation});
  parent.destroy();
 }
});

test("resize rejects max dimensions, minimum dimensions and rotated room overflow before commit",()=>{
 const view={x:0,y:0,scale:1};
 assert.equal(elementBoxFits(element,{x:0,y:0,width:2001,height:300,rotation:0},view,5000,5000),false);
 assert.equal(elementBoxFits(element,{x:0,y:0,width:199,height:300,rotation:0},view,5000,5000),false);
 assert.equal(elementBoxFits(element,{x:0,y:0,width:400,height:300,rotation:Math.PI/4},view,500,500),false);
 assert.equal(elementBoxFits(element,{x:0,y:0,width:400,height:300,rotation:0},view,500,500),true);
 assert.equal(elementBoxFits(element,{x:0,y:0,width:-400,height:300,rotation:0},view,500,500),false);
});

test("drag clamps rounded rotated centers to valid integer room coordinates",()=>{
 const {elementFits}=load("../elements/model.ts");
 for(const rotation_deg of [0,45,90,135,359])for(const point of [{x:-999,y:-999},{x:9999,y:9999},{x:200.1,y:149.6}]) {
  const e={...element,width_cm:401,height_cm:301,rotation_deg};
  const position=elementDragPosition(e,point,1200,1000);
  assert.equal(elementFits({...e,x_cm:position.x,y_cm:position.y},1200,1000),true);
 }
});

test("locked elements let pan pointer events bubble while clicks still select",()=>{
 const Shape=load("../components/elements/ElementShape.tsx").default;
 for(const locked of [true,false]) {
  selected=0;
  const tree=Shape({element:{...element,locked},selected:true,disabled:false,hand:false,scale:1,roomWidth:1200,roomHeight:1000,colors:{accent:"purple"},onSelect:()=>selected++,onChange(){},registerCancellation(){return ()=>{};}});
  const rect=tree.props.children[0];
  const mouse={cancelBubble:false},touch={cancelBubble:false,evt:{touches:[{}]}};
  rect.props.onMouseDown(mouse);rect.props.onTouchStart(touch);
  assert.equal(mouse.cancelBubble,!locked);assert.equal(touch.cancelBubble,!locked);
  assert.equal(rect.props.draggable,!locked);
  rect.props.onClick();assert.ok(selected>0);
  assert.equal(Boolean(tree.props.children[2]),!locked);
 }
});
