// UI: dialogue box, choice menu, notebook, title.
//
// Deliberate split of resolutions. The world renders into a 320x240 buffer
// and is scaled up with nearest-neighbour so the pixel art stays crunchy.
// The UI draws afterwards at full display resolution with real font
// rendering. This game is 95% dialogue and it is going on a Chromebook in a
// classroom — chunky upscaled text would be authentic and also genuinely
// harder to read for thirty minutes straight. Portraits stay pixel-scaled so
// they still belong to the world.

import { P } from '../palette.js';

/** Greedy word wrap against a measured width. */
export function wrapText(g, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (g.measureText(trial).width <= maxWidth || !line) {
      line = trial;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function panel(g, x, y, w, h, s) {
  // Two-tone parchment panel with a dark rule and an inner hairline.
  g.fillStyle = 'rgba(16,16,20,0.35)';
  g.fillRect(x + 3 * s, y + 3 * s, w, h);
  g.fillStyle = P.boxFill;
  g.fillRect(x, y, w, h);
  g.fillStyle = P.boxFill2;
  g.fillRect(x, y + h - 4 * s, w, 4 * s);
  g.strokeStyle = P.boxEdge;
  g.lineWidth = Math.max(2, 2 * s);
  g.strokeRect(x + s, y + s, w - 2 * s, h - 2 * s);
  g.strokeStyle = 'rgba(58,54,48,0.30)';
  g.lineWidth = 1;
  g.strokeRect(x + 4 * s, y + 4 * s, w - 8 * s, h - 8 * s);
}

export const DIALOGUE_FONT = (s) =>
  `${11.5 * s}px Georgia, "Iowan Old Style", Palatino, serif`;

/**
 * Geometry for the dialogue box, and the wrapped lines for a given string.
 *
 * Kept separate from drawing so the game loop can paginate: a lot of the
 * writing in this game runs longer than four lines, and reflowing text
 * mid-typewriter looks broken. Wrap once, page through, reveal per page.
 */
export function dialogueLayout(g, view, s, text, hasPortrait) {
  const pad = 8 * s;
  const boxH = 88 * s;
  const bx = view.x + pad;
  const by = view.y + view.h - boxH - pad;
  const bw = view.w - pad * 2;

  const bodyX = hasPortrait ? bx + 74 * s : bx + 14 * s;
  const bodyW = (hasPortrait ? bw - 88 * s : bw - 28 * s);
  const lineH = 15 * s;
  const maxLines = Math.max(1, Math.floor((boxH - 26 * s) / lineH));

  g.font = DIALOGUE_FONT(s);
  const lines = text ? wrapText(g, text, bodyW) : [];

  const pages = [];
  for (let i = 0; i < lines.length; i += maxLines) pages.push(lines.slice(i, i + maxLines));
  if (!pages.length) pages.push([]);

  return { bx, by, bw, boxH, bodyX, bodyW, lineH, maxLines, lines, pages };
}

/**
 * The dialogue box.
 *
 * @param d  { who, portrait, page: string[], revealed, done, more }
 */
export function drawDialogue(g, view, s, L, d) {
  panel(g, L.bx, L.by, L.bw, L.boxH, s);

  // Portrait, pixel-scaled so it still belongs to the world art.
  if (d.portrait) {
    const size = 62 * s;
    const px0 = L.bx + 8 * s;
    const py0 = L.by - size + 16 * s;
    g.fillStyle = P.boxEdge;
    g.fillRect(px0 - 2 * s, py0 - 2 * s, size + 4 * s, size + 4 * s);
    g.imageSmoothingEnabled = false;
    g.drawImage(d.portrait.canvas, px0, py0, size, size);
  }

  // Name plate rides the box's top edge.
  if (d.who) {
    g.font = `700 ${10.5 * s}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    const nameW = g.measureText(d.who).width + 16 * s;
    const nx = d.portrait ? L.bx + 74 * s : L.bx + 10 * s;
    g.fillStyle = P.boxEdge;
    g.fillRect(nx, L.by - 10 * s, nameW, 20 * s);
    g.fillStyle = P.boxFill;
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(d.who, nx + 8 * s, L.by);
  }

  // Body. Serif — this is a game about the seventeenth century and the voice
  // should not sound like a UI string.
  g.font = DIALOGUE_FONT(s);
  g.fillStyle = d.who ? P.boxInk : P.boxDim;   // narration reads quieter
  if (!d.who) g.font = `italic ${11.5 * s}px Georgia, Palatino, serif`;
  g.textAlign = 'left';
  g.textBaseline = 'top';

  let budget = d.revealed;
  let ty = L.by + 15 * s;
  for (const line of d.page) {
    if (budget <= 0) break;
    g.fillText(line.slice(0, budget), L.bodyX, ty);
    budget -= line.length + 1;
    ty += L.lineH;
  }

  // Advance caret.
  if (d.done) {
    const cx = L.bx + L.bw - 20 * s;
    const cy = L.by + L.boxH - 15 * s + Math.sin(Date.now() / 220) * 1.5 * s;
    g.fillStyle = P.accent;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + 9 * s, cy);
    g.lineTo(cx + 4.5 * s, cy + 6 * s);
    g.closePath();
    g.fill();
    if (d.more) {
      g.font = `${8.5 * s}px system-ui, sans-serif`;
      g.fillStyle = P.boxDim;
      g.textAlign = 'right';
      g.fillText('more', cx - 6 * s, cy - 2 * s);
    }
  }
}

/** Choice menu, anchored above the dialogue box. */
export function drawChoices(g, view, s, options, index) {
  g.font = `${12 * s}px Georgia, "Iowan Old Style", Palatino, serif`;
  let maxW = 0;
  for (const o of options) maxW = Math.max(maxW, g.measureText(o.label).width);

  const rowH = 22 * s;
  const bw = Math.min(view.w - 32 * s, maxW + 48 * s);
  const bh = options.length * rowH + 16 * s;
  const bx = view.x + view.w - bw - 16 * s;
  const by = view.y + view.h - 88 * s - 14 * s - bh;

  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.textBaseline = 'middle';
  options.forEach((o, i) => {
    const y = by + 8 * s + rowH * i + rowH / 2;
    if (i === index) {
      g.fillStyle = 'rgba(125,63,44,0.14)';
      g.fillRect(bx + 8 * s, y - rowH / 2 + 2 * s, bw - 16 * s, rowH - 4 * s);
      g.fillStyle = P.accent;
      g.beginPath();
      g.moveTo(bx + 16 * s, y - 5 * s);
      g.lineTo(bx + 22 * s, y);
      g.lineTo(bx + 16 * s, y + 5 * s);
      g.closePath();
      g.fill();
    }
    g.fillStyle = i === index ? P.boxInk : P.boxDim;
    g.fillText(o.label, bx + 30 * s, y);
  });

  return { bx, by, bw, bh, rowH };
}

/** A small transient line at the top of the screen — used when the player
 *  examines something and learns from it. */
export function drawToast(g, view, s, text, alpha) {
  if (alpha <= 0) return;
  g.save();
  g.globalAlpha = Math.min(1, alpha);
  // Tucked under the place-name label rather than beside it — some map
  // names are long, and "Salem Witch Trials Memorial" collides with
  // anything sharing that line.
  g.font = `600 ${8.5 * s}px system-ui, -apple-system, sans-serif`;
  const w = g.measureText(text).width + 20 * s;
  const h = 17 * s;
  const x = view.x + 8 * s;
  const y = view.y + 30 * s;
  g.fillStyle = 'rgba(26,26,30,0.88)';
  g.fillRect(x, y, w, h);
  g.fillStyle = P.accent;
  g.fillRect(x, y, 2.5 * s, h);
  g.fillStyle = '#efeade';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, x + w / 2 + 1 * s, y + h / 2);
  g.restore();
}

/**
 * The notebook. Everything the player has learned, in the order they learned
 * it, with who told them. This is the spine of the exit artifact — the design
 * doc is firm that without something the teacher can collect, this is a fun
 * thirty minutes with no assessment hook.
 */
export function drawNotebook(g, view, s, entries, scroll, sourceName) {
  g.fillStyle = 'rgba(12,12,16,0.72)';
  g.fillRect(view.x, view.y, view.w, view.h);

  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bw = view.w - 40 * s, bh = view.h - 40 * s;
  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.font = `700 ${13 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  g.textBaseline = 'top';
  g.fillText('What I have seen and been told', bx + 18 * s, by + 14 * s);

  g.font = `${8.5 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText('X or Esc to close  ·  ↑ ↓ to scroll', bx + 18 * s, by + 31 * s);

  const top = by + 46 * s;
  const bottom = by + bh - 12 * s;

  g.strokeStyle = 'rgba(58,54,48,0.35)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(bx + 18 * s, top - 8 * s);
  g.lineTo(bx + bw - 18 * s, top - 8 * s);
  g.stroke();

  if (!entries.length) {
    g.font = `italic ${11 * s}px Georgia, serif`;
    g.fillStyle = P.boxDim;
    g.fillText('Nothing yet. Go and talk to someone.', bx + 18 * s, top + 6 * s);
    return;
  }

  // Clip to the panel so a long list scrolls under the frame instead of
  // spilling out over the darkened world behind it.
  g.save();
  g.beginPath();
  g.rect(bx + 8 * s, top - 4 * s, bw - 16 * s, bottom - top + 4 * s);
  g.clip();

  const textW = bw - 52 * s;
  const lineH = 13 * s;
  const bodyFont = `${10.5 * s}px Georgia, serif`;
  const srcFont = `${8.5 * s}px system-ui, sans-serif`;

  let y = top - scroll;
  let contentH = 0;

  for (const e of entries) {
    g.font = bodyFont;
    const lines = wrapText(g, e.text, textW);
    const blockH = lines.length * lineH + 13 * s + 10 * s;

    if (y + blockH > top - 20 * s && y < bottom + 20 * s) {
      g.font = bodyFont;
      g.fillStyle = P.boxInk;
      let ly = y;
      for (const l of lines) { g.fillText(l, bx + 32 * s, ly); ly += lineH; }

      g.font = srcFont;
      g.fillStyle = P.boxDim;
      g.fillText(sourceName(e.source), bx + 32 * s, ly + 1 * s);

      g.fillStyle = P.accent;
      g.fillRect(bx + 20 * s, y + 4 * s, 4 * s, 4 * s);
    }
    y += blockH;
    contentH += blockH;
  }
  g.restore();

  // Scroll affordance when there is more below.
  const maxScroll = Math.max(0, contentH - (bottom - top));
  if (scroll < maxScroll - 1) {
    g.fillStyle = P.boxDim;
    g.textAlign = 'center';
    g.font = `${9 * s}px system-ui, sans-serif`;
    g.fillText('▼ more', bx + bw / 2, bottom - 2 * s);
  }
  return maxScroll;
}

/**
 * The objective HUD.
 *
 * One line, top-right, in the yellow every game has used for "here is what
 * to do next" since the nineties — because that convention is doing real
 * work for a student who has never played anything like this. Below it, once
 * the memorial has raised it, the standing question in a quieter colour.
 *
 * Deliberately not a quest log: one step at a time, no checklist, nothing
 * that looks like a worksheet.
 */
export function drawObjective(g, view, s, { step, standing, progress, sub, flash }) {
  const pad = 8 * s;
  const right = view.x + view.w - pad;
  // Hard cap, so a long goal wraps instead of spanning the whole screen and
  // colliding with the place-name label in the opposite corner.
  const maxW = Math.min(132 * s, view.w * 0.38);
  let y = view.y + pad;

  g.textAlign = 'right';
  g.textBaseline = 'top';

  if (step) {
    const bodyFont = `600 ${7 * s}px system-ui, -apple-system, sans-serif`;
    g.font = bodyFont;
    const lines = wrapText(g, step.text, maxW);
    let textW = 0;
    for (const l of lines) textW = Math.max(textW, g.measureText(l).width);

    const lineH = 9.5 * s;
    const boxW = textW + 16 * s;
    const boxH = 13 * s + lines.length * lineH;

    g.fillStyle = 'rgba(14,16,20,0.72)';
    g.fillRect(right - boxW, y, boxW, boxH);
    g.fillStyle = flash > 0 ? '#f6e8b8' : '#e8c46a';
    g.fillRect(right - boxW, y, 2 * s, boxH);

    g.font = `700 ${5.5 * s}px system-ui, -apple-system, sans-serif`;
    g.fillStyle = '#8d939b';
    // The sub-count matters more than the step count: "2 of 4" is what tells
    // a player their last five minutes counted for something.
    const tail = sub ? `   ${sub[0]} of ${sub[1]}` : '';
    g.fillText(`GOAL  ${progress.done}/${progress.total}${tail}`, right - 8 * s, y + 4 * s);

    g.font = bodyFont;
    // A brief pale flash when a goal completes, then back to steady yellow.
    g.fillStyle = flash > 0 ? '#fff6d8' : '#e8c46a';
    let ly = y + 12 * s;
    for (const l of lines) { g.fillText(l, right - 8 * s, ly); ly += lineH; }
    y += boxH + 4 * s;
  }

  if (standing) {
    g.font = `italic ${7.5 * s}px Georgia, Palatino, serif`;
    const w = g.measureText(standing).width + 14 * s;
    const h = 13 * s;
    g.fillStyle = 'rgba(14,16,20,0.58)';
    g.fillRect(right - w, y, w, h);
    g.fillStyle = '#b9a06a';
    g.fillText(standing, right - 8 * s, y + 3 * s);
  }
}

/**
 * The document reader.
 *
 * One of the two screens the design doc says this game needs that Pokémon
 * never had: original text on one side, a plain modern gloss on the other,
 * full screen, with the citation and — deliberately — a fidelity label. A
 * student noticing that some sources are transcriptions and some are
 * reconstructions is a student doing source criticism.
 *
 * It is a reader, not a graphic organiser. No fields, no prompts, nothing to
 * fill in.
 */
export function drawReader(g, view, s, doc, fidelityLabel, scroll, copied) {
  g.fillStyle = 'rgba(10,10,13,0.9)';
  g.fillRect(view.x, view.y, view.w, view.h);

  const bx = view.x + 12 * s, by = view.y + 12 * s;
  const bw = view.w - 24 * s, bh = view.h - 24 * s;
  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.textBaseline = 'top';

  // --- header ---------------------------------------------------------
  g.font = `700 ${13 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  g.fillText(doc.title, bx + 16 * s, by + 12 * s);

  g.font = `${8.5 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText(`${doc.date}  ·  ${doc.kind}`, bx + 16 * s, by + 30 * s);

  g.textAlign = 'right';
  g.fillStyle = '#5d7a4a';
  g.fillText('✓ copied into your notebook', bx + bw - 16 * s, by + 30 * s);
  g.textAlign = 'left';

  const ruleY = by + 44 * s;
  g.strokeStyle = 'rgba(58,54,48,0.4)';
  g.lineWidth = 1;
  g.beginPath(); g.moveTo(bx + 16 * s, ruleY); g.lineTo(bx + bw - 16 * s, ruleY); g.stroke();

  // --- two columns ----------------------------------------------------
  const colGap = 18 * s;
  const colW = (bw - 32 * s - colGap) / 2;
  const leftX = bx + 16 * s;
  const rightX = leftX + colW + colGap;
  const top = ruleY + 12 * s;
  const bottom = by + bh - 26 * s;

  g.save();
  g.beginPath();
  g.rect(bx + 8 * s, top - 6 * s, bw - 16 * s, bottom - top + 6 * s);
  g.clip();

  // Original: monospaced, because the layout of a ledger or a warrant is
  // part of what it is saying.
  const monoH = 10 * s;
  g.font = `${7.5 * s}px ui-monospace, Menlo, Consolas, monospace`;
  g.fillStyle = '#3f3a32';
  let ly = top - scroll;
  for (const line of doc.original) { g.fillText(line, leftX, ly); ly += monoH; }

  // Gloss: serif, plain modern English, wrapped.
  g.font = `${10 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  let ry = top - scroll;
  for (const para of doc.gloss) {
    if (!para) { ry += 8 * s; continue; }
    for (const l of wrapText(g, para, colW)) { g.fillText(l, rightX, ry); ry += 13 * s; }
  }
  g.restore();

  const contentH = Math.max(doc.original.length * monoH, ry + scroll - top);
  const maxScroll = Math.max(0, contentH - (bottom - top));

  // --- footer ---------------------------------------------------------
  g.font = `${7 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  const foot = `${fidelityLabel}  ·  ${doc.cite}`;
  const footLines = wrapText(g, foot, bw - 32 * s);
  let fy = by + bh - 12 * s - footLines.length * 9 * s;
  g.beginPath(); g.moveTo(bx + 16 * s, fy - 6 * s); g.lineTo(bx + bw - 16 * s, fy - 6 * s); g.stroke();
  for (const l of footLines) { g.fillText(l, bx + 16 * s, fy); fy += 9 * s; }

  if (maxScroll > 0) {
    g.textAlign = 'right';
    g.fillStyle = P.accent;
    g.fillText(scroll < maxScroll - 1 ? '↓ more' : '↑ back to the top', bx + bw - 16 * s, by + bh - 12 * s - 9 * s);
    g.textAlign = 'left';
  }
  g.font = `${7 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText('Z or X to close', bx + 16 * s, by + 12 * s + 2 * s);

  return maxScroll;
}

/** The notebook's document tab: what the player has copied down. */
export function drawDocTab(g, view, s, docs, scroll, total) {
  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bw = view.w - 40 * s, bh = view.h - 40 * s;

  g.textAlign = 'left';
  g.textBaseline = 'top';
  const top = by + 46 * s;
  const bottom = by + bh - 12 * s;

  if (!docs.length) {
    g.font = `italic ${11 * s}px Georgia, serif`;
    g.fillStyle = P.boxDim;
    g.fillText('Nothing copied yet. Papers you find can be copied down.',
               bx + 18 * s, top + 6 * s);
    return 0;
  }

  g.save();
  g.beginPath();
  g.rect(bx + 8 * s, top - 4 * s, bw - 16 * s, bottom - top + 4 * s);
  g.clip();

  let y = top - scroll;
  let contentH = 0;
  for (const d of docs) {
    const blockH = 30 * s;
    if (y + blockH > top - 20 * s && y < bottom + 20 * s) {
      g.font = `600 ${11 * s}px Georgia, serif`;
      g.fillStyle = P.boxInk;
      g.fillText(d.title, bx + 32 * s, y);
      g.font = `${8.5 * s}px system-ui, sans-serif`;
      g.fillStyle = P.boxDim;
      g.fillText(`${d.date} · ${d.kind}`, bx + 32 * s, y + 14 * s);
      g.fillStyle = P.accent;
      g.fillRect(bx + 20 * s, y + 4 * s, 4 * s, 4 * s);
    }
    y += blockH;
    contentH += blockH;
  }
  g.restore();

  return Math.max(0, contentH - (bottom - top));
}

/** The two tabs across the top of the notebook. */
export function drawNotebookTabs(g, view, s, tab, docCount, docTotal) {
  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const labels = ['What I was told', `What I copied down   ${docCount}/${docTotal}`];
  g.font = `600 ${9 * s}px system-ui, sans-serif`;
  g.textAlign = 'left';
  g.textBaseline = 'top';
  let x = bx + 18 * s;
  const y = by + 30 * s;
  labels.forEach((label, i) => {
    const w = g.measureText(label).width;
    g.fillStyle = i === tab ? P.boxInk : P.boxDim;
    g.fillText(label, x, y);
    if (i === tab) {
      g.fillStyle = P.accent;
      g.fillRect(x, y + 13 * s, w, 2 * s);
    }
    x += w + 26 * s;
  });
}

/**
 * The closing screen. The game asks its question once, takes whatever the
 * player types, and does not respond to it.
 */
export function drawAnswer(g, view, s, text, caret) {
  g.fillStyle = 'rgba(8,9,12,0.94)';
  g.fillRect(view.x, view.y, view.w, view.h);

  const bx = view.x + 26 * s, by = view.y + 26 * s;
  const bw = view.w - 52 * s, bh = view.h - 52 * s;
  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.font = `700 ${17 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  g.fillText('What caused it?', bx + 22 * s, by + 22 * s);

  g.font = `italic ${9.5 * s}px Georgia, serif`;
  g.fillStyle = P.boxDim;
  const intro = 'Write what you think. There is no right answer and nothing here is scored. '
              + 'Use what you saw and what you were told, and say which of it you trust.';
  let iy = by + 48 * s;
  for (const l of wrapText(g, intro, bw - 44 * s)) { g.fillText(l, bx + 22 * s, iy); iy += 13 * s; }

  const fx = bx + 22 * s, fy = iy + 12 * s;
  const fw = bw - 44 * s, fh = bh - (fy - by) - 44 * s;
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fillRect(fx, fy, fw, fh);
  g.strokeStyle = P.boxEdge;
  g.lineWidth = Math.max(1, s);
  g.strokeRect(fx, fy, fw, fh);

  g.font = `${11 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  let ty = fy + 10 * s;
  const lines = text ? wrapText(g, text, fw - 20 * s) : [''];
  for (const l of lines.slice(-Math.floor((fh - 20 * s) / (14 * s)))) {
    g.fillText(l, fx + 10 * s, ty); ty += 14 * s;
  }
  if (caret) {
    const last = lines[lines.length - 1] || '';
    g.fillStyle = P.accent;
    g.fillRect(fx + 10 * s + g.measureText(last).width + 1 * s, ty - 14 * s, 2 * s, 12 * s);
  }

  g.font = `${8.5 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.textAlign = 'right';
  g.fillText(text.trim() ? 'Enter to finish' : 'Type your answer',
             bx + bw - 22 * s, by + bh - 24 * s);
  g.textAlign = 'left';
}

/**
 * The "you can interact with this" prompt, floating over the player.
 *
 * Added because playtesting found the real failure mode: documents are
 * 16px sheets lying on tables, and standing in front of one looks exactly
 * like standing in front of nothing. Naming the verb — read, look, talk —
 * also finally distinguishes the two systems, which no amount of writing in
 * a README was going to do.
 */
export function drawPrompt(g, s, sx, sy, verb) {
  const label = `Z · ${verb}`;
  g.font = `700 ${7.5 * s}px system-ui, -apple-system, sans-serif`;
  const w = g.measureText(label).width + 12 * s;
  const h = 13 * s;
  const bob = Math.round(Math.sin(Date.now() / 320) * 1.5) * s;
  const x = Math.round(sx - w / 2);
  // Clear of the tile in front, so the prompt never covers the thing it is
  // pointing at.
  const y = Math.round(sy - h - 17 * s + bob);

  g.fillStyle = 'rgba(14,16,20,0.86)';
  g.fillRect(x, y, w, h);
  g.fillStyle = '#e8c46a';
  g.fillRect(x, y, w, 1.5 * s);
  // Little tail pointing down at the player.
  g.beginPath();
  g.moveTo(x + w / 2 - 3 * s, y + h);
  g.lineTo(x + w / 2 + 3 * s, y + h);
  g.lineTo(x + w / 2, y + h + 3 * s);
  g.closePath();
  g.fillStyle = 'rgba(14,16,20,0.86)';
  g.fill();

  g.fillStyle = '#efe6cf';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, x + w / 2, y + h / 2);
}

/**
 * The wayfinder: a small chevron at the edge of the screen pointing toward
 * whatever the current goal is.
 *
 * Deliberately not a minimap. The whole village is about six screenfuls, and
 * a persistent map in the corner makes players watch the corner instead of
 * the village — which would be fatal in a game whose entire subject is
 * noticing what is around you. This orients without routing: it tells you
 * which way, never how to get there, and it vanishes the moment the target
 * is on screen.
 *
 * @param a       angle from the screen centre toward the target, radians
 * @param tiles   distance in tiles, or null when the target is on another map
 */
export function drawWayfinder(g, view, s, a, tiles) {
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2;
  const pad = 22 * s;
  const hw = view.w / 2 - pad, hh = view.h / 2 - pad;

  // Where a ray from the centre leaves the viewport box.
  const dx = Math.cos(a), dy = Math.sin(a);
  const t = Math.min(
    Math.abs(dx) < 1e-6 ? Infinity : hw / Math.abs(dx),
    Math.abs(dy) < 1e-6 ? Infinity : hh / Math.abs(dy),
  );
  const x = cx + dx * t, y = cy + dy * t;

  g.save();
  g.translate(x, y);
  g.rotate(a);
  // Chevron, pointing along +x before rotation.
  g.beginPath();
  g.moveTo(9 * s, 0);
  g.lineTo(-4 * s, -6 * s);
  g.lineTo(-1 * s, 0);
  g.lineTo(-4 * s, 6 * s);
  g.closePath();
  g.fillStyle = 'rgba(14,16,20,0.55)';
  g.fill();
  g.fillStyle = '#e8c46a';
  g.beginPath();
  g.moveTo(7 * s, 0);
  g.lineTo(-3 * s, -4.5 * s);
  g.lineTo(-0.5 * s, 0);
  g.lineTo(-3 * s, 4.5 * s);
  g.closePath();
  g.fill();
  g.restore();

  if (tiles != null) {
    g.font = `700 ${6.5 * s}px system-ui, -apple-system, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const label = `${tiles}`;
    const lw = g.measureText(label).width + 8 * s;
    // Nudge the label back toward the centre so it never clips the edge.
    const lx = x - dx * 13 * s, ly = y - dy * 13 * s;
    g.fillStyle = 'rgba(14,16,20,0.72)';
    g.fillRect(lx - lw / 2, ly - 6 * s, lw, 12 * s);
    g.fillStyle = '#e8c46a';
    g.fillText(label, lx, ly);
  }
}

/** Title screen. */
export function drawTitle(g, view, s, hasSave, index) {
  g.fillStyle = '#14161a';
  g.fillRect(view.x, view.y, view.w, view.h);

  // A cold wash from the top, like the sky over a March village.
  const grd = g.createLinearGradient(0, view.y, 0, view.y + view.h);
  grd.addColorStop(0, '#2b3138');
  grd.addColorStop(1, '#14161a');
  g.fillStyle = grd;
  g.fillRect(view.x, view.y, view.w, view.h);

  g.textAlign = 'center';
  g.textBaseline = 'middle';

  g.font = `700 ${34 * s}px Georgia, "Iowan Old Style", Palatino, serif`;
  g.fillStyle = '#e6e2d8';
  g.fillText('Salem Village', view.x + view.w / 2, view.y + view.h * 0.34);

  g.font = `italic ${30 * s}px Georgia, serif`;
  g.fillStyle = '#a8b4c4';
  g.fillText('1692', view.x + view.w / 2, view.y + view.h * 0.34 + 38 * s);

  g.font = `${12 * s}px system-ui, sans-serif`;
  g.fillStyle = '#7e858e';
  g.fillText('Walk. Talk to people. Notice things.',
             view.x + view.w / 2, view.y + view.h * 0.34 + 74 * s);

  const items = hasSave ? ['Continue', 'Begin again'] : ['Begin'];
  items.forEach((label, i) => {
    const y = view.y + view.h * 0.68 + i * 30 * s;
    g.font = `${i === index ? '700 ' : ''}${15 * s}px Georgia, serif`;
    g.fillStyle = i === index ? '#efeade' : '#79808a';
    g.fillText(label, view.x + view.w / 2, y);
    if (i === index) {
      g.fillStyle = P.accent;
      g.fillRect(view.x + view.w / 2 - g.measureText(label).width / 2, y + 13 * s,
                 g.measureText(label).width, 2 * s);
    }
  });

  g.font = `${10 * s}px system-ui, sans-serif`;
  g.fillStyle = '#5c626b';
  g.fillText('Arrow keys or WASD to move  ·  Z / Space to talk  ·  N for notebook',
             view.x + view.w / 2, view.y + view.h - 22 * s);
}
