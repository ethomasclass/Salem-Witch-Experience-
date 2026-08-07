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

  // --- ground shadow ----------------------------------------------------
  g.fillStyle = P.shadow;
  g.fillRect(2, H, W - 4, 4);

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
