// Does every document fit its reader page without scrolling?
//
// A document a student has to scroll through is a document a student skims,
// so the reader is sized to be read in one screen and the content is written
// to that budget. This asks the real drawReader — with the real fonts, at the
// real scale — how each one measured, rather than reimplementing the layout
// and slowly drifting away from it.
//
//   node tools/check-fit.mjs          checks every document
//   node tools/check-fit.mjs annApology sewallApology
//
// Requires the game served locally:  python3 -m http.server 8123
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:8123/';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: Number(process.env.VW||1366), height: Number(process.env.VH||768) } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.keyboard.press('KeyZ');           // past the title, so the loop draws
await page.waitForTimeout(300);

const only = process.argv.slice(2);
const rows = await page.evaluate((ids) => {
  const g = window.__salem;
  const list = ids.length ? ids : Object.keys(window.__DOCUMENTS);
  const out = [];
  for (const id of list) {
    g.openReader(id);
    g.docScroll = 0;
    g.draw();                                 // populates drawReader.metrics
    const m = window.__readerMetrics();
    out.push({
      id,
      mono: `${m.monoLines}/${m.monoFits}`,
      gloss: `${Math.round(m.glossLines * 10) / 10}/${m.glossFits}`,
      cite: m.citeLines,
      overflowPx: m.overflow,
      fits: m.overflow === 0 ? 'yes' : '',
    });
  }
  g.mode = 'play';
  g.reader = null;
  return out;
}, only);

console.table(rows);
const bad = rows.filter((r) => r.overflowPx > 0);
console.log(`${rows.length - bad.length}/${rows.length} fit with no scrolling.`);
if (bad.length) {
  console.log('\nStill overflowing — trim the longer column:');
  for (const r of bad) console.log(`  ${r.id.padEnd(20)} mono ${r.mono.padEnd(7)} gloss ${r.gloss.padEnd(8)} +${r.overflowPx}px`);
}
if (errors.length) console.log('\nPAGE ERRORS:\n' + errors.join('\n'));
await browser.close();
process.exit(bad.length || errors.length ? 1 : 0);
