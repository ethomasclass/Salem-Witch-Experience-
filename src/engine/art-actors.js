// Character sprites and dialogue portraits.
//
// Proportions are deliberately less chibi than the GBA games this borrows
// from: 16x28 with roughly a 1:3.5 head-to-body ratio rather than Pokémon's
// ~1:2.5. Enough naturalism to carry adults, children and the elderly as
// visibly different bodies — Rebecca Nurse is 71 and Dorothy Good is 4, and
// the art has to be able to say so — without losing readability at 16px.
//
// Every actor is generated from one spec object, so the walking sprite and
// the close-up portrait always agree about who someone is.

import { surface, rect, px, hline, vline, ellipse, speckle, stroke } from './pixels.js';
import { P, FLESH, HAIR, CLOTH } from '../palette.js';

// 16x24 on a 16px tile. Taller than the tile so characters have presence,
// but not so tall that a player standing directly south of someone buries
// their skirt under the player's own head — the single most common framing
// in the game is exactly that, and at 28px it was unreadable.
export const SPR_W = 16, SPR_H = 24;
export const DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };

/* ---------------------------------------------------------------------- *
 * Walking sprite
 * ---------------------------------------------------------------------- */

function drawBody(g, sp, dir, step) {
  const { flesh, hair, coat, under, coif, hat, apron, collar, band } = sp;
  const child = sp.child ? 1 : 0;
  const stoop = sp.stoop ? 1 : 0;         // the elderly stand shorter

  const top = 2 + child * 4 + stoop;      // where the head starts
  const headH = child ? 6 : 7;
  const headW = child ? 7 : 8;
  const hx = Math.floor((SPR_W - headW) / 2);
  const shoulder = top + headH;
  const hipY = SPR_H - (child ? 6 : 8);

  // ---- legs / skirt ----------------------------------------------------
  if (sp.skirt) {
    // A gown to the ankle. Hem sways with the step, which is most of what
    // sells walking when you cannot animate legs.
    const sway = step === 1 ? -1 : step === 2 ? 1 : 0;
    for (let y = hipY - 4; y < SPR_H - 1; y++) {
      const t = (y - (hipY - 4)) / (SPR_H - 1 - (hipY - 4));
      const w = Math.round(6 + t * 6);
      const x = Math.floor((SPR_W - w) / 2) + Math.round(sway * t);
      rect(g, x, y, w, 1, sp.skirt[1]);
      px(g, x, y, sp.skirt[2]);
      px(g, x + w - 1, y, sp.skirt[2]);
    }
    // Fold shading.
    vline(g, SPR_W / 2 - 2, hipY - 2, SPR_H - hipY, sp.skirt[2]);
    vline(g, SPR_W / 2 + 1, hipY - 1, SPR_H - hipY - 1, sp.skirt[0]);
    // Shoes just visible under the hem.
    px(g, 6, SPR_H - 1, P.ink); px(g, 9, SPR_H - 1, P.ink);
  } else {
    // Breeches and stockings.
    const l = step === 1 ? 1 : 0, r = step === 2 ? 1 : 0;
    rect(g, 5, hipY, 3, 6 - l, under ? under[1] : coat[2]);
    rect(g, 8, hipY, 3, 6 - r, under ? under[1] : coat[2]);
    rect(g, 5, SPR_H - 2 - l, 3, 2, P.ink);
    rect(g, 8, SPR_H - 2 - r, 3, 2, P.ink);
  }

  // ---- torso -----------------------------------------------------------
  const torsoH = hipY - shoulder + 2;
  const tw = child ? 8 : 10;
  const tx = Math.floor((SPR_W - tw) / 2);
  rect(g, tx, shoulder, tw, torsoH, coat[1]);
  vline(g, tx, shoulder, torsoH, coat[2]);
  vline(g, tx + tw - 1, shoulder, torsoH, coat[2]);
  // Light from upper-left.
  rect(g, tx + 1, shoulder, 3, torsoH - 1, coat[0]);

  if (apron) {
    const aw = tw - 2;
    rect(g, tx + 1, shoulder + 3, aw, torsoH - 3, apron);
    vline(g, tx + 1, shoulder + 3, torsoH - 3, P.wallLo);
  }

  // Arms.
  const swing = step === 1 ? 1 : step === 2 ? -1 : 0;
  rect(g, tx - 2, shoulder + 1 + swing, 2, torsoH - 3, coat[2]);
  rect(g, tx + tw, shoulder + 1 - swing, 2, torsoH - 3, coat[2]);
  // Hands.
  px(g, tx - 2, shoulder + torsoH - 2 + swing, flesh[1]);
  px(g, tx + tw + 1, shoulder + torsoH - 2 - swing, flesh[1]);

  // Linen collar / falling band — the one bright note in most of these
  // outfits, and a class marker when it is large and starched.
  if (collar) {
    rect(g, tx + 1, shoulder, tw - 2, band ? 3 : 2, collar);
    hline(g, tx + 1, shoulder + (band ? 3 : 2), tw - 2, P.wallLo);
  }

  // ---- head ------------------------------------------------------------
  rect(g, hx, top, headW, headH, flesh[1]);
  rect(g, hx + 1, top, headW - 2, 1, flesh[0]);
  vline(g, hx, top + 1, headH - 1, flesh[2]);
  vline(g, hx + headW - 1, top + 1, headH - 1, flesh[2]);
  // Neck.
  rect(g, hx + 3, top + headH, 2, 1, flesh[2]);

  // Face, by facing.
  const ey = top + 3;
  if (dir === DIR.DOWN) {
    px(g, hx + 2, ey, P.ink); px(g, hx + headW - 3, ey, P.ink);
    if (!sp.child) px(g, hx + Math.floor(headW / 2), ey + 2, flesh[2]);
  } else if (dir === DIR.LEFT) {
    px(g, hx + 2, ey, P.ink);
    px(g, hx + 1, ey + 2, flesh[2]);
  } else if (dir === DIR.RIGHT) {
    px(g, hx + headW - 3, ey, P.ink);
    px(g, hx + headW - 2, ey + 2, flesh[2]);
  }

  // ---- hair, coif, hat -------------------------------------------------
  if (dir === DIR.UP) {
    // Back of the head: all hair, no face.
    rect(g, hx, top, headW, headH - 1, hair[1]);
    rect(g, hx + 1, top, headW - 2, 1, hair[0]);
  } else {
    rect(g, hx, top, headW, 2, hair[1]);
    rect(g, hx + 1, top, headW - 2, 1, hair[0]);
    if (dir === DIR.DOWN) {
      px(g, hx, top + 2, hair[2]); px(g, hx + headW - 1, top + 2, hair[2]);
    } else if (dir === DIR.LEFT) {
      rect(g, hx + headW - 2, top, 2, 4, hair[1]);
    } else {
      rect(g, hx, top, 2, 4, hair[1]);
    }
  }

  if (coif) {
    // Linen coif — near-universal for women and girls, indoors and out.
    rect(g, hx - 1, top - 1, headW + 2, 4, coif);
    hline(g, hx - 1, top - 1, headW + 2, P.wallLo);
    if (dir !== DIR.UP) {
      px(g, hx - 1, top + 3, coif); px(g, hx + headW, top + 3, coif);
    } else {
      rect(g, hx - 1, top - 1, headW + 2, headH, coif);
      hline(g, hx - 1, top + headH - 1, headW + 2, P.wallLo);
    }
  }

  if (hat) {
    // Broad-brimmed felt. Not the buckled cone of later cartoons — that is a
    // 19th-century invention, and getting it right is a free history lesson.
    rect(g, hx - 3, top - 1, headW + 6, 2, hat);
    hline(g, hx - 3, top + 1, headW + 6, P.ink);
    rect(g, hx, top - 4, headW, 4, hat);
    rect(g, hx + 1, top - 4, headW - 2, 1, P.wallDeep);
  }
}

/** Build all frames for one actor: [dir][frame] -> surface. */
export function buildActor(spec) {
  const sp = normalize(spec);
  const frames = [];
  for (let d = 0; d < 4; d++) {
    const row = [];
    for (let f = 0; f < 3; f++) {
      const s = surface(SPR_W, SPR_H + 3);
      ellipse(s.g, SPR_W / 2, SPR_H, 6, 2, P.shadow);
      drawBody(s.g, sp, d, f);
      row.push(s);
    }
    frames.push(row);
  }
  return frames;
}

function normalize(spec) {
  return {
    flesh: spec.flesh || FLESH.fair,
    hair: spec.hair || HAIR.dark,
    coat: spec.coat || CLOTH.russet,
    under: spec.under || null,
    skirt: spec.skirt || null,
    apron: spec.apron || null,
    coif: spec.coif || null,
    hat: spec.hat || null,
    collar: spec.collar || null,
    band: spec.band || false,
    child: !!spec.child,
    stoop: !!spec.stoop,
  };
}

/* ---------------------------------------------------------------------- *
 * Portrait
 *
 * The design doc is explicit that a four-line dialogue box cannot show
 * someone reacting. These are head-and-shoulders at 64x64, drawn from the
 * same spec as the walking sprite, with an `mood` variant so a character can
 * visibly harden between March and September.
 * ---------------------------------------------------------------------- */

export const PORTRAIT = 64;

export function buildPortrait(spec, mood = 'neutral') {
  const sp = normalize(spec);
  const s = surface(PORTRAIT, PORTRAIT);
  const g = s.g;
  const C = PORTRAIT / 2;

  // Backdrop: a cold vignette so pale faces still separate from the box.
  rect(g, 0, 0, PORTRAIT, PORTRAIT, '#3b3f46');
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    rect(g, 0, i * 6, PORTRAIT, 6, `rgba(20,22,26,${0.05 + t * 0.16})`);
  }

  const scale = sp.child ? 0.88 : 1;
  const headW = Math.round(29 * scale), headH = Math.round(34 * scale);
  const hx = C - Math.round(headW / 2);
  const hy = 13;

  // ---- shoulders -------------------------------------------------------
  const shY = hy + headH + 3;
  ellipse(g, C, shY + 16, 26, 16, sp.coat[2]);
  ellipse(g, C, shY + 15, 25, 15, sp.coat[1]);
  ellipse(g, C - 7, shY + 14, 12, 10, sp.coat[0]);
  if (sp.collar) {
    ellipse(g, C, shY + 2, sp.band ? 17 : 13, sp.band ? 8 : 6, sp.collar);
    ellipse(g, C, shY + 1, sp.band ? 16 : 12, sp.band ? 7 : 5, '#e8e2d2');
  }
  // Neck.
  rect(g, C - 5, hy + headH - 4, 10, 8, sp.flesh[2]);
  rect(g, C - 4, hy + headH - 4, 8, 6, sp.flesh[1]);

  // ---- head ------------------------------------------------------------
  ellipse(g, C, hy + headH / 2, headW / 2 + 1, headH / 2 + 1, P.outline);
  ellipse(g, C, hy + headH / 2, headW / 2, headH / 2, sp.flesh[1]);
  // Light from upper-left.
  ellipse(g, C - 4, hy + headH / 2 - 4, headW / 2 - 4, headH / 2 - 5, sp.flesh[0]);
  // Jaw and cheek shadow.
  ellipse(g, C + 5, hy + headH / 2 + 4, 7, 8, sp.flesh[2]);

  // ---- features --------------------------------------------------------
  const ey = hy + Math.round(headH * 0.46);
  const eo = Math.round(headW * 0.22);

  // Brow: the single most expressive line at this size.
  const browY = ey - 4 + (mood === 'hard' ? 1 : 0);
  hline(g, C - eo - 3, browY - (mood === 'hard' ? 0 : 1), 6, sp.hair[2]);
  hline(g, C + eo - 2, browY - (mood === 'hard' ? 0 : 1), 6, sp.hair[2]);
  if (mood === 'hard') {
    px(g, C - eo + 2, browY + 1, sp.hair[2]);
    px(g, C + eo - 2, browY + 1, sp.hair[2]);
  }

  // Eyes.
  for (const sx of [C - eo, C + eo]) {
    rect(g, sx - 2, ey, 5, 3, '#efe9df');
    rect(g, sx, ey, 2, 3, P.ink);
    px(g, sx, ey, '#7f8a92');
    hline(g, sx - 2, ey - 1, 5, sp.flesh[2]);
  }

  // Nose and mouth.
  vline(g, C, ey + 3, 4, sp.flesh[2]);
  px(g, C - 1, ey + 6, sp.flesh[2]);
  const mY = ey + 10;
  if (mood === 'hard') hline(g, C - 4, mY, 8, '#8a6154');
  else { hline(g, C - 3, mY, 7, '#8a6154'); px(g, C - 4, mY - 1, sp.flesh[2]); }

  // Age lines.
  if (sp.stoop) {
    hline(g, C - 10, ey - 7, 5, sp.flesh[2]);
    hline(g, C + 6, ey - 7, 5, sp.flesh[2]);
    hline(g, C - 8, mY + 4, 4, sp.flesh[2]);
    hline(g, C + 5, mY + 4, 4, sp.flesh[2]);
  }

  // ---- hair ------------------------------------------------------------
  ellipse(g, C, hy + 6, headW / 2 + 1, 8, sp.hair[1]);
  ellipse(g, C - 4, hy + 4, headW / 2 - 4, 5, sp.hair[0]);
  rect(g, hx - 1, hy + 5, 3, Math.round(headH * 0.55), sp.hair[1]);
  rect(g, hx + headW - 2, hy + 5, 3, Math.round(headH * 0.55), sp.hair[2]);

  if (sp.coif) {
    // A linen coif sits BACK on the head. If it covers the whole crown it
    // stops reading as cloth and starts reading as white hair, so the cap
    // stops short and a band of the wearer's own hair shows beneath it.
    ellipse(g, C, hy - 1, headW / 2 + 4, 12, P.outline);
    ellipse(g, C, hy - 1, headW / 2 + 3, 11, sp.coif);
    ellipse(g, C - 5, hy - 4, headW / 2 - 4, 6, '#eee9dc');   // catchlight
    // Hem of the cap, so the front edge has a visible thickness.
    ellipse(g, C, hy + 9, headW / 2 + 3, 3, P.wallLo);
    ellipse(g, C, hy + 8, headW / 2 + 3, 3, sp.coif);
    // Lappets falling past the jaw.
    rect(g, hx - 4, hy + 2, 4, 18, sp.coif);
    rect(g, hx + headW, hy + 2, 4, 18, sp.coif);
    vline(g, hx - 4, hy + 2, 18, P.outline);
    vline(g, hx + headW + 3, hy + 2, 18, P.outline);
    vline(g, hx - 1, hy + 2, 18, P.wallLo);
    vline(g, hx + headW, hy + 2, 18, P.wallLo);
  }
  if (sp.hat) {
    rect(g, C - 24, hy + 1, 48, 4, sp.hat);
    stroke(g, C - 24, hy + 1, 48, 4, P.ink);
    rect(g, hx - 1, hy - 11, headW + 2, 13, sp.hat);
    stroke(g, hx - 1, hy - 11, headW + 2, 13, P.ink);
    rect(g, hx, hy - 10, headW - 4, 2, '#4a4640');
  }

  speckle(g, 0, 0, PORTRAIT, PORTRAIT, 'rgba(255,255,255,0.03)', 0.05, 313);
  stroke(g, 0, 0, PORTRAIT, PORTRAIT, P.ink);
  return s;
}

/* ---------------------------------------------------------------------- *
 * The player
 *
 * A student from the present, in modern clothes, walking around 1692. The
 * visual mismatch is intentional and permanent: they never blend in, and by
 * September that is the point.
 * ---------------------------------------------------------------------- */

export const PLAYER_SPEC = {
  flesh: FLESH.olive,
  hair: HAIR.dark,
  coat: ['#4a6d8c', '#3b5871', '#2c4356'],   // a blue hoodie
  under: ['#3a3f4a', '#2f333c', '#24272e'],  // jeans
  collar: null,
};
