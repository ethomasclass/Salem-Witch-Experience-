// Ground tiles.
//
// 16x16, built once at boot. Each terrain type is generated in 16 edge
// variants (a bitmask of which of N/E/S/W border a *different* terrain) so
// paths and snow get proper rims instead of hard checkerboard seams. That
// rim is most of what makes a GBA-era map read as hand-drawn.

import { surface, rect, px, hline, vline, speckle, hash, dither } from './pixels.js';
import { P } from '../palette.js';

export const TS = 16; // tile size

const N = 1, E = 2, S = 4, W = 8;

/* ---------------------------------------------------------------------- *
 * Terrain painters. Each fills a 16x16 surface, edge-unaware; the rim pass
 * runs afterwards so every type gets consistent border treatment.
 * ---------------------------------------------------------------------- */

function paintGrass(g, v) {
  // Dead late-winter grass: dun, not green. Broken up with darker tufts and
  // a few bleached highlights so large fields don't band.
  rect(g, 0, 0, TS, TS, P.grass);
  speckle(g, 0, 0, TS, TS, P.grassLo, 0.12, 11 + v * 7);
  speckle(g, 0, 0, TS, TS, P.grassHi, 0.06, 31 + v * 13);

  // A couple of grass blades, placed by hash so they're stable per variant.
  for (let i = 0; i < 3; i++) {
    const bx = 2 + Math.floor(hash(i, v, 5) * 12);
    const by = 3 + Math.floor(hash(i, v, 9) * 10);
    vline(g, bx, by, 2, P.grassDeep);
    px(g, bx + 1, by + 1, P.grassDeep);
  }
}

function paintMud(g, v) {
  // The village had no paved street. This is churned, half-frozen mud.
  rect(g, 0, 0, TS, TS, P.mud);
  speckle(g, 0, 0, TS, TS, P.mudLo, 0.20, 3 + v * 5);
  speckle(g, 0, 0, TS, TS, P.mudHi, 0.10, 17 + v * 11);

  // Cart ruts: two faint parallel grooves, offset per variant.
  const r = v & 1 ? 4 : 5;
  for (let y = 0; y < TS; y++) {
    if ((y + v) % 3 === 0) continue;
    px(g, r, y, P.mudDeep);
    px(g, r + 6, y, P.mudDeep);
  }
}

function paintSnow(g, v) {
  // Old snow, not fresh — grey where it has thawed and refrozen.
  rect(g, 0, 0, TS, TS, P.snow);
  speckle(g, 0, 0, TS, TS, P.snowHi, 0.16, 7 + v * 3);
  speckle(g, 0, 0, TS, TS, P.snowLo, 0.12, 23 + v * 9);
  // Grass poking through where it has worn thin.
  for (let i = 0; i < 2; i++) {
    const bx = 3 + Math.floor(hash(i, v, 41) * 10);
    const by = 4 + Math.floor(hash(i, v, 47) * 8);
    px(g, bx, by, P.grassLo);
    px(g, bx, by + 1, P.grassLo);
  }
}

function paintWater(g, v) {
  rect(g, 0, 0, TS, TS, P.water);
  speckle(g, 0, 0, TS, TS, P.waterLo, 0.14, 13 + v * 6);
  // Two horizontal ripple strokes.
  const y0 = 3 + v * 2, y1 = 10 + ((v * 3) % 4);
  hline(g, 2, y0, 6, P.waterHi);
  hline(g, 9, y1, 5, P.waterHi);
}

function paintFloor(g, v) {
  // Wide riven floorboards laid east-west. Deliberately darker and running
  // the opposite direction to the wall sheathing — otherwise a room is one
  // undifferentiated brown texture and the space stops reading.
  rect(g, 0, 0, TS, TS, P.floorMid);
  speckle(g, 0, 0, TS, TS, P.floorLo, 0.10, 19 + v * 4);
  for (let y = 0; y < TS; y += 5) {
    hline(g, 0, y, TS, P.floorSeam);
    hline(g, 0, y + 1, TS, P.floorHi);
  }
  // Board-end joints, staggered per variant so the floor doesn't grid up.
  const joint = (v & 1) ? 4 : 11;
  vline(g, joint, 0, TS, P.floorSeam);
}

/* ---- present day ------------------------------------------------------ */

function paintLawn(g, v) {
  // Mown, watered, municipal. The deliberate opposite of the 1692 grass:
  // green, even, and obviously looked after by somebody with a budget.
  rect(g, 0, 0, TS, TS, P.lawn);
  speckle(g, 0, 0, TS, TS, P.lawnLo, 0.14, 61 + v * 5);
  speckle(g, 0, 0, TS, TS, P.lawnHi, 0.10, 73 + v * 9);
  // Mower stripes, alternating by tile column so the lawn reads as tended.
  if (v & 1) {
    for (let y = 0; y < TS; y++) if ((y & 3) === 0) hline(g, 0, y, TS, P.lawnHi);
  }
}

function paintPaving(g, v) {
  // Granite pavers. Big slabs, tight joints.
  rect(g, 0, 0, TS, TS, P.granite);
  speckle(g, 0, 0, TS, TS, P.graniteLo, 0.16, 83 + v * 4);
  speckle(g, 0, 0, TS, TS, P.graniteHi, 0.10, 89 + v * 7);
  // Joints, staggered per variant so it reads as coursed rather than tiled.
  hline(g, 0, 0, TS, P.graniteDeep);
  const j = (v & 1) ? 0 : 8;
  vline(g, j, 0, TS, P.graniteDeep);
  hline(g, 0, 8, TS, P.graniteDeep);
  vline(g, (j + 8) % TS, 8, 8, P.graniteDeep);
}

function paintBrick(g, v) {
  // Running bond, four courses to a tile, staggered by variant.
  rect(g, 0, 0, TS, TS, P.mortar);
  const off = (v & 1) ? 4 : 0;
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    const stagger = ((row & 1) ? 4 : 0) + off;
    for (let x = -8; x < TS; x += 8) {
      const bx = x + stagger;
      rect(g, bx, y, 7, 3, P.brick);
      hline(g, bx, y, 7, P.brickHi);
      px(g, bx + 6, y + 2, P.brickLo);
    }
  }
  speckle(g, 0, 0, TS, TS, P.brickLo, 0.08, 107 + v * 5);
}

function paintAsphalt(g, v) {
  rect(g, 0, 0, TS, TS, P.asphalt);
  speckle(g, 0, 0, TS, TS, P.asphaltLo, 0.22, 97 + v * 3);
  speckle(g, 0, 0, TS, TS, P.asphaltHi, 0.12, 101 + v * 6);
}

function paintWall(g, v) {
  // Interior wall: riven vertical sheathing boards, no plaster and no paint.
  // Most village houses were unfinished inside; the boards were the wall.
  rect(g, 0, 0, TS, TS, P.wallLo);
  for (let x = 0; x < TS; x += 5) {
    vline(g, x, 0, TS, P.wallDeep);
    vline(g, x + 1, 0, TS, P.wall);
    vline(g, x + 2, 0, TS, P.wallHi);
  }
  speckle(g, 0, 0, TS, TS, P.wallDeep, 0.06, 43 + v * 6);
  // Knots, placed by hash so a long wall doesn't visibly repeat.
  if (v & 1) { px(g, 4 + v, 6, P.wallDeep); px(g, 4 + v, 7, P.wallDeep); }
}

function paintHearthstone(g, v) {
  rect(g, 0, 0, TS, TS, P.stoneLo);
  speckle(g, 0, 0, TS, TS, P.stone, 0.30, 29 + v * 8);
  speckle(g, 0, 0, TS, TS, P.stoneHi, 0.08, 37 + v * 8);
}

const PAINTERS = {
  grass: paintGrass,
  mud: paintMud,
  snow: paintSnow,
  water: paintWater,
  floor: paintFloor,
  wall: paintWall,
  hearthstone: paintHearthstone,
  lawn: paintLawn,
  paving: paintPaving,
  brick: paintBrick,
  asphalt: paintAsphalt,
};

/* ---------------------------------------------------------------------- *
 * Rim pass
 * ---------------------------------------------------------------------- */

// What colour a terrain uses for its own outer rim, and whether it gets a
// soft inner highlight just inside that rim.
const RIM = {
  grass: null,                                   // grass is the base; no rim
  mud:   { edge: P.mudDeep, inner: P.mudLo },
  snow:  { edge: P.snowLo,  inner: P.snowHi },
  water: { edge: P.waterLo, inner: null },
  floor: { edge: P.floorSeam, inner: null },
  wall:  { edge: P.outline, inner: null },
  hearthstone: { edge: P.stoneLo, inner: null },
  lawn:  { edge: P.lawnDeep, inner: P.lawnLo },
  paving:{ edge: P.graniteDeep, inner: null },
  brick: { edge: P.brickLo, inner: null },
  asphalt:{ edge: P.asphaltLo, inner: null },
};

function applyRim(g, type, mask) {
  const r = RIM[type];
  if (!r || !mask) return;
  if (mask & N) { hline(g, 0, 0, TS, r.edge); if (r.inner) hline(g, 0, 1, TS, r.inner); }
  if (mask & S) { hline(g, 0, TS - 1, TS, r.edge); if (r.inner) hline(g, 0, TS - 2, TS, r.inner); }
  if (mask & W) { vline(g, 0, 0, TS, r.edge); if (r.inner) vline(g, 1, 0, TS, r.inner); }
  if (mask & E) { vline(g, TS - 1, 0, TS, r.edge); if (r.inner) vline(g, TS - 2, 0, TS, r.inner); }

  // Knock the corner pixel out on outside corners so rims read as rounded
  // rather than as a hard box.
  if ((mask & N) && (mask & W)) px(g, 0, 0, r.edge);
  if ((mask & N) && (mask & E)) px(g, TS - 1, 0, r.edge);
  if ((mask & S) && (mask & W)) px(g, 0, TS - 1, r.edge);
  if ((mask & S) && (mask & E)) px(g, TS - 1, TS - 1, r.edge);
}

/* ---------------------------------------------------------------------- *
 * Build
 * ---------------------------------------------------------------------- */

const VARIANTS = 4;

/** tiles[type][mask][variant] -> surface */
export function buildGroundTiles() {
  const out = {};
  for (const type of Object.keys(PAINTERS)) {
    out[type] = [];
    for (let mask = 0; mask < 16; mask++) {
      const vs = [];
      for (let v = 0; v < VARIANTS; v++) {
        const s = surface(TS, TS);
        PAINTERS[type](s.g, v);
        applyRim(s.g, type, mask);
        vs.push(s);
      }
      out[type].push(vs);
    }
  }
  return out;
}

/** Pick a stable variant index for a map cell. */
export function variantFor(x, y) {
  return Math.floor(hash(x, y, 101) * VARIANTS) % VARIANTS;
}

export const EDGE_BITS = { N, E, S, W };
