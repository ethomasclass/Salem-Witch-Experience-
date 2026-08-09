// Props: buildings, trees, fences, and the objects the player can examine.
//
// The important thing here is PROJECTION. This is not a true overhead view.
// Like the GBA Pokémon towns it borrows from, a building shows its roof from
// slightly above AND its front wall straight on, in the same image. That
// oblique cheat is what makes a village read as a place you're standing in
// rather than a floor plan.
//
// Everything is drawn into a surface sized to a whole number of 16px tiles,
// so props drop onto the tile grid cleanly and sort against the player by
// their baseline (bottom edge).

import { surface, rect, px, hline, vline, line, ellipse, speckle, hash, stroke } from './pixels.js';
import { P } from '../palette.js';
import { TS } from './art-ground.js';

/* ---------------------------------------------------------------------- *
 * Buildings
 * ---------------------------------------------------------------------- */

function shingles(g, x0, y0, w, h, topInset) {
  // Split cedar shingles, laid in courses. Each course is 4px, drawn from the
  // eave upward so the overlap shadow falls the right way.
  const rows = Math.ceil(h / 4);
  for (let r = 0; r < rows; r++) {
    const yy = y0 + h - (r + 1) * 4;
    // Roof narrows toward the ridge — that taper is the whole illusion.
    const t = (r * 4) / h;
    const inset = Math.round(topInset * t);
    const xx = x0 + inset;
    const ww = w - inset * 2;
    if (ww <= 0) continue;

    const band = r % 2 === 0 ? P.roof : P.roofLo;
    rect(g, xx, yy, ww, 4, band);
    // Course shadow along the bottom of each row.
    hline(g, xx, yy + 3, ww, P.roofDeep);
    // Vertical shingle joints, staggered per course.
    for (let sx = xx + ((r % 2) ? 0 : 3); sx < xx + ww; sx += 6) {
      vline(g, sx, yy, 3, P.roofDeep);
    }
    // Weathering highlights.
    speckle(g, xx, yy, ww, 3, P.roofHi, 0.05, 71 + r * 5);
  }
}

function window16(g, x, y, w = 10, h = 11) {
  // Small leaded casement. Glass was expensive and windows were tiny; that
  // is why these interiors were dark, which is worth the player noticing.
  rect(g, x - 1, y - 1, w + 2, h + 2, P.wallDeep);
  rect(g, x, y, w, h, P.frame);
  rect(g, x + 1, y + 1, w - 2, h - 2, P.glass);
  // Diamond quarrel leading.
  for (let i = 1; i < h - 1; i += 3) hline(g, x + 1, y + i, w - 2, P.frame);
  vline(g, x + Math.floor(w / 2), y + 1, h - 2, P.frame);
  // A single glare pixel-run, top-left, as if catching the grey sky.
  hline(g, x + 1, y + 1, 3, P.glassLit);
  px(g, x + 1, y + 2, P.glassLit);
}

function door16(g, x, y, w = 12, h = 18) {
  rect(g, x - 1, y - 1, w + 2, h + 1, P.wallDeep);
  rect(g, x, y, w, h, P.door);
  // Vertical batten planks.
  for (let i = 3; i < w; i += 4) vline(g, x + i, y + 1, h - 1, P.doorLo);
  // Two cross-battens.
  hline(g, x, y + 4, w, P.doorHi);
  hline(g, x, y + h - 6, w, P.doorHi);
  // Latch and strap hinge.
  px(g, x + w - 3, y + Math.floor(h / 2), '#2f2a24');
  px(g, x + w - 4, y + Math.floor(h / 2), '#2f2a24');
  hline(g, x + 1, y + 5, 4, '#2f2a24');
  hline(g, x + 1, y + h - 5, 4, '#2f2a24');
}

function chimney(g, x, y, w, h) {
  rect(g, x, y, w, h, P.stone);
  speckle(g, x, y, w, h, P.stoneLo, 0.35, 91);
  speckle(g, x, y, w, h, P.stoneHi, 0.12, 97);
  stroke(g, x, y, w, h, P.outline);
  // Cap course.
  rect(g, x - 1, y, w + 2, 2, P.stoneHi);
  hline(g, x - 1, y + 2, w + 2, P.outline);
}

/**
 * Build a house.
 *
 * @param wT,hT   size in tiles
 * @param opts.doorCol   tile column (0-based) the door sits in
 * @param opts.windows   array of tile columns to place windows in
 * @param opts.roofFrac  fraction of height given to roof (0..1)
 * @param opts.chimney   'center' | 'left' | 'right' | null
 */
export function buildHouse(wT, hT, opts = {}) {
  const {
    doorCol = Math.floor(wT / 2),
    windows = [],
    roofFrac = 0.52,
    chimney: chim = 'center',
  } = opts;

  const W = wT * TS, H = hT * TS;
  const s = surface(W, H + 6);           // +6 so the eave shadow has room
  const g = s.g;

  const foundH = 5;
  const roofH = Math.round(H * roofFrac);
  const wallY = roofH;
  const wallH = H - roofH - foundH;
  const overhang = 3;

  // --- chimney goes behind the ridge -----------------------------------
  if (chim) {
    const cw = 10, ch = 14;
    const cx = chim === 'center' ? Math.round(W / 2 - cw / 2)
             : chim === 'left'   ? Math.round(W * 0.24)
             :                     Math.round(W * 0.72);
    chimney(g, cx, 2, cw, ch);
  }

  // --- roof -------------------------------------------------------------
  const rx = -overhang, rw = W + overhang * 2;
  const topInset = Math.round(roofH * 0.34);
  shingles(g, rx, 8, rw, roofH - 8, topInset);

  // Ridge cap.
  const ridgeW = rw - topInset * 2;
  rect(g, rx + topInset, 6, ridgeW, 3, P.roofHi);
  hline(g, rx + topInset, 6, ridgeW, P.outline);
  hline(g, rx + topInset, 8, ridgeW, P.roofDeep);

  // Rake edges (the sloping sides), drawn as outline so the gable reads.
  line(g, rx + topInset, 7, rx, roofH, P.outline);
  line(g, rx + rw - topInset - 1, 7, rx + rw - 1, roofH, P.outline);

  // Eave: bright board, then the shadow it throws on the wall below.
  rect(g, rx, roofH - 3, rw, 3, P.roofHi);
  hline(g, rx, roofH - 4, rw, P.outline);
  hline(g, rx, roofH, rw, P.outline);
  rect(g, 0, roofH + 1, W, 3, P.wallDeep);

  // --- wall -------------------------------------------------------------
  rect(g, 0, wallY + 4, W, wallH - 4, P.wall);
  // Clapboard courses: each board casts a 1px shadow under its lower edge.
  for (let y = wallY + 6; y < wallY + wallH; y += 4) {
    hline(g, 0, y, W, P.wallLo);
    hline(g, 0, y + 1, W, P.wallHi);
  }
  speckle(g, 0, wallY + 4, W, wallH - 4, P.wallDeep, 0.04, 55);
  // Corner posts.
  rect(g, 0, wallY + 4, 3, wallH - 4, P.wallLo);
  rect(g, W - 3, wallY + 4, 3, wallH - 4, P.wallLo);
  vline(g, 0, wallY + 4, wallH - 4, P.outline);
  vline(g, W - 1, wallY + 4, wallH - 4, P.outline);

  // --- openings ---------------------------------------------------------
  const winY = wallY + 8;
  for (const col of windows) {
    window16(g, col * TS + 3, winY);
  }
  const dW = 12, dH = Math.min(20, wallH - 6);
  const dX = doorCol * TS + Math.floor((TS - dW) / 2);
  const dY = H - foundH - dH;
  door16(g, dX, dY, dW, dH);
  // Doorstone.
  rect(g, dX - 2, H - foundH, dW + 4, 3, P.stoneHi);
  hline(g, dX - 2, H - foundH + 3, dW + 4, P.stoneLo);

  // --- foundation -------------------------------------------------------
  rect(g, 0, H - foundH, W, foundH, P.stone);
  speckle(g, 0, H - foundH, W, foundH, P.stoneLo, 0.34, 61);
  speckle(g, 0, H - foundH, W, foundH, P.stoneHi, 0.14, 67);
  hline(g, 0, H - foundH, W, P.outline);

  // --- lean-to ----------------------------------------------------------
  // The visible half of a saltbox. A family that needed another room added
  // one against the end wall under a single long slope, and the result is
  // the silhouette everyone pictures when they picture a colonial house.
  if (opts.leanTo) {
    const lw = Math.round(W * 0.30);
    const lx = opts.leanTo === 'left' ? -overhang : W - lw + overhang;
    const lRoofTop = roofH - 8;
    const lRoofH = 12;
    rect(g, lx, lRoofTop, lw, lRoofH, P.roofLo);
    for (let yy = lRoofTop; yy < lRoofTop + lRoofH; yy += 4) hline(g, lx, yy + 3, lw, P.roofDeep);
    hline(g, lx, lRoofTop, lw, P.outline);
    rect(g, lx, lRoofTop + lRoofH - 2, lw, 2, P.roofHi);
    hline(g, lx, lRoofTop + lRoofH, lw, P.outline);
    const lwx = opts.leanTo === 'left' ? 0 : W - lw + overhang;
    const lwWidth = lw - overhang;
    rect(g, lwx, lRoofTop + lRoofH + 1, lwWidth, H - foundH - lRoofTop - lRoofH - 1, P.wall);
    for (let yy = lRoofTop + lRoofH + 3; yy < H - foundH; yy += 4) {
      hline(g, lwx, yy, lwWidth, P.wallLo);
      hline(g, lwx, yy + 1, lwWidth, P.wallHi);
    }
    if (opts.leanTo === 'left') vline(g, 0, lRoofTop + lRoofH, H - foundH - lRoofTop - lRoofH, P.outline);
    else vline(g, W - 1, lRoofTop + lRoofH, H - foundH - lRoofTop - lRoofH, P.outline);
  }

  // --- ground shadow ----------------------------------------------------
  g.fillStyle = P.shadow;
  g.fillRect(2, H, W - 4, 4);

  return s;
}

/**
 * An English barn. Bigger than any house in the village, no chimney, and a
 * pair of great doors in the long side — which is what a barn IS in New
 * England in 1692: a threshing floor with bays either side.
 *
 * Worth building because it corrects the picture. Salem Village was a
 * farming community, not a town: the largest building on most properties
 * was the one the animals and the harvest lived in.
 */
export function buildBarn(wT = 8, hT = 6) {
  const W = wT * TS, H = hT * TS;
  const s = surface(W, H + 6);
  const g = s.g;
  const foundH = 4;
  const roofH = Math.round(H * 0.5);
  const wallH = H - roofH - foundH;
  const overhang = 3;

  // Roof — steeper and plainer than a house, no chimney.
  const rx = -overhang, rw = W + overhang * 2;
  const topInset = Math.round(roofH * 0.30);
  shingles(g, rx, 4, rw, roofH - 4, topInset);
  const ridgeW = rw - topInset * 2;
  rect(g, rx + topInset, 2, ridgeW, 3, P.roofHi);
  hline(g, rx + topInset, 2, ridgeW, P.outline);
  line(g, rx + topInset, 3, rx, roofH, P.outline);
  line(g, rx + rw - topInset - 1, 3, rx + rw - 1, roofH, P.outline);
  rect(g, rx, roofH - 3, rw, 3, P.roofHi);
  hline(g, rx, roofH, rw, P.outline);
  rect(g, 0, roofH + 1, W, 3, P.wallDeep);

  // Wall: vertical board-and-batten, not clapboard. Different texture from
  // every house, so the barn reads as a barn at a glance.
  const wy = roofH + 4;
  rect(g, 0, wy, W, wallH, P.wallLo);
  for (let x = 0; x < W; x += 6) {
    vline(g, x, wy, wallH, P.wallDeep);
    vline(g, x + 1, wy, wallH, P.wall);
  }
  speckle(g, 0, wy, W, wallH, P.wallDeep, 0.05, 501);
  vline(g, 0, wy, wallH, P.outline);
  vline(g, W - 1, wy, wallH, P.outline);

  // The great doors, centred, tall enough for a loaded cart.
  const dW = 30, dH = wallH - 3;
  const dX = Math.round(W / 2 - dW / 2), dY = H - foundH - dH;
  rect(g, dX - 1, dY - 1, dW + 2, dH + 1, P.wallDeep);
  rect(g, dX, dY, dW, dH, P.doorLo);
  for (let i = 4; i < dW; i += 5) vline(g, dX + i, dY + 1, dH - 1, P.door);
  hline(g, dX, dY + 4, dW, P.doorHi);
  hline(g, dX, dY + dH - 7, dW, P.doorHi);
  vline(g, dX + dW / 2, dY, dH, P.wallDeep);      // the split between leaves
  // Strap hinges.
  hline(g, dX + 1, dY + 5, 7, '#2f2a24');
  hline(g, dX + dW - 8, dY + 5, 7, '#2f2a24');

  // A pitching hole up in the gable for hay.
  const hx = Math.round(W / 2 - 5);
  rect(g, hx, roofH - 16, 10, 9, P.ink);
  stroke(g, hx - 1, roofH - 17, 12, 11, P.outline);

  rect(g, 0, H - foundH, W, foundH, P.stone);
  speckle(g, 0, H - foundH, W, foundH, P.stoneLo, 0.34, 503);
  hline(g, 0, H - foundH, W, P.outline);
  g.fillStyle = P.shadow;
  g.fillRect(2, H, W - 4, 4);
  return s;
}

/**
 * A dry-laid field wall. Cleared stone, stacked without mortar — the single
 * most characteristic object in the New England landscape, and the physical
 * record of every rock a family pulled out of a field by hand.
 */
export function buildStoneWall() {
  const s = surface(TS, TS + 3);
  const g = s.g;
  rect(g, 0, 12, TS, 3, 'rgba(20,22,26,0.35)');
  // Two courses of irregular stone.
  const stones = [[0, 5, 6, 5], [6, 4, 5, 6], [11, 5, 5, 5],
                  [0, 9, 5, 5], [5, 10, 6, 4], [11, 9, 5, 5]];
  for (const [x, y, w, h] of stones) {
    ellipse(g, x + w / 2, y + h / 2, w / 2 + 0.5, h / 2 + 0.5, P.outline);
    ellipse(g, x + w / 2, y + h / 2, w / 2, h / 2, P.stone);
    ellipse(g, x + w / 2 - 1, y + h / 2 - 1, w / 3, h / 3, P.stoneHi);
  }
  speckle(g, 0, 4, TS, 11, P.stoneLo, 0.14, 511);
  return s;
}

/** A hay rick — cut hay stacked around a pole and thatched over. */
export function buildHayrick() {
  const W = 2 * TS, H = 2 * TS;
  const s = surface(W, H + 3);
  const g = s.g;
  const cx = W / 2;
  ellipse(g, cx, H - 6, 14, 9, P.outline);
  ellipse(g, cx, H - 6, 13, 8, '#8a7647');
  // Conical top.
  for (let i = 0; i < 18; i++) {
    const w = Math.round(13 * (1 - i / 20));
    rect(g, cx - w, H - 12 - i, w * 2, 1, i % 4 === 0 ? '#9c8752' : '#8a7647');
  }
  speckle(g, cx - 13, H - 30, 26, 26, '#6f5f3a', 0.16, 521);
  speckle(g, cx - 13, H - 30, 26, 26, '#a8935c', 0.10, 523);
  vline(g, cx, H - 34, 6, P.bark);                 // the pole
  ellipse(g, cx, H + 1, 13, 3, P.shadow);
  return s;
}

/** A two-wheeled farm cart, tipped down on its shafts. */
export function buildCart() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 3);
  const g = s.g;
  rect(g, 3, 4, W - 8, 7, P.barkHi);
  stroke(g, 3, 4, W - 8, 7, P.outline);
  for (let x = 6; x < W - 6; x += 4) vline(g, x, 5, 5, P.bark);
  // Shafts.
  rect(g, W - 6, 8, 6, 2, P.bark);
  // Wheel.
  ellipse(g, 8, 12, 5, 5, P.outline);
  ellipse(g, 8, 12, 4, 4, P.barkHi);
  ellipse(g, 8, 12, 2, 2, P.bark);
  ellipse(g, W / 2, H + 1, 12, 2, P.shadow);
  return s;
}

/** Apple tree, bare. Orchards were everywhere — mostly for cider, which is
 *  what a New England family actually drank. */
export function buildAppleTree() {
  const W = 2 * TS, H = 3 * TS;
  const s = surface(W, H + 4);
  const g = s.g;
  const cx = W / 2, base = H;
  for (let i = 0; i < 16; i++) {
    const y = base - 1 - i, hw = Math.max(2, 4 - Math.floor(i / 6));
    rect(g, cx - hw, y, hw * 2, 1, P.bark);
    px(g, cx - hw, y, P.outline);
    px(g, cx + hw - 1, y, P.barkHi);
  }
  const fork = base - 16;
  const limbs = [[cx, fork + 2, cx - 11, fork - 11], [cx, fork + 2, cx + 10, fork - 12],
                 [cx, fork, cx - 4, fork - 17], [cx, fork, cx + 5, fork - 16]];
  for (const [x0, y0, x1, y1] of limbs) {
    line(g, x0, y0, x1, y1, P.bark);
    line(g, x0 + 1, y0, x1 + 1, y1, P.barkLo);
    line(g, x1, y1, x1 + (x1 > x0 ? 4 : -4), y1 - 6, P.bark);
  }
  speckle(g, 3, fork - 20, W - 6, 22, P.barkLo, 0.07, 531);
  ellipse(g, cx, base + 1, 9, 3, P.shadow);
  return s;
}

/**
 * The meetinghouse. Salem Village's was a plain rectangular box — no steeple,
 * no tower, galleries inside. Making it merely BIGGER than the houses rather
 * than prettier is the historically honest choice, and it still reads as the
 * centre of town because everything else is small.
 */
export function buildMeetinghouse(wT = 9, hT = 6) {
  // No porch, no steeple, no ornament of any kind. Salem Village's
  // meetinghouse was a plain box roughly 34 by 28 feet, and making it merely
  // larger than the houses rather than prettier is the honest choice. It
  // still reads as the centre of town, because everything else is small.
  return buildHouse(wT, hT, {
    doorCol: Math.floor(wT / 2),
    windows: [1, 3, wT - 4, wT - 2],
    roofFrac: 0.55,
    chimney: null,
  });
}

/* ---------------------------------------------------------------------- *
 * Vegetation
 * ---------------------------------------------------------------------- */

/** Evergreen, 2x3 tiles. Layered boughs, dark outline, light from upper-left. */
export function buildPine() {
  const W = 2 * TS, H = 3 * TS;
  const s = surface(W, H + 4);
  const g = s.g;
  const cx = W / 2;

  // Trunk.
  rect(g, cx - 2, H - 14, 4, 14, P.bark);
  vline(g, cx - 2, H - 14, 14, P.barkLo);
  vline(g, cx + 1, H - 14, 14, P.barkHi);

  // Three bough tiers, widest at the bottom.
  const tiers = [
    { y: H - 16, rx: 15, ry: 8 },
    { y: H - 27, rx: 12, ry: 7 },
    { y: H - 37, rx: 8,  ry: 6 },
  ];
  for (const t of tiers) {
    ellipse(g, cx, t.y, t.rx + 1, t.ry + 1, P.outline);
    ellipse(g, cx, t.y, t.rx, t.ry, P.pine);
    ellipse(g, cx - 2, t.y - 2, Math.round(t.rx * 0.6), Math.round(t.ry * 0.55), P.pineHi);
    ellipse(g, cx + 3, t.y + 2, Math.round(t.rx * 0.5), Math.round(t.ry * 0.4), P.pineLo);
  }
  // Needle texture.
  speckle(g, 2, H - 44, W - 4, 36, P.pineLo, 0.10, 123);
  speckle(g, 2, H - 44, W - 4, 36, P.pineHi, 0.06, 131);
  // Crown tip.
  vline(g, cx, H - 44, 4, P.pineHi);

  g.fillStyle = P.shadow;
  ellipse(g, cx, H + 1, 11, 3, P.shadow);
  return s;
}

/**
 * Bare hardwood, 3x4 tiles. It is early March — nothing has leafed out.
 *
 * A leafless tree has to be built with real mass or it reads as a weed: a
 * thick buttressed trunk, a proper fork, and enough twig density at the
 * crown to suggest a canopy that simply isn't there yet.
 */
export function buildBareTree() {
  const W = 3 * TS, H = 4 * TS;
  const s = surface(W, H + 4);
  const g = s.g;
  const cx = Math.round(W / 2), base = H;

  // Trunk: wide at the root, tapering to the fork.
  const trunkH = 30;
  for (let i = 0; i < trunkH; i++) {
    const y = base - 1 - i;
    const t = i / trunkH;
    const hw = Math.max(2, Math.round(5 - t * 2.5));
    rect(g, cx - hw, y, hw * 2, 1, P.bark);
    px(g, cx - hw, y, P.outline);
    px(g, cx + hw - 1, y, P.barkHi);
    if (i % 4 === 0) px(g, cx - hw + 1, y, P.barkLo);
  }
  // Root buttress.
  for (let i = 0; i < 4; i++) {
    rect(g, cx - 6 - i, base - 4 + i, 3, 1, P.barkLo);
    rect(g, cx + 3 + i, base - 4 + i, 3, 1, P.bark);
  }

  // Primary limbs off the fork, then secondaries off those.
  const fork = base - trunkH;
  const limbs = [
    [cx, fork + 4, cx - 17, fork - 14, 3],
    [cx, fork + 6, cx + 16, fork - 12, 3],
    [cx, fork + 1, cx - 6, fork - 24, 3],
    [cx, fork, cx + 7, fork - 26, 3],
  ];
  for (const [x0, y0, x1, y1, wgt] of limbs) {
    for (let o = 0; o < wgt; o++) {
      line(g, x0 + o - 1, y0, x1 + (o - 1), y1, o === 0 ? P.outline : (o === 1 ? P.bark : P.barkHi));
    }
    // Secondaries.
    const mx = Math.round((x0 + x1) / 2), my = Math.round((y0 + y1) / 2);
    line(g, mx, my, mx + (x1 > x0 ? 9 : -9), my - 11, P.bark);
    line(g, x1, y1, x1 + (x1 > x0 ? 5 : -5), y1 - 9, P.bark);
    line(g, x1, y1, x1 + (x1 > x0 ? -3 : 3), y1 - 10, P.barkLo);
  }

  // Twig haze at the crown — the suggestion of a canopy in outline.
  speckle(g, 4, fork - 30, W - 8, 30, P.barkLo, 0.09, 211);
  speckle(g, 6, fork - 26, W - 12, 24, P.bark, 0.06, 223);

  ellipse(g, cx, base + 1, 13, 3, P.shadow);
  return s;
}

/* ---------------------------------------------------------------------- *
 * Fences, and the objects that carry the argument
 * ---------------------------------------------------------------------- */

/** One tile of post-and-rail fence. */
export function buildFence() {
  const s = surface(TS, TS);
  const g = s.g;
  // Two rails.
  rect(g, 0, 7, TS, 3, P.barkHi);
  hline(g, 0, 7, TS, P.outline);
  hline(g, 0, 9, TS, P.bark);
  rect(g, 0, 12, TS, 3, P.barkHi);
  hline(g, 0, 12, TS, P.outline);
  hline(g, 0, 14, TS, P.bark);
  // Post.
  rect(g, 2, 3, 4, 13, P.bark);
  vline(g, 2, 3, 13, P.outline);
  vline(g, 5, 3, 13, P.barkHi);
  hline(g, 2, 3, 4, P.outline);
  return s;
}

/**
 * The parsonage woodpile.
 *
 * Parris's 1689 contract promised him firewood. The village stopped
 * delivering it. This prop is a clue: it should look CONSPICUOUSLY small
 * against the size of the house it is meant to heat.
 */
export function buildWoodpile() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 3);
  const g = s.g;

  rect(g, 1, 6, W - 2, 10, P.barkLo);
  stroke(g, 1, 6, W - 2, 10, P.outline);
  // Stacked log ends — deliberately only two courses.
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 6; i++) {
      const cxp = 4 + i * 4 + (row ? 2 : 0);
      const cyp = 13 - row * 4;
      if (cxp > W - 4) continue;
      ellipse(g, cxp, cyp, 2, 2, P.bark);
      px(g, cxp, cyp, P.barkHi);
      px(g, cxp - 1, cyp - 1, P.barkHi);
    }
  }
  ellipse(g, W / 2, H + 1, 12, 2, P.shadow);
  return s;
}

/**
 * A boundary marker in the woods, between the Nurse and Putnam land. Small,
 * easy to miss, and the entire faction thesis hangs off it. It is supposed
 * to be underwhelming — that's the lesson.
 */
export function buildMarker() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  rect(g, 5, 3, 6, 12, P.stone);
  speckle(g, 5, 3, 6, 12, P.stoneLo, 0.3, 151);
  speckle(g, 5, 3, 6, 12, P.stoneHi, 0.15, 157);
  stroke(g, 5, 3, 6, 12, P.outline);
  // A weathered notch cut into the face.
  px(g, 7, 7, P.stoneLo); px(g, 8, 7, P.stoneLo); px(g, 8, 8, P.stoneLo);
  ellipse(g, 8, 15, 6, 2, P.shadow);
  return s;
}

/** A field-stone well. */
export function buildWell() {
  const W = 2 * TS, H = 2 * TS;
  const s = surface(W, H + 3);
  const g = s.g;
  ellipse(g, W / 2, H - 8, 13, 8, P.outline);
  ellipse(g, W / 2, H - 8, 12, 7, P.stone);
  speckle(g, W / 2 - 12, H - 15, 24, 14, P.stoneLo, 0.3, 171);
  ellipse(g, W / 2, H - 10, 8, 4, P.ink);
  // Posts and crossbeam.
  rect(g, 7, 6, 3, 18, P.bark); rect(g, W - 10, 6, 3, 18, P.bark);
  rect(g, 5, 3, W - 10, 4, P.barkHi);
  stroke(g, 5, 3, W - 10, 4, P.outline);
  ellipse(g, W / 2, H + 1, 13, 3, P.shadow);
  return s;
}

/**
 * The meetinghouse seating chart, nailed to the wall. Pews assigned by wealth
 * and standing — a literal map of who matters, seen by every person in the
 * village every Sunday. Drawn as an interior wall prop.
 */
export function buildSeatingChart() {
  const W = 2 * TS, H = 2 * TS;
  const s = surface(W, H);
  const g = s.g;
  rect(g, 2, 3, W - 4, H - 10, '#cbbfa6');
  stroke(g, 2, 3, W - 4, H - 10, P.doorLo);
  stroke(g, 1, 2, W - 2, H - 8, P.outline);
  // Ruled rows of names, with the top rows heavier — the good seats.
  for (let i = 0; i < 7; i++) {
    const y = 6 + i * 3;
    const w = i < 2 ? W - 10 : W - 10 - (i % 3) * 3;
    hline(g, 5, y, w, i < 2 ? P.ink : P.boxDim);
  }
  vline(g, W / 2, 5, H - 14, P.doorLo);
  return s;
}

/** Interior hearth — the only real light source in a 1692 house. */
export function buildHearth() {
  const W = 3 * TS, H = 2 * TS;
  const s = surface(W, H);
  const g = s.g;
  rect(g, 0, 0, W, H - 2, P.stoneLo);
  speckle(g, 0, 0, W, H - 2, P.stone, 0.35, 181);
  speckle(g, 0, 0, W, H - 2, P.stoneHi, 0.12, 187);
  stroke(g, 0, 0, W, H - 2, P.outline);
  // Firebox.
  const fx = 10, fw = W - 20, fy = 10, fh = H - 16;
  rect(g, fx, fy, fw, fh, P.ink);
  stroke(g, fx - 1, fy - 1, fw + 2, fh + 2, P.outline);
  // Low fire — they are short of firewood, and that is the point.
  rect(g, fx + 4, fy + fh - 5, fw - 8, 3, '#6b3a22');
  rect(g, fx + 7, fy + fh - 7, fw - 14, 3, '#9c5a2c');
  rect(g, fx + 10, fy + fh - 9, fw - 20, 2, '#c98a3e');
  px(g, fx + Math.floor(fw / 2), fy + fh - 11, '#e0b45e');
  return s;
}

/** A plain trestle table. */
export function buildTable() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 3);
  const g = s.g;
  rect(g, 0, 3, W, 6, P.barkHi);
  hline(g, 0, 3, W, P.outline);
  hline(g, 0, 8, W, P.bark);
  stroke(g, 0, 3, W, 6, P.outline);
  rect(g, 4, 9, 3, 7, P.bark);
  rect(g, W - 7, 9, 3, 7, P.bark);
  ellipse(g, W / 2, H + 1, 13, 2, P.shadow);
  return s;
}

/** A meetinghouse pew — one tile wide, benches face south. */
export function buildPew() {
  const s = surface(TS, TS);
  const g = s.g;
  rect(g, 0, 5, TS, 4, P.barkHi);
  stroke(g, 0, 5, TS, 4, P.outline);
  rect(g, 0, 9, TS, 3, P.bark);
  rect(g, 1, 12, 2, 4, P.barkLo);
  rect(g, TS - 3, 12, 2, 4, P.barkLo);
  return s;
}

/* ---------------------------------------------------------------------- *
 * Present day — the Salem Witch Trials Memorial, Charter Street
 * ---------------------------------------------------------------------- */

/**
 * One memorial bench: a granite slab cantilevered out of the low wall, with
 * a name, a means of execution and a date cut into its edge. There are
 * twenty of them and they are identical, which is the point — the design
 * refuses to rank the dead or make any one of them the interesting one.
 */
export function buildMemBench() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 5);
  const g = s.g;
  // A hard cast shadow first — this is granite sitting on granite, and the
  // shadow is doing most of the work of separating the two.
  rect(g, 2, 12, W - 3, 4, 'rgba(18,20,24,0.5)');
  // Slab, lit from upper-left.
  rect(g, 1, 3, W - 2, 10, P.granite);
  rect(g, 2, 3, W - 4, 4, P.graniteHi);
  rect(g, 1, 11, W - 2, 2, P.graniteDeep);
  stroke(g, 1, 3, W - 2, 10, P.outline);
  speckle(g, 2, 5, W - 4, 6, P.graniteLo, 0.16, 401);
  // The inscribed edge — reads as lettering without being readable.
  for (let x = 5; x < W - 5; x += 3) px(g, x, 9, P.graniteDeep);
  ellipse(g, W / 2, H + 2, 13, 2, P.shadow);
  return s;
}

/** A course of the low granite enclosure wall. */
export function buildLowWall() {
  const s = surface(TS, TS + 4);
  const g = s.g;
  // Cast shadow, so the enclosure reads as a wall you are standing inside
  // rather than a change of paving.
  rect(g, 0, 14, TS, 4, 'rgba(18,20,24,0.42)');
  rect(g, 0, 1, TS, 14, P.granite);
  rect(g, 0, 1, TS, 4, P.graniteHi);       // top face catching the light
  hline(g, 0, 5, TS, P.graniteLo);
  rect(g, 0, 12, TS, 3, P.graniteDeep);    // shaded base course
  speckle(g, 0, 6, TS, 6, P.graniteLo, 0.20, 409);
  speckle(g, 0, 6, TS, 6, P.graniteHi, 0.08, 419);
  hline(g, 0, 1, TS, P.outline);
  hline(g, 0, 15, TS, P.outline);
  vline(g, 0, 1, 15, P.graniteDeep);       // block joint
  return s;
}

/** Black locust, in leaf. The memorial is planted with them. */
export function buildLocust() {
  const W = 3 * TS, H = 4 * TS;
  const s = surface(W, H + 4);
  const g = s.g;
  const cx = Math.round(W / 2), base = H;

  // Trunk.
  for (let i = 0; i < 26; i++) {
    const y = base - 1 - i;
    const hw = Math.max(2, Math.round(4 - (i / 26) * 2));
    rect(g, cx - hw, y, hw * 2, 1, P.bark);
    px(g, cx - hw, y, P.outline);
    px(g, cx + hw - 1, y, P.barkHi);
  }
  // Canopy: three overlapping masses so it doesn't read as one blob.
  const lobes = [
    [cx, base - 40, 20, 13], [cx - 13, base - 32, 13, 9], [cx + 13, base - 33, 13, 9],
    [cx - 5, base - 48, 12, 8], [cx + 7, base - 47, 11, 8],
  ];
  for (const [x, y, rx, ry] of lobes) {
    ellipse(g, x, y, rx + 1, ry + 1, P.outline);
    ellipse(g, x, y, rx, ry, P.leaf);
  }
  for (const [x, y, rx, ry] of lobes) {
    ellipse(g, x - 3, y - 3, Math.round(rx * 0.55), Math.round(ry * 0.5), P.leafHi);
    ellipse(g, x + 4, y + 4, Math.round(rx * 0.4), Math.round(ry * 0.35), P.leafLo);
  }
  speckle(g, 4, base - 58, W - 8, 34, P.leafLo, 0.10, 431);
  speckle(g, 4, base - 58, W - 8, 34, P.leafHi, 0.07, 439);

  ellipse(g, cx, base + 1, 14, 3, P.shadow);
  return s;
}

/** An interpretive sign on two posts — the kind every historic site has. */
export function buildSignboard() {
  const W = 2 * TS, H = 2 * TS;
  const s = surface(W, H + 3);
  const g = s.g;
  rect(g, 6, 16, 3, 14, '#4a4d52');
  rect(g, W - 9, 16, 3, 14, '#4a4d52');
  rect(g, 1, 3, W - 2, 15, '#2f4a52');
  stroke(g, 1, 3, W - 2, 15, P.outline);
  rect(g, 3, 5, W - 6, 11, '#3d616b');
  // Text ruling and a small image block, angled reader-style.
  for (let i = 0; i < 4; i++) hline(g, 5, 7 + i * 2, W - 16, '#9fc0c7');
  rect(g, W - 12, 7, 8, 7, '#8aa9b0');
  ellipse(g, W / 2, H + 1, 11, 2, P.shadow);
  return s;
}

/** A public bin. Small, mundane, and doing a lot of work to say "present". */
export function buildBin() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  rect(g, 3, 4, 10, 12, '#3c4348');
  stroke(g, 3, 4, 10, 12, P.outline);
  rect(g, 2, 2, 12, 3, '#4d565c');
  stroke(g, 2, 2, 12, 3, P.outline);
  vline(g, 5, 6, 9, '#4d565c');
  vline(g, 10, 6, 9, '#4d565c');
  ellipse(g, 8, 16, 7, 2, P.shadow);
  return s;
}

/**
 * A storefront across the street. Salem sells this history — witch hats,
 * fridge magnets, ghost tours — about two hundred feet from the memorial.
 * The game never editorialises about it. It just puts it in frame.
 */
export function buildShopfront(wT = 6, hT = 5) {
  const W = wT * TS, H = hT * TS;
  const s = surface(W, H + 6);
  const g = s.g;
  const foundH = 4;
  const upperH = Math.round(H * 0.44);

  // Upper storey: painted clapboard, sash windows.
  rect(g, 0, 0, W, upperH, '#6d5f5a');
  for (let y = 3; y < upperH; y += 4) { hline(g, 0, y, W, '#5b4f4b'); hline(g, 0, y + 1, W, '#7d6e68'); }
  for (let i = 1; i < wT - 1; i += 2) {
    const wx = i * TS + 3;
    rect(g, wx - 1, 7, 12, 15, '#3a3230');
    rect(g, wx, 8, 10, 13, '#2b3037');
    hline(g, wx, 14, 10, '#8f9aa2');
    vline(g, wx + 5, 8, 13, '#8f9aa2');
    hline(g, wx + 1, 9, 3, P.glassLit);
  }
  hline(g, 0, upperH - 1, W, P.outline);

  // Awning — a hard, saturated stripe that reads modern instantly.
  const ay = upperH;
  for (let x = 0; x < W; x++) {
    rect(g, x, ay, 1, 7, (Math.floor(x / 8) % 2) ? '#8a3b34' : '#d8cfc0');
  }
  hline(g, 0, ay, W, P.outline);
  hline(g, 0, ay + 7, W, P.outline);
  rect(g, 0, ay + 8, W, 2, 'rgba(20,20,24,0.4)');

  // Shopfront glazing: one big plate window and a door.
  const gy = ay + 10, gh = H - foundH - gy;
  rect(g, 0, gy, W, gh, '#3b3330');
  rect(g, 3, gy + 2, W - 22, gh - 4, '#2a3138');
  stroke(g, 3, gy + 2, W - 22, gh - 4, '#8d827a');
  // Reflected sky across the glass, and merchandise silhouettes behind it.
  for (let i = 0; i < 3; i++) rect(g, 6 + i * 5, gy + 4, 2, gh - 8, 'rgba(150,175,195,0.16)');
  for (let i = 0; i < 4; i++) rect(g, 8 + i * 9, gy + gh - 10, 5, 6, 'rgba(220,200,150,0.35)');
  // Door.
  rect(g, W - 17, gy + 2, 13, gh - 4, '#4a4038');
  rect(g, W - 15, gy + 4, 9, gh - 12, '#2a3138');
  stroke(g, W - 17, gy + 2, 13, gh - 4, P.outline);

  // Foundation.
  rect(g, 0, H - foundH, W, foundH, P.graniteLo);
  hline(g, 0, H - foundH, W, P.outline);
  g.fillStyle = P.shadow;
  g.fillRect(2, H, W - 4, 4);
  return s;
}

/* ---------------------------------------------------------------------- *
 * Livestock
 *
 * Not decoration. Free-ranging swine trespassing into a neighbour's field
 * was one of the most common causes of ill-feeling in a New England village,
 * and Rebecca Nurse mentions exactly that quarrel with the Putnams. Putting
 * the pigs on screen makes her line land.
 * ---------------------------------------------------------------------- */

function quadruped(g, x, y, w, h, body, dark, light) {
  ellipse(g, x + w / 2, y + h / 2, w / 2 + 1, h / 2 + 1, P.outline);
  ellipse(g, x + w / 2, y + h / 2, w / 2, h / 2, body);
  ellipse(g, x + w / 2 - 2, y + h / 2 - 2, w / 3, h / 3, light);
  ellipse(g, x + w / 2 + 2, y + h / 2 + 1, w / 4, h / 4, dark);
  // Legs.
  rect(g, x + 2, y + h - 1, 2, 3, dark);
  rect(g, x + w - 4, y + h - 1, 2, 3, dark);
}

export function buildPig() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  quadruped(g, 1, 5, 12, 7, '#9a7d72', '#7a6058', '#b39a8e');
  // Snout and ear.
  rect(g, 0, 8, 3, 3, '#b39a8e');
  px(g, 0, 9, P.outline); px(g, 1, 9, '#7a6058');
  px(g, 4, 5, '#7a6058');
  px(g, 9, 7, P.ink);            // eye
  // Curl of tail.
  px(g, 13, 7, '#7a6058'); px(g, 14, 6, '#7a6058');
  ellipse(g, 7, TS, 6, 2, P.shadow);
  return s;
}

export function buildCow() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 3);
  const g = s.g;
  quadruped(g, 3, 3, 22, 9, '#7b6247', '#5d4936', '#94795b');
  // Belted patch — most New England cattle were red devons and mongrels,
  // so this is a plausible mixed beast rather than a Holstein.
  ellipse(g, 14, 7, 5, 4, '#c9bda6');
  // Head, low, grazing.
  ellipse(g, 2, 10, 4, 3, P.outline);
  ellipse(g, 2, 10, 3, 2, '#5d4936');
  px(g, 1, 9, P.ink);
  // Horns.
  px(g, 2, 7, '#cfc6b0'); px(g, 4, 7, '#cfc6b0');
  // Tail.
  vline(g, 25, 5, 7, '#5d4936');
  ellipse(g, W / 2, H + 1, 12, 2, P.shadow);
  return s;
}

export function buildSheep() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  // Fleece: a lumpy cloud rather than a smooth body.
  for (const [x, y, r] of [[5, 7, 4], [8, 6, 4], [11, 8, 3], [7, 9, 4]]) {
    ellipse(g, x, y, r + 1, r + 1, P.outline);
    ellipse(g, x, y, r, r, '#cfc9bb');
  }
  for (const [x, y, r] of [[5, 6, 2], [9, 5, 2]]) ellipse(g, x, y, r, r, '#e6e1d4');
  ellipse(g, 2, 9, 3, 2, P.outline);
  ellipse(g, 2, 9, 2, 2, '#4a4540');       // dark face
  px(g, 1, 9, P.ink);
  rect(g, 5, 12, 2, 3, '#4a4540');
  rect(g, 10, 12, 2, 3, '#4a4540');
  ellipse(g, 8, TS, 6, 2, P.shadow);
  return s;
}

export function buildChicken() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  ellipse(g, 8, 10, 5, 4, P.outline);
  ellipse(g, 8, 10, 4, 3, '#b8a48c');
  ellipse(g, 7, 9, 2, 2, '#d3c3ad');
  ellipse(g, 5, 6, 3, 3, P.outline);
  ellipse(g, 5, 6, 2, 2, '#b8a48c');
  px(g, 4, 6, P.ink);
  px(g, 3, 7, '#c98a3e');                  // beak
  px(g, 5, 3, '#8f3d2b'); px(g, 6, 4, '#8f3d2b');   // comb
  rect(g, 7, 13, 1, 2, '#c98a3e');
  rect(g, 9, 13, 1, 2, '#c98a3e');
  ellipse(g, 8, TS, 4, 1, P.shadow);
  return s;
}

/** Iron bars. The Salem jail was a cellar with a grate. */
export function buildBars() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  rect(g, 0, 0, TS, 3, '#3a3d42');
  hline(g, 0, 0, TS, P.outline);
  for (let x = 1; x < TS; x += 4) {
    rect(g, x, 2, 2, TS - 2, '#4c5057');
    vline(g, x, 2, TS - 2, P.outline);
    px(g, x + 1, 5, '#6d727a');
  }
  rect(g, 0, TS - 4, TS, 3, '#3a3d42');
  hline(g, 0, TS - 2, TS, P.outline);
  return s;
}

/**
 * A loose sheet of paper — where a document can be copied from.
 *
 * Drawn to sit UP off the surface it is on, with a hard drop shadow and a
 * lifted corner, because the first version was a flat pale rectangle that
 * disappeared into the table it was lying on and players could not find the
 * documents at all.
 */
export function buildPaper() {
  const s = surface(TS, TS + 4);
  const g = s.g;
  // Shadow first: this is what separates the sheet from the table top.
  rect(g, 2, 12, 13, 3, 'rgba(18,16,14,0.45)');
  // Two sheets, slightly offset, so it reads as a small pile.
  rect(g, 1, 3, 13, 10, '#b9ad92');
  rect(g, 2, 2, 13, 10, '#efe6cf');
  stroke(g, 2, 2, 13, 10, '#6b6250');
  // Ruled writing.
  for (let i = 0; i < 4; i++) hline(g, 4, 4 + i * 2, 9 - (i % 2) * 3, '#8d8571');
  // A wax seal / signature blot, and a turned-up corner.
  px(g, 12, 9, '#8f3d2b'); px(g, 13, 9, '#8f3d2b'); px(g, 12, 10, '#8f3d2b');
  rect(g, 12, 2, 3, 3, '#d6cbb0');
  line(g, 12, 5, 15, 2, '#6b6250');
  return s;
}

/** An archive box on a shelf. Present day. */
export function buildArchiveBox() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  rect(g, 1, 4, 14, 11, '#8a8272');
  stroke(g, 1, 4, 14, 11, P.outline);
  rect(g, 1, 4, 14, 3, '#9e9686');
  rect(g, 4, 9, 8, 4, '#d8d2c2');
  stroke(g, 4, 9, 8, 4, '#6f6857');
  return s;
}

/**
 * A bookshelf, two tiles wide and three tall.
 *
 * The reading room was twelve one-tile boxes along a wall, which reads as
 * storage rather than as a library. Height is what makes a room feel like
 * one — a shelf you cannot see over, with spines on it.
 */
export function buildBookshelf(wT = 2, hT = 3) {
  const W = wT * TS, H = hT * TS;
  const s = surface(W, H + 3);
  const g = s.g;

  // Carcass.
  rect(g, 0, 2, W, H - 2, '#4a3f33');
  stroke(g, 0, 2, W, H - 2, P.outline);
  rect(g, 1, 3, W - 2, H - 4, '#5c4e3f');

  // Shelves, and the books on them. Spines are varied by hash so no two
  // shelves repeat, and stable so the room does not shimmer.
  const SPINE = ['#7a3f33', '#4d5b6b', '#6b6042', '#3f5545', '#6d4a5c', '#8a7350', '#40474f'];
  const shelves = hT * 2 - 1;
  for (let r = 0; r < shelves; r++) {
    const y = 4 + r * Math.floor((H - 8) / shelves);
    const hgt = Math.floor((H - 8) / shelves) - 2;
    if (hgt < 5) continue;
    rect(g, 2, y + hgt, W - 4, 2, '#3a3128');       // the shelf board
    let x = 3;
    while (x < W - 4) {
      const t = hash(x, r, 811);
      if (t < 0.10) { x += 2; continue; }            // a gap where one is out
      const bw = 2 + Math.floor(hash(x, r, 823) * 2);
      const bh = hgt - Math.floor(hash(x, r, 829) * 3);
      const col = SPINE[Math.floor(hash(x, r, 839) * SPINE.length)];
      rect(g, x, y + hgt - bh, bw, bh, col);
      // A lighter band along the spine, which is what makes it read as a book.
      hline(g, x, y + hgt - bh + 1, bw, 'rgba(255,255,255,0.13)');
      px(g, x, y + hgt - 1, 'rgba(0,0,0,0.35)');
      x += bw + 1;
    }
  }
  rect(g, 0, H - 3, W, 3, '#3a3128');
  hline(g, 0, H - 3, W, P.outline);
  g.fillStyle = P.shadow;
  g.fillRect(2, H, W - 4, 3);
  return s;
}

/** A green-shaded reading lamp. The visual shorthand for an archive. */
export function buildReadingLamp() {
  const s = surface(TS, TS + 2);
  const g = s.g;
  rect(g, 6, 12, 5, 2, '#2f3238');            // base
  rect(g, 7, 6, 2, 7, '#5a5f66');             // stem
  rect(g, 3, 3, 11, 4, '#2f6b48');            // shade
  hline(g, 3, 3, 11, '#3f8a5e');
  hline(g, 3, 6, 11, '#1e4a31');
  stroke(g, 3, 3, 11, 4, P.outline);
  rect(g, 5, 7, 7, 1, 'rgba(255,236,170,0.55)');   // the light it throws
  rect(g, 6, 8, 5, 1, 'rgba(255,236,170,0.25)');
  return s;
}

/**
 * A writing desk with a sloped top and paper on it.
 *
 * Built for one room in particular: Thomas Putnam wrote his daughter's
 * depositions, which is one of the six things the player can find sources
 * disagreeing about. Standing at the desk where that happened is worth more
 * than another line of dialogue saying so.
 */
export function buildDesk() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 4);
  const g = s.g;
  rect(g, 0, 1, W, 8, P.barkHi);              // sloped top
  hline(g, 0, 1, W, P.outline);
  for (let i = 2; i < 8; i++) hline(g, 0, i, W, i % 2 ? P.bark : P.barkHi);
  stroke(g, 0, 1, W, 8, P.outline);
  rect(g, 4, 3, 12, 5, '#e6dfc9');            // a sheet, mid-sentence
  stroke(g, 4, 3, 12, 5, '#7a7460');
  for (let i = 0; i < 3; i++) hline(g, 6, 4 + i * 2, 8 - i * 2, '#8d8571');
  px(g, 22, 4, '#2b2b30'); px(g, 23, 3, '#2b2b30');   // the inkwell
  rect(g, 21, 5, 4, 3, '#3a3a40');
  stroke(g, 21, 5, 4, 3, P.outline);
  rect(g, 3, 9, 3, 7, P.bark);
  rect(g, W - 6, 9, 3, 7, P.bark);
  ellipse(g, W / 2, H + 2, 13, 2, P.shadow);
  return s;
}

/** A bed. Two tiles, low, with the covers turned back. */
export function buildBed() {
  const W = 2 * TS, H = 2 * TS;
  const s = surface(W, H + 3);
  const g = s.g;
  rect(g, 1, 4, W - 2, H - 6, '#4a3c30');
  stroke(g, 1, 4, W - 2, H - 6, P.outline);
  rect(g, 2, 6, W - 4, H - 11, '#b0a894');    // the tick
  speckle(g, 2, 6, W - 4, H - 11, '#9a927e', 0.10, 907);
  rect(g, 2, H - 12, W - 4, 6, '#7a4750');    // a murrey coverlet, turned back
  hline(g, 2, H - 12, W - 4, '#8f5760');
  rect(g, 4, 6, 9, 4, '#cfc8b6');             // the bolster
  stroke(g, 4, 6, 9, 4, '#98917f');
  rect(g, 1, H - 6, 3, 5, '#3a2f26');         // posts
  rect(g, W - 4, H - 6, 3, 5, '#3a2f26');
  g.fillStyle = P.shadow;
  g.fillRect(3, H, W - 6, 3);
  return s;
}

/** A spinning wheel. One of the few objects in a house that was a woman's
 *  own property and her own trade. */
export function buildWheel() {
  const s = surface(TS, TS + 4);
  const g = s.g;
  ellipse(g, 6, 7, 6, 6, P.barkHi);
  ellipse(g, 6, 7, 4.5, 4.5, '#6b5d4a');
  ellipse(g, 6, 7, 1.5, 1.5, P.bark);
  for (let a = 0; a < 6; a++) {
    const t = (a / 6) * Math.PI * 2;
    line(g, 6, 7, 6 + Math.round(Math.cos(t) * 5), 7 + Math.round(Math.sin(t) * 5), P.bark);
  }
  rect(g, 11, 4, 2, 12, P.bark);              // the post
  rect(g, 3, 14, 10, 2, P.barkHi);            // the treadle bar
  hline(g, 3, 14, 10, P.outline);
  g.fillStyle = P.shadow;
  g.fillRect(3, TS + 1, 10, 2);
  return s;
}

/** A dresser with pewter on it — the thing the sheriff came for. */
export function buildDresser() {
  const W = 2 * TS, H = TS;
  const s = surface(W, H + 3);
  const g = s.g;
  rect(g, 0, 5, W, 11, P.bark);
  stroke(g, 0, 5, W, 11, P.outline);
  rect(g, 1, 6, W - 2, 4, P.barkHi);
  hline(g, 0, 10, W, P.outline);
  // Pewter: three plates on edge and a tankard, which is exactly what the
  // seizure inventory lists.
  for (let i = 0; i < 3; i++) {
    const x = 4 + i * 7;
    ellipse(g, x + 2, 3, 3, 3, '#9aa0a6');
    ellipse(g, x + 2, 3, 2, 2, '#b6bcc2');
    px(g, x + 1, 2, '#d6dade');
  }
  rect(g, 25, 1, 4, 5, '#9aa0a6');
  stroke(g, 25, 1, 4, 5, '#6e747a');
  ellipse(g, W / 2, H + 1, 13, 2, P.shadow);
  return s;
}

/** Straw on a stone floor. */
/**
 * A small pale stone, left on the edge of a bench.
 *
 * Leaving a stone on a grave is a real practice and a real one at this
 * memorial — visitors do it, and the stones are cleared and reappear. It is
 * the right object because it says "somebody was here and knew who this was"
 * without saying anything else, which is exactly what the player has done.
 *
 * Deliberately tiny. Twenty benches with a bright marker on them would read
 * as collectibles; a few pebbles read as a place people visit.
 */
export function buildMemStone() {
  const s = surface(TS, TS);
  const g = s.g;
  // Sits on the near edge of the slab, right of centre so a row of them
  // along the wall does not look stamped on.
  rect(g, 6, 7, 3, 1, '#d8d2c4');
  rect(g, 5, 8, 5, 1, '#c6bfb0');
  rect(g, 5, 9, 5, 1, '#a9a294');
  rect(g, 6, 10, 3, 1, '#8b8578');
  // A second, smaller one, because people leave more than one.
  rect(g, 11, 9, 3, 1, '#c6bfb0');
  rect(g, 11, 10, 3, 1, '#9a9486');
  return s;
}

export function buildStraw() {
  const s = surface(TS, TS);
  const g = s.g;
  for (let i = 0; i < 14; i++) {
    const x = 1 + Math.floor(hash(i, 3, 601) * 13);
    const y = 3 + Math.floor(hash(i, 7, 607) * 11);
    const len = 2 + Math.floor(hash(i, 11, 613) * 3);
    rect(g, x, y, len, 1, i % 3 ? '#8a7647' : '#6f5f3a');
  }
  return s;
}

/** Ingersoll's account book, open on the tavern table. Debt as a map of
 *  resentment — who owes whom, in one object. */
export function buildAccountBook() {
  const s = surface(TS, TS);
  const g = s.g;
  rect(g, 1, 5, 14, 9, '#d8cfb6');
  stroke(g, 1, 5, 14, 9, P.outline);
  vline(g, 8, 5, 9, P.boxDim);
  for (let i = 0; i < 4; i++) {
    hline(g, 3, 7 + i * 2, 4, P.boxDim);
    hline(g, 10, 7 + i * 2, 4, P.boxDim);
  }
  return s;
}
