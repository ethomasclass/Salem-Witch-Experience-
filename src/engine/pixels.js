// Low-level pixel-art helpers.
//
// Everything in this game is drawn procedurally into offscreen canvases once
// at boot, then blitted. No image assets to load, no CORS, no sprite sheet to
// keep in sync — which matters when the deploy target is a school Chromebook
// on a filtered network that may or may not let a .png through.

/** Create an offscreen canvas with image smoothing off. */
export function surface(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return { canvas: c, g, w, h };
}

/** Deterministic hash -> [0,1). Used for texture variation that must not
 *  shimmer between frames, so never use Math.random() for anything drawn. */
export function hash(x, y, seed = 0) {
  let h = x * 374761393 + y * 668265263 + seed * 1274126177;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Filled rect, integer-snapped. */
export function rect(g, x, y, w, h, color) {
  g.fillStyle = color;
  g.fillRect(x | 0, y | 0, w | 0, h | 0);
}

/** Single pixel. */
export function px(g, x, y, color) {
  g.fillStyle = color;
  g.fillRect(x | 0, y | 0, 1, 1);
}

/** 1px hollow rect — the outline pass that sells the 16-bit look. */
export function stroke(g, x, y, w, h, color) {
  rect(g, x, y, w, 1, color);
  rect(g, x, y + h - 1, w, 1, color);
  rect(g, x, y, 1, h, color);
  rect(g, x + w - 1, y, 1, h, color);
}

/** Horizontal 1px line. */
export function hline(g, x, y, w, color) { rect(g, x, y, w, 1, color); }

/** Vertical 1px line. */
export function vline(g, x, y, h, color) { rect(g, x, y, 1, h, color); }

/** Bresenham line, for roof rakes and branches. */
export function line(g, x0, y0, x1, y1, color) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    px(g, x0, y0, color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/** Filled ellipse, pixel-stepped so it keeps hard edges. */
export function ellipse(g, cx, cy, rx, ry, color) {
  g.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const t = 1 - (y * y) / (ry * ry);
    if (t < 0) continue;
    const w = Math.round(rx * Math.sqrt(t));
    if (w <= 0) continue;
    g.fillRect((cx - w) | 0, (cy + y) | 0, w * 2, 1);
  }
}

/** 50% checker dither between two colours — the classic way to fake a shade
 *  between two ramp steps without spending a palette slot on it. */
export function dither(g, x, y, w, h, a, b, phase = 0) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      px(g, x + i, y + j, ((i + j + phase) & 1) ? b : a);
    }
  }
}

/** Sparse speckle, seeded. Density is 0..1. Used for grass tufts, gravel,
 *  shingle wear — anything that should look hand-placed but stay stable. */
export function speckle(g, x, y, w, h, color, density, seed = 0) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (hash(x + i, y + j, seed) < density) px(g, x + i, y + j, color);
    }
  }
}

/** Draw an existing surface into a 2d context at integer coords. */
export function blit(g, src, x, y) {
  g.drawImage(src.canvas, x | 0, y | 0);
}

/** Tint an entire surface by compositing a colour over its opaque pixels.
 *  Used for the night/indoor mood shift without a second set of art. */
export function tint(surf, color, alpha) {
  const { g, w, h } = surf;
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  g.restore();
}

/** Build a surface from a string-art grid. `key` maps chars to colours;
 *  space and '.' are transparent. Lets small sprites be authored as legible
 *  ASCII rather than a hundred rect() calls. */
export function fromArt(rows, key, scale = 1) {
  const h = rows.length, w = rows[0].length;
  const s = surface(w * scale, h * scale);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === ' ' || ch === '.') continue;
      const c = key[ch];
      if (!c) continue;
      rect(s.g, x * scale, y * scale, scale, scale, c);
    }
  }
  return s;
}
