// Maps, collision, and rendering.
//
// A map is authored as ASCII ground plus a list of props. Ground handles
// terrain; anything with height — houses, trees, the woodpile — is a prop
// with a tile footprint and a baseline. Props and actors are sorted by that
// baseline every frame, so the player walks BEHIND a house's roof and IN
// FRONT of its doorstone. Without that sort the oblique projection falls
// apart instantly and the whole village reads as a flat diagram.

import { TS, buildGroundTiles, variantFor, EDGE_BITS } from './art-ground.js';
import {
  buildHouse, buildMeetinghouse, buildPine, buildBareTree, buildFence,
  buildWoodpile, buildMarker, buildWell, buildSeatingChart, buildHearth,
  buildTable, buildPew, buildAccountBook,
} from './art-props.js';
import { SPR_W, SPR_H, DIR } from './art-actors.js';
import { P } from '../palette.js';

export const VIEW_W = 320, VIEW_H = 240;

/* ---------------------------------------------------------------------- *
 * Terrain
 * ---------------------------------------------------------------------- */

export const GROUND = {
  '.': 'grass',
  ',': 'grass',
  '-': 'mud',
  '*': 'snow',
  '~': 'water',
  'f': 'floor',
  '#': 'wall',
  'H': 'hearthstone',
  'x': 'void',
};

const SOLID_GROUND = new Set(['water', 'void', 'wall']);

/* ---------------------------------------------------------------------- *
 * Prop catalogue
 *
 * `w`/`h` are the tile footprint. `solidRows` limits collision to the
 * bottom N rows so the player can walk behind a tree canopy — the standard
 * trick, and the reason trees feel like scenery rather than walls.
 * ---------------------------------------------------------------------- */

export const PROPS = {
  house:        { w: 6, h: 5, build: (o) => buildHouse(o.w || 6, o.h || 5, o), sized: true },
  meetinghouse: { w: 9, h: 6, build: (o) => buildMeetinghouse(o.w || 9, o.h || 6), sized: true },
  pine:         { w: 2, h: 3, build: () => buildPine(), solidRows: 1 },
  baretree:     { w: 3, h: 4, build: () => buildBareTree(), solidRows: 1 },
  fence:        { w: 1, h: 1, build: () => buildFence() },
  woodpile:     { w: 2, h: 1, build: () => buildWoodpile() },
  marker:       { w: 1, h: 1, build: () => buildMarker() },
  well:         { w: 2, h: 2, build: () => buildWell() },
  seatingchart: { w: 2, h: 2, build: () => buildSeatingChart(), solidRows: 2 },
  hearth:       { w: 3, h: 2, build: () => buildHearth() },
  table:        { w: 2, h: 1, build: () => buildTable() },
  pew:          { w: 1, h: 1, build: () => buildPew() },
  accountbook:  { w: 1, h: 1, build: () => buildAccountBook(), passable: true },
};

let TILES = null;
const PROP_CACHE = new Map();

export function initArt() {
  if (!TILES) TILES = buildGroundTiles();
}

function propImage(prop) {
  const def = PROPS[prop.kind];
  // Sized props (houses) need one image per distinct configuration.
  const key = def.sized
    ? `${prop.kind}:${prop.w}x${prop.h}:${prop.doorCol}:${(prop.windows || []).join(',')}:${prop.chimney}`
    : prop.kind;
  let img = PROP_CACHE.get(key);
  if (!img) { img = def.build(prop); PROP_CACHE.set(key, img); }
  return img;
}

/* ---------------------------------------------------------------------- *
 * Map construction
 * ---------------------------------------------------------------------- */

export function buildMap(def) {
  const rows = def.ground;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));

  // Validate up front — a ragged ASCII map is the single easiest mistake to
  // make when hand-authoring one of these, and silently padding it produces
  // collision bugs that are miserable to track down later.
  rows.forEach((r, i) => {
    if (r.length !== w) {
      console.warn(`[map:${def.id}] row ${i} is ${r.length} wide, expected ${w}`);
    }
  });

  const terrain = new Array(w * h);
  const solid = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x] || 'x';
      const t = GROUND[ch] || 'grass';
      terrain[y * w + x] = t;
      if (SOLID_GROUND.has(t)) solid[y * w + x] = 1;
    }
  }

  const props = (def.props || []).map((p) => {
    const d = PROPS[p.kind];
    if (!d) throw new Error(`unknown prop kind: ${p.kind}`);
    const inst = {
      ...p,
      w: p.w || d.w,
      h: p.h || d.h,
      doorCol: p.doorCol !== undefined ? p.doorCol : Math.floor((p.w || d.w) / 2),
    };
    if (!d.passable) {
      const rowsSolid = d.solidRows || inst.h;
      const y0 = inst.y + inst.h - rowsSolid;
      for (let y = y0; y < inst.y + inst.h; y++) {
        for (let x = inst.x; x < inst.x + inst.w; x++) {
          if (x < 0 || y < 0 || x >= w || y >= h) continue;
          solid[y * w + x] = 1;
        }
      }
    }
    return inst;
  });

  // Warps punch a hole back through whatever solid the door sits in.
  const warps = new Map();
  for (const wp of def.warps || []) {
    warps.set(`${wp.x},${wp.y}`, wp);
    if (wp.x >= 0 && wp.y >= 0 && wp.x < w && wp.y < h) solid[wp.y * w + wp.x] = 0;
  }

  // Examinable tiles.
  const interact = new Map();
  for (const it of def.interact || []) {
    const iw = it.w || 1, ih = it.h || 1;
    for (let y = it.y; y < it.y + ih; y++) {
      for (let x = it.x; x < it.x + iw; x++) interact.set(`${x},${y}`, it);
    }
  }

  // Tiles that fire once when stepped on, without the player pressing
  // anything. Used sparingly — the road to Salem Town is worth one, because
  // the point of that walk is the walk itself.
  const triggers = new Map();
  for (const t of def.triggers || []) {
    const tw = t.w || 1, th = t.h || 1;
    for (let y = t.y; y < t.y + th; y++) {
      for (let x = t.x; x < t.x + tw; x++) triggers.set(`${x},${y}`, t);
    }
  }

  return {
    id: def.id, name: def.name, indoor: !!def.indoor,
    w, h, terrain, solid, props, warps, interact, triggers,
    npcs: [], def,
  };
}

/* ---------------------------------------------------------------------- *
 * Queries
 * ---------------------------------------------------------------------- */

export function terrainAt(map, x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return 'void';
  return map.terrain[y * map.w + x];
}

export function isSolid(map, x, y, actors = []) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
  if (map.solid[y * map.w + x]) return true;
  for (const a of actors) {
    if (a.tx === x && a.ty === y) return true;
  }
  return false;
}

export function warpAt(map, x, y) { return map.warps.get(`${x},${y}`) || null; }
export function interactAt(map, x, y) { return map.interact.get(`${x},${y}`) || null; }
export function triggerAt(map, x, y) { return map.triggers.get(`${x},${y}`) || null; }

export const DIR_VEC = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};
export const DIR_INDEX = {
  up: DIR.UP, down: DIR.DOWN, left: DIR.LEFT, right: DIR.RIGHT,
};

/* ---------------------------------------------------------------------- *
 * Rendering
 * ---------------------------------------------------------------------- */

/** Edge mask for a ground tile: which neighbours are a different terrain. */
function edgeMask(map, x, y, t) {
  let m = 0;
  if (terrainAt(map, x, y - 1) !== t) m |= EDGE_BITS.N;
  if (terrainAt(map, x + 1, y) !== t) m |= EDGE_BITS.E;
  if (terrainAt(map, x, y + 1) !== t) m |= EDGE_BITS.S;
  if (terrainAt(map, x - 1, y) !== t) m |= EDGE_BITS.W;
  return m;
}

/** Interiors render at 2x so a small room reads as a small room rather than
 *  as a postage stamp floating in a black viewport. These houses genuinely
 *  were cramped, and the camera should be inside that rather than above it. */
export function zoomFor(map) { return map.indoor ? 2 : 1; }

export function computeCamera(map, focusPx, focusPy) {
  const z = zoomFor(map);
  const vw = VIEW_W / z, vh = VIEW_H / z;
  const mapPxW = map.w * TS, mapPxH = map.h * TS;
  let cx = Math.round(focusPx + TS / 2 - vw / 2);
  let cy = Math.round(focusPy + TS / 2 - vh / 2);
  // Clamp, unless the map is smaller than the viewport — then centre it.
  cx = mapPxW <= vw ? Math.round((mapPxW - vw) / 2) : Math.max(0, Math.min(cx, mapPxW - vw));
  cy = mapPxH <= vh ? Math.round((mapPxH - vh) / 2) : Math.max(0, Math.min(cy, mapPxH - vh));
  return { x: cx, y: cy };
}

export function renderMap(g, map, cam, actors) {
  initArt();

  const z = zoomFor(map);
  const VW = VIEW_W / z, VH = VIEW_H / z;

  // --- ground ---------------------------------------------------------
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = map.indoor ? '#0d0e11' : '#20232a';
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  if (z !== 1) g.setTransform(z, 0, 0, z, 0, 0);

  const x0 = Math.max(0, Math.floor(cam.x / TS));
  const y0 = Math.max(0, Math.floor(cam.y / TS));
  const x1 = Math.min(map.w - 1, Math.ceil((cam.x + VW) / TS));
  const y1 = Math.min(map.h - 1, Math.ceil((cam.y + VH) / TS));

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const t = terrainAt(map, x, y);
      if (t === 'void') continue;
      const set = TILES[t];
      if (!set) continue;
      const mask = edgeMask(map, x, y, t);
      const img = set[mask][variantFor(x, y)];
      g.drawImage(img.canvas, x * TS - cam.x, y * TS - cam.y);
    }
  }

  // --- props + actors, sorted by baseline ------------------------------
  const draws = [];

  for (const p of map.props) {
    const img = propImage(p);
    const dx = p.x * TS - cam.x;
    const dy = (p.y + p.h) * TS - img.h - cam.y + (PROPS[p.kind].sized ? 6 : 0);
    // Cull generously — props can be tall.
    if (dx > VW || dx + img.w < 0 || dy > VH || dy + img.h < 0) continue;
    draws.push({ img: img.canvas, dx, dy, base: (p.y + p.h) * TS });
  }

  for (const a of actors) {
    if (!a.frames) continue;
    const frame = a.frames[a.dirIndex][a.animFrame];
    const dx = Math.round(a.px) - cam.x;
    const dy = Math.round(a.py) - (SPR_H - TS) - cam.y;
    if (dx > VW || dx + SPR_W < 0 || dy > VH || dy + SPR_H < 0) continue;
    draws.push({ img: frame.canvas, dx, dy, base: Math.round(a.py) + TS });
  }

  draws.sort((m, n) => m.base - n.base);
  for (const d of draws) g.drawImage(d.img, d.dx, d.dy);

  // --- indoor vignette --------------------------------------------------
  // Glass was expensive and windows were tiny; these rooms were genuinely
  // dark. Cheap way to make the hearth feel like it is doing real work.
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (map.indoor) {
    const grd = g.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.34,
                                       VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.92);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(8,8,12,0.5)');
    g.fillStyle = grd;
    g.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
