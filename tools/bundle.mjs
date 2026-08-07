// Bundle the game into a single self-contained HTML file.
//
// The game is authored as ES modules, which is the right shape for editing
// but means it has to be served over http. This produces one file that runs
// anywhere — opened straight off a USB stick, dropped into an LMS, or
// embedded in a host page that will not serve a directory of modules.
//
// There is no build tooling involved: the modules are concatenated in
// dependency order and the import/export keywords stripped, which works
// because every top-level name in the project is already unique.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Dependency order. Top-level `const` is not hoisted, so a module must
// appear after anything it reads at evaluation time.
const ORDER = [
  'src/palette.js',
  'src/engine/pixels.js',
  'src/engine/art-ground.js',
  'src/engine/art-props.js',
  'src/engine/art-actors.js',
  'src/engine/state.js',
  'src/engine/dialogue.js',
  'src/engine/input.js',
  'src/content/knowledge.js',
  'src/content/clues.js',
  'src/content/npcs.js',
  'src/content/maps.js',
  'src/engine/world.js',
  'src/engine/ui.js',
  'src/main.js',
];

function strip(src) {
  return src
    // import { a, b } from '...';  (including multi-line forms)
    .replace(/^\s*import\s+[\s\S]*?from\s*['"][^'"]+['"]\s*;?\s*$/gm, '')
    // bare side-effect imports
    .replace(/^\s*import\s*['"][^'"]+['"]\s*;?\s*$/gm, '')
    // export const / function / class / let
    .replace(/^\s*export\s+(?=(const|let|var|function|class|async)\b)/gm, '')
    // export { ... };
    .replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');
}

const chunks = ORDER.map((rel) => {
  const src = readFileSync(resolve(root, rel), 'utf8');
  return `/* ===== ${rel} ===== */\n${strip(src).trim()}\n`;
});

const js = chunks.join('\n');

// Sanity: nothing should survive that a plain <script> cannot parse.
for (const bad of [/^\s*import\s/m, /^\s*export\s/m]) {
  const m = js.match(bad);
  if (m) throw new Error(`bundle still contains a module keyword near: ${JSON.stringify(js.slice(m.index, m.index + 80))}`);
}

const html = readFileSync(resolve(root, 'index.html'), 'utf8');

// Take the page apart: keep the style block and the markup, drop the module
// script tags and the "serve me over http" notice the bundle makes moot.
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body = html
  .match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<div id="nomodule">[\s\S]*?<\/div>/, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .trim();

// Two output shapes:
//
//   default     a complete standalone document — double-clickable, works off
//               a USB stick or inside an LMS file upload
//   --fragment  no doctype/html/head, for hosts that supply their own shell
//
// The distinction matters more than it looks: the viewport meta lives in
// <head>, and without it a phone lays the page out at a 980px fallback
// width and the canvas sizes itself against a viewport that isn't there.
const fragment = process.argv.includes('--fragment');

const inner = `<title>Salem Village, 1692</title>
<style>
${style.trim()}
</style>

${body}

<script>
${js}
</script>
`;

const out = fragment ? inner : `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="A thirty-minute walk through a village coming apart. High school US History.">
</head>
<body>
${inner}</body>
</html>
`;

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dest = resolve(root, args[0] || 'dist/salem-village-1692.html');
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, out);
console.log(`wrote ${dest}  (${(out.length / 1024).toFixed(0)} KB)${fragment ? ' [fragment]' : ''}`);
