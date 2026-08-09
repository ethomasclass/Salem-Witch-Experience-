// Can the player actually find and reach everything the game asks for?
//
// Written after shipping the same bug twice. The seating list in the
// meetinghouse and the account book page in the tavern were both correctly
// defined, correctly gated, and standing on tiles with nothing drawn on
// them. The interactables existed. They were reachable. They were invisible.
//
// A player examined the seating chart, saw no second sheet, walked out, and
// watched the March goal counter sit at two of four for the rest of the
// chapter — with the wayfinder arrow pointing back at a building they had
// already searched. Nothing in the game could report that, because from the
// inside every system was behaving correctly.
//
// So this checks the two things a document has to be, that no other check
// covers: VISIBLE, and REACHABLE.
//
//   node tools/check-maps.mjs
//
// Requires the game served locally:  python3 -m http.server 8123
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:8123/';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Where the player enters each map, for the reachability flood fill.
const ENTRY = {
  village: [22, 34], memorial: [13, 25], road: [7, 28], jail: [6, 8],
  parsonage: [5, 7], meetinghouse: [6, 8], tavern: [5, 7],
  nursehouse: [3, 7], putnamhouse: [2, 6], dig: [11, 9], archive: [8, 11],
};

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
await page.keyboard.press('KeyZ');
await page.waitForTimeout(400);
for (let i = 0; i < 8; i++) { await page.keyboard.press('KeyZ'); await page.waitForTimeout(60); }

const report = await page.evaluate((ENTRY) => {
  const g = window.__salem;
  const invisible = [], unreachable = [], unstandable = [];
  const chapters = ['memorial', 'march', 'dig', 'june', 'archive', 'september', 'reckoning'];

  for (const ch of chapters) {
    for (const id of Object.keys(window.__MAPS)) {
      const m = g.mapFor(id, ch);

      // --- flood fill from where the player comes in ---------------------
      const entry = ENTRY[id];
      const seen = new Set();
      if (entry) {
        const key = (x, y) => `${x},${y}`;
        const q = [entry];
        seen.add(key(entry[0], entry[1]));
        while (q.length) {
          const [x, y] = q.pop();
          for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
            if (seen.has(key(nx, ny)) || window.__isSolid(m, nx, ny)) continue;
            seen.add(key(nx, ny)); q.push([nx, ny]);
          }
        }
      }

      // Group tiles back into the region they came from. An interactable
      // three tiles wide only needs ONE approachable side — checking every
      // tile flags the middle of a hearth set into a wall, which is fine.
      const regions = new Map();
      for (const [k, spot] of m.interact) {
        if (!regions.has(spot)) regions.set(spot, []);
        regions.get(spot).push(k.split(',').map(Number));
      }

      for (const [spot, tiles] of regions) {
        const [x, y] = tiles[0];
        const where = `${ch}/${id} ${spot.doc || spot.id}@${tiles.map(t=>t.join(',')).join(' ')}`;

        // A document must have a paper sprite on or beside it. Examinables
        // are allowed to be scenery — a woodpile is its own sprite.
        if (spot.doc) {
          const drawn = tiles.some(([tx, ty]) => m.props.some((pr) => pr.kind === 'paper'
            && Math.abs(pr.x - tx) <= 1 && Math.abs(pr.y - ty) <= 1));
          if (!drawn) invisible.push(where);
        }

        // Somewhere to stand beside ANY tile of the region.
        const neighbours = [];
        for (const [tx, ty] of tiles) {
          for (const [a, b] of [[tx, ty - 1], [tx, ty + 1], [tx - 1, ty], [tx + 1, ty]]) {
            if (a < 0 || b < 0 || a >= m.w || b >= m.h) continue;
            if (!window.__isSolid(m, a, b)) neighbours.push([a, b]);
          }
        }
        if (!neighbours.length) unstandable.push(where);
        else if (entry && !neighbours.some(([a, b]) => seen.has(`${a},${b}`))) unreachable.push(where);
      }
    }
  }
  // --- can the gate on each document ever be satisfied? -----------------
  //
  // New failure mode, introduced the day documents became person-gated: a
  // paper is not drawn until somebody names it, so a `require` flag that no
  // line of dialogue ever teaches produces a document that is invisible
  // FOREVER — with no error anywhere, because the map, the sprite, the gate
  // and the goal are all individually correct. That is the same shape as
  // every other bug this file exists because of.
  //
  // So: walk every script in the game, collect everything it can teach, and
  // check each gate against it.
  const taught = new Set();
  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;
    if (node.learn) [].concat(node.learn).forEach((f) => taught.add(f));
    for (const k of ['then', 'else', 'lines', 'cases', 'options', 'greet', 'topics', 'farewell']) {
      if (node[k]) walk(node[k]);
    }
    if (node.cases) Object.values(node.cases).forEach(walk);
    if (node.default) walk(node.default);
  };
  Object.values(window.__NPCS).forEach(walk);
  Object.values(window.__CLUES).forEach(walk);

  const ungettable = [];
  const checkedGates = new Set();
  for (const ch of chapters) {
    for (const id of Object.keys(window.__MAPS)) {
      for (const [, spot] of g.mapFor(id, ch).interact) {
        if (!spot.doc || !spot.require) continue;
        for (const f of spot.require) {
          const key = `${spot.doc}:${f}`;
          if (checkedGates.has(key)) continue;
          checkedGates.add(key);
          if (!taught.has(f)) ungettable.push(`${spot.doc} needs "${f}", which nothing in the game teaches`);
        }
      }
    }
  }

  return {
    invisible: [...new Set(invisible)],
    unreachable: [...new Set(unreachable)],
    unstandable: [...new Set(unstandable)],
    ungettable: [...new Set(ungettable)],
  };
}, ENTRY);

let bad = 0;
const section = (title, list, note) => {
  if (!list.length) { console.log(`ok   ${title}`); return; }
  bad += list.length;
  console.log(`FAIL ${title}  (${list.length})`);
  if (note) console.log(`     ${note}`);
  for (const x of list) console.log(`       ${x}`);
};

section('every document has a paper sprite the player can see', report.invisible,
  'A document standing on an empty tile cannot be found, however correct it is.');
section('every interactable has somewhere to stand beside it', report.unstandable);
section('every interactable can be walked to from the entrance', report.unreachable);
section('every document gate is something a person or a script can teach', report.ungettable,
  'A paper whose gate nothing teaches is never drawn, and nothing anywhere reports it.');

if (errors.length) { bad += errors.length; console.log('\nPAGE ERRORS:\n  ' + errors.join('\n  ')); }
console.log(bad ? `\n${bad} problems.` : '\nAll maps clean.');
await browser.close();
process.exit(bad ? 1 : 0);
