// Can a player who follows the goal tracker actually follow it?
//
// `check-play` asks whether a chapter can be finished by somebody who does
// everything in any order. That is a weaker question than it sounds, and it
// passed while March was broken.
//
// March is a chain now: each goal names what the last beat was and why that
// sends you here. The moment it became a chain, a new failure appeared that
// nothing was watching for — a step whose topic is gated on something a LATER
// step provides. The tracker sends the player to the tavern to ask Ingersoll
// about the seating, and the topic is not in his menu, because it wanted the
// player to have seen the chart first, which is the step after. The chapter
// is still completable — you can go off-script, do the later thing, and come
// back — so check-play reports it green. The chain is simply unwalkable.
//
// This walks the steps IN ORDER, granting only what the earlier steps grant,
// and asks at each one: given exactly what a player following instructions
// would have by now, is there anything available that completes this step?
//
//   node tools/check-chain.mjs
//
// Requires the game served locally:  python3 -m http.server 8123
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:8123/';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);

const report = await page.evaluate(() => {
  const g = window.__salem, S = window.__objectives;
  const CHAIN = ['memorial', 'march', 'dig', 'june', 'archive', 'september', 'reckoning'];
  const out = [];

  const teach = (node, got) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach((n) => teach(n, got)); return; }
    if (typeof node !== 'object') return;
    if (node.learn) [].concat(node.learn).forEach((f) => got.add(f));
    for (const k of ['then', 'else', 'lines', 'default']) teach(node[k], got);
    if (node.cases) Object.values(node.cases).forEach((n) => teach(n, got));
    if (node.options) node.options.forEach((o) => teach(o.then, got));
  };

  for (const chapter of CHAIN) {
    const steps = S.STEPS_BY_CHAPTER[chapter] || [];
    const st = new window.__GameState();
    st.chapter = chapter;
    for (const id of Object.keys(window.__MAPS)) st.visited.add(id);

    // What is in this chapter, INDEXED BY MAP.
    //
    // The index is the whole point. A pass that does everything in the world
    // cannot tell a player following the tracker apart from a player doing
    // everything, and the first version of this checker made exactly that
    // mistake: it walked the steps in order but let each pass examine the
    // seating chart on the other side of the village, so the topic gated on
    // having seen the chart opened, and the unwalkable chain looked fine.
    //
    // A player following instructions goes where the goal points and works
    // with what is in that room. That is what a pass is allowed to do.
    const cast = {}, spots = {}, docSpots = {};
    for (const id of Object.keys(window.__MAPS)) {
      const m = g.mapFor(id, chapter);
      cast[id] = m.actors.map((a) => a.def);
      spots[id] = []; docSpots[id] = [];
      const seen = new Set();
      for (const [, spot] of m.interact) {
        if (seen.has(spot)) continue;
        seen.add(spot);
        if (spot.doc) docSpots[id].push(spot);
        if (spot.id && window.__CLUES[spot.id]) spots[id].push(spot);
        if (spot.bench) spots[id].push(spot);
      }
      for (const [, t] of m.triggers) if (t.id && window.__CLUES[t.id]) spots[id].push(t);
      for (const [, w] of m.warps) if (w.script && window.__CLUES[w.script]) spots[id].push({ id: w.script });
    }

    // Everything in one room, done by somebody standing in it.
    const pass = (mapId) => {
      for (const def of cast[mapId] || []) {
        st.markSpoke(def.id);
        const got = new Set();
        teach(def.greet, got);
        for (const t of def.topics || []) {
          if (t.chapter && t.chapter !== chapter) continue;
          if (t.require && !st.knowsAll(t.require)) continue;
          if (t.hide && st.knowsAll(t.hide)) continue;
          got.add(`asked.${def.id}.${t.id}`);
          teach(t.lines, got);
        }
        for (const f of got) st.learn(f, def.id);
      }
      for (const spot of spots[mapId] || []) {
        const got = new Set();
        teach(spot.bench ? window.__benchScript(spot.bench, st) : window.__CLUES[spot.id], got);
        for (const f of got) st.learn(f, 'observed');
      }
      for (const spot of docSpots[mapId] || []) {
        if (spot.require && !st.knowsAll(spot.require)) continue;
        st.copyDoc(spot.doc);
      }
    };

    // Exit steps are completed by walking out, or by the closing screen —
    // there is nothing in the world that satisfies them and there is not
    // meant to be.
    const EXIT = new Set(['leave', 'back', 'gap', 'answer']);
    for (const step of steps) {
      if (EXIT.has(step.id) || step.done(st)) continue;
      // Where the tracker is sending them right now — re-read every pass,
      // because a step that covers several items moves its own waypoint as
      // each one lands, and following it means walking to each in turn.
      let ok = false, room = null;
      for (let n = 0; n < 12 && !ok; n++) {
        const w = typeof step.where === 'function' ? step.where(st) : step.where;
        room = w && w.map;
        if (!room) { ok = true; break; }   // nowhere to point: not this check
        const before = st.flags.size + st.docs.size + st.talkedTo.size;
        pass(room);
        if (step.done(st)) { ok = true; break; }
        if (st.flags.size + st.docs.size + st.talkedTo.size === before) break;
      }
      if (!ok) {
        out.push({ chapter, step: step.id, text: S.stepText(st, step), room });
        break;                       // one report per chapter is enough
      }
    }
  }
  return out;
});

let bad = report.length;
if (!bad) {
  console.log('ok   every goal can be done when the tracker asks for it');
} else {
  console.log(`FAIL a goal the player cannot complete when they are sent to it  (${bad})`);
  for (const r of report) {
    console.log(`       ${r.chapter}/${r.step}  (sends the player to ${r.room})`);
    console.log(`         "${r.text}"`);
    console.log('         Nothing available at this point in the chain completes it — the');
    console.log('         content it needs is gated on something a later goal provides.');
  }
}
if (errors.length) { bad += errors.length; console.log('\nPAGE ERRORS:\n  ' + errors.join('\n  ')); }
console.log(bad ? '' : '\nThe chain is walkable.');
await browser.close();
process.exit(bad ? 1 : 0);
