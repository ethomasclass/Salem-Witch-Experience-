// Is each chapter actually finishable by a player who does everything?
//
// Written the day documents stopped lying on tables and started being
// unlocked by conversation. That change moved the game's critical path off
// the map and into the dialogue trees, where nothing was checking it: a
// document gated on a flag taught only by a topic that is itself gated on
// something unobtainable in that chapter is a chapter that cannot be
// completed, and every individual piece of it looks correct.
//
// So this plays each chapter the way the most thorough possible student
// would, and asks whether the chapter's own steps come out done.
//
// It is a REACHABILITY fixpoint, not a playthrough: repeatedly take every
// topic whose conditions are currently satisfied, examine everything whose
// conditions are currently satisfied, and copy every document whose gate is
// currently satisfied — until nothing new lands. If the chapter is not
// complete at that point, no student could complete it either.
//
//   node tools/check-play.mjs
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
  const g = window.__salem;
  const CHAIN = ['memorial', 'march', 'dig', 'june', 'archive', 'september', 'reckoning'];
  const out = [];

  // Everything a script can teach, following whichever branches its
  // conditions currently allow. Deliberately optimistic on `bySource` —
  // a branch keyed on who told you still teaches the same flags.
  const teach = (node, st, got) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach((n) => teach(n, st, got)); return; }
    if (typeof node !== 'object') return;
    if (node.learn) [].concat(node.learn).forEach((f) => got.add(f));
    if (node.then) teach(node.then, st, got);
    if (node.else) teach(node.else, st, got);
    if (node.lines) teach(node.lines, st, got);
    if (node.cases) Object.values(node.cases).forEach((n) => teach(n, st, got));
    if (node.default) teach(node.default, st, got);
    if (node.options) node.options.forEach((o) => teach(o.then, st, got));
  };

  for (const chapter of CHAIN) {
    const st = new window.__GameState();
    st.chapter = chapter;
    // Everything earlier chapters would have left behind. A chapter is
    // allowed to depend on March; it is not allowed to depend on itself.
    for (const prior of CHAIN.slice(0, CHAIN.indexOf(chapter))) {
      st.chapter = prior;
      // (filled in by the fixpoint below on the prior pass — see `carried`)
    }
    st.chapter = chapter;

    // Who and what exists in this chapter, on every map.
    //
    // Triggers count as much as interactables. The memorial's whole first
    // step is a tile you walk over, and leaving them out made this checker
    // report the opening scene as unfinishable — which is exactly the kind
    // of false alarm that gets a checker ignored.
    const cast = [], spots = [], docSpots = [];
    for (const id of Object.keys(window.__MAPS)) {
      const m = g.mapFor(id, chapter);
      for (const a of m.actors) cast.push(a.def);
      const seen = new Set();
      for (const [, spot] of m.interact) {
        if (seen.has(spot)) continue;
        seen.add(spot);
        if (spot.doc) docSpots.push(spot);
        if (spot.id && window.__CLUES[spot.id]) spots.push(spot);
        if (spot.bench) spots.push(spot);
      }
      for (const [, t] of m.triggers) {
        if (seen.has(t)) continue;
        seen.add(t);
        if (t.id && window.__CLUES[t.id]) spots.push(t);
      }
      // And the arrival beats a warp can carry.
      for (const [, w] of m.warps) {
        if (w.to) st.visited.add(w.to);
        if (w.script && window.__CLUES[w.script]) spots.push({ id: w.script });
      }
      st.visited.add(id);
    }

    // The fixpoint.
    for (let pass = 0; pass < 12; pass++) {
      const before = st.flags.size + st.docs.size + st.talkedTo.size;
      for (const def of cast) {
        st.markSpoke(def.id);
        const got = new Set();
        teach(def.greet, st, got);
        for (const t of def.topics || []) {
          // A topic's own conditions, evaluated exactly as the menu does.
          if (t.chapter && t.chapter !== chapter) continue;
          if (t.require && !st.knowsAll(t.require)) continue;
          if (t.hide && st.knowsAll(t.hide)) continue;
          // Taking a topic records that it was taken. buildTopicMenu prepends
          // this to every option, and content gates on it — a step can ask
          // "did they actually ask her about the cake", which is a different
          // question from "did they learn what a cake is".
          got.add(`asked.${def.id}.${t.id}`);
          teach(t.lines, st, got);
        }
        for (const f of got) st.learn(f, def.id);
      }
      for (const spot of spots) {
        const script = spot.bench ? window.__benchScript(spot.bench, st) : window.__CLUES[spot.id];
        const got = new Set();
        teach(script, st, got);
        for (const f of got) st.learn(f, 'observed');
      }
      for (const spot of docSpots) {
        if (spot.require && !st.knowsAll(spot.require)) continue;
        st.copyDoc(spot.doc);
      }
      if (st.flags.size + st.docs.size + st.talkedTo.size === before) break;
    }

    const steps = window.__objectives.STEPS_BY_CHAPTER[chapter] || [];
    const stuck = steps.filter((o) => !o.done(st))
      .filter((o) => !['leave', 'back', 'gap', 'answer'].includes(o.id));
    out.push({
      chapter,
      complete: window.__chapterComplete(st, chapter),
      stuck: stuck.map((o) => o.id),
      docs: docSpots.filter((s) => st.hasDoc(s.doc)).length,
      docsTotal: docSpots.length,
    });
  }
  // --- can every piece of "arguable" evidence actually be got? ----------
  //
  // The four-cases tab only offers flags listed as arguable. A flag listed
  // there that nothing teaches, or that has no notebook text, is a silent
  // hole: the tab simply never shows it, and nothing anywhere reports that
  // a case is missing a third of its evidence.
  const orphanArguable = [];
  const everTaught = new Set();
  const collect = (node) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(collect); return; }
    if (typeof node !== 'object') return;
    if (node.learn) [].concat(node.learn).forEach((f) => everTaught.add(f));
    for (const k of ['then', 'else', 'lines', 'greet', 'topics', 'farewell', 'default']) collect(node[k]);
    if (node.cases) Object.values(node.cases).forEach(collect);
    if (node.options) node.options.forEach((o) => collect(o.then));
  };
  Object.values(window.__NPCS).forEach(collect);
  Object.values(window.__CLUES).forEach(collect);
  for (const flag of window.__theories.ARGUABLE) {
    if (!window.__KNOWLEDGE[flag]) orphanArguable.push(`${flag} has no notebook text`);
    else if (!everTaught.has(flag)) orphanArguable.push(`${flag} is never taught by anything`);
  }

  return { chapters: out, orphanArguable };
});

let bad = 0;
if (report.orphanArguable.length) {
  bad += report.orphanArguable.length;
  console.log(`FAIL evidence offered for sorting that the player can never get  (${report.orphanArguable.length})`);
  for (const x of report.orphanArguable) console.log(`       ${x}`);
} else {
  console.log('ok   every piece of sortable evidence can actually be collected');
}
for (const r of report.chapters) {
  const docs = `${r.docs}/${r.docsTotal} documents`;
  if (r.complete) {
    console.log(`ok   ${r.chapter.padEnd(10)} finishable   (${docs})`);
  } else {
    bad++;
    console.log(`FAIL ${r.chapter.padEnd(10)} CANNOT be finished   (${docs})`);
    console.log(`       steps that stay incomplete even after doing everything: ${r.stuck.join(', ')}`);
  }
}
if (errors.length) { bad += errors.length; console.log('\nPAGE ERRORS:\n  ' + errors.join('\n  ')); }
console.log(bad ? `\n${bad} chapters a class could get stuck in.` : '\nEvery chapter can be finished.');
await browser.close();
process.exit(bad ? 1 : 0);
