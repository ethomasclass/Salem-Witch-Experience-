// Maps, collision, and rendering.
//
// A map is authored as ASCII ground plus a list of props. Ground handles
// terrain; anything with height — houses, trees, the woodpile — is a prop
// with a tile footprint and a baseline. Props and actors are sorted by that
// baseline every frame, so the player walks BEHIND a house's roof and IN
// FRONT of its doorstone. Without that sort the oblique projection falls
// apart instantly and the whole village reads as a flat diagram.

import { TS, buildGroundTiles, variantFor, EDGE_BITS } from './art-ground.js';
import { hash } from './pixels.js';
import {
  buildHouse, buildMeetinghouse, buildPine, buildBareTree, buildFence,
  buildWoodpile, buildMarker, buildWell, buildSeatingChart, buildHearth,
  buildTable, buildPew, buildAccountBook,
  buildMemBench, buildLowWall, buildLocust, buildSignboard, buildBin,
  buildShopfront, buildBarn, buildStoneWall, buildHayrick, buildCart,
  buildAppleTree, buildPig, buildCow, buildSheep, buildChicken,
  buildBookshelf, buildReadingLamp, buildDesk, buildBed, buildWheel, buildDresser,
  buildBars, buildPaper, buildArchiveBox, buildStraw,
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
  // Present day.
  'L': 'lawn',
  'G': 'paving',
  'B': 'brick',
  'A': 'asphalt',
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
  house:        { w: 6, h: 5, build: (o) => buildHouse(o.w || 6, o.h || 5, o), sized: true, smokes: true },
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

  // A working farm village, not a street of houses.
  barn:         { w: 8, h: 6, build: (o) => buildBarn(o.w || 8, o.h || 6), sized: true },
  stonewall:    { w: 1, h: 1, build: () => buildStoneWall() },
  hayrick:      { w: 2, h: 2, build: () => buildHayrick(), solidRows: 1 },
  cart:         { w: 2, h: 1, build: () => buildCart() },
  appletree:    { w: 2, h: 3, build: () => buildAppleTree(), solidRows: 1 },
  pig:          { w: 1, h: 1, build: () => buildPig() },
  cow:          { w: 2, h: 1, build: () => buildCow() },
  sheep:        { w: 1, h: 1, build: () => buildSheep() },
  chicken:      { w: 1, h: 1, build: () => buildChicken(), passable: true },
  // Solid, but you can speak through it. The jail scene is a conversation
  // held through a grate, which is the whole shape of it.
  bars:         { w: 1, h: 1, build: () => buildBars(), talkThrough: true },
  paper:        { w: 1, h: 1, build: () => buildPaper(), passable: true },
  archivebox:   { w: 1, h: 1, build: () => buildArchiveBox() },
  bookshelf:    { w: 2, h: 3, build: (o) => buildBookshelf(o.w || 2, o.h || 3), sized: true },
  readinglamp:  { w: 1, h: 1, build: () => buildReadingLamp(), passable: true },
  desk:         { w: 2, h: 1, build: () => buildDesk() },
  bed:          { w: 2, h: 2, build: () => buildBed(), solidRows: 1 },
  wheel:        { w: 1, h: 1, build: () => buildWheel() },
  dresser:      { w: 2, h: 1, build: () => buildDresser() },
  straw:        { w: 1, h: 1, build: () => buildStraw(), passable: true },

  // Present day.
  membench:     { w: 2, h: 1, build: () => buildMemBench() },
  lowwall:      { w: 1, h: 1, build: () => buildLowWall() },
  locust:       { w: 3, h: 4, build: () => buildLocust(), solidRows: 1 },
  signboard:    { w: 2, h: 2, build: () => buildSignboard(), solidRows: 1 },
  bin:          { w: 1, h: 1, build: () => buildBin() },
  shopfront:    { w: 6, h: 5, build: (o) => buildShopfront(o.w || 6, o.h || 5), sized: true },
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
    ? `${prop.kind}:${prop.w}x${prop.h}:${prop.doorCol}:${(prop.windows || []).join(',')}:${prop.chimney}:${prop.leanTo}:${prop.roofFrac}`
    : prop.kind;
  let img = PROP_CACHE.get(key);
  if (!img) { img = def.build(prop); PROP_CACHE.set(key, img); }
  return img;
}

/* ---------------------------------------------------------------------- *
 * Map construction
 * ---------------------------------------------------------------------- */

/**
 * Build a map for a given chapter.
 *
 * The village is dressed three times across the game, so a map definition
 * may carry `byChapter` overrides — extra props, removed props, a different
 * cast, a different name. Everything not overridden is shared, which is the
 * whole reason one village map can carry March, June and September.
 */
// Kinds that walk about instead of standing still.
const LIVESTOCK = new Set(['pig', 'cow', 'sheep', 'chicken']);

export function buildMap(def, chapter = 'march') {
  const over = (def.byChapter && def.byChapter[chapter]) || {};
  def = {
    ...def,
    ...over,
    props: [...(def.props || []), ...(over.addProps || [])]
      .filter((p) => !(over.hideProps || []).some((h) => h.x === p.x && h.y === p.y && h.kind === p.kind)),
    interact: [...(def.interact || []), ...(over.addInteract || [])],
    triggers: [...(def.triggers || []), ...(over.addTriggers || [])],
    warps: [...(def.warps || []), ...(over.addWarps || [])],
    npcs: over.npcs !== undefined ? over.npcs : (def.npcs || []),
  };
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

  // Livestock are not furniture. They come out of the prop list and into a
  // list that gets a position update every frame, because a village where
  // the animals are nailed down reads as a diorama — and because the swine
  // wandering off the road and into a neighbour's field is the exact
  // grievance Rebecca Nurse describes. Static pigs cannot trespass.
  const critters = [];
  const isLivestock = (kind) => LIVESTOCK.has(kind);

  const talkThrough = new Set();
  const props = (def.props || []).filter((p) => {
    if (!isLivestock(p.kind)) return true;
    critters.push({
      kind: p.kind,
      tx: p.x, ty: p.y, px: p.x * TS, py: p.y * TS,
      fromX: p.x, fromY: p.y,
      // Where it started, and how far it is allowed to get. A pure random
      // walk has no home: over half an hour the herd diffuses across the
      // whole map and the village ends up empty. The tether is loose enough
      // to cross a boundary wall — which is the entire point of the swine —
      // and tight enough that they are still there when the player returns.
      homeX: p.x, homeY: p.y,
      moving: false, t: 0, dir: 0,
      // Staggered so twelve animals do not step in unison like a chorus.
      wait: 0.6 + ((p.x * 7 + p.y * 13) % 40) / 10,
    });
    return false;
  }).map((p) => {
    const d = PROPS[p.kind];
    if (!d) throw new Error(`unknown prop kind: ${p.kind}`);
    if (d.talkThrough) {
      for (let y = p.y; y < p.y + (p.h || d.h); y++) {
        for (let x = p.x; x < p.x + (p.w || d.w); x++) talkThrough.add(`${x},${y}`);
      }
    }
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

  // Bind every paper sprite to the document it is the sprite FOR.
  //
  // A document has two halves that must agree: the interactable that opens
  // it, and the sheet of paper the player can see lying there. They were
  // authored separately, which is how two documents once shipped correctly
  // gated and completely invisible. Now the gate is written once, on the
  // interactable, and the sprite inherits it — so a paper cannot be visible
  // for a document that is still locked, or missing for one that isn't.
  //
  // Searched outward one tile because a paper often sits on the near edge of
  // a two-tile table while the interactable covers the whole table.
  for (const p of props) {
    if (p.kind !== 'paper') continue;
    const near = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]
      .map(([dx, dy]) => interact.get(`${p.x + dx},${p.y + dy}`))
      .find((s) => s && s.doc);
    if (!near) continue;
    p.docId = near.doc;
    p.gate = near.require || null;
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
    era: def.era || '1692', chapter,
    w, h, terrain, solid, props, critters, warps, interact, triggers, talkThrough,
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

/**
 * Move the livestock.
 *
 * A slow, aimless, tile-by-tile wander with long pauses. Deliberately not a
 * pathfinder and deliberately not fast: an animal that moves with intent
 * reads as a character, and these are scenery that happens to be alive.
 *
 * They walk onto anything the player could walk onto, which is what lets the
 * pigs end up in a field they have no business in.
 */
export function updateCritters(map, dt, now) {
  const list = map.critters;
  if (!list || !list.length) return;

  for (const c of list) {
    if (c.moving) {
      c.t += dt / CRITTER_STEP;
      if (c.t >= 1) {
        c.t = 0; c.moving = false;
        c.px = c.tx * TS; c.py = c.ty * TS;
        c.wait = 1.2 + hash(c.tx, c.ty, Math.floor(now)) * 5;
      } else {
        c.px = (c.fromX + (c.tx - c.fromX) * c.t) * TS;
        c.py = (c.fromY + (c.ty - c.fromY) * c.t) * TS;
      }
      continue;
    }

    c.wait -= dt;
    if (c.wait > 0) continue;

    // Seeded on the animal's own position and the clock, so the herd does
    // not share a random stream and drift into formation.
    const r = hash(c.tx * 31 + 7, c.ty * 17 + 3, Math.floor(now * 3));
    const d = Math.floor(r * 4);
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][d];
    const nx = c.tx + dx, ny = c.ty + dy;

    const strayed = Math.abs(nx - c.homeX) + Math.abs(ny - c.homeY) > CRITTER_RANGE;
    if (strayed || nx < 0 || ny < 0 || nx >= map.w || ny >= map.h || isSolid(map, nx, ny)) {
      c.wait = 0.8 + r * 2;      // blocked or too far: pause and try again
      continue;
    }
    c.fromX = c.tx; c.fromY = c.ty;
    c.tx = nx; c.ty = ny;
    c.dir = dx < 0 ? 3 : dx > 0 ? 1 : dy < 0 ? 0 : 2;
    c.moving = true;
  }
}

const CRITTER_STEP = 0.85;      // seconds per tile. They are not in a hurry.
const CRITTER_RANGE = 6;        // tiles from where it started, Manhattan

/**
 * Smoke from the chimneys.
 *
 * Drawn rather than stored: every puff is a function of the clock and the
 * chimney's own coordinates, so there is no particle state to keep, nothing
 * to save, and nothing to desynchronise.
 *
 * It also carries a clue the game otherwise only states. `clue.hearth` reads
 * "The parsonage fire is banked low even in March. This house is cold." So
 * every chimney in the village smokes except that one, which barely does —
 * and a student who notices has found the salary dispute without reading a
 * word about it.
 */
function drawSmoke(g, map, cam, clock, VW, VH) {
  // September has lost a fifth of its households. Fewer fires lit.
  const thin = map.chapter === 'september';

  for (const p of map.props) {
    const d = PROPS[p.kind];
    if (!d || !d.smokes || p.smoke === 'none') continue;
    if (thin && p.smoke !== 'lit') continue;

    const W = p.w * TS;
    const chim = p.chimney === undefined ? 'center' : p.chimney;
    if (!chim) continue;
    const cw = 10;
    const cx = chim === 'center' ? Math.round(W / 2 - cw / 2)
             : chim === 'left' ? Math.round(W * 0.24)
             : Math.round(W * 0.72);

    const img = propImage(p);
    const ox = p.x * TS - cam.x + cx + cw / 2;
    const oy = (p.y + p.h) * TS - img.h - cam.y + (d.sized ? 6 : 0) + 2;
    if (ox < -20 || ox > VW + 20 || oy < -40 || oy > VH + 20) continue;

    // A banked fire gives two thin puffs; a working one gives five.
    const faint = p.smoke === 'faint';
    const count = faint ? 3 : 7;
    const rise = faint ? 13 : 30;
    const speed = faint ? 0.20 : 0.34;

    for (let i = 0; i < count; i++) {
      const seed = p.x * 71 + p.y * 37 + i * 13;
      const phase = (clock * speed + hash(seed, i, 5)) % 1;
      const y = oy - phase * rise;
      // Drifts as it climbs, and thins out at the top.
      const drift = Math.sin(phase * 3.1 + hash(seed, i, 9) * 6) * (2 + phase * 4);
      const x = ox + drift;
      const a = (1 - phase) * (faint ? 0.34 : 0.62);
      if (a <= 0.03) continue;
      // Grows as it cools and spreads.
      const r = phase < 0.25 ? 1 : phase < 0.6 ? 2 : 3;
      g.fillStyle = `rgba(214,214,210,${a.toFixed(3)})`;
      g.fillRect(Math.round(x), Math.round(y), r, r);
    }
  }
}

export function renderMap(g, map, cam, actors, clock = 0) {
  initArt();

  const z = zoomFor(map);
  const VW = VIEW_W / z, VH = VIEW_H / z;

  // --- ground ---------------------------------------------------------
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = map.indoor ? '#0d0e11' : (map.era === 'present' ? '#2b3038' : '#20232a');
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
    // A document nobody has told the player about is not lying there yet.
    // Drawing it and refusing to open it is the shape that produced "the
    // arrow points at a building I already searched" — the player can see
    // the thing and cannot have it, which reads as breakage, not as a lock.
    if (p.hidden) continue;
    const img = propImage(p);
    const dx = p.x * TS - cam.x;
    const dy = (p.y + p.h) * TS - img.h - cam.y + (PROPS[p.kind].sized ? 6 : 0);
    // Cull generously — props can be tall.
    if (dx > VW || dx + img.w < 0 || dy > VH || dy + img.h < 0) continue;
    draws.push({ img: img.canvas, dx, dy, base: (p.y + p.h) * TS, live: p.live });
  }

  // Livestock: same sort as everything else, so a cow in front of a barn
  // occludes it and a cow behind it does not.
  for (const c of map.critters || []) {
    const img = propImage({ kind: c.kind, w: PROPS[c.kind].w, h: PROPS[c.kind].h });
    const dx = Math.round(c.px) - cam.x;
    const dy = Math.round(c.py) + TS - img.h - cam.y;
    if (dx > VW || dx + img.w < 0 || dy > VH || dy + img.h < 0) continue;
    draws.push({ img: img.canvas, dx, dy, base: Math.round(c.py) + TS });
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
  for (const d of draws) {
    // A paper somebody has just told the player about, and which they have
    // not read yet. It lifts a pixel and carries a warm edge that breathes.
    //
    // Restraint is the whole design here. Because a document is only visible
    // once a person has named it, there is almost never more than one of
    // these on screen — so it reads as "that is the thing he meant" rather
    // than as a map strewn with collectibles. It stops the instant the
    // document is read.
    if (d.live) {
      const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(clock * 3.1));
      const lift = Math.round(Math.sin(clock * 2.2) * 0.9 + 0.9);
      g.save();
      g.globalAlpha = 0.30 + 0.42 * pulse;
      g.globalCompositeOperation = 'lighter';
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        g.drawImage(d.img, d.dx + ox, d.dy - lift + oy);
      }
      g.restore();
      g.drawImage(d.img, d.dx, d.dy - lift);
      continue;
    }
    g.drawImage(d.img, d.dx, d.dy);
  }

  // Above everything: smoke is the only thing in the village taller than a
  // roof, so it never needs to take part in the baseline sort.
  if (!map.indoor) drawSmoke(g, map, cam, clock, VW, VH);

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
  } else if (map.era === 'present') {
    // A warm lift over the present-day maps. The terrain and props already
    // do most of the work of separating the eras; this is the last few
    // percent, so a student registers the century before reading a word.
    g.save();
    g.globalCompositeOperation = 'soft-light';
    g.fillStyle = 'rgba(255, 196, 122, 0.30)';
    g.fillRect(0, 0, VIEW_W, VIEW_H);
    g.restore();
  }
}
