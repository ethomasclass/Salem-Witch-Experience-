// Does the game actually get from one chapter to the next?
//
// Written after the worst bug of the project. The warp out of the memorial
// moved the player to the 1692 road and did not set the chapter. Everything
// downstream was individually correct: the goal tracker worked, the maps
// worked, the chapter overrides worked. But the player arrived in 1692 with
// `chapter` still reading 'memorial', so the goal HUD froze on memorial steps
// and — much worse — Salem Village never gained its `byChapter.march` exit to
// the archaeological dig, and the game could not be finished at all.
//
// It survived every test I had because every test set `state.chapter`
// directly and skipped the one line that was broken. So this checker is only
// allowed to move between chapters the way a player does: by standing on a
// warp tile and walking through it.
//
//   node tools/check-chapters.mjs
//
// Requires the game served locally:  python3 -m http.server 8123
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:8123/';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const CHAIN = ['memorial', 'march', 'dig', 'june', 'archive', 'september', 'reckoning'];

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);

// Start the way a student starts: title screen, then the cold open. Pressing
// Z enough times has to land in the world — if the intro ever swallows input
// or fails to hand off, this is where it shows up.
await page.keyboard.press('KeyZ');
await page.waitForTimeout(300);
for (let i = 0; i < 12; i++) { await page.keyboard.press('KeyZ'); await page.waitForTimeout(80); }

const opening = await page.evaluate(() => ({
  mode: window.__salem.mode,
  chapter: window.__salem.state.chapter,
  map: window.__salem.player.map,
}));

const report = await page.evaluate((CHAIN) => {
  const g = window.__salem;
  const notes = [], closed = [], stuck = [];

  // The exit of a chapter is any warp GATED on that chapter — that is the
  // only property a player can perceive, because the gate is what refuses
  // them until the chapter is done.
  //
  // Emphatically NOT "any warp that carries setChapter". Looking for the
  // thing under test is how the first version of this checker managed to pass
  // while the exact original bug was reintroduced: delete setChapter and the
  // warp simply vanished from the search, so there was nothing left to fail.
  const warpsOut = (chapter) => {
    const found = [];
    for (const id of Object.keys(window.__MAPS)) {
      const m = g.mapFor(id, chapter);
      for (const [, w] of m.warps) if (w.gate === chapter) found.push({ from: id, w });
    }
    return found;
  };

  // --- pass A: with an empty notebook, every gated exit must refuse -----
  //
  // A chapter whose exit opens too early is the same failure as one whose
  // exit never opens: the player skips the point of it.
  for (const ch of CHAIN) {
    for (const { from, w } of warpsOut(ch)) {
      const fresh = new window.__GameState();
      fresh.chapter = ch;
      if (window.__chapterComplete(fresh, ch)) {
        closed.push(`${ch}/${from} -> ${w.to} opens with an empty notebook`);
      }
    }
  }

  // --- pass B: walk the whole chain through the real warps -------------
  //
  // Everything is granted so the gates open; the thing under test is the
  // transition itself, not the gating, which pass A covers.
  const st = g.state;
  for (const k of Object.keys(window.__KNOWLEDGE)) st.learn(k, 'observed');
  for (const d of Object.keys(window.__DOCUMENTS)) st.docs.set(d, { chapter: st.chapter, at: 0 });
  for (const n of Object.keys(window.__NPCS)) st.markSpoke(n);

  for (let i = 0; i < CHAIN.length - 1; i++) {
    const here = CHAIN[i], next = CHAIN[i + 1];
    const outs = warpsOut(here);
    if (!outs.length) { stuck.push(`nothing anywhere is gated on ${here}, so it has no exit`); break; }

    // EVERY gated tile, not just the first. Exits are usually a pair of
    // adjacent tiles so the player cannot walk between them, and a pair is
    // exactly the shape where one half gets edited and the other does not.
    let ok = true;
    for (const { from, w } of outs) {
      st.chapter = here;
      g.player.map = from;
      g.setTile(w.x, w.y);
      g.doWarp(w);
      if (st.chapter !== next) {
        stuck.push(`${here}: walked ${from}(${w.x},${w.y}) -> ${w.to} and the chapter stayed "${st.chapter}"`);
        ok = false;
      }
    }
    if (!ok) break;
    // And the chapter has to be finishable once you are in it: its steps must
    // exist, and its own exit must be somewhere on a map you can be on.
    const steps = window.__objectives.STEPS_BY_CHAPTER[next];
    if (!steps || !steps.length) { stuck.push(`${next} has no steps at all`); break; }
    if (next !== CHAIN[CHAIN.length - 1] && !warpsOut(next).length) {
      stuck.push(`${next} has no way out`); break;
    }
    notes.push(`${here} -> ${next}  via ${outs.map((o) => `${o.from}(${o.w.x},${o.w.y})`).join(' ')} -> ${outs[0].w.to}`);
  }

  return { notes, closed, stuck };
}, CHAIN);

let bad = 0;
console.log(`opening: mode=${opening.mode} chapter=${opening.chapter} map=${opening.map}`);
if (opening.mode !== 'play' && opening.mode !== 'dialogue') {
  bad++; console.log('FAIL pressing Z from the title never reaches the world');
} else {
  console.log('ok   title and cold open hand off to the world');
}

for (const n of report.notes) console.log(`     ${n}`);
const section = (title, list) => {
  if (!list.length) { console.log(`ok   ${title}`); return; }
  bad += list.length;
  console.log(`FAIL ${title}  (${list.length})`);
  for (const x of list) console.log(`       ${x}`);
};
section('no gated exit opens before its chapter is done', report.closed);
section('every chapter hands off to the next one when walked through', report.stuck);

if (errors.length) { bad += errors.length; console.log('\nPAGE ERRORS:\n  ' + errors.join('\n  ')); }
console.log(bad ? `\n${bad} problems.` : '\nThe chapter chain holds.');
await browser.close();
process.exit(bad ? 1 : 0);
