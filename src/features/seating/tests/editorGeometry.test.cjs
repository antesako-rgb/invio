/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
// Compile application helpers and their local TS dependencies in memory; no DB or credentials.
const modules = new Map();
function load(relative) {
  const filename = path.resolve(__dirname, relative);
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  compiledModule.require = function(request) {
    const dependency = path.resolve(path.dirname(filename),request.endsWith(".ts") ? request : request+".ts");
    if (request.startsWith(".") && fs.existsSync(dependency)) return load(path.relative(__dirname,dependency));
    return Module.prototype.require.call(this,request);
  };
  modules.set(filename,compiledModule);
  compiledModule._compile(compiled, filename);
  return compiledModule.exports;
}
const { zoomViewport, normalizeTableRotation, normalizeTablePosition, normalizeRoomTransform, fitRoomViewport, resizeRoomViewport } = load("../validation/editorGeometry.ts");
const { CanvasGesture, cancelNodeGesture } = load("../validation/canvasGesture.ts");
const { tableContainsPoint, getTableLabelLayout, chairPositions, getChairSize, getTablePreviewBounds, canAssignToTable,
  getSeatSide, getSeatWorldPosition, chairContainsPoint, hitSeat, hitSeatingTarget, hitGuestDropTarget, clientToRoomPoint, getSeatNameLayout } = load("../validation/canvasInteraction.ts");
const { seatingGeometryFits } = load("../validation/seatingGeometry.ts");
const { getStandardTableDimensions, getStandardTableUpdates, withTableCapacity } = load("../validation/tableDimensions.ts");
const { getLongTableSeatCounts, getLongTableWidth } = load("../validation/longTableGeometry.ts");
const { getDuplicateTable, getDuplicateTableName } = load("../validation/duplicateTable.ts");
const { TableChairs, TableSeatNames } = load("../components/TableDecorations.tsx");
const { updateTableSizes } = load("../services/updateTableSizes.ts");
const rectangle = { id: "table", plan_id: "plan", project_id: "project", name: "Table", shape: "rectangle",
  capacity: 8, x_cm: 500, y_cm: 400, width_cm: 200, height_cm: 100, rotation_deg: 0 };

test("drop coordinates follow current canvas bounds, pan, zoom and CSS scale", () => {
  const view = { x:73,y:28,scale:.4 },size = { width:800,height:600 },point = { x:500,y:400 };
  for (const factor of [.5,1,1.5]) for (const top of [100,145]) {
    const frame = { left:300,top,right:300+size.width*factor,bottom:top+size.height*factor };
    const client = { x:frame.left+(view.x+point.x*view.scale)*factor,y:frame.top+(view.y+point.y*view.scale)*factor };
    const result = clientToRoomPoint(client,frame,view,size);
    assert.ok(Math.abs(result.x-point.x)<1e-8 && Math.abs(result.y-point.y)<1e-8);
    assert.equal(clientToRoomPoint({ x:frame.left-1,y:frame.top },frame,view,size),null);
    assert.equal(clientToRoomPoint(client,frame,{ ...view,scale:0 },size),null);
  }
});

test("nearby drops choose a table across shapes, rotations and zoom levels without guessing a chair", () => {
  for (const shape of ["round","rectangle"]) for (const rotation_deg of [0,45,90,270]) for (const scale of [.25,1,3]) {
    const table = { ...rectangle,shape,rotation_deg,height_cm:shape==="round"?200:100 };
    const halfWidth = getTablePreviewBounds(table).width/2,angle = rotation_deg*Math.PI/180;
    const world = distance => ({ x:table.x_cm+distance*Math.cos(angle),y:table.y_cm+distance*Math.sin(angle) });
    const near = world(halfWidth+10/scale);
    assert.equal(hitSeatingTarget([table],near),null);
    assert.deepEqual(hitGuestDropTarget([table],near,scale),{ tableId:table.id,seatNumber:null });
    assert.equal(hitGuestDropTarget([table],world(halfWidth+50/scale),scale),null);
  }
});

test("exact chairs keep their number and visible draw order before generous table targets", () => {
  const table = { ...rectangle,shape:"round",height_cm:200 };
  for (const scale of [.25,1,3]) {
    for (const chair of chairPositions(table)) assert.deepEqual(hitGuestDropTarget([table],getSeatWorldPosition(table,chair.seatNumber),scale),{ tableId:table.id,seatNumber:chair.seatNumber });
    assert.deepEqual(hitGuestDropTarget([table],{ x:table.x_cm,y:table.y_cm },scale),{ tableId:table.id,seatNumber:null });
  }
  const near = { x:table.x_cm+getTablePreviewBounds(table).width/2+10,y:table.y_cm };
  assert.deepEqual(hitGuestDropTarget([{ ...table,id:"back" },{ ...table,id:"front" }],near,1),{ tableId:"front",seatNumber:null });
});

test("touch has a larger table margin while distant drops and invalid scales remain misses", () => {
  const table = { ...rectangle,shape:"round",height_cm:200 };
  const point = { x:table.x_cm+getTablePreviewBounds(table).width/2+20,y:table.y_cm };
  assert.equal(hitGuestDropTarget([table],point,1,"mouse"),null);
  assert.deepEqual(hitGuestDropTarget([table],point,1,"touch"),{ tableId:table.id,seatNumber:null });
  for (const scale of [0,-1,NaN,Infinity]) assert.equal(hitGuestDropTarget([table],point,scale),null);
  assert.equal(hitGuestDropTarget([],point,1,"touch"),null);
});

test("pointer stays at the same physical cm coordinate through zoom and pan", () => {
  const view = { x: 73, y: -28, scale: .4 }, pointer = { x: 400, y: 250 };
  const next = zoomViewport(view, 1.8, pointer);
  assert.ok(Math.abs((pointer.x-next.x)/next.scale - (pointer.x-view.x)/view.scale) < 1e-9);
  assert.ok(Math.abs((pointer.y-next.y)/next.scale - (pointer.y-view.y)/view.scale) < 1e-9);
  const restored = zoomViewport(next, 1/1.8, pointer);
  assert.ok(Math.abs(restored.scale-view.scale) < 1e-9);
});
test("rotating round and rectangular tables preserves their center, dimensions and capacity", () => {
  for (const shape of ["round","rectangle"]) {
    const table = { ...rectangle,shape,height_cm:shape === "round" ? 200 : 100 };
    const changed = normalizeTableRotation(table,-90.2);
    assert.deepEqual(changed,{ ...table,rotation_deg:270 });
    assert.deepEqual(normalizeTableRotation(table,360),table);
  }
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
test("chair counts cover odd and maximum capacities with fixed table dimensions", () => {
  for (const shape of ["round","rectangle"]) for (const capacity of [1,3,8,99,100]) {
    const table = { ...rectangle,shape,capacity };
    const chairs = chairPositions(table);
    assert.equal(chairs.length,capacity);
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

test("moving a table preserves its dimensions after an interrupted rotation", async () => {
  const Konva = (await import("konva")).default;
  const node = new Konva.Rect({ x:500,y:400,width:200,height:100,rotation:90 });
  const transformer = new Konva.Transformer({ nodes:[node] });
  const table = { ...rectangle,rotation_deg:90 }, gesture = new CanvasGesture();
  gesture.begin("transform"); node.rotation(180); transformer._transforming=true;
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

test("mobile zoom scales the label together with a fixed-size table", () => {
  const table = { ...rectangle,shape:"round",width_cm:229,height_cm:229 };
  const label = getTableLabelLayout(table), mobileScale = .12;
  const zoomed = zoomViewport({ x:0,y:0,scale:mobileScale },2,{ x:100,y:100 });
  assert.equal(zoomed.scale,.24);
  assert.equal(label.nameFontSize*zoomed.scale,2*label.nameFontSize*mobileScale);
  assert.ok(label.nameFontSize*mobileScale < 12);
  assert.ok(label.nameFontSize*label.lineHeight < label.nameHeight && label.occupancyFontSize*label.lineHeight < label.occupancyHeight);
  assert.deepEqual(table,{ ...rectangle,shape:"round",width_cm:229,height_cm:229 });
});

test("upright table labels stay inside round and narrow rotated bodies, including minimum dimensions", () => {
  for (const [shape,width,height] of [["round",229,229],["round",10,10],["rectangle",237,206],["rectangle",300,40],["rectangle",10,10000]]) {
    for (let rotation_deg = 0; rotation_deg < 360; rotation_deg++) {
      const table = { ...rectangle,shape,width_cm:width,height_cm:height,rotation_deg };
      const label = getTableLabelLayout(table);
      assert.ok(Number.isFinite(label.nameFontSize) && label.nameFontSize > 0 && label.occupancyFontSize < label.nameFontSize);
      assert.ok(label.nameFontSize*label.lineHeight < label.nameHeight && label.occupancyFontSize*label.lineHeight < label.occupancyHeight);
      for (const x of [-label.width/2,label.width/2]) for (const y of [-label.height/2,label.height/2]) {
        assert.equal(tableContainsPoint(table,{ x:table.x_cm+x,y:table.y_cm+y }),true,`${shape} ${width}x${height}, rotation ${rotation_deg}`);
      }
    }
  }
});

test("new tables use the same standard dimensions per shape, including small odd-sized rooms", () => {
  assert.deepEqual(getStandardTableDimensions("round",2000,1500),{ width_cm:229,height_cm:229 });
  assert.deepEqual(getStandardTableDimensions("rectangle",2000,1500),{ width_cm:206,height_cm:206 });
  for (const shape of ["round","rectangle"]) {
    const dimensions = getStandardTableDimensions(shape,101,103);
    const table = { ...rectangle,shape,...dimensions,x_cm:50,y_cm:51 };
    assert.equal(seatingGeometryFits(table,101,103),true);
    assert.deepEqual(getStandardTableDimensions(shape,101,103),dimensions);
    if (shape === "round") assert.equal(dimensions.width_cm,dimensions.height_cm);
  }
});

test("standardizing only changes dimensions of matching tables and rejects an edge crossing before writes", () => {
  const tables = [{ ...rectangle,id:"a",width_cm:100,height_cm:100,x_cm:60,y_cm:60 },
    { ...rectangle,id:"b",shape:"round" },{ ...rectangle,id:"c",width_cm:206,height_cm:206 }];
  const snapshot = structuredClone(tables);
  const updates = getStandardTableUpdates(tables,"rectangle",2000,1500);
  assert.deepEqual(updates,[{ ...tables[0],width_cm:206,height_cm:206 }]);
  assert.equal(seatingGeometryFits(tables[0],2000,1500),true);
  assert.equal(updates.some(table => !seatingGeometryFits(table,2000,1500)),true);
  assert.deepEqual(tables,snapshot);
});

test("standardizing chains confirmed revisions and preserves names, positions, seats and rotation", async () => {
  const updates = getStandardTableUpdates([{ ...rectangle,id:"a" },{ ...rectangle,id:"b",rotation_deg:45,capacity:13 }],"rectangle",2000,1500);
  const calls = [];
  const result = await updateTableSizes(updates,10,async (table,revision) => {
    calls.push({ ...table,revision });
    return { success:true,data:{ id:table.id,revision:revision+1 } };
  });
  assert.deepEqual(calls,updates.map((table,i) => ({ ...table,revision:10+i })));
  assert.deepEqual(result,{ success:true,data:{ revision:12,updated:2 } });
});

test("standardizing stops at a revision conflict and exposes partial saves without retries", async () => {
  const tables = [{ ...rectangle,id:"a" },{ ...rectangle,id:"b" },{ ...rectangle,id:"c" }];
  let calls = 0;
  const conflict = await updateTableSizes(tables,10,async () => { calls++; return { success:false,code:"REVISION_CONFLICT" }; });
  assert.equal(calls,1);
  assert.deepEqual(conflict,{ success:false,code:"REVISION_CONFLICT",updated:0 });
  const confirmed = [];
  calls=0;
  const partial = await updateTableSizes(tables,10,async (table,revision) => {
    calls++;
    if (calls === 2) return { success:false,code:"REVISION_CONFLICT" };
    confirmed.push(table.id);
    return { success:true,data:{ id:table.id,revision:revision+1 } };
  });
  assert.equal(calls,2); assert.deepEqual(confirmed,["a"]);
  assert.deepEqual(partial,{ success:false,code:"STANDARDIZE_PARTIAL",updated:1 });
});

test("standardizing stops after an uncertain transport outcome or invalid RPC confirmation", async () => {
  const tables = [{ ...rectangle,id:"a" },{ ...rectangle,id:"b" }];
  for (const outcome of ["throw","missing","wrong-id","wrong-revision"]) {
    let calls=0;
    const result = await updateTableSizes(tables,10,async () => {
      calls++;
      if (outcome === "throw") throw new Error("connection interrupted after possible commit");
      return { success:true,data:outcome === "missing" ? null : { id:outcome === "wrong-id" ? "other" : "a",revision:outcome === "wrong-revision" ? 20 : 11 } };
    });
    assert.equal(calls,1);
    assert.deepEqual(result,{ success:false,code:"STANDARDIZE_PARTIAL",updated:0 });
  }
});

test("long tables put at most two chairs at each end and split the remainder evenly", () => {
  assert.deepEqual(getLongTableSeatCounts(17),{ left:2,right:2,top:7,bottom:6 });
  for (let capacity=1;capacity<=100;capacity++) {
    const counts = getLongTableSeatCounts(capacity);
    assert.equal(Object.values(counts).reduce((total,n) => total+n,0),capacity);
    assert.ok(counts.left<=2 && counts.right<=2);
    assert.ok(counts.top-counts.bottom>=0 && counts.top-counts.bottom<=1);
    const table = { ...rectangle,capacity,width_cm:getLongTableWidth(capacity,206),height_cm:206 };
    const chairs = chairPositions(table);
    assert.equal(chairs.length,capacity);
    for (const [edge,rotation] of [["top",0],["right",90],["bottom",180],["left",270]]) {
      assert.equal(chairs.filter(chair => chair.rotation === rotation).length,counts[edge]);
    }
  }
});

test("long-table capacity changes extend only width with constant chair size and even row spacing", () => {
  const original = { ...rectangle,width_cm:412,height_cm:206 };
  const nine = withTableCapacity(original,9), seventeen = withTableCapacity(original,17);
  assert.equal(nine.height_cm,206); assert.equal(seventeen.height_cm,206);
  assert.ok(nine.width_cm>original.width_cm); assert.ok(seventeen.width_cm>nine.width_cm);
  assert.deepEqual(withTableCapacity(seventeen,8),original);
  assert.deepEqual(withTableCapacity({ ...original,shape:"round",width_cm:229,height_cm:229 },17),{ ...original,shape:"round",width_cm:229,height_cm:229,capacity:17 });
  const snapshot = { ...original };
  for (const table of [original,nine,seventeen]) {
    assert.equal(table.x_cm,original.x_cm); assert.equal(table.y_cm,original.y_cm);
    assert.equal(table.rotation_deg,original.rotation_deg); assert.equal(table.name,original.name);
    assert.equal(getChairSize(table),getChairSize(original));
    for (const rotation of [0,90,180,270]) {
      const chairs = chairPositions(table).filter(chair => chair.rotation === rotation);
      const axis = rotation%180 === 0 ? "x" : "y";
      const pitch = chairs.length>1 ? chairs[1][axis]-chairs[0][axis] : 0;
      for (let i=1;i<chairs.length;i++) assert.ok(Math.abs(chairs[i][axis]-chairs[i-1][axis]-pitch)<1e-9);
    }
  }
  assert.deepEqual(original,snapshot);
});

test("a growing rotated long table is rejected at the edge and fits after moving its center", () => {
  const original = { ...rectangle,width_cm:412,height_cm:206,x_cm:300,y_cm:300,rotation_deg:45 };
  assert.equal(seatingGeometryFits(original,1000,1000),true);
  const extended = withTableCapacity(original,17);
  assert.equal(seatingGeometryFits(extended,1000,1000),false);
  assert.equal(seatingGeometryFits({ ...extended,x_cm:500,y_cm:500 },1000,1000),true);
  assert.deepEqual(original,{ ...rectangle,width_cm:412,height_cm:206,x_cm:300,y_cm:300,rotation_deg:45 });
});

test("chair positions and orientation rotate with the table in local coordinates", async () => {
  const Konva = (await import("konva")).default;
  const table = { ...rectangle,capacity:17,width_cm:getLongTableWidth(17,206),height_cm:206 };
  const localChairs = chairPositions(table);
  for (const angle of [0,45,90,180,270]) {
    const group = new Konva.Group({ x:table.x_cm,y:table.y_cm,rotation:angle });
    for (const position of localChairs) {
      const chair = new Konva.Group({ x:position.x,y:position.y,rotation:position.rotation });
      group.add(chair);
      const world = chair.getAbsolutePosition(), radians = angle*Math.PI/180;
      assert.ok(Math.abs(world.x-(table.x_cm+position.x*Math.cos(radians)-position.y*Math.sin(radians)))<1e-8);
      assert.ok(Math.abs(world.y-(table.y_cm+position.x*Math.sin(radians)+position.y*Math.cos(radians)))<1e-8);
      assert.ok(Math.abs(((chair.getAbsoluteRotation()-(angle+position.rotation))%360+360)%360)<1e-8 || Math.abs(((chair.getAbsoluteRotation()-(angle+position.rotation))%360+360)%360-360)<1e-8);
    }
    group.destroy();
    assert.deepEqual(chairPositions({ ...table,rotation_deg:angle }),localChairs);
  }
});

test("standardizing long tables derives each length from its capacity but uses a common depth", () => {
  const tables = [{ ...rectangle,id:"a",capacity:8 },{ ...rectangle,id:"b",capacity:17,height_cm:150 }];
  const updates = getStandardTableUpdates(tables,"rectangle",2000,1500);
  assert.deepEqual(updates.map(table => [table.width_cm,table.height_cm,table.capacity]),[[206,206,8],[550,206,17]]);
  assert.equal(updates.some(table => !seatingGeometryFits(table,2000,1500)),false);
  const smallEight = getStandardTableDimensions("rectangle",101,103,8);
  const smallSeventeen = getStandardTableDimensions("rectangle",101,103,17);
  assert.equal(smallEight.height_cm,smallSeventeen.height_cm);
  assert.ok(smallSeventeen.width_cm>smallEight.width_cm); // Do not compress the depth to force a fit.
});

test("chair rows stay centered with equal gaps between seats and from the ends", () => {
  for (const capacity of [8,9,17,100]) {
    const table = { ...rectangle,capacity,width_cm:getLongTableWidth(capacity,206),height_cm:206 };
    const chairs = chairPositions(table);
    if (capacity === 8) assert.deepEqual(getLongTableSeatCounts(capacity),{ top:2,bottom:2,left:2,right:2 });
    for (const rotation of [0,90,180,270]) {
      const row = chairs.filter(chair => chair.rotation === rotation);
      const axis = rotation%180 === 0 ? "x" : "y";
      const length = axis === "x" ? table.width_cm : table.height_cm;
      const gap = length/(row.length+1);
      assert.ok(Math.abs(row[0][axis]+length/2-gap)<1e-9);
      assert.ok(Math.abs(length/2-row.at(-1)[axis]-gap)<1e-9);
      for (let i=1;i<row.length;i++) assert.ok(Math.abs(row[i][axis]-row[i-1][axis]-gap)<1e-9);
      assert.ok(Math.abs(row.reduce((total,chair) => total+chair[axis],0))<1e-8);
    }
  }
});

test("name and smaller occupancy keep exactly the same sizes and box through every rotation", () => {
  for (const table of [{ ...rectangle,width_cm:309,height_cm:206 },{ ...rectangle,width_cm:653,height_cm:206 },{ ...rectangle,shape:"round",width_cm:229,height_cm:229 }]) {
    const original = getTableLabelLayout(table);
    assert.ok(original.occupancyFontSize < original.nameFontSize);
    for (let rotation_deg=0;rotation_deg<360;rotation_deg++) {
      assert.deepEqual(getTableLabelLayout({ ...table,rotation_deg }),original);
    }
    assert.ok(original.nameFontSize*original.lineHeight < original.nameHeight);
    assert.ok(original.occupancyFontSize*original.lineHeight < original.occupancyHeight);
  }
});

test("capacity changes preserve extra length of legacy tables and never reverse growth or shrink", () => {
  const longer = { ...rectangle,width_cm:1000,height_cm:206 };
  const increased = withTableCapacity(longer,17);
  assert.ok(increased.width_cm>longer.width_cm);
  assert.equal(increased.height_cm,longer.height_cm);
  assert.deepEqual(withTableCapacity(increased,8),longer);
  const short = { ...rectangle,width_cm:100,height_cm:206 };
  assert.ok(withTableCapacity(short,7).width_cm<=short.width_cm);
  assert.ok(withTableCapacity(short,9).width_cm>=short.width_cm);
  for (const table of [short,longer]) assert.ok(getChairSize(table)>0);
});

test("eight seats make a square with symmetric edge positions and the ninth extends only width", () => {
  const dimensions = getStandardTableDimensions("rectangle",2000,1500);
  assert.deepEqual(dimensions,{ width_cm:206,height_cm:206 });
  const eight = { ...rectangle,...dimensions };
  const chairs = chairPositions(eight);
  const top = chairs.filter(chair => chair.rotation === 0).map(chair => chair.x);
  const bottom = chairs.filter(chair => chair.rotation === 180).map(chair => chair.x);
  const left = chairs.filter(chair => chair.rotation === 270).map(chair => chair.y);
  const right = chairs.filter(chair => chair.rotation === 90).map(chair => chair.y);
  assert.deepEqual(top,bottom); assert.deepEqual(top,left); assert.deepEqual(top,right);
  const nine = withTableCapacity(eight,9);
  assert.equal(nine.width_cm,275); assert.equal(nine.height_cm,206);
  assert.deepEqual(getLongTableSeatCounts(9),{ left:2,right:2,top:3,bottom:2 });
  assert.equal(getChairSize(nine),getChairSize(eight));
  assert.deepEqual(withTableCapacity(nine,8),eight);
});


test("creation preview keeps the table and all rotated chairs inside a narrow mobile canvas", async () => {
  const Konva = (await import("konva")).default;
  for (const shape of ["round", "rectangle"]) for (const capacity of [1, 6, 8, 9, 12, 17, 100]) {
    const table = { ...rectangle, shape, capacity, ...getStandardTableDimensions(shape,10000,10000,capacity) };
    const bounds = getTablePreviewBounds(table);
    const scale = Math.min((240-32)/bounds.width,(176-32)/bounds.height);
    const group = new Konva.Group({ x:120,y:88,scaleX:scale,scaleY:scale });
    group.add(new Konva.Rect({ width:table.width_cm,height:table.height_cm,offsetX:table.width_cm/2,offsetY:table.height_cm/2 }));
    const size = getChairSize(table);
    for (const chair of chairPositions(table)) {
      const seat = new Konva.Group({ x:chair.x,y:chair.y,rotation:chair.rotation });
      seat.add(new Konva.Rect({ width:size,height:size,offsetX:size/2,offsetY:size/2 }));
      group.add(seat);
    }
    const rendered = group.getClientRect();
    assert.ok(rendered.x>=16-1e-9 && rendered.y>=16-1e-9);
    assert.ok(rendered.x+rendered.width<=224+1e-9 && rendered.y+rendered.height<=160+1e-9);
    group.destroy();
  }
});


test("duplicating both table shapes preserves legacy size, seats and rotation without changing the original", () => {
  for (const shape of ["round","rectangle"]) for (const rotation_deg of [0,45,90,270]) {
    const source = { ...rectangle,shape,rotation_deg,capacity:17,width_cm:470,height_cm:shape === "round" ? 470 : 439,x_cm:1600,y_cm:1400 };
    const snapshot = structuredClone(source);
    const copy = getDuplicateTable(source,[source],4944,7654,"Table (copy 1)");
    assert.ok(copy);
    assert.equal(seatingGeometryFits(copy,4944,7654),true);
    assert.deepEqual({ ...copy,id:source.id,name:source.name,x_cm:source.x_cm,y_cm:source.y_cm },source);
    assert.notDeepEqual([copy.x_cm,copy.y_cm],[source.x_cm,source.y_cm]);
    assert.equal(copy.id,"");
    assert.ok(Number.isInteger(copy.x_cm) && Number.isInteger(copy.y_cm));
    assert.deepEqual(source,snapshot);
  }
});

test("blocked neighbours place a copy near its source instead of the first free room corner", () => {
  const source = { ...rectangle,shape:"round",width_cm:200,height_cm:200,x_cm:1000,y_cm:1000 };
  const tables = [source,...[[1300,1000],[700,1000],[1000,1300],[1000,700]].map(([x_cm,y_cm],i) => ({ ...source,id:String(i),x_cm,y_cm }))];
  const copy = getDuplicateTable(source,tables,2000,2000,"Copy");
  assert.ok(copy);
  assert.ok(Math.hypot(copy.x_cm-source.x_cm,copy.y_cm-source.y_cm)<850);
  assert.ok(copy.x_cm>200 && copy.y_cm>200 && copy.x_cm<1800 && copy.y_cm<1800);
  for (const table of tables) assert.ok(Math.hypot(copy.x_cm-table.x_cm,copy.y_cm-table.y_cm)>200);
});

test("duplicating at room edges respects rotated bounds and reports no available position in a full room", () => {
  for (const rotation_deg of [0,45,90]) {
    const source = { ...rectangle,width_cm:470,height_cm:439,rotation_deg,x_cm:340,y_cm:340 };
    const copy = getDuplicateTable(source,[source],2000,1500,"Copy");
    assert.ok(copy);
    assert.equal(seatingGeometryFits(copy,2000,1500),true);
  }
  const full = { ...rectangle,shape:"round",width_cm:100,height_cm:100,x_cm:50,y_cm:50 };
  assert.equal(getDuplicateTable(full,[full],100,100,"Copy"),null);
});

test("copy names avoid collisions and fit input limits without splitting Unicode characters", () => {
  for (const source of ["Table","A".repeat(150),"😀".repeat(75)]) {
    const suffix = number => " (copy "+number+")";
    const first = getDuplicateTableName(source,[source],suffix);
    const second = getDuplicateTableName(source,[source,first],suffix);
    assert.notEqual(first,second);
    assert.ok(first.length<=150 && second.length<=150);
    assert.ok(first.endsWith(suffix(1)) && second.endsWith(suffix(2)));
    assert.equal(first.isWellFormed(),true);
    assert.equal(second.isWellFormed(),true);
  }
});

test("chair rendering follows saved seat numbers through moves and release, without filling table-only guests", () => {
  const colors = { fill:"white",text:"black",accent:"purple",accentText:"white" };
  const tableA = { ...rectangle,id:"a",shape:"round",height_cm:200 };
  const tableB = { ...rectangle,id:"b",capacity:17,width_cm:550,height_cm:206 };
  const assigned = [{ table_id:"a",project_guest_id:"one",seat_number:3 },{ table_id:"a",project_guest_id:"two",seat_number:8 },
    { table_id:"b",project_guest_id:"three",seat_number:17 },{ table_id:"b",project_guest_id:"four",seat_number:null }];
  const moved = assigned.map(assignment => assignment.project_guest_id === "two" ? { ...assignment,table_id:"b",seat_number:null } : assignment);
  const removed = moved.filter(assignment => assignment.project_guest_id !== "one");
  for (const assignments of [assigned,moved,removed]) for (const table of [tableA,tableB]) for (const selected of [false,true]) {
    const atTable = assignments.filter(assignment => assignment.table_id === table.id);
    const expected = atTable.filter(assignment => assignment.seat_number !== null).map(assignment => assignment.seat_number).sort((a,b) => a-b);
    const seats = TableChairs({ table,assignments:atTable,selected,colors }).props.children;
    assert.equal(seats.length,table.capacity);
    assert.deepEqual(seats.filter(seat => seat.props.children[0].props.fill === colors.accent).map(seat => Number(seat.key)).sort((a,b) => a-b),expected);
    assert.equal(seats.filter(seat => seat.props.children[0].props.fill === colors.fill).length,table.capacity-expected.length);
  }
  const copy = { ...tableA,id:"copy" };
  const seats = TableChairs({ table:copy,selected:true,colors }).props.children;
  assert.equal(seats.filter(seat => seat.props.children[0].props.fill === colors.accent).length,0);
});

test("empty, full and invalid seat numbers render only actual available seats for both shapes", () => {
  const colors = { fill:"white",text:"black",accent:"purple",accentText:"white" };
  for (const shape of ["round","rectangle"]) for (const capacity of [1,8,17,100]) {
    const table = { ...rectangle,shape,capacity,...getStandardTableDimensions(shape,10000,10000,capacity) };
    for (const assignments of [[],[{ project_guest_id:"table-only",seat_number:null }],
      Array.from({ length:capacity },(_,i) => ({ project_guest_id:String(i),seat_number:i+1 })),
      [{ project_guest_id:"zero",seat_number:0 },{ project_guest_id:"beyond",seat_number:capacity+1 }]]) {
      const seats = TableChairs({ table,assignments,colors }).props.children;
      const expected = assignments.filter(assignment => assignment.seat_number>=1 && assignment.seat_number<=capacity).length;
      assert.equal(seats.length,capacity);
      assert.equal(seats.filter(seat => seat.props.children[0].props.fill === colors.accent).length,expected);
    }
  }
});

test("seat numbers cover 1 through capacity and preserve rectangle sides when eight seats grow to nine and seventeen", () => {
  for (const shape of ["round","rectangle"]) for (let capacity=1;capacity<=100;capacity++) {
    const table = { ...rectangle,shape,capacity };
    assert.deepEqual(chairPositions(table).map(chair => chair.seatNumber).sort((a,b) => a-b),Array.from({ length:capacity },(_,i) => i+1));
  }
  const sides = { left:[1,3],right:[2,4],top:[5,7],bottom:[6,8] };
  for (const capacity of [8,9,17]) {
    const table = withTableCapacity({ ...rectangle,width_cm:206,height_cm:206 },capacity);
    for (const [side,numbers] of Object.entries(sides)) for (const seatNumber of numbers) {
      assert.equal(getSeatSide(table,seatNumber),side);
      const chair = chairPositions(table).find(item => item.seatNumber === seatNumber);
      assert.equal(chair.rotation,{ top:0,right:90,bottom:180,left:270 }[side]);
    }
    for (const chair of chairPositions(table)) assert.equal(getSeatSide(table,chair.seatNumber),{ 0:"top",90:"right",180:"bottom",270:"left" }[chair.rotation]);
  }
  assert.equal(getSeatSide(rectangle,9),"top");
  assert.equal(getSeatSide(rectangle,10),"bottom");
});

test("round seat numbers start at the top and continue clockwise", () => {
  const table = { ...rectangle,shape:"round",width_cm:200,height_cm:200,capacity:4 };
  const chairs = chairPositions(table);
  assert.equal(chairs[0].seatNumber,1); assert.ok(Math.abs(chairs[0].x)<1e-9 && chairs[0].y<0);
  assert.equal(chairs[1].seatNumber,2); assert.ok(chairs[1].x>0 && Math.abs(chairs[1].y)<1e-9);
  assert.equal(chairs[2].seatNumber,3); assert.ok(Math.abs(chairs[2].x)<1e-9 && chairs[2].y>0);
  assert.equal(chairs[3].seatNumber,4); assert.ok(chairs[3].x<0 && Math.abs(chairs[3].y)<1e-9);
});

test("chair hit testing uses stable IDs and the rotated local chair body, while zoom only enlarges optional targets", () => {
  for (const shape of ["round","rectangle"]) for (const rotation_deg of [0,45,90,180,270]) {
    const table = { ...rectangle,shape,rotation_deg,...getStandardTableDimensions(shape,10000,10000,17),capacity:17 };
    for (const chair of chairPositions(table)) {
      const position = getSeatWorldPosition(table,chair.seatNumber);
      assert.ok(position);
      assert.equal(chairContainsPoint(table,chair.seatNumber,position),true);
      assert.deepEqual(hitSeat([table],position),{ tableId:table.id,seatNumber:chair.seatNumber });
      const distance = getChairSize(table);
      const outside = { x:position.x+distance*2,y:position.y };
      assert.equal(chairContainsPoint(table,chair.seatNumber,outside),false);
      assert.equal(chairContainsPoint(table,chair.seatNumber,outside,distance*2+1),true);
    }
    assert.equal(getSeatWorldPosition(table,0),null);
    assert.equal(chairContainsPoint(table,18,{ x:0,y:0 }),false);
    assert.equal(hitSeat([table],{ x:-10000,y:-10000 }),null);
  }
  const table = { ...rectangle,id:"front" }, point = getSeatWorldPosition(table,1);
  assert.deepEqual(hitSeat([{ ...table,id:"back" },table],point),{ tableId:"front",seatNumber:1 });
});

test("a front table body masks the invisible chair of an overlapping earlier table", () => {
  const back = { ...rectangle,id:"back" }, point = getSeatWorldPosition(back,7);
  const front = { ...rectangle,id:"front",x_cm:point.x,y_cm:point.y };
  assert.equal(tableContainsPoint(front,point),true);
  assert.deepEqual(hitSeatingTarget([back,front],point),{ tableId:"front",seatNumber:null });
  assert.deepEqual(hitSeatingTarget([front,back],point),{ tableId:"back",seatNumber:7 });
  assert.equal(hitSeatingTarget([back,front],{ x:-10000,y:-10000 }),null);
});

test("a front chair drawn over an earlier table body remains the visible seat drop target", () => {
  const back = { ...rectangle,id:"back" }, front = { ...rectangle,id:"front",y_cm:460 };
  const point = getSeatWorldPosition(front,7);
  assert.equal(tableContainsPoint(back,point),true);
  assert.equal(tableContainsPoint(front,point),false);
  assert.deepEqual(hitSeatingTarget([back,front],point),{ tableId:"front",seatNumber:7 });
  assert.deepEqual(hitSeatingTarget([front,back],point),{ tableId:"back",seatNumber:null });
});

test("interactive chair clicks select seats without starting table or stage dragging, while hand and pinch pass through", () => {
  const colors = { fill:"white",text:"black",accent:"purple",accentText:"white" }, selected = [];
  const render = options => TableChairs({ table:rectangle,colors,onSeatSelect:number => selected.push(number),...options });
  const interactive = render({});
  assert.equal(interactive.props.listening,true);
  const chair = interactive.props.children.find(item => Number(item.key) === 7);
  const down = { evt:{},cancelBubble:false };
  chair.props.onMouseDown(down); assert.equal(down.cancelBubble,true); assert.deepEqual(selected,[]);
  const tap = { evt:{ touches:[] },cancelBubble:false };
  chair.props.onTap(tap); assert.equal(tap.cancelBubble,true); assert.deepEqual(selected,[7]);
  const pinch = { evt:{ touches:[{},{}] },cancelBubble:false };
  chair.props.onTouchStart(pinch); chair.props.onTap(pinch);
  assert.equal(pinch.cancelBubble,false); assert.deepEqual(selected,[7]);
  for (const options of [{ hand:true },{ disabled:true }]) {
    const passive = render(options);
    assert.equal(passive.props.listening,false);
    const event = { evt:{},cancelBubble:false };
    passive.props.children[0].props.onMouseDown(event); passive.props.children[0].props.onClick(event);
    assert.equal(event.cancelBubble,false); assert.deepEqual(selected,[7]);
  }
});

test("upright seat names use project people by identity, omit table-only guests and update after a shared rename", async () => {
  const colors = { fill:"white",text:"black",accent:"purple",accentText:"white" };
  const assignments = [{ project_guest_id:"person",seat_number:7 },{ project_guest_id:"table-only",seat_number:null },{ project_guest_id:"missing",seat_number:1 }];
  const people = [{ id:"person",first_name:"Ana",last_name:"Horvat" },{ id:"table-only",first_name:"Marko",last_name:null }];
  const Konva = (await import("konva")).default;
  let layout;
  for (const rotation_deg of [0,45,90,180,270]) {
    const table = { ...rectangle,width_cm:206,height_cm:206,rotation_deg };
    const actual = getSeatNameLayout(table,7,.5);
    if (!layout) layout = actual;
    for (const field of ["width","height","fontSize","lineHeight"]) assert.equal(actual[field],layout[field]);
    assert.ok(actual.width*.5<=90 && actual.fontSize*.5>=10);
    const rendered = TableSeatNames({ table,assignments,people,colors,scale:.5 });
    const names = rendered.props.children.filter(Boolean);
    assert.equal(names.length,1); assert.equal(names[0].props.children[1].props.text,"Ana Horvat");
    const world = new Konva.Group({ scaleX:.5,scaleY:.5 });
    const label = new Konva.Group({ x:names[0].props.x,y:names[0].props.y });
    world.add(label);
    assert.ok(Math.abs(label.getAbsoluteRotation())<1e-8);
    assert.equal(names[0].props.rotation,undefined);
    assert.equal(names[0].props.children[1].props.rotation,undefined);
    world.destroy();
  }
  const renamed = TableSeatNames({ table:rectangle,assignments,people:[{ ...people[0],first_name:"Anica" },people[1]],colors });
  assert.equal(renamed.props.children.filter(Boolean)[0].props.children[1].props.text,"Anica Horvat");
});

test("selected chair numbers counter-rotate around chair centers and hide when too small to read", async () => {
  const colors = { fill:"white",text:"black",accent:"purple",accentText:"white" };
  const Konva = (await import("konva")).default;
  for (const rotation_deg of [0,45,90,180,270]) {
    const table = { ...rectangle,rotation_deg };
    const rendered = TableChairs({ table,colors,selected:true,scale:1 });
    const group = new Konva.Group({ x:table.x_cm,y:table.y_cm,rotation:table.rotation_deg });
    for (const seat of rendered.props.children) {
      const child = new Konva.Group({ x:seat.props.x,y:seat.props.y,rotation:seat.props.rotation });
      const props = seat.props.children[3].props;
      const number = new Konva.Group({ x:props.x,y:props.y,rotation:props.rotation });
      child.add(number); group.add(child);
      assert.ok(Math.abs(number.getAbsoluteRotation())<1e-8);
      assert.deepEqual(number.getAbsolutePosition(),child.getAbsolutePosition());
    }
    group.destroy();
  }
  const small = TableChairs({ table:rectangle,colors,selected:true,scale:.05 });
  assert.ok(small.props.children.every(chair => !chair.props.children[3]));
});
