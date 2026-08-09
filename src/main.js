// Salem Village, 1692 — game loop.
//
// Chapter one of three: March 1692. Nothing has happened yet.

import { GameState } from './engine/state.js';
import { Input } from './engine/input.js';
import { DialogueRunner, buildTopicMenu } from './engine/dialogue.js';
import {
  buildMap, renderMap, computeCamera, isSolid, warpAt, interactAt, triggerAt, updateCritters,
  terrainAt, DIR_VEC, DIR_INDEX, VIEW_W, VIEW_H, initArt,
} from './engine/world.js';
import { TS } from './engine/art-ground.js';
import { buildActor, buildPortrait, PLAYER_SPEC, SPR_H } from './engine/art-actors.js';
import {
  dialogueLayout, drawDialogue, drawChoices, drawNotebook, drawTitle, drawToast,
  drawObjective, drawReader, drawNotebookTabs, drawAnswer, drawPrompt, drawWayfinder,
  drawDisputeTab, drawIntro, drawGroupedNotebook, drawDocGrid, drawTheoryTab,
  wrapText,
} from './engine/ui.js';
import { Audio } from './engine/audio.js';
import { currentStep, progress, STANDING, chapterComplete, remainingIn,
         stepText, outstanding, outstandingKey, outstandingMap,
         STEPS_BY_CHAPTER } from './content/objectives.js';
import { DIRECTIONS, pointerFor, withinSight } from './content/directions.js';
import { DOCUMENTS, DOC_COUNT, FIDELITY_LABEL } from './content/documents.js';
import { MAPS } from './content/maps.js';
import { NPCS } from './content/npcs.js';
import { CLUES, benchScript } from './content/clues.js';
import { notebookEntries, notebookGroups, sourceName, shortSourceName, KNOWLEDGE } from './content/knowledge.js';
import { PORTRAIT_ART } from './content/portraits.js';
import { DISPUTES, activeDisputes, disputeCompletedBy, sideSourceOf } from './content/disputes.js';
import { reckoningScript } from './content/reckoning.js';
import { THEORIES, THEORY_IDS, ARGUABLE, filableEntries, filedCounts } from './content/theories.js';

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

/**
 * The cold open.
 *
 * Numbers first, and only numbers that are not in dispute: nineteen hanged,
 * one pressed to death, at least five dead in custody. "At least" is doing
 * real work — jail deaths were recorded unevenly and historians do not agree
 * on a final figure, so the game says the floor and not a total. The village
 * population of roughly five hundred and the ten-month span are both standard.
 *
 * Then the thing the whole game is about, stated as a fact rather than as a
 * puzzle: nobody has ever agreed on why. A student who starts here knows,
 * before they take a single step, that they are walking into an argument and
 * not a mystery with an answer at the end of it.
 *
 * `hold` is seconds. Slow enough to read twice.
 */
const INTRO_CARDS = [
  { text: 'In 1692, in a farming village of about five hundred people, twenty-five people died.', hold: 6.5 },
  { text: 'Nineteen were hanged. One was pressed to death under stones. At least five died in jail, including an infant.', hold: 7.5 },
  { text: 'It took ten months.', hold: 4.5, big: true },
  { text: 'Nobody has ever agreed on why it happened.', hold: 5.5, big: true },
  { text: 'Salem, Massachusetts. Today.', hold: 4.5 },
];

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
    this.noteSel = 0;           // cursor in the grouped notebook
    this.noteOpen = new Set();  // which people's headings are expanded
    this.docSel = 0;            // cursor in the document collection
    this.readerFrom = 'world';  // where the reader was opened from
    this.theorySel = 0;         // cursor in the evidence-sorting tab
    this.theoryCases = false;   // showing the four arguments rather than the list
    this.stalled = 0;           // conversations since the goal last moved
    this.goalAtTalk = null;
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
    this.audio.setMusic(this.musicFor(m));
  }

  /**
   * Which tune belongs to where the player is standing.
   *
   * Rooms first, because two of them earn their own: the meetinghouse is the
   * only place in the village where this music was ever actually sung, and
   * the jail should barely have any. Then the year, because the outdoor tune
   * loses notes as the village empties — March has the phrase and its answer,
   * June has lost the answer, September is three notes and silence.
   *
   * The present day gets nothing at all. A memorial beside a working street
   * is not scored, and the silence is what makes the first step into 1692
   * land.
   */
  musicFor(m) {
    if (m.era === 'present') return m.id === 'archive' ? 'archive' : null;
    if (m.id === 'meetinghouse') return 'meetinghouse';
    if (m.id === 'jail') return 'jail';
    if (m.indoor) return 'indoor';
    if (this.state.chapter === 'september') return '1692-late';
    if (this.state.chapter === 'june') return '1692-june';
    return '1692';
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

  /**
   * Start the cold open, then the game.
   *
   * Only on a fresh start. A student who is resuming has already seen it, and
   * making them sit through the death toll again every time they come back
   * from a fire drill would turn the most serious thing in the game into an
   * obstacle between them and their save.
   */
  startIntro(fresh) {
    if (!fresh) { this.begin(false); return; }
    this.introCards = INTRO_CARDS;
    this.introIndex = 0;
    this.introT = 0;
    this.mode = 'intro';
    this.audio.unlock();
  }

  endIntro() {
    this.mode = 'title';          // begin() will move us on; never leave it here
    this.begin(true);
  }

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
    this.audio.duckMusic(true);
    this.mode = 'dialogue';
    this.choiceIndex = 0;
    this.runner.start(script, speaker, onEnd || (() => { this.endConversation(); }));
    this.syncDialogue();
  }

  talkTo(npc) {
    this.convNpc = npc;
    this.goalAtTalk = outstandingKey(this.state);
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

    // Otherwise, if this person has something useful to say about where the
    // player still has to go, they say it on the way out.
    if (npc) {
      const line = this.pointerLine(npc);
      if (line) {
        this.state.learn(`pointed.${npc.id}.${outstandingKey(this.state)}`, 'observed');
        this.stalled = 0;
        const speaker = { id: npc.id, name: npc.name, spec: npc.def.spec };
        this.startScript([{ say: line, who: npc.name }], speaker,
                         () => { this.finishConversation(); });
        return;
      }
    }
    this.finishConversation();
  }

  /**
   * Should this person volunteer a direction, and which one?
   *
   * Four conditions, and every one of them is here because the version
   * without it shipped and read as machinery:
   *
   *   - THE PLAYER HAS TO BE STUCK. `stalled` counts conversations that
   *     ended without the current goal changing. Two of those and the third
   *     person helps. Without this the pointer fired on every goodbye, and
   *     loudest from the ambient villagers — who have no topics at all, so
   *     their whole conversation was one greeting with a direction stapled
   *     to the end of it, every single time.
   *
   *   - NOT ABOUT SOMETHING YOU CAN SEE. Ingersoll used to tell the player
   *     to go and look at the account book four tiles behind him. Measured
   *     as "on screen from where the speaker stands", the same test the
   *     wayfinder chevron uses — not "same map", which would silence the
   *     boundary stone in the north woods because it shares a map with the
   *     well the player is standing at.
   *
   *   - NOT ABOUT A PAPER. Documents are unlocked by a person who says where
   *     the paper is as part of unlocking it. A pointer afterwards is that
   *     line again, a minute later, and in several cases it had gone stale
   *     and named furniture the paper was no longer on.
   *
   *   - AND THE CHARACTER HAS TO HAVE ONE, in this chapter, unsaid.
   */
  pointerLine(npc) {
    const key = outstandingKey(this.state);
    if (!key) return null;
    if (this.stalled < 2) return null;
    if (DOCUMENTS[key]) return null;
    const w = outstanding(this.state, currentStep(this.state));
    if (w && w.map === this.player.map
        && withinSight(this.mapFor(this.player.map).indoor, w.x - npc.tx, w.y - npc.ty)) {
      return null;
    }
    return pointerFor(this.state, npc.id, key);
  }

  finishConversation() {
    this.audio.duckMusic(false);
    const npc = this.convNpc;
    // Did this conversation move the player forward? If the goal is the same
    // one they walked in with, they are that much closer to being lost.
    const key = outstandingKey(this.state);
    if (key && key === this.goalAtTalk) this.stalled = (this.stalled || 0) + 1;
    else this.stalled = 0;
    this.goalAtTalk = key;
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
      // doing nothing is indistinguishable from the game being broken. A
      // gated spot is still worth examining — it is a bar, a table, a court
      // bench — it just has no paper on it yet.
      if (spot.require && !this.state.knowsAll(spot.require)) {
        return CLUES[spot.id] ? 'look' : null;
      }
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

    // A document.
    //
    // One object, one keypress. The seating chart and the working sheet
    // pinned up beside it used to be two interactables a tile apart: you
    // examined the chart, got the good beat about who sits where, saw no
    // document, and walked out. The account book was worse — the book on
    // the bar and the loose page from the same book were three tiles apart
    // across the room.
    //
    // So a document spot may also carry an `id`. Examining it plays that
    // observation once — the thing itself, in the room, before any
    // transcription — and then the reader opens on the same keypress.
    if (spot.doc) {
      const locked = spot.require && !this.state.knowsAll(spot.require);
      const intro = CLUES[spot.id];
      const fired = spot.id && this.state.knows(`fired.look.${spot.id}`);

      // Locked: the furniture is still there and still worth looking at.
      // What is missing is the paper, and it is missing rather than refused.
      if (locked) {
        if (!intro) return;
        this.state.learn(`fired.look.${spot.id}`, 'observed');
        const before = this.state.flags.size;
        this.startScript(intro, null, () => {
          this.mode = 'play'; this.dlg = null;
          if (this.state.flags.size > before) this.showToast('Noted in your notebook');
          this.save();
        });
        return;
      }

      if (intro && !fired) {
        this.state.learn(`fired.look.${spot.id}`, 'observed');
        this.startScript(intro, null, () => { this.openReader(spot.doc); });
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

  /**
   * Which papers exist, and which of them are asking to be picked up.
   *
   * Both come from one place — the gate written on the document's
   * interactable, which `buildMap` copies onto the sprite — so a paper is
   * drawn exactly when it is readable, and never the other way round.
   */
  syncPapers(map) {
    for (const p of map.props) {
      if (!p.docId) continue;
      p.hidden = !this.state.knowsAll(p.gate);
      p.live = !p.hidden && !this.state.hasDoc(p.docId);
    }
  }

  showToast(text) { this.toast = { text, t: 2.6 }; this.audio.noted(); }

  openReader(id) {
    this.audio.duckMusic(true);
    const doc = DOCUMENTS[id];
    if (!doc) { this.mode = 'play'; this.dlg = null; return; }
    this.reader = doc;
    this.dlg = null;          // may be arriving straight out of a look script
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
    // Same one-thing-at-a-time text the HUD shows, so the message at a closed
    // door and the message in the corner cannot say different things.
    return left.length ? stepText(this.state, left[0]) : null;
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

    // The village keeps going while you are reading. Freezing the animals
    // during dialogue would make every conversation feel like a cutscene,
    // and this game is nothing but conversations.
    this.clock = (this.clock || 0) + dt;
    const inWorld = this.mode !== 'title' && this.mode !== 'intro';
    if (inWorld) {
      const here = this.mapFor(this.player.map);
      updateCritters(here, dt, this.clock);
      this.syncPapers(here);

      // Villagers who are doing a job loop two frames on the spot. Actors
      // already carry three frames per direction and nothing had ever
      // cycled them while standing still, which is the difference between
      // a village and a diorama. Offset per character so the well and the
      // woodpile are not in time with each other.
      for (const a of here.actors || []) {
        if (!a.def || !a.def.busy) continue;
        const off = (a.tx * 3 + a.ty) * 0.37;
        a.animFrame = Math.floor(this.clock * 1.7 + off) % 2;
      }
    }

    if (this.toast.t > 0) this.toast.t -= dt;
    if (this.objFlash > 0) this.objFlash = Math.max(0, this.objFlash - dt);
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt);

    // Browsers require a gesture before audio; this is the first one.
    if (inp.justPressed('confirm') || inp.direction()) this.audio.unlock();
    if (inWorld) this.checkObjective();

    if (this.mode === 'title') {
      const items = this.saved ? 2 : 1;
      if (inp.justPressed('up')) { this.titleIndex = (this.titleIndex + items - 1) % items; this.audio.menuMove(); }
      if (inp.justPressed('down')) { this.titleIndex = (this.titleIndex + 1) % items; this.audio.menuMove(); }
      if (inp.justPressed('confirm')) {
        this.audio.unlock();
        this.audio.menuPick();
        this.startIntro(!this.saved ? true : this.titleIndex === 1);
      }
      return;
    }

    if (this.mode === 'intro') {
      this.introT += dt;
      // X skips the whole sequence. Z takes the next card — which on the last
      // card is the same as skipping, so a player who mashes Z through the
      // opening lands in the game rather than on a stuck screen.
      if (inp.justPressed('cancel')) { this.endIntro(); return; }
      const card = this.introCards[this.introIndex];
      if (inp.justPressed('confirm') || this.introT >= card.hold) {
        this.introIndex++;
        this.introT = 0;
        if (this.introIndex >= this.introCards.length) { this.endIntro(); return; }
      }
      return;
    }

    if (this.mode === 'reader') {
      // Closing goes back where it was opened from. A student who reopens
      // the Topsfield petition from the collection to check a date should
      // land back in the collection, not in a room three chapters away.
      const back = () => {
        this.audio.duckMusic(false);
        this.mode = this.readerFrom === 'notebook' ? 'notebook' : 'play';
        this.reader = null;
        this.readerFrom = 'world';
      };
      if (inp.justPressed('cancel') || inp.justPressed('notebook')) { back(); return; }
      // Z and X both close it now that opening does the copying.
      if (inp.justPressed('confirm')) { back(); return; }
      if (inp.isDown('down')) this.docScroll += 320 * dt;
      if (inp.isDown('up')) this.docScroll -= 320 * dt;
      this.docScroll = Math.max(0, Math.min(this.docScroll, this.docMax || 0));
      return;
    }

    if (this.mode === 'answer') return;   // driven by a DOM keydown handler

    if (this.mode === 'notebook') {
      if (inp.justPressed('cancel') || inp.justPressed('notebook')) this.mode = 'play';
      if (inp.justPressed('left')) {
        this.notebookTab = (this.notebookTab + 3) % 4;
        this.notebookScroll = 0;
        this.audio.menuMove();
      }
      if (inp.justPressed('right')) {
        this.notebookTab = (this.notebookTab + 1) % 4;
        this.notebookScroll = 0;
        this.audio.menuMove();
      }

      // Tab 0: headings. Up and down move between people, Z opens the one
      // you are on. Nothing scrolls freely any more — a student looking for
      // what Rebecca Nurse said should be able to find it by name.
      if (this.notebookTab === 0) {
        const groups = notebookGroups(this.state);
        if (groups.length) {
          this.noteSel = Math.min(this.noteSel, groups.length - 1);
          if (inp.justPressed('down')) { this.noteSel = Math.min(groups.length - 1, this.noteSel + 1); this.audio.menuMove(); }
          if (inp.justPressed('up')) { this.noteSel = Math.max(0, this.noteSel - 1); this.audio.menuMove(); }
          if (inp.justPressed('confirm')) {
            const k = groups[this.noteSel].key;
            if (this.noteOpen.has(k)) this.noteOpen.delete(k); else this.noteOpen.add(k);
            this.audio.menuPick();
          }
          // Keep the cursor on screen as the list grows under it. Only an
          // approximation — an open heading is taller than a closed one —
          // but it only has to stop the cursor leaving the panel.
          const approx = this.noteSel * 20 * this.scale;
          const window = 200 * this.scale;
          if (approx - this.notebookScroll > window) this.notebookScroll = approx - window;
          if (approx < this.notebookScroll) this.notebookScroll = approx;
          this.notebookScroll = Math.max(0, Math.min(this.notebookScroll, this.notebookMax || 0));
        }
        return;
      }

      // Tab 1: the document grid. Arrows move through the fifteen slots, Z
      // reopens whichever one you are on — a document used to be readable
      // exactly once, at the table it was found on, which for a game that
      // ends by asking what you think caused it was a real gap.
      if (this.notebookTab === 1) {
        // Up and down walk the whole grid in reading order, one slot at a
        // time. Left and right belong to the tabs everywhere else in this
        // screen, and stealing them here to mean "next column" would make
        // the one key that always changes tab sometimes not change tab.
        const order = Object.keys(DOCUMENTS);
        const cols = 5;
        if (inp.justPressed('down')) { this.docSel = Math.min(order.length - 1, this.docSel + 1); this.audio.menuMove(); }
        if (inp.justPressed('up')) { this.docSel = Math.max(0, this.docSel - 1); this.audio.menuMove(); }
        if (inp.justPressed('confirm') && this.state.hasDoc(order[this.docSel])) {
          this.readerFrom = 'notebook';
          this.openReader(order[this.docSel]);
        }
        const row = Math.floor(this.docSel / cols);
        const rowH = 66 * this.scale;
        if (row * rowH - this.notebookScroll > 120 * this.scale) this.notebookScroll = row * rowH - 120 * this.scale;
        if (row * rowH < this.notebookScroll) this.notebookScroll = row * rowH;
        this.notebookScroll = Math.max(0, Math.min(this.notebookScroll, this.notebookMax || 0));
        return;
      }

      // Tab 3: the four cases. Same shape as the disputes tab — a cursor,
      // and number keys that apply to whatever it is on. Z flips to the four
      // arguments themselves, with the historians who make them, because a
      // student cannot sort evidence into four buckets they have only seen
      // named once, on a panel, twenty minutes ago.
      if (this.notebookTab === 3) {
        if (inp.justPressed('confirm')) { this.theoryCases = !this.theoryCases; this.audio.menuPick(); return; }
        if (this.theoryCases) return;
        const items = filableEntries(this.state, KNOWLEDGE);
        if (items.length) {
          this.theorySel = Math.min(this.theorySel, items.length - 1);
          if (inp.justPressed('down')) { this.theorySel = Math.min(items.length - 1, this.theorySel + 1); this.audio.menuMove(); }
          if (inp.justPressed('up')) { this.theorySel = Math.max(0, this.theorySel - 1); this.audio.menuMove(); }
          const item = items[Math.min(this.theorySel, items.length - 1)];
          const file = (n) => {
            this.state.toggleFiled(item.flag, THEORY_IDS[n]);
            this.audio.menuPick();
            this.save();
          };
          if (inp.justPressed('pos1')) file(0);
          if (inp.justPressed('pos2')) file(1);
          if (inp.justPressed('pos3')) file(2);
          if (inp.justPressed('pos4')) file(3);
          const approx = this.theorySel * 32 * this.scale;
          const window = 150 * this.scale;
          if (approx - this.notebookScroll > window) this.notebookScroll = approx - window;
          if (approx < this.notebookScroll) this.notebookScroll = approx;
          this.notebookScroll = Math.max(0, Math.min(this.notebookScroll, this.notebookMax || 0));
        }
        return;
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

    if (this.mode === 'intro') {
      drawIntro(g, v, s, this.introCards[this.introIndex], this.introT);
      return;
    }

    if (this.mode === 'title') {
      // The memorial itself, drifting, behind the words. Rendered with the
      // map's own actors so Nora is already sitting on the wall — the title
      // screen is a shot of the first thing the player will walk into, not an
      // illustration of it.
      //
      // Asked for by chapter rather than by current state on purpose: if a
      // save exists from September, mapFor('memorial') would hand back the
      // 1692 version and the title would be a picture of the wrong century.
      let scene = false;
      try {
        const m = this.mapFor('memorial', 'memorial');
        const t = this.clock || 0;
        const cam = computeCamera(m, (13 + Math.sin(t * 0.055) * 3.2) * TS,
                                     (14 + Math.sin(t * 0.031) * 2.2) * TS);
        renderMap(this.bg, m, cam, m.actors, t);
        g.imageSmoothingEnabled = false;
        g.drawImage(this.buf, v.x, v.y, v.w, v.h);
        scene = true;
      } catch (e) {
        // A title screen must never be the thing that fails to load. If the
        // memorial cannot be built for any reason, fall back to the gradient.
        scene = false;
      }
      drawTitle(g, v, s, !!this.saved, this.titleIndex, scene);
      return;
    }

    const map = this.mapFor(this.player.map);
    const cam = computeCamera(map, this.player.px, this.player.py);
    const actors = [this.player, ...map.actors];
    renderMap(this.bg, map, cam, actors, this.clock || 0);

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

    // Objective HUD.
    //
    // Only while the player is actually walking around. It used to draw over
    // conversations and over open documents, which meant a student could read
    // what to do next in the middle of somebody telling them something —
    // there is no version of that where the goal does not win, because it is
    // yellow, it is short, and it is the only thing on screen that is an
    // instruction. Reading a primary source has the same problem.
    //
    // It comes back the moment the conversation ends, so nothing is lost;
    // it just stops competing.
    if (this.mode === 'play') {
      const step = currentStep(this.state);
      drawObjective(g, v, s, {
        step,
        text: stepText(this.state, step),
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
        drawNotebook(g, v, s, null, 0, sourceName, 'What I have seen and been told');
        this.notebookMax = drawGroupedNotebook(
          g, v, s, notebookGroups(this.state), this.notebookScroll,
          this.noteSel, this.noteOpen) || 0;
      } else if (this.notebookTab === 1) {
        // Draw the shell, then the collection in place of the entries.
        drawNotebook(g, v, s, null, 0, sourceName, 'The papers I have copied down');
        this.notebookMax = drawDocGrid(
          g, v, s, Object.keys(DOCUMENTS), this.state.docs, DOCUMENTS,
          this.docSel, this.notebookScroll) || 0;
      } else if (this.notebookTab === 3) {
        drawNotebook(g, v, s, null, 0, sourceName,
                     this.theoryCases ? 'The four cases' : 'Why it happened');
        this.notebookMax = drawTheoryTab(
          g, v, s, THEORIES, filedCounts(this.state),
          filableEntries(this.state, KNOWLEDGE), this.state,
          this.theorySel, this.notebookScroll, this.theoryCases) || 0;
      } else {
        const list = activeDisputes(this.state);
        this.disputeSel = Math.min(this.disputeSel, Math.max(0, list.length - 1));
        this.notebookMax = drawDisputeTab(
          g, v, s, list, this.state, this.notebookScroll, this.disputeSel, shortSourceName) || 0;
      }
      const HELP = [
        '↑ ↓ move  ·  Z open a heading  ·  ← → tabs  ·  X close',
        '↑ ↓ move  ·  Z read it again  ·  ← → tabs  ·  X close',
        '↑ ↓ move  ·  1 2 3 take a position  ·  ← → tabs  ·  X close',
        this.theoryCases
          ? 'Z back to the evidence  ·  ← → tabs  ·  X close'
          : '↑ ↓ move  ·  1 2 3 4 file it under a case  ·  Z what these mean  ·  X close',
      ];
      drawNotebookTabs(g, v, s, this.notebookTab, this.state.docs.size, DOC_COUNT,
                       activeDisputes(this.state).length, HELP[this.notebookTab],
                       this.state.filed.size);
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

  /**
   * The closing question — but not before the game has said something back.
   *
   * The reckoning plays once, is built entirely out of what this player
   * actually did, and hands over to the text box on its last line. Flagged
   * rather than held in memory so a student who closes the tab mid-ending
   * does not sit through it twice.
   */
  openAnswer() {
    if (!this.state.knows('reck.reckoned')) {
      this.state.learn('reck.reckoned', 'observed');
      this.save();
      this.mode = 'dialogue';
      this.startScript(reckoningScript(this.state), null, () => {
        this.mode = 'answer';
        this.answerText = this.state.answer || '';
      });
      return;
    }
    this.mode = 'answer';
    this.answerText = this.state.answer || '';
  }

  submitAnswer() {
    this.state.answer = this.answerText.trim();
    this.save();
    this.mode = 'dialogue';
    // The reckoning has already said that nothing here will tell you whether
    // you are right, so this does not say it twice. It hands over the
    // artifact and gets out of the way.
    this.startScript([
      { say: 'Written down.', who: null },
      { say: 'That is your answer, and it is the only one in this game that belongs to anybody. Everything else in here belonged to somebody who was dead before your country existed.', who: null },
      { say: 'What you can do now is show your working.', who: null },
      { say: 'Press "Copy my notes" below. Everything you saw, everyone who told you something, every paper you copied, every place your sources disagreed and what you made of it — as plain text you can paste anywhere.', who: null },
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
    // Grouped the same way the notebook on screen is grouped, by who told
    // the player. A student pasting this into an assignment should get the
    // structure they were reading from, not a different one — and grouping
    // by source puts "how do you know that?" next to every claim.
    //
    // Numbering stays continuous across the groups, so an instruction like
    // "cite three entries by number" still works.
    lines.push('WHAT I SAW AND WAS TOLD', '');
    if (!entries.length) {
      lines.push('(Nothing recorded yet.)');
    } else {
      let n = 0;
      for (const grp of notebookGroups(this.state)) {
        lines.push(`${grp.label.toUpperCase()}  (${grp.entries.length})`, '');
        for (const e of grp.entries) {
          n += 1;
          lines.push(`${n}. ${e.text}`);
        }
        lines.push('');
      }
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

    // What they made of it. Their filing, in their order, with nothing said
    // about whether it is the right shape.
    const filed = filedCounts(this.state);
    const filedTotal = Object.values(filed).reduce((n, c) => n + c, 0);
    if (filedTotal) {
      lines.push('---------------------------------------------', '');
      lines.push('HOW I SORTED THE EVIDENCE', '');
      for (const t of THEORIES) {
        lines.push(`${t.title}  (${filed[t.id]})`);
        lines.push(`   ${t.blurb}`);
        lines.push(`   ${t.cite}`);
        const mine = filableEntries(this.state, KNOWLEDGE)
          .filter((e) => this.state.filedUnder(e.flag).has(t.id));
        if (!mine.length) lines.push('   (I did not put anything under this one.)');
        for (const e of mine) lines.push(`   - ${e.text}`);
        lines.push('');
      }
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
window.__objectives = { currentStep, stepText, outstanding, outstandingKey, STEPS_BY_CHAPTER };
window.__directions = { DIRECTIONS, pointerFor };
window.__objectives.outstandingMap = outstandingMap;
window.__directions.withinSight = withinSight;
window.__theories = { THEORIES, THEORY_IDS, ARGUABLE, filableEntries, filedCounts };
window.__GameState = GameState;
window.__KNOWLEDGE = KNOWLEDGE;
window.__NPCS = NPCS;
window.__chapterComplete = chapterComplete;
window.__updateCritters = updateCritters;
window.__isSolid = isSolid;
window.__CLUES = CLUES;
window.__reckoningScript = reckoningScript;
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
// Three settings, not two. A teacher who wants a room of thirty quieter
// almost always wants the tune gone and the footsteps and dialogue blips
// left alone — those are feedback about what the game is doing, and losing
// them makes it harder to play, not calmer.
const SOUND_LABEL = { all: 'Sound: on', quiet: 'Sound: no music', off: 'Sound: off' };
function paintSoundBtn() {
  if (soundBtn) soundBtn.textContent = SOUND_LABEL[game.audio.sound] || 'Sound: on';
}
paintSoundBtn();
soundBtn?.addEventListener('click', () => {
  game.audio.unlock();
  game.audio.cycleSound();
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
