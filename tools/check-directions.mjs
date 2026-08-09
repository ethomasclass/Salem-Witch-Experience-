// Can each direction a character gives actually fire, and is it about
// something that is actually somewhere else?
//
// Written after shipping ninety lines of these and discovering that eight of
// them could never fire at all, twenty-four repeated a line the player had
// been given a minute earlier by the same person, and several named furniture
// the paper had since been moved off. None of it was visible from the code:
// every line was well-formed, every key was spelled right, and the system
// worked. It was simply pointing at the wrong things at the wrong times.
//
// Four properties, each of which was violated in the shipped build:
//
//   REACHABLE   the key can be the outstanding goal in some chapter where
//               this character is actually standing somewhere
//   ELSEWHERE   the target is not close enough for the player to simply see
//               from where the speaker stands — the same rule the wayfinder
//               chevron uses. Not "same map": the village is forty-six tiles
//               across and the boundary stone really is a walk.
//   NOT A PAPER documents are unlocked by a person who says where they are;
//               a pointer afterwards is that same line, stale
//   VOICED      a chapter-keyed line has an entry for every chapter it can
//               fire in
//
//   node tools/check-directions.mjs
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
  const g = window.__salem, S = window.__objectives, D = window.__directions;
  const CH = ['memorial', 'march', 'dig', 'june', 'archive', 'september', 'reckoning'];

  // Every key that can be the outstanding goal in a chapter, with the map it
  // is on — read out of the step tables rather than simulated, by walking
  // each step and satisfying whatever it currently wants.
  const goalsOf = (ch) => {
    const found = new Map();     // key -> { map, x, y }
    for (const step of S.STEPS_BY_CHAPTER[ch] || []) {
      const st = new window.__GameState();
      st.chapter = ch;
      for (let n = 0; n < 24; n++) {
        const w = S.outstanding(st, step);
        if (!w) break;
        const k = w.npc || w.doc || w.flag || w.key;
        if (!found.has(k)) found.set(k, { map: w.map, x: w.x, y: w.y });
        if (w.npc) st.markSpoke(w.npc);
        else if (w.doc) st.docs.set(w.doc, { chapter: ch, at: 0 });
        else if (w.flag) st.learn(w.flag, 'observed');
        else break;                       // fixed-place step: one key only
      }
    }
    return found;
  };
  const castOf = (ch) => {
    const list = [];
    for (const id of Object.keys(window.__MAPS))
      for (const a of g.mapFor(id, ch).actors)
        list.push({ id: a.id, map: id, x: a.tx, y: a.ty, indoor: g.mapFor(id, ch).indoor });
    return list;
  };

  const goals = {}, cast = {};
  for (const ch of CH) { goals[ch] = goalsOf(ch); cast[ch] = castOf(ch); }

  const dead = [], sameRoom = [], papers = [], unvoiced = [];
  const live = [];

  for (const who of Object.keys(D.DIRECTIONS)) {
    for (const key of Object.keys(D.DIRECTIONS[who])) {
      const value = D.DIRECTIONS[who][key];
      let fires = false;
      for (const ch of CH) {
        const here = cast[ch].find((c) => c.id === who);
        if (!here || !goals[ch].has(key)) continue;
        fires = true;
        live.push(`${ch}: ${who} -> ${key}`);
        const t = goals[ch].get(key);
        if (t.map === here.map && D.withinSight(here.indoor, t.x - here.x, t.y - here.y)) {
          sameRoom.push(`${ch}: ${who} points at ${key}, which they can see from where they stand (${here.map})`);
        }
        if (window.__DOCUMENTS[key]) papers.push(`${ch}: ${who} -> ${key} is a document`);
        if (typeof value === 'object' && !value[ch]) unvoiced.push(`${ch}: ${who} -> ${key} has no line for this chapter`);
      }
      if (!fires) dead.push(`${who} -> ${key}`);
    }
  }
  return { dead, sameRoom, papers, unvoiced, live: [...new Set(live)] };
});

let bad = 0;
const section = (title, list, note) => {
  if (!list.length) { console.log(`ok   ${title}`); return; }
  bad += list.length;
  console.log(`FAIL ${title}  (${list.length})`);
  if (note) console.log(`     ${note}`);
  for (const x of list) console.log(`       ${x}`);
};

console.log(`${report.live.length} directions can fire.\n`);
section('every line a character has can actually fire somewhere', report.dead,
  'A line keyed on something that is never a goal, or given to somebody who is never present when it is.');
section('nobody points at something the player could already see', report.sameRoom);
section('nobody points at a document', report.papers,
  'The character who unlocks a paper already says where it is. A pointer afterwards is that line again, and it goes stale when the paper moves.');
section('every chapter-keyed line has a line for each chapter it fires in', report.unvoiced);

if (errors.length) { bad += errors.length; console.log('\nPAGE ERRORS:\n  ' + errors.join('\n  ')); }
console.log(bad ? `\n${bad} problems.` : '\nEvery direction points somewhere real.');
await browser.close();
process.exit(bad ? 1 : 0);
