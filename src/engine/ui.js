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
/**
 * The notebook, as headings.
 *
 * Closed by default, one line each, arrow keys to move and Z to open. The
 * flat version of this screen was seven screens of prose with no structure
 * in it, and the honest description of what a student did with it was scroll
 * past the whole thing.
 *
 * `open` is a Set of group keys, `sel` the cursor. Returns the max scroll so
 * the caller can clamp, exactly like the other tabs.
 */
export function drawGroupedNotebook(g, view, s, groups, scroll, sel, open) {
  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bw = view.w - 40 * s, bh = view.h - 40 * s;

  g.textAlign = 'left';
  g.textBaseline = 'top';
  const top = by + 46 * s;
  const bottom = by + bh - 12 * s;

  if (!groups.length) {
    g.font = `italic ${11 * s}px Georgia, serif`;
    g.fillStyle = P.boxDim;
    g.fillText('Nothing yet. Go and talk to someone.', bx + 18 * s, top + 6 * s);
    return 0;
  }

  g.save();
  g.beginPath();
  g.rect(bx + 8 * s, top - 4 * s, bw - 16 * s, bottom - top + 4 * s);
  g.clip();

  const textW = bw - 76 * s;
  const lineH = 12.5 * s;
  const headFont = `600 ${10.5 * s}px Georgia, serif`;
  const bodyFont = `${9.5 * s}px Georgia, serif`;

  let y = top - scroll;
  let contentH = 0;

  groups.forEach((grp, i) => {
    const isOpen = open.has(grp.key);
    const isSel = i === sel;
    const headH = 20 * s;

    if (y + headH > top - 24 * s && y < bottom + 24 * s) {
      if (isSel) {
        g.fillStyle = 'rgba(232,196,106,0.16)';
        g.fillRect(bx + 14 * s, y - 3 * s, bw - 28 * s, headH);
      }
      g.font = `${9 * s}px system-ui, sans-serif`;
      g.fillStyle = isSel ? P.accent : P.boxDim;
      g.fillText(isOpen ? '▾' : '▸', bx + 20 * s, y + 2 * s);

      g.font = headFont;
      g.fillStyle = isSel ? P.boxInk : 'rgba(58,54,48,0.86)';
      g.fillText(grp.label, bx + 34 * s, y + 1 * s);

      // The count is the point of a closed heading: it tells a student how
      // much they got out of a person without opening anything.
      g.font = `${9 * s}px system-ui, sans-serif`;
      g.fillStyle = P.boxDim;
      g.textAlign = 'right';
      g.fillText(String(grp.entries.length), bx + bw - 22 * s, y + 3 * s);
      g.textAlign = 'left';
    }
    y += headH;
    contentH += headH;

    if (!isOpen) return;
    for (const e of grp.entries) {
      g.font = bodyFont;
      const lines = wrapText(g, e.text, textW);
      const blockH = lines.length * lineH + 7 * s;
      if (y + blockH > top - 24 * s && y < bottom + 24 * s) {
        g.fillStyle = 'rgba(140,120,80,0.5)';
        g.fillRect(bx + 38 * s, y + 1 * s, 1 * s, lines.length * lineH - 2 * s);
        g.font = bodyFont;
        g.fillStyle = P.boxInk;
        let ly = y;
        for (const l of lines) { g.fillText(l, bx + 46 * s, ly); ly += lineH; }
      }
      y += blockH;
      contentH += blockH;
    }
    y += 4 * s;
    contentH += 4 * s;
  });
  g.restore();

  return Math.max(0, contentH - (bottom - top));
}

/**
 * @param entries  an array to render as a flat list, or NULL to draw only
 *                 the panel and let a tab draw its own contents into it.
 *                 The shell used to be requested by passing an empty array,
 *                 which meant every tab printed "Nothing yet. Go and talk to
 *                 someone." underneath itself, in italic, through the tabs.
 * @param heading  overrides the panel title for tabs that are not a log.
 */
export function drawNotebook(g, view, s, entries, scroll, sourceName, heading) {
  g.fillStyle = 'rgba(12,12,16,0.72)';
  g.fillRect(view.x, view.y, view.w, view.h);

  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bw = view.w - 40 * s, bh = view.h - 40 * s;
  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.font = `700 ${13 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  g.textBaseline = 'top';
  g.fillText(heading || 'What I have seen and been told', bx + 18 * s, by + 14 * s);

  // No key hint here. It used to print at by+31s, which is exactly where
  // the tab strip lands, so the two overprinted each other on every tab.
  // The help now belongs to the tabs, drawn once, in one place.

  const top = by + 46 * s;
  const bottom = by + bh - 12 * s;

  g.strokeStyle = 'rgba(58,54,48,0.35)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(bx + 18 * s, top - 8 * s);
  g.lineTo(bx + bw - 18 * s, top - 8 * s);
  g.stroke();

  if (!entries) return;              // shell only; a tab draws its own body
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
export function drawObjective(g, view, s, { step, text, standing, progress, sub, flash }) {
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
    const lines = wrapText(g, text || step.text, maxW);
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

  // Panel chrome is kept deliberately mean. Every unit spent on margins,
  // header and citation is a unit of document the student has to scroll
  // for, and scrolling is what turns reading a source into skimming one.
  const bx = view.x + 8 * s, by = view.y + 8 * s;
  const bw = view.w - 16 * s, bh = view.h - 16 * s;
  const pad = 12 * s;
  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.textBaseline = 'top';

  // --- header ---------------------------------------------------------
  g.font = `700 ${12 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  g.fillText(doc.title, bx + pad, by + 8 * s);

  g.font = `${8 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText(`${doc.date}  ·  ${doc.kind}`, bx + pad, by + 24 * s);

  g.textAlign = 'right';
  g.fillStyle = '#5d7a4a';
  g.fillText('✓ copied into your notebook', bx + bw - pad, by + 24 * s);
  g.textAlign = 'left';

  const ruleY = by + 36 * s;
  g.strokeStyle = 'rgba(58,54,48,0.4)';
  g.lineWidth = 1;
  g.beginPath(); g.moveTo(bx + pad, ruleY); g.lineTo(bx + bw - pad, ruleY); g.stroke();

  // --- footer, measured first ------------------------------------------
  // The citation wraps to a variable number of lines, so how much room the
  // columns actually have is not known until it has been measured. Laying
  // the text out first and discovering the footer afterwards is what let
  // documents run underneath their own citation.
  g.font = `${6.5 * s}px system-ui, sans-serif`;
  const foot = `${fidelityLabel}  ·  ${doc.cite}`;
  const footLines = wrapText(g, foot, bw - 2 * pad - 6 * s);
  const footTop = by + bh - 9 * s - footLines.length * 8 * s;

  // --- two columns ----------------------------------------------------
  const colGap = 14 * s;
  const colW = (bw - 2 * pad - colGap) / 2;
  const leftX = bx + pad;
  const rightX = leftX + colW + colGap;
  const top = ruleY + 15 * s;
  const bottom = footTop - 8 * s;
  const colH = bottom - top;

  // Column labels. Worth the eight pixels: a student needs to know that the
  // left side is the actual thing and the right side is a translation, and
  // "the original spelling" is doing the work of explaining why the left
  // column looks misspelt.
  g.font = `${6.5 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText('THE DOCUMENT · ORIGINAL SPELLING', leftX, ruleY + 4 * s);
  g.fillText('IN PLAIN ENGLISH', rightX, ruleY + 4 * s);

  // Original: monospaced, because the layout of a ledger or a warrant is
  // part of what it is saying — but wrapped to the column, because a line
  // of a warrant is longer than half this panel and running it into the
  // translation makes both unreadable.
  //
  // Wrapped continuations are indented so a ledger row or an address line
  // still reads as one entry rather than as two.
  const monoH = 8.5 * s;
  g.font = `${7 * s}px ui-monospace, Menlo, Consolas, monospace`;
  const monoLines = [];
  for (const line of doc.original) {
    if (!line) { monoLines.push(''); continue; }
    // Keep leading whitespace: in the ledger and the seating list, the
    // indentation IS the document.
    const lead = line.match(/^\s*/)[0];
    const wrapped = wrapText(g, line, colW - g.measureText(lead).width);
    wrapped.forEach((l, i) => monoLines.push(i === 0 ? lead + l : lead + '  ' + l));
  }

  // Gloss: serif, plain modern English, wrapped.
  g.font = `${9.5 * s}px Georgia, serif`;
  const glossH = 11.5 * s;
  // Paragraph breaks cost half a line rather than a whole one — at a full
  // line the white space was eating a third of the column.
  const glossLines = [];
  for (const para of doc.gloss) {
    if (!para) { glossLines.push(null); continue; }
    for (const l of wrapText(g, para, colW)) glossLines.push(l);
  }
  const glossY = [];
  let gy = 0;
  for (const l of glossLines) { glossY.push(gy); gy += l === null ? glossH * 0.5 : glossH; }

  const contentH = Math.max(monoLines.length * monoH, gy);
  const maxScroll = Math.max(0, Math.ceil(contentH - colH));

  // Reported so tools/check-fit.mjs can ask the real layout how a document
  // measured instead of reimplementing this arithmetic and drifting from it.
  drawReader.metrics = {
    monoLines: monoLines.length, monoFits: Math.floor(colH / monoH),
    glossLines: gy / glossH, glossFits: Math.floor(colH / glossH),
    citeLines: footLines.length, colW, colH, overflow: maxScroll,
  };

  g.save();
  g.beginPath();
  g.rect(leftX - 4 * s, top - 4 * s, colW + 8 * s, colH + 8 * s);
  g.clip();
  g.font = `${7 * s}px ui-monospace, Menlo, Consolas, monospace`;
  g.fillStyle = '#3f3a32';
  monoLines.forEach((l, i) => { if (l) g.fillText(l, leftX, top - scroll + i * monoH); });
  g.restore();

  g.save();
  g.beginPath();
  g.rect(rightX - 4 * s, top - 4 * s, colW + 8 * s, colH + 8 * s);
  g.clip();
  g.font = `${9.5 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  glossLines.forEach((l, i) => { if (l) g.fillText(l, rightX, top - scroll + glossY[i]); });
  g.restore();

  // A hairline between the columns, so the source and the translation read
  // as two things rather than one ragged block.
  g.strokeStyle = 'rgba(58,54,48,0.22)';
  const midX = Math.round(leftX + colW + colGap / 2) + 0.5;
  g.beginPath(); g.moveTo(midX, top); g.lineTo(midX, bottom); g.stroke();

  // --- footer ---------------------------------------------------------
  g.font = `${7 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  let fy = footTop;
  g.strokeStyle = 'rgba(58,54,48,0.4)';
  g.beginPath(); g.moveTo(bx + pad, fy - 5 * s); g.lineTo(bx + bw - pad, fy - 5 * s); g.stroke();
  for (const l of footLines) { g.fillText(l, bx + pad, fy); fy += 8 * s; }

  // Scroll hint sits just above the citation rule, inside the column area,
  // rather than on top of the citation itself.
  if (maxScroll > 0) {
    g.textAlign = 'right';
    g.fillStyle = P.accent;
    g.font = `${7 * s}px system-ui, sans-serif`;
    g.fillText(scroll < maxScroll - 1 ? '↓ more' : '↑ back to the top',
      bx + bw - pad, bottom + 2 * s);
    g.textAlign = 'left';
  }
  // Right-aligned on the title line — printed at the left it sat directly
  // on top of the document's own title.
  g.font = `${7 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.textAlign = 'right';
  g.fillText(maxScroll > 0 ? '↑↓ scroll · Z or X to close' : 'Z or X to close',
    bx + bw - pad, by + 10 * s);
  g.textAlign = 'left';

  return maxScroll;
}

/** The notebook's document tab: what the player has copied down. */
/* ---------------------------------------------------------------------- *
 * The document collection
 *
 * Fifteen slots, always all fifteen, drawn as the papers themselves. The
 * list version was fifteen lines of title-and-date, which is a bibliography
 * — and a bibliography is the one thing a student can already produce
 * without playing anything.
 *
 * The thumbnails are drawn from each document's own `kind` field, which was
 * already an evidence typology before this screen existed: "A signature",
 * "A number", "Thirty-nine signatures", "Not meant for you". So the grid
 * sorts itself visually by what makes each paper evidence, without a legend
 * and without a word of new content.
 * ---------------------------------------------------------------------- */

const INK = '#4a4238';
const PAPER_LIT = '#e9e2d2';
const PAPER_DIM = 'rgba(90,84,74,0.22)';

function drawDocThumb(g, x, y, w, h, s, doc, owned) {
  const px = (n) => n * s;
  g.fillStyle = owned ? PAPER_LIT : 'rgba(58,54,48,0.10)';
  g.fillRect(x, y, w, h);
  g.strokeStyle = owned ? 'rgba(58,54,48,0.45)' : 'rgba(58,54,48,0.30)';
  g.lineWidth = Math.max(1, s * 0.6);
  g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  if (!owned) {
    // An empty slot says how many are left without a bar or a percentage.
    g.strokeStyle = 'rgba(58,54,48,0.22)';
    g.beginPath();
    g.moveTo(x + px(5), y + px(5));
    g.lineTo(x + w - px(5), y + h - px(5));
    g.moveTo(x + w - px(5), y + px(5));
    g.lineTo(x + px(5), y + h - px(5));
    g.stroke();
    return;
  }

  const ink = (ix, iy, iw, ih, a = 0.55) => {
    g.globalAlpha = a;
    g.fillStyle = INK;
    g.fillRect(x + px(ix), y + px(iy), px(iw), px(ih));
    g.globalAlpha = 1;
  };

  const kind = doc.kind || '';
  if (kind === 'A number') {
    // A ledger: two columns, short entries, figures ruled off to the right.
    for (let r = 0; r < 7; r++) {
      ink(4, 5 + r * 3.4, 9 + (r % 3) * 3, 1);
      ink(20, 5 + r * 3.4, 5 - (r % 2), 1, 0.7);
    }
    ink(18.5, 4, 0.6, 25, 0.35);
  } else if (kind === 'Thirty-nine signatures') {
    // Many hands. Deliberately uneven — some of these people signed with
    // difficulty, and the thumbnail should say so before the reader does.
    ink(4, 4, 18, 1);
    ink(4, 6.4, 13, 1);
    for (let r = 0; r < 8; r++) {
      const wobble = ((r * 7) % 5) - 2;
      ink(4 + (r % 2) * 12, 11 + r * 2.3, 8 + wobble, 1.2, 0.5 + (r % 3) * 0.12);
    }
  } else if (kind === 'Not meant for you') {
    // Private writing: small, dense, no clerk's margin, and a fold across it.
    for (let r = 0; r < 11; r++) ink(4, 4 + r * 2.3, 19 - ((r * 5) % 6), 0.9, 0.42);
    g.globalAlpha = 0.5;
    g.strokeStyle = 'rgba(58,54,48,0.6)';
    g.beginPath();
    g.moveTo(x + px(2), y + h * 0.52);
    g.lineTo(x + w - px(2), y + h * 0.48);
    g.stroke();
    g.globalAlpha = 1;
  } else {
    // A signature: a fair clerk's hand, and one name at the bottom that is
    // doing all the work.
    for (let r = 0; r < 6; r++) ink(4, 4 + r * 2.8, 19 - ((r * 4) % 5), 1, 0.45);
    ink(4, 22, 11, 1, 0.3);
    ink(12, 25.5, 10, 1.6, 0.85);
    ink(11, 27, 3, 1, 0.6);
  }
}


/**
 * The collection: fifteen slots, always all fifteen.
 *
 * @returns max scroll, so the caller clamps the same way as every tab.
 */
export function drawDocGrid(g, view, s, order, owned, docs, sel, scroll) {
  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bw = view.w - 40 * s, bh = view.h - 40 * s;
  const top = by + 46 * s;
  const bottom = by + bh - 12 * s;

  // Sized so all fifteen fit at once, on any window, without scrolling.
  // A collection you have to scroll is a list with pictures on it; the
  // point of this screen is that a student can see the whole set and the
  // holes in it in one look.
  const cols = 5;
  const rowsTotal = Math.ceil(order.length / cols);
  const cellW = (bw - 44 * s) / cols;
  // Room reserved at the bottom for the selected paper's title and for the
  // key help on the tab row, so neither can land on the last row of thumbs.
  const barH = 30 * s;
  const barTop = bottom - barH - 14 * s;
  const gridBottom = barTop - 8 * s;
  const cellH = (gridBottom - top) / rowsTotal;
  const thumbH = Math.max(12 * s, cellH - 8 * s);
  const thumbW = Math.min(thumbH / 1.28, cellW - 10 * s);

  g.save();
  g.beginPath();
  g.rect(bx + 8 * s, top - 4 * s, bw - 16 * s, gridBottom - top + 4 * s);
  g.clip();

  order.forEach((id, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = bx + 22 * s + c * cellW + (cellW - thumbW) / 2;
    const y = top + r * cellH - scroll;
    if (y > gridBottom + cellH || y + cellH < top - cellH) return;

    const have = owned.has(id);
    const doc = docs[id];
    if (i === sel) {
      g.fillStyle = 'rgba(232,196,106,0.30)';
      g.fillRect(x - 6 * s, y - 6 * s, thumbW + 12 * s, thumbH + 12 * s);
      g.strokeStyle = P.accent;
      g.lineWidth = Math.max(1, s);
      g.strokeRect(x - 6 * s + 0.5, y - 6 * s + 0.5, thumbW + 12 * s - 1, thumbH + 12 * s - 1);
    }
    drawDocThumb(g, x, y, thumbW, thumbH, s, doc, have);
  });
  g.restore();

  // The selected document's title, below the grid, where it has room to be
  // a full sentence rather than a caption truncated under a thumbnail.
  const doc = docs[order[sel]];
  const have = owned.has(order[sel]);
  g.textAlign = 'left';
  g.fillStyle = 'rgba(58,54,48,0.10)';
  g.fillRect(bx + 14 * s, barTop, bw - 28 * s, barH);
  g.font = `600 ${10 * s}px Georgia, serif`;
  g.fillStyle = have ? P.boxInk : P.boxDim;
  g.fillText(have ? doc.title : 'You have not found this one yet.',
             bx + 22 * s, barTop + 4 * s);
  g.font = `${8 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText(have ? `${doc.date}  ·  ${doc.kind}`
                  : 'Fifteen papers survive. Somebody in the village knows where each one is.',
             bx + 22 * s, barTop + 17 * s);

  return 0;
}

/**
 * The disputes tab: where the sources disagree, and what the player makes
 * of it.
 *
 * This is the one screen in the game that asks the player for a judgement,
 * and it is deliberately the smallest possible version of that: two
 * accounts, who said each, and three keys. Nothing is scored, nothing is
 * required, and "not sure" is a real answer that survives into the export —
 * because "the sources conflict and I can't resolve it" is a legitimate
 * finding and a student should be able to say it.
 *
 * @param sel  index of the highlighted dispute, for the position keys
 */
export function drawDisputeTab(g, view, s, disputes, state, scroll, sel, sourceName) {
  g.fillStyle = 'rgba(12,12,16,0.72)';
  g.fillRect(view.x, view.y, view.w, view.h);

  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bw = view.w - 40 * s, bh = view.h - 40 * s;
  panel(g, bx, by, bw, bh, s);

  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.font = `700 ${13 * s}px Georgia, serif`;
  g.fillStyle = P.boxInk;
  g.fillText('Where my sources disagree', bx + 18 * s, by + 14 * s);

  const top = by + 54 * s;
  const bottom = by + bh - 20 * s;

  g.strokeStyle = 'rgba(58,54,48,0.35)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(bx + 18 * s, top - 8 * s);
  g.lineTo(bx + bw - 18 * s, top - 8 * s);
  g.stroke();

  if (!disputes.length) {
    g.font = `italic ${11 * s}px Georgia, serif`;
    g.fillStyle = P.boxDim;
    for (const [i, line] of [
      'Nothing here yet.',
      'When two people tell you different things about the same event,',
      'both accounts land here and you can say which one you believe.',
    ].entries()) {
      g.fillText(line, bx + 18 * s, top + 6 * s + i * 15 * s);
    }
    return 0;
  }

  g.save();
  g.beginPath();
  g.rect(bx + 8 * s, top - 4 * s, bw - 16 * s, bottom - top + 4 * s);
  g.clip();

  const colW = bw - 56 * s;
  let y = top - scroll;
  let contentH = 0;

  disputes.forEach((d, i) => {
    const chosen = state.positionOn(d.id);
    const a = sourceName(sideSourceOfSafe(state, d.a));
    const b = sourceName(sideSourceOfSafe(state, d.b));

    g.font = `600 ${11 * s}px Georgia, serif`;
    const cLines = wrapText(g, d.claim, colW - 10 * s);
    g.font = `${9.5 * s}px Georgia, serif`;
    const aLines = wrapText(g, d.sideA, colW - 16 * s);
    const bLines = wrapText(g, d.sideB, colW - 16 * s);
    const blockH = (cLines.length * 13 + 4 + (aLines.length + bLines.length) * 12 + 28 + 22) * s;

    if (y + blockH > top - 30 * s && y < bottom + 30 * s) {
      if (i === sel) {
        g.fillStyle = 'rgba(125,63,44,0.09)';
        g.fillRect(bx + 12 * s, y - 4 * s, bw - 24 * s, blockH - 4 * s);
      }
      g.font = `600 ${11 * s}px Georgia, serif`;
      g.fillStyle = P.boxInk;
      let ty = y;
      for (const l of wrapText(g, d.claim, colW - 10 * s)) { g.fillText(l, bx + 30 * s, ty); ty += 13 * s; }
      g.fillStyle = P.accent;
      g.fillRect(bx + 20 * s, y + 4 * s, 4 * s, 4 * s);

      let ly = ty + 4 * s;
      const side = (lines, who, key) => {
        const picked = chosen === key;
        g.fillStyle = picked ? P.accent : P.boxDim;
        g.font = `600 ${8 * s}px system-ui, sans-serif`;
        g.fillText(picked ? `▸ ${who}` : who, bx + 30 * s, ly);
        ly += 11 * s;
        g.font = `${9.5 * s}px Georgia, serif`;
        g.fillStyle = picked ? P.boxInk : '#5f5a50';
        for (const l of lines) { g.fillText(l, bx + 38 * s, ly); ly += 12 * s; }
        ly += 3 * s;
      };
      side(aLines, a, 'a');
      side(bLines, b, 'b');

      g.font = `${8 * s}px system-ui, sans-serif`;
      g.fillStyle = chosen === 'unsure' ? P.accent : P.boxDim;
      const verdict = chosen === 'a' ? `You find ${a} more credible.`
                    : chosen === 'b' ? `You find ${b} more credible.`
                    : chosen === 'unsure' ? 'You cannot tell which of these is true.'
                    : i === sel ? '1 / 2 / 3 to say which you believe' : '—';
      g.fillText(verdict, bx + 30 * s, ly);
    }
    y += blockH;
    contentH += blockH;
  });
  g.restore();

  g.font = `${8 * s}px system-ui, sans-serif`;
  g.fillStyle = P.boxDim;
  g.fillText('↑↓ move · 1 first account · 2 second · 3 cannot tell',
             bx + 18 * s, by + bh - 16 * s);

  return Math.max(0, contentH - (bottom - top));
}

// Kept local so ui.js does not have to import from content/.
function sideSourceOfSafe(state, key) {
  return key.startsWith('doc:') ? 'document' : state.sourceOf(key);
}

/** The tabs across the top of the notebook. */
export function drawNotebookTabs(g, view, s, tab, docCount, docTotal, disputeCount, help) {
  const bx = view.x + 20 * s, by = view.y + 20 * s;
  const bh = view.h - 40 * s;
  const labels = [
    'What I was told',
    `What I copied down   ${docCount}/${docTotal}`,
    disputeCount ? `Where they disagree  ${disputeCount}` : 'Where they disagree',
  ];
  // Three tabs have to fit inside the panel. Close the gaps first, then
  // shrink the type, and measure rather than guessing — the labels carry
  // counts that change width as the player collects things.
  const bw = view.w - 40 * s;
  const avail = bw - 36 * s;
  let size = 9, widths = [], total = 0, gap = 0;
  for (; size >= 6; size -= 0.25) {
    g.font = `600 ${size * s}px system-ui, sans-serif`;
    widths = labels.map((l) => g.measureText(l).width);
    total = widths.reduce((n, w) => n + w, 0);
    gap = (avail - total) / (labels.length - 1);
    if (gap >= 9 * s) break;
  }
  gap = Math.max(6 * s, Math.min(24 * s, gap));

  g.textAlign = 'left';
  g.textBaseline = 'top';
  let x = bx + 18 * s;
  const y = by + 32 * s;
  labels.forEach((label, i) => {
    g.fillStyle = i === tab ? P.boxInk : P.boxDim;
    g.fillText(label, x, y);
    if (i === tab) {
      g.fillStyle = P.accent;
      g.fillRect(x, y + 12 * s, widths[i], 2 * s);
    }
    x += widths[i] + gap;
  });

  // Key help, on the tab row, right-aligned, quiet. One place, so it cannot
  // land on top of anything.
  if (help) {
    g.textAlign = 'right';
    g.font = `${7.5 * s}px system-ui, sans-serif`;
    g.fillStyle = 'rgba(90,84,74,0.62)';
    g.fillText(help, bx + bw - 18 * s, by + bh - 14 * s);
    g.textAlign = 'left';
  }
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

/**
 * Title screen.
 *
 * `hasScene` means the caller has already drawn the memorial into the view,
 * and this should darken it rather than paint over it. Worth the extra
 * parameter: a title card that is a picture of the actual place the game
 * opens in tells the player what kind of game this is before they press
 * anything, and a gradient tells them nothing.
 */
export function drawTitle(g, view, s, hasSave, index, hasScene = false) {
  if (!hasScene) {
    g.fillStyle = '#14161a';
    g.fillRect(view.x, view.y, view.w, view.h);

    // A cold wash from the top, like the sky over a March village.
    const grd = g.createLinearGradient(0, view.y, 0, view.y + view.h);
    grd.addColorStop(0, '#2b3138');
    grd.addColorStop(1, '#14161a');
    g.fillStyle = grd;
    g.fillRect(view.x, view.y, view.w, view.h);
  } else {
    // Enough scrim that white serif type is readable over grass, stone and
    // shadow alike, and heavier at the top and bottom where the words are.
    g.fillStyle = 'rgba(10,11,14,0.55)';
    g.fillRect(view.x, view.y, view.w, view.h);
    const grd = g.createLinearGradient(0, view.y, 0, view.y + view.h);
    grd.addColorStop(0, 'rgba(8,9,12,0.82)');
    grd.addColorStop(0.45, 'rgba(8,9,12,0.18)');
    grd.addColorStop(1, 'rgba(8,9,12,0.86)');
    g.fillStyle = grd;
    g.fillRect(view.x, view.y, view.w, view.h);
  }

  g.textAlign = 'center';
  g.textBaseline = 'middle';

  // One stack, measured in tile units from the top of the view.
  //
  // Everything here used to mix two coordinate systems: the title block was
  // placed with absolute `s` offsets while the menu anchored to a fraction of
  // the height. They grow at different rates, so "Begin" was printed on top
  // of the tagline at every window size.
  const cx = view.x + view.w / 2;
  const Y = (u) => view.y + u * s;

  g.font = `700 ${34 * s}px Georgia, "Iowan Old Style", Palatino, serif`;
  g.fillStyle = '#e6e2d8';
  g.fillText('Salem Village', cx, Y(72));

  g.font = `italic ${30 * s}px Georgia, serif`;
  g.fillStyle = '#a8b4c4';
  g.fillText('1692', cx, Y(108));

  g.font = `${12 * s}px system-ui, sans-serif`;
  g.fillStyle = '#7e858e';
  g.fillText('Walk. Talk to people. Notice things.', cx, Y(140));

  const items = hasSave ? ['Continue', 'Begin again'] : ['Begin'];
  items.forEach((label, i) => {
    const y = Y(170 + i * 26);
    g.font = `${i === index ? '700 ' : ''}${15 * s}px Georgia, serif`;
    g.fillStyle = i === index ? '#efeade' : '#79808a';
    g.fillText(label, cx, y);
    if (i === index) {
      g.fillStyle = P.accent;
      g.fillRect(cx - g.measureText(label).width / 2, y + 11 * s,
                 g.measureText(label).width, 2 * s);
    }
  });

  g.font = `${10 * s}px system-ui, sans-serif`;
  g.fillStyle = '#5c626b';
  g.fillText('Arrow keys or WASD to move  ·  Z / Space to talk  ·  N for notebook',
             cx, Y(222));

  // Said out loud, on the first screen, because this game spends half an hour
  // teaching students to ask where a source came from. No likeness survives
  // of anyone here — not Tituba, not Rebecca Nurse, not Ann Putnam — so every
  // face in it is an invention, and it would be incoherent to quietly present
  // invented faces as real people in a game about evidence.
  g.font = `${9 * s}px system-ui, sans-serif`;
  g.fillStyle = '#4a4f57';
  g.fillText('No portrait survives of anyone in this story. Every face here is imagined.',
             cx, Y(233));
}

/**
 * The cold open.
 *
 * Five cards over black before the memorial appears. The point is not
 * atmosphere — it is that a student should know the size of the thing before
 * they start walking around in it. A player who wanders into the memorial
 * cold reads twenty bench names as decoration.
 *
 * Every card is skippable and the whole sequence is skippable, because the
 * second time a class plays this it must not cost them forty seconds.
 */
export function drawIntro(g, view, s, card, t) {
  g.fillStyle = '#08090b';
  g.fillRect(view.x, view.y, view.w, view.h);
  if (!card) return;

  // Fade in over the first ¾ second, hold, fade out over the last ½.
  const inA = Math.min(1, t / 0.75);
  const outA = Math.min(1, Math.max(0, (card.hold - t) / 0.5));
  const a = Math.min(inA, outA);

  const cx = view.x + view.w / 2;
  const maxW = Math.min(view.w * 0.76, 230 * s);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = card.big
    ? `700 ${19 * s}px Georgia, "Iowan Old Style", Palatino, serif`
    : `${12 * s}px Georgia, "Iowan Old Style", Palatino, serif`;

  const lines = wrapText(g, card.text, maxW);
  const lineH = (card.big ? 26 : 18) * s;
  let y = view.y + view.h / 2 - ((lines.length - 1) * lineH) / 2;
  g.fillStyle = `rgba(${card.big ? '236,231,220' : '198,203,211'},${a.toFixed(3)})`;
  for (const l of lines) { g.fillText(l, cx, y); y += lineH; }

  g.font = `${9 * s}px system-ui, sans-serif`;
  g.fillStyle = `rgba(96,102,112,${(a * 0.9).toFixed(3)})`;
  g.fillText('Z to continue  ·  X to skip', cx, view.y + view.h - 22 * s);
}
