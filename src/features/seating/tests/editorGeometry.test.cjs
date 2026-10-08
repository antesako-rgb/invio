/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
// Compile pure application helpers in memory; no DB, browser or credentials.
function load(relative) {
  const filename = path.resolve(__dirname, relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  compiledModule._compile(compiled, filename);
  return compiledModule.exports;
}
const { zoomViewport, normalizeTableTransform, normalizeTablePosition, normalizeRoomTransform, fitRoomViewport, resizeRoomViewport } = load("../validation/editorGeometry.ts");
const { CanvasGesture, cancelNodeGesture } = load("../validation/canvasGesture.ts");
const { tableContainsPoint, chairPositions, canAssignToTable } = load("../validation/canvasInteraction.ts");
const { seatingGeometryFits } = load("../validation/seatingGeometry.ts");
const rectangle = { id: "table", plan_id: "plan", project_id: "project", name: "Table", shape: "rectangle",
  capacity: 8, x_cm: 500, y_cm: 400, width_cm: 200, height_cm: 100, rotation_deg: 0 };

test("pointer stays at the same physical cm coordinate through zoom and pan", () => {
  const view = { x: 73, y: -28, scale: .4 }, pointer = { x: 400, y: 250 };
  const next = zoomViewport(view, 1.8, pointer);
  assert.ok(Math.abs((pointer.x-next.x)/next.scale - (pointer.x-view.x)/view.scale) < 1e-9);
  assert.ok(Math.abs((pointer.y-next.y)/next.scale - (pointer.y-view.y)/view.scale) < 1e-9);
  const restored = zoomViewport(next, 1/1.8, pointer);
  assert.ok(Math.abs(restored.scale-view.scale) < 1e-9);
});
test("resize yields integer cm dimensions, preserves center and capacity and normalizes rotation", () => {
  const changed = normalizeTableTransform(rectangle, { x: 501.4, y: 402.7, scaleX: 1.5, scaleY: .8, rotation: -90 });
  assert.equal(changed.x_cm, 501); assert.equal(changed.y_cm, 403);
  assert.equal(changed.width_cm, 300); assert.equal(changed.height_cm, 80);
  assert.equal(changed.rotation_deg, 270); assert.equal(changed.capacity, 8);
});
test("round table stays circular even with unequal canvas scales", () => {
  const changed = normalizeTableTransform({ ...rectangle, shape: "round", height_cm: 200 }, { x: 500, y: 400, scaleX: 1.5, scaleY: .7, rotation: 360 });
  assert.equal(changed.width_cm, changed.height_cm); assert.equal(changed.rotation_deg, 0);
});
test("rotated edge crossing is rejected while exact circular boundary fits", () => {
  assert.equal(seatingGeometryFits({ ...rectangle, x_cm: 100, y_cm: 100, rotation_deg: 45 }, 1000, 1000), false);
  assert.equal(seatingGeometryFits({ ...rectangle, x_cm: 50, y_cm: 100, rotation_deg: 90 }, 1000, 1000), true);
  assert.equal(seatingGeometryFits({ ...rectangle, shape: "round", width_cm: 200, height_cm: 200, x_cm: 100, y_cm: 100 }, 1000, 1000), true);
  assert.equal(seatingGeometryFits({ ...rectangle, shape: "round", width_cm: 200, height_cm: 200, x_cm: 99, y_cm: 100 }, 1000, 1000), false);
});

test("guest drops respect rotated table bodies, not their bounding boxes or chairs", () => {
  const rotated = { ...rectangle, width_cm:200,height_cm:40,rotation_deg:90 };
  assert.equal(tableContainsPoint(rotated, { x:500,y:490 }), true);
  assert.equal(tableContainsPoint(rotated, { x:590,y:400 }), false);
  assert.equal(tableContainsPoint({ ...rectangle,shape:"round",height_cm:200 }, { x:590,y:490 }), false);
  assert.equal(tableContainsPoint({ ...rectangle,shape:"round",height_cm:200 }, { x:600,y:400 }), true);
});
test("a full table accepts its own guest but rejects another guest without removing the old assignment", () => {
  const assignments = [{ table_id:"a",project_guest_id:"one" }, { table_id:"b",project_guest_id:"two" }];
  assert.equal(canAssignToTable(1,"a","one",assignments), true);
  assert.equal(canAssignToTable(1,"a","two",assignments), false);
  assert.deepEqual(assignments, [{ table_id:"a",project_guest_id:"one" }, { table_id:"b",project_guest_id:"two" }]);
});
test("chair counts cover odd and maximum capacities; resize keeps their count", () => {
  for (const shape of ["round","rectangle"]) for (const capacity of [1,3,8,99,100]) {
    const table = { ...rectangle,shape,capacity };
    const chairs = chairPositions(table);
    assert.equal(chairs.length,capacity);
    assert.equal(chairPositions({ ...table,width_cm:800,height_cm:400 }).length,capacity);
    for (const chair of chairs) {
      assert.ok(Number.isFinite(chair.x) && Number.isFinite(chair.y) && Number.isFinite(chair.rotation));
      assert.ok(Math.abs(chair.x)>table.width_cm/2 || Math.abs(chair.y)>table.height_cm/2 || shape==="round");
    }
  }
});
test("room shrinking rejects a rotated edge crossing without changing table dimensions or position", () => {
  const table = { ...rectangle,x_cm:700,y_cm:700,rotation_deg:45 };
  const snapshot = { ...table };
  assert.equal(seatingGeometryFits(table,1000,1000),true);
  assert.equal(seatingGeometryFits(table,750,750),false);
  assert.deepEqual(table,snapshot);
});

test("room resize from all eight handles preserves the opposite boundary and table cm coordinates", () => {
  const cases = [
    { x:-100,y:-50,scaleX:1.1,scaleY:1.05 }, // top-left
    { x:0,y:-50,scaleX:1,scaleY:1.05 }, // top-center
    { x:0,y:-50,scaleX:1.1,scaleY:1.05 }, // top-right
    { x:-100,y:0,scaleX:1.1,scaleY:1 }, // middle-left
    { x:0,y:0,scaleX:1.1,scaleY:1 }, // middle-right
    { x:-100,y:0,scaleX:1.1,scaleY:1.05 }, // bottom-left
    { x:0,y:0,scaleX:1,scaleY:1.05 }, // bottom-center
    { x:0,y:0,scaleX:1.1,scaleY:1.05 }, // bottom-right
  ];
  const tableSnapshot = { ...rectangle }, view = { x:73,y:28,scale:.4 };
  for (const transform of cases) {
    const next = normalizeRoomTransform(1000,1000,transform);
    assert.equal(seatingGeometryFits(rectangle,next.width,next.height),true);
    const nextView = { ...view,x:view.x+next.x*view.scale,y:view.y+next.y*view.scale };
    // The preview's table position and normalized committed frame must match on screen.
    assert.equal(nextView.x+rectangle.x_cm*view.scale,view.x+(transform.x+rectangle.x_cm)*view.scale);
    assert.equal(nextView.y+rectangle.y_cm*view.scale,view.y+(transform.y+rectangle.y_cm)*view.scale);
    if (transform.x < 0) assert.equal(nextView.x+next.width*view.scale,view.x+1000*view.scale);
    if (transform.y < 0) assert.equal(nextView.y+next.height*view.scale,view.y+1000*view.scale);
    assert.deepEqual(rectangle,tableSnapshot);
  }
});
test("top/left room shrink is checked against unchanged rotated table positions", () => {
  const next = normalizeRoomTransform(1000,1000,{ x:300,y:300,scaleX:.7,scaleY:.7 });
  const table = { ...rectangle,x_cm:650,y_cm:650,rotation_deg:45 };
  assert.equal(seatingGeometryFits(table,next.width,next.height),false);
});

test("switching a desktop canvas to mobile refits both room edges into the available screen", () => {
  const view = { x:-500,y:-300,scale:.8 };
  const next = resizeRoomViewport(view,{ width:1450,height:800 },{ width:390,height:650 },3809,4272);
  assert.ok(next.scale < view.scale);
  assert.ok(next.x >= 24 && next.y >= 24);
  assert.ok(next.x+3809*next.scale <= 390-24+1e-9);
  assert.ok(next.y+4272*next.scale <= 650-24+1e-9);
  assert.deepEqual(view,{ x:-500,y:-300,scale:.8 });
});
test("height-only notices preserve manual zoom, while rotating to a wider canvas refits", () => {
  const view = { x:10,y:-90,scale:.6 };
  const notice = resizeRoomViewport(view,{ width:390,height:650 },{ width:390,height:600 },2000,1500);
  assert.equal(notice.scale,.6); assert.equal(notice.x,10); assert.equal(notice.y,-115);
  const rotated = resizeRoomViewport(notice,{ width:390,height:600 },{ width:844,height:350 },2000,1500);
  assert.deepEqual(rotated,fitRoomViewport(2000,1500,{ width:844,height:350 }));
  assert.ok(rotated.y+1500*rotated.scale <= 350);
});

test("viewport changes cancel an active Konva room resize before fitting and never save its end event", async () => {
  const Konva = (await import("konva")).default;
  const frame = new Konva.Group({ x:24,y:24,scaleX:.4,scaleY:.4 });
  const room = new Konva.Rect({ width:2000,height:1500 });
  const table = new Konva.Rect({ x:500,y:400,width:229,height:229 });
  const transformer = new Konva.Transformer({ nodes:[room] });
  frame.add(room,table,transformer);
  const gesture = new CanvasGesture(), writes = [];
  room.on("transformend", () => {
    if (gesture.takeEnd("transform")) writes.push(normalizeRoomTransform(2000,1500,{
      x:room.x(),y:room.y(),scaleX:room.scaleX(),scaleY:room.scaleY(),
    }));
  });
  for (const size of [{ width:390,height:650 },{ width:1450,height:800 }]) {
    gesture.begin("transform");
    room.setAttrs({ x:-100,y:-50,scaleX:1.5,scaleY:1.8 });
    // Simulate an in-flight Transformer. Its real stopTransform emits transformend.
    transformer._transforming = true;
    gesture.cancel();
    cancelNodeGesture(room,transformer,{ x:0,y:0,width:2000,height:1500 });
    const view = fitRoomViewport(2000,1500,size);
    frame.position({ x:view.x,y:view.y }); frame.scale({ x:view.scale,y:view.scale });
    room.fire("transformend"); // A delayed mouse/touch release must also be ignored.
    assert.equal(transformer.isTransforming(),false);
    assert.deepEqual(writes,[]);
    assert.deepEqual(normalizeRoomTransform(2000,1500,{ x:room.x(),y:room.y(),scaleX:room.scaleX(),scaleY:room.scaleY() }),{ x:0,y:0,width:2000,height:1500 });
    assert.deepEqual([table.x(),table.y(),table.width(),table.height(),table.scaleX(),table.scaleY()],[500,400,229,229,1,1]);
  }
  // The next completed resize still saves once, independently of the viewport scale.
  gesture.begin("transform"); room.scale({ x:1.2,y:1.1 }); transformer._transforming=true;
  transformer.stopTransform(); room.fire("transformend");
  assert.deepEqual(writes,[{ x:0,y:0,width:2400,height:1650 }]);
  frame.destroy();
});

test("moving a table preserves its saved size and rotation after an interrupted resize", async () => {
  const Konva = (await import("konva")).default;
  const node = new Konva.Rect({ x:500,y:400,width:200,height:100,rotation:90 });
  const transformer = new Konva.Transformer({ nodes:[node] });
  const table = { ...rectangle,rotation_deg:90 }, gesture = new CanvasGesture();
  gesture.begin("transform"); node.scale({ x:3,y:2 }); node.rotation(180); transformer._transforming=true;
  let saves = 0;
  node.on("transformend", () => { if (gesture.takeEnd("transform")) saves++; });
  gesture.cancel();
  cancelNodeGesture(node,transformer,{ x:500,y:400,width:200,height:100,rotation:90 });
  assert.equal(saves,0);
  assert.deepEqual([node.scaleX(),node.scaleY(),node.rotation()],[1,1,90]);
  const moved = normalizeTablePosition(table,{ x:650.4,y:700.8 });
  assert.deepEqual([moved.x_cm,moved.y_cm,moved.width_cm,moved.height_cm,moved.rotation_deg,moved.capacity],[650,701,200,100,90,8]);
  transformer.destroy(); node.destroy();
});
