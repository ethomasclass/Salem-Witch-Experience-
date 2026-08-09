// Salem Village, 1692 — game loop.
//
// Chapter one of three: March 1692. Nothing has happened yet.

import { GameState } from './engine/state.js';
import { Input } from './engine/input.js';
import { DialogueRunner, buildTopicMenu } from './engine/dialogue.js';
import {
  buildMap, renderMap, computeCamera, isSolid, warpAt, interactAt, triggerAt,
  terrainAt, DIR_VEC, DIR_INDEX, VIEW_W, VIEW_H, initArt,
} from './engine/world.js';
import { TS } from './engine/art-ground.js';
import { buildActor, buildPortrait, PLAYER_SPEC, SPR_H } from './engine/art-actors.js';
import {
  dialogueLayout, drawDialogue, drawChoices, drawNotebook, drawTitle, drawToast,
  drawObjective, drawReader, drawDocTab, drawNotebookTabs, drawAnswer, drawPrompt, drawWayfinder,
  drawDisputeTab,
  wrapText,
} from './engine/ui.js';
import { Audio } from './engine/audio.js';
import { currentStep, progress, STANDING, chapterComplete, remainingIn } from './content/objectives.js';
import { DOCUMENTS, DOC_COUNT, FIDELITY_LABEL } from './content/documents.js';
import { MAPS } from './content/maps.js';
import { NPCS } from './content/npcs.js';
import { CLUES, benchScript } from './content/clues.js';
import { notebookEntries, sourceName, shortSourceName, KNOWLEDGE } from './content/knowledge.js';
import { PORTRAIT_ART } from './content/portraits.js';
import { DISPUTES, activeDisputes, disputeCompletedBy, sideSourceOf } from './content/disputes.js';

// Which chapters wear the hardened faces. March is the only time the player
// meets these people before anything has happened to them.
const HARD_CHAPTERS = new Set(['june', 'archive', 'september', 'reckoning']);

// Cast entries that are the same person in different clothes.
const PORTRAIT_ALIAS = { titubaJail: 'tituba', nurseJail: 'nurse' };

const MOVE_TIME = 0.16;      // seconds per tile
// Holding shift roughly halves that. The village is deliberately walkable
// rather than fast — noticing it is the whole point — but a student who has
// already read the seating chart and is going back for the boundary marker
// is not noticing anything, they are commuting. Crossing the map is about
// forty tiles, which is six seconds of held arrow key at walking pace.
const RUN_TIME = 0.095;
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
    this.audio = new Audio();
    this.state = new GameState();
    this.runner = new DialogueRunner(this.state);
    this.bindState();

    this.mode = 'title';
    this.titleIndex = 0;
    this.maps = {};
    this.portraits = new Map();
    this.drawnPortraits = new Map();
    this.toast = { text: '', t: 0 };
    this.notebookScroll = 0;
    this.docScroll = 0;
    this.notebookTab = 0;
    this.convNpc = null;
    this.objFlash = 0;
    this.moveHeld = 0;          // seconds of unbroken walking, for auto-run
    this.pendingDispute = null; // a contradiction waiting for a gap to speak in
    this.disputeSel = 0;
    this.lastStepId = null;
    this.reader = null;         // the document currently open
    this.answerText = '';

    initArt();
    this.loadPortraits();
    this.playerFrames = buildActor(PLAYER_SPEC);

    this.player = {
      map: 'memorial', tx: 13, ty: 25, px: 13 * TS, py: 25 * TS,
      dir: 'down', dirIndex: DIR_INDEX.down, moving: false, t: 0,
      fromX: 0, fromY: 0, steps: 0, animFrame: 0,
      frames: this.playerFrames,
    };

    this.saved = GameState.load();
    this.resize();
    addEventListener('resize', () => this.resize());
    // The canvas sits in an aspect-ratio box, so its size can change without
    // the window changing at all — notably when embedded in a host page that
    // resizes the frame after load.
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(canvas);
  }

  /* ---------------- setup ---------------- */

  /** Ambience is chosen by era and by whether you are under a roof. */
  syncAmbience() {
    const m = this.mapFor(this.player.map);
    const outdoor1692 = this.state.chapter === 'september' ? '1692-late' : '1692';
    this.audio.setAmbience(m.indoor ? 'indoor' : (m.era === 'present' ? 'present' : outdoor1692));
  }

  mapFor(id, chapter = this.state.chapter) {
    const key = `${id}:${chapter}`;
    if (!this.maps[key]) {
      const m = buildMap(MAPS[id], chapter);
      m.actors = (m.def.byChapter && m.def.byChapter[chapter] && m.def.byChapter[chapter].npcs !== undefined
        ? m.def.byChapter[chapter].npcs
        : (MAPS[id].npcs || [])).map((n) => this.makeNpc(n));
      this.maps[key] = m;
    }
    return this.maps[key];
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

  /**
   * The face in the dialogue box.
   *
   * Drawn art if we have it for this character and mood, procedural art
   * otherwise. The fallback is not a nicety: a portrait that fails to decode
   * would otherwise be a black rectangle in front of a class, and every
   * character still has a generated face that agrees with their sprite.
   *
   * Mood is the chapter. Everyone the player meets again after March has had
   * three months of this happen to them, and the face should say so before
   * the dialogue does.
   */
  portraitFor(npcId) {
    const mood = HARD_CHAPTERS.has(this.state.chapter) ? 'hard' : 'neutral';
    const key = `${npcId}:${mood}`;
    if (this.portraits.has(key)) return this.portraits.get(key);

    // The jail versions of Tituba and Rebecca Nurse are separate cast entries
    // because their clothing changes, but they are the same two faces.
    const artId = PORTRAIT_ALIAS[npcId] || npcId;
    const drawn = this.drawnPortraits.get(`${artId}-${mood}`)
               || this.drawnPortraits.get(`${artId}-neutral`);
    if (drawn) { this.portraits.set(key, drawn); return drawn; }

    const def = NPCS[npcId];
    const built = def ? buildPortrait(def.spec, mood) : null;
    this.portraits.set(key, built);
    return built;
  }

  /**
   * Decode the drawn portraits once at boot.
   *
   * They are data URIs compiled into the bundle, so this never touches the
   * network and cannot be blocked by a school filter — but decoding is still
   * async, so until each one lands the procedural face stands in. Nothing
   * waits on this and nothing breaks if it never finishes.
   */
  loadPortraits() {
    this.drawnPortraits = new Map();
    for (const [key, uri] of Object.entries(PORTRAIT_ART)) {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d');
        g.imageSmoothingEnabled = false;
        g.drawImage(img, 0, 0);
        this.drawnPortraits.set(key, { canvas: c, w: c.width, h: c.height });
        this.portraits.clear();       // re-resolve anything already cached
      };
      img.onerror = () => {};          // procedural portrait stands in
      img.src = uri;
    }
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
      this.bindState();
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
      this.bindState();
      this.player.map = 'memorial';
      this.setTile(13, 25);
      this.player.dir = 'up';
      this.player.dirIndex = DIR_INDEX.up;
    }
    this.mode = 'play';
    this.state.visited.add(this.player.map);
    this.lastStepId = (currentStep(this.state) || {}).id || null;
    this.syncAmbience();
    this.openingBeat();
  }

  openingBeat() {
    // Deliberately almost nothing. The game opens on a street in Salem in
    // the present day, and the memorial itself does the framing — the
    // threshold stones, twenty benches, and a bored seventeen-year-old.
    // The one thing worth saying out loud is the rule the whole game runs
    // on, and even that waits until the player has stepped into 1692.
    this.startScript([
      { say: 'Arrow keys or WASD to walk. Z to look at things and to talk. N for your notebook.', who: null },
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
      // Ambient villagers have no topics — they say their piece and go back
      // to work. Showing them a menu with one "say nothing more" option in
      // it would be worse than showing them nothing.
      if (!npc.def.topics || !npc.def.topics.length) { this.endConversation(); return; }
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

    // A contradiction is worth interrupting for, but not worth interrupting
    // mid-sentence. It waits until the conversation that produced it is
    // over, then the person in front of you says it, and the notebook keeps
    // it from then on.
    if (this.pendingDispute) {
      const d = this.pendingDispute;
      this.pendingDispute = null;
      const speaker = npc ? { id: npc.id, name: npc.name, spec: npc.def.spec } : null;
      this.startScript([
        { say: d.line, who: speaker ? npc.name : null },
        { say: `Both accounts are in your notebook now, marked as disagreeing. The game is not going to tell you which one is true.`, who: null },
      ], speaker, () => { this.finishConversation(); });
      this.showToast('Your sources disagree');
      return;
    }
    this.finishConversation();
  }

  finishConversation() {
    const npc = this.convNpc;
    if (npc) { npc.dir = npc.homeDir; npc.dirIndex = DIR_INDEX[npc.homeDir]; }
    this.convNpc = null;
    this.mode = 'play';
    this.dlg = null;
    this.save();
  }

  /**
   * Called by GameState whenever a genuinely new flag or document lands.
   *
   * Only the second half of a pair triggers anything, so the game points at
   * a disagreement once — at the moment it becomes a disagreement — and then
   * never mentions it again.
   */
  onRecord(key) {
    const d = disputeCompletedBy(this.state, key);
    if (d && this.state.noteDispute(d.id)) this.pendingDispute = d;
  }

  bindState() {
    this.state.onRecord = (key) => this.onRecord(key);
  }

  /** Rebuild the paginated view whenever the runner produces a new line. */
  syncDialogue() {
    const cur = this.runner.current;
    if (!cur) { this.dlg = null; return; }
    if (cur.type === 'choice') { this.dlg = null; this.choiceIndex = 0; return; }

    const portrait = cur.speaker ? this.portraitFor(cur.speaker.id) : null;
    // Stable per-speaker pitch, derived from the id so it never drifts.
    const id = cur.speaker ? cur.speaker.id : '';
    let hsum = 0; for (let i = 0; i < id.length; i++) hsum = (hsum * 31 + id.charCodeAt(i)) >>> 0;
    const pitch = id ? 0.8 + ((hsum % 70) / 100) : 0.62;
    const L = dialogueLayout(this.g, this.view, this.scale, cur.text, !!portrait);
    this.dlg = {
      who: cur.who || '',
      portrait,
      pitch,
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

  /**
   * Where on the CURRENT map the player should head for, to reach the goal.
   *
   * If the goal is on this map, that is the answer. If it is somewhere else,
   * point at the door that leads there — searching one hop further out, so
   * "the jail" resolves to the road exit while you are still in the village.
   * Returns null when there is nothing useful to point at.
   */
  goalTile() {
    const step = currentStep(this.state);
    if (!step || !step.where) return null;
    const w = typeof step.where === 'function' ? step.where(this.state) : step.where;
    if (!w) return null;

    const map = this.mapFor(this.player.map);
    if (w.map === map.id) return { x: w.x, y: w.y, here: true };

    // A door on this map that leads straight there.
    for (const warp of map.warps.values()) {
      if (warp.to === w.map) return { x: warp.x, y: warp.y, here: false };
    }
    // One hop: a door leading to a map that has a door leading there.
    for (const warp of map.warps.values()) {
      let next;
      try { next = this.mapFor(warp.to, warp.setChapter || this.state.chapter); } catch { continue; }
      for (const w2 of next.warps.values()) {
        if (w2.to === w.map) return { x: warp.x, y: warp.y, here: false };
      }
    }
    // Otherwise just head for the way out.
    const out = [...map.warps.values()][0];
    return out ? { x: out.x, y: out.y, here: false } : null;
  }

  /** The verb for whatever the player is facing, or null. Drives the prompt
   *  that floats over their head — the single most effective fix found in
   *  playtesting, because a 16px sheet of paper on a table is invisible. */
  facingVerb() {
    const map = this.mapFor(this.player.map);
    const [dx, dy] = DIR_VEC[this.player.dir];
    let [fx, fy] = this.facingTile();

    if (map.actors.some((a) => a.tx === fx && a.ty === fy)) return 'talk';
    if (map.talkThrough.has(`${fx},${fy}`)) {
      const bx = fx + dx, by = fy + dy;
      if (map.actors.some((a) => a.tx === bx && a.ty === by)) return 'talk';
      fx = bx; fy = by;
    }
    const spot = interactAt(map, fx, fy);
    if (!spot) return null;
    if (spot.doc) {
      // Never promise "read" on a locked document. Saying "read" and then
      // doing nothing is indistinguishable from the game being broken.
      if (spot.require && !this.state.knowsAll(spot.require)) return 'look';
      return this.state.hasDoc(spot.doc) ? 'read again' : 'read';
    }
    if (spot.bench || CLUES[spot.id]) return 'look';
    return null;
  }

  facingTile() {
    const [dx, dy] = DIR_VEC[this.player.dir];
    return [this.player.tx + dx, this.player.ty + dy];
  }

  interact() {
    const map = this.mapFor(this.player.map);
    const [dx, dy] = DIR_VEC[this.player.dir];
    let [fx, fy] = this.facingTile();

    let npc = map.actors.find((a) => a.tx === fx && a.ty === fy);
    // Speak through a grate. The jail scene is a conversation held through
    // iron bars, so interaction reaches one tile further when the thing in
    // the way is something you can talk through.
    if (!npc && map.talkThrough.has(`${fx},${fy}`)) {
      const bx = fx + dx, by = fy + dy;
      npc = map.actors.find((a) => a.tx === bx && a.ty === by);
      if (npc) { this.talkTo(npc); return; }
      fx = bx; fy = by;
    }
    if (npc) { this.talkTo(npc); return; }

    const spot = interactAt(map, fx, fy);
    if (!spot) return;

    // A document. Knowledge-gated exactly like a conversation topic: you
    // cannot read Parris's contract until you have counted his woodpile.
    if (spot.doc) {
      if (spot.require && !this.state.knowsAll(spot.require)) {
        this.startScript([{ say: spot.locked || 'Not yet.', who: null }], null, () => {
          this.mode = 'play'; this.dlg = null;
        });
        return;
      }
      this.openReader(spot.doc);
      return;
    }
    // Memorial benches are generated from their inscription data rather than
    // hand-written twenty times over.
    const script = spot.bench ? benchScript(spot.bench, this.state) : CLUES[spot.id];
    if (!script) return;

    const before = this.state.flags.size;
    this.startScript(script, null, () => {
      this.mode = 'play';
      this.dlg = null;
      if (this.state.flags.size > before) this.showToast('Noted in your notebook');
      this.save();
    });
  }

  showToast(text) { this.toast = { text, t: 2.6 }; this.audio.noted(); }

  openReader(id) {
    const doc = DOCUMENTS[id];
    if (!doc) return;
    this.reader = doc;
    this.docScroll = 0;
    this.mode = 'reader';
    // Opening it IS copying it. The second keypress was never discoverable,
    // and a player who has the document open in front of them has done the
    // only thing the game was ever asking for.
    if (this.state.copyDoc(id)) {
      this.showToast('Copied into your notebook');
      this.save();
    } else {
      this.audio.menuPick();
    }
  }

  /** Watch for a completed objective so it can be announced once. */
  checkObjective() {
    const step = currentStep(this.state);
    const id = step ? step.id : '__done__';
    if (this.lastStepId !== null && id !== this.lastStepId) {
      this.objFlash = 1.1;
      this.audio.objective();
    }
    this.lastStepId = id;
  }

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
    this.audio.step(terrainAt(map, p.tx, p.ty));

    const w = warpAt(map, p.tx, p.ty);
    if (w) {
      const blocked = this.warpBlocked(w);
      if (blocked) {
        // Step back off it and say what is still missing.
        this.setTile(p.fromX, p.fromY);
        this.startScript([
          { say: 'Not yet. There is something here you have not done.', who: null },
          { say: blocked, who: null },
        ], null, () => { this.mode = 'play'; this.dlg = null; });
        return;
      }
      this.doWarp(w);
      return;
    }

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

  /** A gated exit will not open until the chapter has actually been done. */
  warpBlocked(w) {
    if (!w.gate) return null;
    if (chapterComplete(this.state, w.gate)) return null;
    const left = remainingIn(this.state, w.gate);
    return left.length ? left[0].text : null;
  }

  doWarp(w) {
    const p = this.player;
    if (w.setChapter) {
      this.state.chapter = w.setChapter;
      this.lastStepId = (currentStep(this.state) || {}).id || null;
    }
    p.map = w.to;
    this.state.visited.add(w.to);
    this.setTile(w.tx, w.ty);
    p.dir = w.dir || 'down';
    p.dirIndex = DIR_INDEX[p.dir];
    this.mapFor(w.to);
    this.fade = 0.28;
    this.syncAmbience();
    if (w.script === 'arrive1692') this.audio.timeShift(); else this.audio.door();
    this.save();

    // A warp can carry its own arrival beat. Only one does: the gap in the
    // memorial wall, which is where the player crosses three centuries and
    // the game declines to explain how.
    if (w.script && CLUES[w.script] && !this.state.knows(`fired.warp.${w.script}`)) {
      this.state.learn(`fired.warp.${w.script}`, 'observed');
      this.startScript(CLUES[w.script], null, () => {
        this.mode = 'play';
        this.dlg = null;
        this.save();
      });
    }
  }

  /* ---------------- update ---------------- */

  update(dt) {
    const inp = this.input;

    if (this.toast.t > 0) this.toast.t -= dt;
    if (this.objFlash > 0) this.objFlash = Math.max(0, this.objFlash - dt);
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt);

    // Browsers require a gesture before audio; this is the first one.
    if (inp.justPressed('confirm') || inp.direction()) this.audio.unlock();
    if (this.mode !== 'title') this.checkObjective();

    if (this.mode === 'title') {
      const items = this.saved ? 2 : 1;
      if (inp.justPressed('up')) { this.titleIndex = (this.titleIndex + items - 1) % items; this.audio.menuMove(); }
      if (inp.justPressed('down')) { this.titleIndex = (this.titleIndex + 1) % items; this.audio.menuMove(); }
      if (inp.justPressed('confirm')) {
        this.audio.unlock();
        this.audio.menuPick();
        this.begin(!this.saved ? true : this.titleIndex === 1);
      }
      return;
    }

    if (this.mode === 'reader') {
      if (inp.justPressed('cancel') || inp.justPressed('notebook')) {
        this.mode = 'play'; this.reader = null; return;
      }
      // Z and X both close it now that opening does the copying.
      if (inp.justPressed('confirm')) { this.mode = 'play'; this.reader = null; return; }
      if (inp.isDown('down')) this.docScroll += 320 * dt;
      if (inp.isDown('up')) this.docScroll -= 320 * dt;
      this.docScroll = Math.max(0, Math.min(this.docScroll, this.docMax || 0));
      return;
    }

    if (this.mode === 'answer') return;   // driven by a DOM keydown handler

    if (this.mode === 'notebook') {
      if (inp.justPressed('cancel') || inp.justPressed('notebook')) this.mode = 'play';
      if (inp.justPressed('left')) {
        this.notebookTab = (this.notebookTab + 2) % 3;
        this.notebookScroll = 0;
        this.audio.menuMove();
      }
      if (inp.justPressed('right')) {
        this.notebookTab = (this.notebookTab + 1) % 3;
        this.notebookScroll = 0;
        this.audio.menuMove();
      }

      // On the disputes tab the arrows move a cursor rather than scrolling
      // freely, because 1/2/3 have to apply to something specific.
      if (this.notebookTab === 2) {
        const list = activeDisputes(this.state);
        if (list.length) {
          if (inp.justPressed('down')) { this.disputeSel = Math.min(list.length - 1, this.disputeSel + 1); this.audio.menuMove(); }
          if (inp.justPressed('up')) { this.disputeSel = Math.max(0, this.disputeSel - 1); this.audio.menuMove(); }
          const d = list[Math.min(this.disputeSel, list.length - 1)];
          const pick = (side) => {
            // Pressing the same key again clears it. A student who changes
            // their mind should not be stuck with their first instinct.
            this.state.setPosition(d.id, this.state.positionOn(d.id) === side ? null : side);
            this.audio.menuPick();
            this.save();
          };
          if (inp.justPressed('pos1')) pick('a');
          if (inp.justPressed('pos2')) pick('b');
          if (inp.justPressed('pos3')) pick('unsure');
        }
        return;
      }

      if (inp.isDown('down')) this.notebookScroll += 300 * dt;
      if (inp.isDown('up')) this.notebookScroll -= 300 * dt;
      // maxScroll comes back from the last draw, so clamp against that.
      this.notebookScroll = Math.max(0, Math.min(this.notebookScroll, this.notebookMax || 0));
      return;
    }

    // Reaching the reckoning's final step opens the closing screen.
    if (this.mode === 'play' && this.state.chapter === 'reckoning'
        && !this.state.answer && chapterComplete(this.state, 'reckoning')) {
      this.openAnswer();
      return;
    }

    if (this.mode === 'dialogue') {
      const cur = this.runner.current;
      if (cur && cur.type === 'choice') {
        const n = cur.options.length;
        if (inp.justPressed('up')) { this.choiceIndex = (this.choiceIndex + n - 1) % n; this.audio.menuMove(); }
        if (inp.justPressed('down')) { this.choiceIndex = (this.choiceIndex + 1) % n; this.audio.menuMove(); }
        if (inp.justPressed('confirm')) {
          this.audio.menuPick();
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
        if (this.dlg.revealed < this.dlg.total) {
          const before = Math.floor(this.dlg.revealed);
          this.dlg.revealed += REVEAL_CPS * dt;
          // A blip every few characters, pitched per speaker so the cast
          // sound different from each other and from narration.
          const after = Math.floor(this.dlg.revealed);
          if (Math.floor(after / 3) !== Math.floor(before / 3)) this.audio.blip(this.dlg.pitch);
        }
        if (inp.justPressed('confirm')) this.advanceDialogue();
      }
      return;
    }

    // ---- play ----
    if (inp.justPressed('notebook')) { this.mode = 'notebook'; this.notebookScroll = 0; return; }
    if (inp.justPressed('confirm')) { this.interact(); return; }

    const p = this.player;

    // Auto-run after a moment of unbroken walking, so the speed-up is
    // available to the touch d-pad too — a lot of these are going on
    // Chromebooks with no shift key in reach of the thumb holding a
    // direction. It also matches the intent on its own: potter around a
    // dooryard and you stay slow, cross the whole map and you speed up.
    const walking = p.moving || !!inp.direction();
    this.moveHeld = walking ? this.moveHeld + dt : 0;
    const stepTime = (inp.isDown('run') || this.moveHeld > 0.7) ? RUN_TIME : MOVE_TIME;

    if (p.moving) {
      p.t += dt / stepTime;
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

    // Wayfinder: only while walking, and only when the target is off screen.
    // If you can see the place, you do not need an arrow pointing at it.
    if (this.mode === 'play') {
      const t = this.goalTile();
      if (t) {
        const z = map.indoor ? 2 : 1;
        const tx = (t.x * TS + TS / 2 - cam.x) * z;
        const ty = (t.y * TS + TS / 2 - cam.y) * z;
        const onScreen = tx >= 0 && ty >= 0 && tx <= VIEW_W && ty <= VIEW_H;
        if (!onScreen) {
          const px0 = (Math.round(this.player.px) + TS / 2 - cam.x) * z;
          const py0 = (Math.round(this.player.py) + TS / 2 - cam.y) * z;
          const a = Math.atan2(ty - py0, tx - px0);
          const dist = t.here
            ? Math.round(Math.hypot(t.x - this.player.tx, t.y - this.player.ty))
            : null;
          drawWayfinder(g, v, s, a, dist);
        }
      }
    }

    // Interaction prompt, pinned over the player.
    if (this.mode === 'play') {
      const verb = this.facingVerb();
      if (verb) {
        const z = map.indoor ? 2 : 1;
        const sx = v.x + (Math.round(this.player.px) - cam.x + TS / 2) * z * s;
        const sy = v.y + (Math.round(this.player.py) - cam.y - (SPR_H - TS)) * z * s;
        drawPrompt(g, s, sx, sy, verb);
      }
    }

    // Objective HUD, above everything except the notebook.
    if (this.mode !== 'notebook') {
      const step = currentStep(this.state);
      drawObjective(g, v, s, {
        step,
        standing: STANDING.active(this.state) ? STANDING.text : null,
        progress: progress(this.state),
        sub: step && step.count ? step.count(this.state) : null,
        flash: this.objFlash,
      });
    }

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
      if (this.notebookTab === 0) {
        this.notebookMax = drawNotebook(
          g, v, s, notebookEntries(this.state), this.notebookScroll, sourceName) || 0;
      } else if (this.notebookTab === 1) {
        // Draw the shell, then the document list in place of the entries.
        drawNotebook(g, v, s, [], 0, sourceName);
        const docs = this.state.docLog().map((d) => DOCUMENTS[d.id]).filter(Boolean);
        this.notebookMax = drawDocTab(g, v, s, docs, this.notebookScroll, DOC_COUNT) || 0;
      } else {
        const list = activeDisputes(this.state);
        this.disputeSel = Math.min(this.disputeSel, Math.max(0, list.length - 1));
        this.notebookMax = drawDisputeTab(
          g, v, s, list, this.state, this.notebookScroll, this.disputeSel, shortSourceName) || 0;
      }
      drawNotebookTabs(g, v, s, this.notebookTab, this.state.docs.size, DOC_COUNT,
                       activeDisputes(this.state).length);
    }

    if (this.mode === 'reader' && this.reader) {
      this.docMax = drawReader(g, v, s, this.reader,
        FIDELITY_LABEL[this.reader.fidelity] || '', this.docScroll,
        this.state.hasDoc(this.reader.id)) || 0;
    }

    if (this.mode === 'answer') {
      drawAnswer(g, v, s, this.answerText, (Date.now() % 1000) < 500);
    }

    // Not over the reader: it lands squarely on the document's title, and
    // the reader's own header already says the same thing in green.
    if (this.toast.t > 0 && this.mode !== 'reader') {
      drawToast(g, v, s, this.toast.text, Math.min(1, this.toast.t));
    }
  }

  openAnswer() {
    this.mode = 'answer';
    this.answerText = this.state.answer || '';
  }

  submitAnswer() {
    this.state.answer = this.answerText.trim();
    this.save();
    this.mode = 'dialogue';
    this.startScript([
      { say: 'Written down.', who: null },
      { say: 'Nothing here is going to tell you whether you are right. Historians have been arguing about this for three hundred and thirty years and they have not finished.', who: null },
      { say: 'What you can do is show your working.', who: null },
      { say: 'Press "Copy my notes" below. Everything you saw, everyone who told you something, every paper you copied, and what you just wrote — as plain text you can paste anywhere.', who: null },
      { say: 'Twenty benches. Charter Street. Any time you like.', who: null },
    ], null, () => { this.mode = 'play'; this.dlg = null; });
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
      'SALEM VILLAGE, 1692',
      '',
    ];
    if (this.state.answer) {
      lines.push('MY ANSWER — what caused it?', '', this.state.answer, '',
                 '---------------------------------------------', '');
    }
    lines.push('WHAT I SAW AND WAS TOLD', '');
    if (!entries.length) {
      lines.push('(Nothing recorded yet.)');
    } else {
      entries.forEach((e, i) => {
        lines.push(`${i + 1}. ${e.text}`);
        lines.push(`   [${sourceName(e.source)}]`);
        lines.push('');
      });
    }

    const docs = this.state.docLog().map((d) => DOCUMENTS[d.id]).filter(Boolean);
    if (docs.length) {
      lines.push('---------------------------------------------', '');
      lines.push(`DOCUMENTS I COPIED  (${docs.length}/${DOC_COUNT})`, '');
      docs.forEach((d, i) => {
        lines.push(`${i + 1}. ${d.title} (${d.date})`);
        lines.push(`   ${d.note}`);
        lines.push(`   Source: ${d.cite}`);
        lines.push(`   [${FIDELITY_LABEL[d.fidelity]}]`);
        lines.push('');
      });
    }

    const disputes = activeDisputes(this.state);
    if (disputes.length) {
      lines.push('---------------------------------------------', '');
      lines.push(`WHERE MY SOURCES DISAGREED  (${disputes.length})`, '');
      disputes.forEach((d, i) => {
        const a = shortSourceName(d.a.startsWith('doc:') ? 'document' : this.state.sourceOf(d.a));
        const b = shortSourceName(d.b.startsWith('doc:') ? 'document' : this.state.sourceOf(d.b));
        const pos = this.state.positionOn(d.id);
        lines.push(`${i + 1}. ${d.claim}`);
        lines.push(`   ${a}: ${d.sideA}`);
        lines.push(`   ${b}: ${d.sideB}`);
        lines.push(pos === 'a' ? `   I find ${a} more credible.`
                 : pos === 'b' ? `   I find ${b} more credible.`
                 : pos === 'unsure' ? '   I cannot tell which of these is true.'
                 : '   I did not decide.');
        lines.push('');
      });
    }

    lines.push('---------------------------------------------', '');
    lines.push('A note on the pictures: no likeness survives of anyone in this');
    lines.push('story. The character portraits were generated with AI and');
    lines.push('hand-quantized to the game\'s palette. They are inventions, not');
    lines.push('evidence.', '');

    if (!this.state.answer) {
      lines.push('---------------------------------------------');
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
// Exposed for tools/fit checks: the reader's layout is only trustworthy when
// measured with the real fonts, so the checker borrows these rather than
// reimplementing the wrapping and getting a different answer.
window.__wrapText = wrapText;
window.__DOCUMENTS = DOCUMENTS;
window.__FIDELITY = FIDELITY_LABEL;
window.__readerMetrics = () => drawReader.metrics;
window.__benchScript = benchScript;
window.__DISPUTES = DISPUTES;
window.__MAPS = MAPS;
window.__currentStep = currentStep;
window.__activeDisputes = activeDisputes;

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

const soundBtn = document.getElementById('sound');
function paintSoundBtn() {
  if (soundBtn) soundBtn.textContent = game.audio.muted ? 'Sound: off' : 'Sound: on';
}
paintSoundBtn();
soundBtn?.addEventListener('click', () => {
  game.audio.unlock();
  game.audio.toggleMute();
  paintSoundBtn();
  canvas.focus();
});

document.getElementById('reset')?.addEventListener('click', () => {
  if (!confirm('Erase your saved progress and start again?')) return;
  GameState.clear();
  location.reload();
});

// The closing screen takes free text, so it needs a real key handler rather
// than the game's four-button input model.
addEventListener('keydown', (e) => {
  if (game.mode !== 'answer') return;
  if (e.key === 'Enter') {
    if (game.answerText.trim()) { e.preventDefault(); game.submitAnswer(); }
    return;
  }
  if (e.key === 'Backspace') { e.preventDefault(); game.answerText = game.answerText.slice(0, -1); return; }
  if (e.key.length === 1 && game.answerText.length < 1200) {
    e.preventDefault();
    game.answerText += e.key;
  }
}, true);

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
