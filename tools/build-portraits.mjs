// Turn the full-size portraits in art/portraits/ into the 64x64 art the game
// actually draws, and emit them as one JS module of data URIs.
//
// Why data URIs and not a folder of PNGs: the game ships as a single HTML
// file so a teacher can email it or drop it in Canvas, and so a filtered
// school network has nothing separate to block. Twelve portraits at 64x64
// cost a few KB each, which is nothing against a 350 KB bundle.
//
// Why Chromium and not an image library: there is no node_modules in this
// project and there is not going to be one. Playwright is already installed
// for the tests, and a browser canvas does box-filter downsampling and PNG
// encoding perfectly well.
//
//   node tools/build-portraits.mjs             build all
//   node tools/build-portraits.mjs --contact   also write a contact sheet
//   node tools/build-portraits.mjs --raw       skip the palette quantize
//
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'art/portraits');
const OUT = resolve(root, 'src/content/portraits.js');
const SIZE = 64;

const raw = process.argv.includes('--raw');
const contact = process.argv.includes('--contact');

// Pull each character's ramps out of the game's own palette and cast, so a
// portrait is quantized to the exact colours that character's walking sprite
// already uses. Anything else and the two drift apart.
const palSrc = readFileSync(resolve(root, 'src/palette.js'), 'utf8').replace(/^export /gm, '');
const npcSrc = readFileSync(resolve(root, 'src/content/npcs.js'), 'utf8')
  .replace(/^export /gm, '').replace(/^import[^;]+;/gm, '');
const { NPCS, CLOTH } = new Function(palSrc + npcSrc + '; return { NPCS, CLOTH };')();

// Universals every portrait may use regardless of who it is.
const UNIVERSAL = [
  '#26262a',                                  // outline
  '#3b3f46',                                  // backdrop
  '#2f3238', '#454a52',                       // backdrop vignette range
  ...CLOTH.linen,                             // collars, coifs, aprons
  '#f2efe6', '#0f1013',                       // eye white, pupil
];

function paletteFor(id) {
  const sp = (NPCS[id] || {}).spec || {};
  const out = new Set(UNIVERSAL);
  for (const ramp of [sp.flesh, sp.hair, sp.coat, sp.under, sp.skirt, sp.apron, sp.coif]) {
    if (Array.isArray(ramp)) ramp.forEach((c) => out.add(c));
    else if (typeof ramp === 'string') out.add(ramp);
  }
  if (typeof sp.hat === 'string') out.add(sp.hat);
  return [...out];
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.png')).sort();
if (!files.length) { console.error(`no PNGs in ${SRC}`); process.exit(1); }

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage();
await page.setContent('<canvas id=c></canvas>');

const results = [];
for (const file of files) {
  const id = file.replace(/\.png$/, '');
  const npcId = id.replace(/-(neutral|hard)$/, '');
  const b64 = readFileSync(resolve(SRC, file)).toString('base64');
  const palette = paletteFor(npcId);

  const out = await page.evaluate(async ({ b64, size, palette, raw }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();

    // Two-stage downsample. Going 2048 -> 64 in one drawImage makes Chromium
    // pick a cheap filter and the face turns to porridge; halving repeatedly
    // keeps a proper box average all the way down.
    let cur = document.createElement('canvas');
    cur.width = img.width; cur.height = img.height;
    let cx = cur.getContext('2d');
    cx.drawImage(img, 0, 0);
    while (cur.width > size * 2) {
      const next = document.createElement('canvas');
      next.width = Math.max(size, cur.width >> 1);
      next.height = Math.max(size, cur.height >> 1);
      const nx = next.getContext('2d');
      nx.imageSmoothingEnabled = true;
      nx.imageSmoothingQuality = 'high';
      nx.drawImage(cur, 0, 0, next.width, next.height);
      cur = next; cx = nx;
    }
    const c = document.getElementById('c');
    c.width = size; c.height = size;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(cur, 0, 0, size, size);

    if (!raw) {
      const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
      const pal = palette.map(hex);
      const d = g.getImageData(0, 0, size, size);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        let best = 0, bestD = Infinity;
        for (let k = 0; k < pal.length; k++) {
          // Weighted RGB distance. Green carries most perceived luminance, so
          // an unweighted match happily swaps a skin midtone for a cloth one
          // of the same brightness and the face goes blotchy.
          const dr = p[i] - pal[k][0], dg = p[i + 1] - pal[k][1], db = p[i + 2] - pal[k][2];
          const dist = dr * dr * 0.30 + dg * dg * 0.59 + db * db * 0.11;
          if (dist < bestD) { bestD = dist; best = k; }
        }
        p[i] = pal[best][0]; p[i + 1] = pal[best][1]; p[i + 2] = pal[best][2];
      }
      g.putImageData(d, 0, 0);
    }
    return c.toDataURL('image/png');
  }, { b64, size: SIZE, palette, raw });

  results.push({ id, npcId, uri: out, bytes: Math.round((out.length * 3) / 4) });
  console.log(`${id.padEnd(26)} ${String(Math.round(out.length / 1024)).padStart(3)} KB`);
}

if (contact) {
  const sheet = await page.evaluate(async ({ items, size }) => {
    const cols = 6, rows = Math.ceil(items.length / cols), zoom = 4;
    const c = document.createElement('canvas');
    c.width = cols * size * zoom; c.height = rows * size * zoom;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#14171b'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < items.length; i++) {
      const img = new Image();
      img.src = items[i].uri;
      await img.decode();
      g.drawImage(img, (i % cols) * size * zoom, Math.floor(i / cols) * size * zoom, size * zoom, size * zoom);
    }
    return c.toDataURL('image/png');
  }, { items: results, size: SIZE });
  mkdirSync(resolve(root, 'art/build'), { recursive: true });
  const dest = resolve(root, `art/build/contact${raw ? '-raw' : ''}.png`);
  writeFileSync(dest, Buffer.from(sheet.split(',')[1], 'base64'));
  console.log(`\ncontact sheet -> ${dest}`);
}

await browser.close();

const total = results.reduce((n, r) => n + r.bytes, 0);
const body = results.map((r) => `  '${r.id}': '${r.uri}',`).join('\n');
writeFileSync(OUT, `// GENERATED by tools/build-portraits.mjs — do not edit by hand.
//
// The full-size sources live in art/portraits/. Re-run the tool after
// changing any of them:
//
//     node tools/build-portraits.mjs
//
// Keys are '<npcId>-<mood>'. A character with no entry falls back to the
// procedural portrait in art-actors.js, so a missing or broken file costs
// one character's face rather than the game.
export const PORTRAIT_ART = {
${body}
};
`);

console.log(`\n${results.length} portraits, ${Math.round(total / 1024)} KB total -> ${OUT.replace(root + '/', '')}`);
