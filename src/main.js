// Salem Village, 1692 — game loop.
//
// Chapter one of three: March 1692. Nothing has happened yet.

import { GameState } from './engine/state.js';
import { Input } from './engine/input.js';
import { DialogueRunner, buildTopicMenu } from './engine/dialogue.js';
import {
  buildMap, renderMap, computeCamera, isSolid, warpAt, interactAt, triggerAt,
  DIR_VEC, DIR_INDEX, VIEW_W, VIEW_H, initArt,
} from './engine/world.js';
import { TS } from './engine/art-ground.js';
import { buildActor, buildPortrait, PLAYER_SPEC, SPR_H } from './engine/art-actors.js';
import {
  dialogueLayout, drawDialogue, drawChoices, drawNotebook, drawTitle, drawToast,
} from './engine/ui.js';
import { MAPS } from './content/maps.js';
import { NPCS } from './content/npcs.js';
import { CLUES } from './content/clues.js';
import { notebookEntries, sourceName, KNOWLEDGE } from './content/knowledge.js';

const MOVE_TIME = 0.16;      // seconds per tile
const REVEAL_CPS = 55;       // typewriter speed

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');

    // World renders into a fixed 320x240 buffer and is scaled up with
    // nearest-neighbour; UI draws afterwards at full resolution.
    this.buf = document.createElement('canvas');
    this.buf.width = VIEW_W;
    this.buf.height = VIEW_H;
    this.bg = this.buf.getContext('2d');
    this.bg.imageSmoothingEnabled = false;

    this.input = new Input();
    this.state = new GameState();
    this.runner = new DialogueRunner(this.state);

    this.mode = 'title';
    this.titleIndex = 0;
    this.maps = {};
    this.portraits = new Map();
    this.toast = { text: '', t: 0 };
    this.notebookScroll = 0;
    this.convNpc = null;

    initArt();
    this.playerFrames = buildActor(PLAYER_SPEC);

    this.player = {
      map: 'village', tx: 22, ty: 18, px: 22 * TS, py: 18 * TS,
      dir: 'down', dirIndex: DIR_INDEX.down, moving: false, t: 0,
      fromX: 0, fromY: 0, steps: 0, animFrame: 0,
      frames: this.playerFrames,
    };

    this.saved = GameState.load();
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  /* ---------------- setup ---------------- */

  mapFor(id) {
    if (!this.maps[id]) {
      const m = buildMap(MAPS[id]);
      m.actors = (MAPS[id].npcs || []).map((n) => this.makeNpc(n));
      this.maps[id] = m;
    }
    return this.maps[id];
  }

  makeNpc(placement) {
    const def = NPCS[placement.id];
    if (!def) throw new Error(`unknown npc: ${placement.id}`);
    return {
      id: def.id, def, name: def.name,
      tx: placement.x, ty: placement.y,
      px: placement.x * TS, py: placement.y * TS,
      dir: placement.dir || 'down',
      dirIndex: DIR_INDEX[placement.dir || 'down'],
      homeDir: placement.dir || 'down',
      animFrame: 0, moving: false,
      frames: buildActor(def.spec),
    };
  }

  portraitFor(npcId) {
    if (!this.portraits.has(npcId)) {
      const def = NPCS[npcId];
      this.portraits.set(npcId, def ? buildPortrait(def.spec, 'neutral') : null);
    }
    return this.portraits.get(npcId);
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.g.imageSmoothingEnabled = false;

    // Integer scale keeps the pixel art honest.
    this.scale = Math.max(1, Math.floor(Math.min(W / VIEW_W, H / VIEW_H)));
    const vw = VIEW_W * this.scale, vh = VIEW_H * this.scale;
    this.view = { x: Math.round((W - vw) / 2), y: Math.round((H - vh) / 2), w: vw, h: vh };
  }

  /* ---------------- lifecycle ---------------- */

  begin(fresh) {
    if (!fresh && this.saved) {
      this.state = this.saved.state;
      this.runner = new DialogueRunner(this.state);
      const p = this.saved.player;
      if (p && MAPS[p.map]) {
        this.player.map = p.map;
        this.setTile(p.x, p.y);
        this.player.dir = p.dir || 'down';
        this.player.dirIndex = DIR_INDEX[this.player.dir];
      }
    } else {
      GameState.clear();
      this.state = new GameState();
      this.runner = new DialogueRunner(this.state);
      this.player.map = 'village';
      this.setTile(22, 18);
    }
    this.mode = 'play';
    this.state.visited.add(this.player.map);
    this.openingBeat();
  }

  openingBeat() {
    // One short framing before the player is let loose. The design doc is
    // firm that the question is never posed as an essay prompt, so this
    // says what the player is and then gets out of the way.
    this.startScript([
      { say: 'Salem Village, Massachusetts Bay. The first week of March, 1692.', who: null },
      { say: 'Two girls in the minister\'s house have been ill since winter, and the doctor has stopped looking for a cause in their bodies.', who: null },
      { say: 'Nobody has been arrested. Nothing has happened yet.', who: null },
      { say: 'You cannot change any of this. You can walk around, and talk to people, and notice things.', who: null },
      { say: 'Press N at any time to look at what you have been told.', who: null },
    ], null);
  }

  setTile(x, y) {
    const p = this.player;
    p.tx = x; p.ty = y; p.px = x * TS; p.py = y * TS;
    p.moving = false; p.t = 0;
  }

  save() { this.state.save(this.player); }

  /* ---------------- dialogue plumbing ---------------- */

  startScript(script, speaker, onEnd = null) {
    this.mode = 'dialogue';
    this.choiceIndex = 0;
    this.runner.start(script, speaker, onEnd || (() => { this.endConversation(); }));
    this.syncDialogue();
  }

  talkTo(npc) {
    this.convNpc = npc;
    // Face the player.
    const p = this.player;
    npc.dir = p.ty < npc.ty ? 'up' : p.ty > npc.ty ? 'down' : p.tx < npc.tx ? 'left' : 'right';
    npc.dirIndex = DIR_INDEX[npc.dir];

    const speaker = { id: npc.id, name: npc.name, spec: npc.def.spec };
    this.mode = 'dialogue';
    this.choiceIndex = 0;
    this.runner.start(npc.def.greet || [], speaker, () => {
      this.state.markSpoke(npc.id);
      this.openTopics();
    });
    this.syncDialogue();
  }

  openTopics() {
    const npc = this.convNpc;
    if (!npc) { this.endConversation(); return; }
    const options = buildTopicMenu(npc.def, this.state);
    const speaker = { id: npc.id, name: npc.name, spec: npc.def.spec };
    this.choiceIndex = 0;
    this.runner.start([{ choice: options }], speaker, () => {
      // The last option is always "say nothing more".
      const wasFarewell = this.runner.lastChoiceIndex === this.runner.lastChoiceCount - 1;
      if (wasFarewell) this.endConversation();
      else this.openTopics();
    });
    this.syncDialogue();
  }

  endConversation() {
    const npc = this.convNpc;
    if (npc) { npc.dir = npc.homeDir; npc.dirIndex = DIR_INDEX[npc.homeDir]; }
    this.convNpc = null;
    this.mode = 'play';
    this.dlg = null;
    this.save();
  }

  /** Rebuild the paginated view whenever the runner produces a new line. */
  syncDialogue() {
    const cur = this.runner.current;
    if (!cur) { this.dlg = null; return; }
    if (cur.type === 'choice') { this.dlg = null; this.choiceIndex = 0; return; }

    const portrait = cur.speaker ? this.portraitFor(cur.speaker.id) : null;
    const L = dialogueLayout(this.g, this.view, this.scale, cur.text, !!portrait);
    this.dlg = {
      who: cur.who || '',
      portrait,
      layout: L,
      pages: L.pages,
      page: 0,
      revealed: 0,
      total: L.pages[0].join(' ').length,
    };
  }

  advanceDialogue() {
    const d = this.dlg;
    if (!d) return;
    if (d.revealed < d.total) { d.revealed = d.total; return; }
    if (d.page < d.pages.length - 1) {
      d.page += 1;
      d.revealed = 0;
      d.total = d.pages[d.page].join(' ').length;
      return;
    }
    this.runner.advance();
    this.syncDialogue();
  }

  /* ---------------- interaction ---------------- */

  facingTile() {
    const [dx, dy] = DIR_VEC[this.player.dir];
    return [this.player.tx + dx, this.player.ty + dy];
  }

  interact() {
    const map = this.mapFor(this.player.map);
    const [fx, fy] = this.facingTile();

    const npc = map.actors.find((a) => a.tx === fx && a.ty === fy);
    if (npc) { this.talkTo(npc); return; }

    const spot = interactAt(map, fx, fy);
    if (spot && CLUES[spot.id]) {
      const before = this.state.flags.size;
      this.startScript(CLUES[spot.id], null, () => {
        this.mode = 'play';
        this.dlg = null;
        if (this.state.flags.size > before) this.showToast('Noted in your notebook');
        this.save();
      });
    }
  }

  showToast(text) { this.toast = { text, t: 2.6 }; }

  /* ---------------- movement ---------------- */

  tryStep(dir) {
    const p = this.player;
    const map = this.mapFor(p.map);
    p.dir = dir;
    p.dirIndex = DIR_INDEX[dir];

    const [dx, dy] = DIR_VEC[dir];
    const nx = p.tx + dx, ny = p.ty + dy;
    if (isSolid(map, nx, ny, map.actors)) return;

    p.fromX = p.tx; p.fromY = p.ty;
    p.tx = nx; p.ty = ny;
    p.moving = true; p.t = 0;
  }

  arrive() {
    const p = this.player;
    p.steps += 1;
    p.animFrame = [0, 1, 0, 2][p.steps % 4];
    const map = this.mapFor(p.map);

    const w = warpAt(map, p.tx, p.ty);
    if (w) { this.doWarp(w); return; }

    const t = triggerAt(map, p.tx, p.ty);
    if (t && !this.state.knows(`fired.${map.id}.${t.id}`)) {
      this.state.learn(`fired.${map.id}.${t.id}`, 'observed');
      if (CLUES[t.id]) {
        this.startScript(CLUES[t.id], null, () => {
          this.mode = 'play'; this.dlg = null;
          this.showToast('Noted in your notebook');
          this.save();
        });
      }
    }
  }

  doWarp(w) {
    const p = this.player;
    p.map = w.to;
    this.state.visited.add(w.to);
    this.setTile(w.tx, w.ty);
    p.dir = w.dir || 'down';
    p.dirIndex = DIR_INDEX[p.dir];
    this.mapFor(w.to);
    this.fade = 0.28;
    this.save();
  }

  /* ---------------- update ---------------- */

  update(dt) {
    const inp = this.input;

    if (this.toast.t > 0) this.toast.t -= dt;
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt);

    if (this.mode === 'title') {
      const items = this.saved ? 2 : 1;
      if (inp.justPressed('up')) this.titleIndex = (this.titleIndex + items - 1) % items;
      if (inp.justPressed('down')) this.titleIndex = (this.titleIndex + 1) % items;
      if (inp.justPressed('confirm')) {
        this.begin(!this.saved ? true : this.titleIndex === 1);
      }
      return;
    }

    if (this.mode === 'notebook') {
      if (inp.justPressed('cancel') || inp.justPressed('notebook')) this.mode = 'play';
      if (inp.isDown('down')) this.notebookScroll += 300 * dt;
      if (inp.isDown('up')) this.notebookScroll -= 300 * dt;
      // maxScroll comes back from the last draw, so clamp against that.
      this.notebookScroll = Math.max(0, Math.min(this.notebookScroll, this.notebookMax || 0));
      return;
    }

    if (this.mode === 'dialogue') {
      const cur = this.runner.current;
      if (cur && cur.type === 'choice') {
        const n = cur.options.length;
        if (inp.justPressed('up')) this.choiceIndex = (this.choiceIndex + n - 1) % n;
        if (inp.justPressed('down')) this.choiceIndex = (this.choiceIndex + 1) % n;
        if (inp.justPressed('confirm')) {
          this.runner.choose(this.choiceIndex);
          this.syncDialogue();
        } else if (inp.justPressed('cancel')) {
          // Backing out picks "say nothing more" — always the last option —
          // so a player can leave a conversation without hunting for it.
          this.runner.choose(n - 1);
          this.syncDialogue();
        }
        return;
      }
      if (this.dlg) {
        if (this.dlg.revealed < this.dlg.total) this.dlg.revealed += REVEAL_CPS * dt;
        if (inp.justPressed('confirm')) this.advanceDialogue();
      }
      return;
    }

    // ---- play ----
    if (inp.justPressed('notebook')) { this.mode = 'notebook'; this.notebookScroll = 0; return; }
    if (inp.justPressed('confirm')) { this.interact(); return; }

    const p = this.player;
    if (p.moving) {
      p.t += dt / MOVE_TIME;
      if (p.t >= 1) {
        p.t = 0; p.moving = false;
        p.px = p.tx * TS; p.py = p.ty * TS;
        this.arrive();
      } else {
        p.px = (p.fromX + (p.tx - p.fromX) * p.t) * TS;
        p.py = (p.fromY + (p.ty - p.fromY) * p.t) * TS;
        // Two-step walk cycle within the tile.
        p.animFrame = [0, 1, 0, 2][(p.steps + (p.t > 0.5 ? 1 : 0)) % 4];
      }
    } else {
      const dir = inp.direction();
      if (dir) this.tryStep(dir);
      else p.animFrame = 0;
    }
  }

  /* ---------------- draw ---------------- */

  draw() {
    const g = this.g, v = this.view, s = this.scale;
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;

    g.fillStyle = '#0b0c0e';
    g.fillRect(0, 0, W, H);

    if (this.mode === 'title') { drawTitle(g, v, s, !!this.saved, this.titleIndex); return; }

    const map = this.mapFor(this.player.map);
    const cam = computeCamera(map, this.player.px, this.player.py);
    const actors = [this.player, ...map.actors];
    renderMap(this.bg, map, cam, actors);

    g.imageSmoothingEnabled = false;
    g.drawImage(this.buf, v.x, v.y, v.w, v.h);

    if (this.fade > 0) {
      g.fillStyle = `rgba(8,8,12,${(this.fade / 0.28) * 0.85})`;
      g.fillRect(v.x, v.y, v.w, v.h);
    }

    // Place name, top-left.
    g.font = `600 ${10 * s}px system-ui, sans-serif`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = 'rgba(12,12,16,0.6)';
    const label = map.name;
    const lw = g.measureText(label).width + 16 * s;
    g.fillRect(v.x + 8 * s, v.y + 8 * s, lw, 18 * s);
    g.fillStyle = '#d8d4c8';
    g.fillText(label, v.x + 16 * s, v.y + 13 * s);

    const cur = this.runner.current;
    if (this.mode === 'dialogue' && cur) {
      if (cur.type === 'choice') {
        drawChoices(g, v, s, cur.options, this.choiceIndex);
      } else if (this.dlg) {
        const d = this.dlg;
        drawDialogue(g, v, s, d.layout, {
          who: d.who,
          portrait: d.portrait,
          page: d.pages[d.page],
          revealed: Math.floor(d.revealed),
          done: d.revealed >= d.total,
          more: d.page < d.pages.length - 1,
        });
      }
    }

    if (this.mode === 'notebook') {
      this.notebookMax = drawNotebook(
        g, v, s, notebookEntries(this.state), this.notebookScroll, sourceName) || 0;
    }

    if (this.toast.t > 0) drawToast(g, v, s, this.toast.text, Math.min(1, this.toast.t));
  }

  /* ---------------- export ---------------- */

  /**
   * The exit artifact. Plain text the student can paste into an assignment.
   * Scoped to general US History rather than the AP rubric: a claim, the
   * evidence they actually gathered, and where each piece came from.
   */
  exportNotes() {
    const entries = notebookEntries(this.state);
    const lines = [
      'SALEM VILLAGE, 1692 — what I saw and was told',
      'Chapter one: March 1692',
      '',
    ];
    if (!entries.length) {
      lines.push('(Nothing recorded yet.)');
    } else {
      entries.forEach((e, i) => {
        lines.push(`${i + 1}. ${e.text}`);
        lines.push(`   [${sourceName(e.source)}]`);
        lines.push('');
      });
      lines.push('---');
      lines.push('Question to answer: what caused this? Weigh the causes against');
      lines.push('each other and use the evidence above. Say which source you trust');
      lines.push('for each claim, and why.');
    }
    return lines.join('\n');
  }
}

/* ---------------------------------------------------------------------- *
 * Boot
 * ---------------------------------------------------------------------- */

const canvas = document.getElementById('screen');
const game = new Game(canvas);
window.__salem = game;   // handy in a console during development

const pad = document.getElementById('touch');
if (pad) {
  game.input.bindTouch(pad);
  if (!matchMedia('(pointer: coarse)').matches) pad.classList.add('hidden');
}

document.getElementById('copy')?.addEventListener('click', async (e) => {
  const text = game.exportNotes();
  try {
    await navigator.clipboard.writeText(text);
    e.target.textContent = 'Copied';
  } catch {
    // Clipboard is frequently blocked on managed school profiles; fall back
    // to something the student can select by hand rather than failing.
    const ta = document.getElementById('fallback');
    ta.value = text;
    ta.classList.remove('hidden');
    ta.select();
    e.target.textContent = 'Select and copy';
  }
  setTimeout(() => { e.target.textContent = 'Copy my notes'; }, 2500);
});

document.getElementById('reset')?.addEventListener('click', () => {
  if (!confirm('Erase your saved progress and start again?')) return;
  GameState.clear();
  location.reload();
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.draw();
  game.input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
