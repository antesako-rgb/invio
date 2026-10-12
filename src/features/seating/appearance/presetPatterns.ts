const tiles = new Map<string, HTMLCanvasElement>();
/** One repeat tile in physical cm. Zoom and transforms do not regenerate it. */
export function presetPattern(style: string, color?: string): HTMLCanvasElement | undefined {
  if (typeof document === "undefined" || style === "neutral" || style === "plain") return;
  const key = style + ":" + (color ?? "");
  const saved = tiles.get(key); if (saved) return saved;
  const tile = document.createElement("canvas"); tile.width = tile.height = 240;
  const c = tile.getContext("2d"); if (!c) return;
  const palettes: Record<string, [string, string]> = {
    light_oak: ["#ebe1d0", "#c9b99a"], dark_oak: ["#b9a78d", "#917b61"],
    classic_parquet: ["#e2ccaa", "#bda17c"], herringbone: ["#e6d2af", "#c2a57b"],
    dark_wood: ["#977a5c", "#6e533c"], marble: ["#f5f0e8", "#c8bdad"],
    tiles: ["#eee8dc", "#d3c8b5"], concrete: ["#e2ded5", "#c4beb1"],
    white: ["#fdfaf2", "#e4dccb"], black_white: ["#f7f1e6", "#535451"],
    minimal: ["#e4ddd0", "#cbc0ad"], linen: [color ?? "#f8f1e6", "#9b8a76"], satin: [color ?? "#f7efdc", "#ffffff"],
  };
  const [base, detail] = palettes[style] ?? palettes.concrete;
  c.fillStyle = base; c.fillRect(0, 0, 240, 240);
  c.strokeStyle = detail; c.lineWidth = .7;
  const wood = ["light_oak", "dark_oak", "dark_wood", "classic_parquet", "herringbone"].includes(style);
  if (style === "herringbone") {
    // Interlocking L-shaped plank pairs on a lattice. After a 45° rotation,
    // lattice vectors repeat at 60cm horizontally / 240cm vertically;
    // both divide this tile exactly, so no broken seams at its edges.
    const unit=240/(4*Math.SQRT2),length=unit*4;
    function plank(variant:number) {
      c!.fillStyle=base;c!.fillRect(0,0,length,unit);
      c!.fillStyle=`rgba(255,255,255,${variant*.025})`;c!.fillRect(0,0,length,unit);
      c!.globalAlpha=.4;c!.strokeRect(.5,.5,length-1,unit-1);c!.globalAlpha=.12;
      for(let grain=1;grain<4;grain++) {
        c!.beginPath();c!.moveTo(5,unit*grain/4);
        c!.bezierCurveTo(length*.3,unit*grain/4-3,length*.65,unit*grain/4+3,length-5,unit*grain/4);c!.stroke();
      }
      c!.globalAlpha=1;
    }
    c.save();c.rotate(Math.PI/4);
    for(let i=-1;i<=1;i++)for(let j=-3;j<=6;j++) {
      const x=(4*i+j)*unit,y=(4*i-j)*unit,variant=((j%4)+4)%4;
      c.save();c.translate(x,y);plank(variant);c.restore();
      c.save();c.translate(x+length,y+unit);c.rotate(Math.PI/2);plank((variant+2)%4);c.restore();
    }
    c.restore();
  } else if (wood) {
    // Draw full planks, including staggered joints and fine deterministic grain.
    const parquet = style === "classic_parquet";
    for (let row = -1; row < (parquet?3:9); row++) for (let col = -2; col < 4; col++) {
      c.save();
      if (parquet) { c.translate(col * 120 + 60, row * 120 + 60); if ((col + row) % 2) c.rotate(Math.PI / 2); }
      else c.translate(col * 120 + row % 2 * 60, row * 30);
      const count = parquet ? 4 : 1;
      for (let p = 0; p < count; p++) {
        const x = parquet ? -60 : 0, y = parquet ? -60 + p * 30 : 0;
        c.fillStyle = base; c.fillRect(x, y, 120, 30);
        c.fillStyle = `rgba(255,255,255,${(((parquet ? 2*row : row) + 2*col + p + 16) % 4) * .025})`; c.fillRect(x, y, 120, 30);
        c.globalAlpha = .45; c.strokeRect(x + .5, y + .5, 119, 29);
        c.globalAlpha = .14;
        for (let grain = 0; grain < 3; grain++) {
          c.beginPath(); c.moveTo(x + 4, y + 7 + grain * 7);
          c.bezierCurveTo(x + 30, y + 3 + grain * 7, x + 80, y + 12 + grain * 7, x + 115, y + 7 + grain * 7); c.stroke();
        }
        c.globalAlpha = 1;
      }
      c.restore();
    }
  } else if (style === "marble") {
    // Closed tile-boundary paths keep veins seamless on repetition.
    c.globalAlpha = .3;
    for (const shift of [0, 75]) {
      c.beginPath(); c.moveTo(0, 45 + shift); c.bezierCurveTo(40, 25 + shift, 85, 90 + shift, 120, 62 + shift); c.bezierCurveTo(160, 30 + shift, 200, 65 + shift, 240, 45 + shift); c.stroke();
      c.lineWidth = 2; c.globalAlpha = .08; c.stroke(); c.lineWidth = .7; c.globalAlpha = .3;
    }
    c.globalAlpha=.18;c.lineWidth=.4;c.strokeStyle="#bca47d";
    c.beginPath();c.moveTo(74,59);c.bezierCurveTo(92,68,106,37,124,35);c.stroke();
    c.globalAlpha=.12;c.strokeStyle=detail;c.beginPath();c.moveTo(130,131);c.bezierCurveTo(158,144,172,111,190,103);c.stroke();
  } else if (style === "black_white") {
    c.fillStyle = detail; c.fillRect(0, 0, 120, 120); c.fillRect(120, 120, 120, 120);
  } else if (["tiles", "white", "minimal"].includes(style)) {
    c.globalAlpha = .45; c.strokeRect(.5, .5, 239, 239);
    c.strokeStyle = "#ffffff"; c.strokeRect(2, 2, 236, 236);
  } else if (style === "linen") {
    c.globalAlpha = .09;
    for (let i = 0; i < 240; i += 4) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 240); c.moveTo(0, i); c.lineTo(240, i); c.stroke(); }
  } else if (style === "satin") {
    const sheen = c.createLinearGradient(0, 0, 240, 240);
    sheen.addColorStop(0, "rgba(255,255,255,0)"); sheen.addColorStop(.5, "rgba(255,255,255,.2)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen; c.fillRect(0, 0, 240, 240);
  } else {
    c.globalAlpha = .14; c.fillStyle = detail;
    for (let i = 0; i < 100; i++) c.fillRect(i * 37 % 240, i * 53 % 240, 1, 1);
  }
  if (tiles.size >= 32) tiles.delete(tiles.keys().next().value!);
  tiles.set(key, tile); return tile;
}
