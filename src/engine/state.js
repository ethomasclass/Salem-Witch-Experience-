// Player knowledge, and the record of where it came from.
//
// Two rules from the design doc drive this whole module:
//
//   "Gating by knowledge, not by items: you can't ask Putnam about the
//    Topsfield line until you've stood at the boundary marker."
//
//   "NPCs know who you've been talking to. 'Who told you that? Was it
//    Putnam?' — and their story shifts based on the answer."
//
// So a flag is never just a boolean. Every piece of knowledge remembers who
// the player heard it from, which is what lets a villager react to the
// source rather than only to the fact. That is the difference between a
// conversation and a lecture with walking.
//
// Storage is localStorage only — no accounts, no network, no analytics.
// COPPA/FERPA: this game must never learn anything about a student that
// leaves their own browser.

const SAVE_KEY = 'salem1692.save.v1';

// Chapters in order, for asking whether something happened before now.
const CHAPTER_ORDER = ['memorial', 'march', 'dig', 'june', 'archive', 'september', 'reckoning'];

export class GameState {
  constructor() {
    this.flags = new Map();        // flag -> { source, chapter, at }
    this.chapter = 'memorial';     // memorial|march|dig|june|archive|september|reckoning
    this.docs = new Map();         // doc id -> { chapter, at }
    this.answer = '';              // the player's final answer, never graded
    this.talkedTo = new Set();     // npc ids the player has spoken with
    // Which chapter each of them was FIRST spoken to in. `talkedTo` alone
    // cannot answer "did you know me before all this", because by June it
    // is true whether the player met them in March or thirty seconds ago.
    this.metIn = new Map();        // npc id -> chapter of first meeting
    this.lastSpoke = null;         // most recent npc id
    this.visited = new Set();      // map ids
    this.finalAnswer = '';

    // Disputes the game has already pointed out, so it says it once and
    // then shuts up, and the position the player has taken on each. A
    // position is never scored and never has to be given — it exists so the
    // exported notes can be an argument rather than an inventory.
    this.disputesSeen = new Set();   // dispute ids already announced
    this.positions = new Map();      // dispute id -> 'a' | 'b' | 'unsure'

    // Which of the four cases the player has filed each piece of evidence
    // under. Theirs, not the game's: nothing in the game says which theory a
    // fact supports, because deciding that is the whole skill. Unscored,
    // optional, and several facts can reasonably go under more than one.
    this.filed = new Map();          // flag -> Set of theory ids
  }

  /** Record a piece of knowledge. `source` is an npc id, a prop id, or
   *  'observed' for something the player simply saw. */
  learn(flag, source = 'observed') {
    if (this.flags.has(flag)) return false;
    this.flags.set(flag, { source, chapter: this.chapter, at: Date.now() });
    // The engine must not know what a dispute is — that is content. It just
    // reports that something genuinely new landed, and lets the game layer
    // decide whether it matters.
    if (this.onRecord) this.onRecord(flag);
    return true;
  }

  knows(flag) { return this.flags.has(flag); }

  /** Who the player heard this from. Null if they don't know it at all. */
  sourceOf(flag) {
    const rec = this.flags.get(flag);
    return rec ? rec.source : null;
  }

  /** True when every listed flag is known. Undefined/empty means no gate. */
  knowsAll(flags) {
    if (!flags || !flags.length) return true;
    return flags.every((f) => this.flags.has(f));
  }

  /** True when none of the listed flags are known. */
  knowsNone(flags) {
    if (!flags || !flags.length) return true;
    return flags.every((f) => !this.flags.has(f));
  }

  /** Copy a document into the notebook. */
  copyDoc(id) {
    if (this.docs.has(id)) return false;
    this.docs.set(id, { chapter: this.chapter, at: Date.now() });
    if (this.onRecord) this.onRecord(`doc:${id}`);
    return true;
  }

  hasDoc(id) { return this.docs.has(id); }

  docLog() {
    return [...this.docs.entries()]
      .sort((a, b) => a[1].at - b[1].at)
      .map(([id, rec]) => ({ id, ...rec }));
  }

  markSpoke(npcId) {
    if (!this.metIn.has(npcId)) this.metIn.set(npcId, this.chapter);
    this.talkedTo.add(npcId);
    this.lastSpoke = npcId;
  }

  hasSpokenTo(npcId) { return this.talkedTo.has(npcId); }

  /** True when the player met this character in an earlier chapter than the
   *  one they are standing in now. This is what makes March retroactively
   *  matter: the people you bothered to talk to then know you now. */
  metBefore(npcId) {
    const then = this.metIn.get(npcId);
    if (!then) return false;
    const i = CHAPTER_ORDER.indexOf(then), j = CHAPTER_ORDER.indexOf(this.chapter);
    return i >= 0 && j >= 0 && i < j;
  }

  /** True the first time a given dispute is raised. */
  noteDispute(id) {
    if (this.disputesSeen.has(id)) return false;
    this.disputesSeen.add(id);
    return true;
  }

  /** File or unfile a piece of evidence under one of the four cases. */
  toggleFiled(flag, theoryId) {
    if (!this.filed.has(flag)) this.filed.set(flag, new Set());
    const set = this.filed.get(flag);
    if (set.has(theoryId)) set.delete(theoryId); else set.add(theoryId);
    if (!set.size) this.filed.delete(flag);
    return set.has(theoryId);
  }

  filedUnder(flag) { return this.filed.get(flag) || new Set(); }

  /** Record, clear, or read which side the player finds more credible. */
  setPosition(id, side) {
    if (side === null) this.positions.delete(id);
    else this.positions.set(id, side);
  }

  positionOn(id) { return this.positions.get(id) || null; }

  /** Everything the player knows, newest first — backs the notebook screen
   *  and the end-of-game export. */
  knowledgeLog() {
    return [...this.flags.entries()]
      .sort((a, b) => a[1].at - b[1].at)
      .map(([flag, rec]) => ({ flag, ...rec }));
  }

  // ---- persistence -----------------------------------------------------

  serialize(player) {
    return JSON.stringify({
      v: 1,
      chapter: this.chapter,
      flags: [...this.flags.entries()],
      docs: [...this.docs.entries()],
      answer: this.answer,
      talkedTo: [...this.talkedTo],
      metIn: [...this.metIn.entries()],
      visited: [...this.visited],
      finalAnswer: this.finalAnswer,
      disputesSeen: [...this.disputesSeen],
      positions: [...this.positions.entries()],
      filed: [...this.filed.entries()].map(([f, set]) => [f, [...set]]),
      player: player ? { map: player.map, x: player.tx, y: player.ty, dir: player.dir } : null,
    });
  }

  save(player) {
    try {
      localStorage.setItem(SAVE_KEY, this.serialize(player));
      return true;
    } catch {
      // Private browsing, or storage disabled by policy. The game still
      // plays start-to-finish in one sitting; only resume is lost.
      return false;
    }
  }

  static load() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch { return null; }
    if (!raw) return null;
    let data;
    try { data = JSON.parse(raw); } catch { return null; }
    if (!data || data.v !== 1) return null;

    const s = new GameState();
    s.chapter = data.chapter || 'memorial';
    s.flags = new Map(data.flags || []);
    s.docs = new Map(data.docs || []);
    s.answer = data.answer || '';
    s.talkedTo = new Set(data.talkedTo || []);
    // A save from before metIn existed still loads; those characters simply
    // do not recognise the player, which is the safe way to be wrong.
    s.metIn = new Map(data.metIn || []);
    s.visited = new Set(data.visited || []);
    s.finalAnswer = data.finalAnswer || '';
    s.disputesSeen = new Set(data.disputesSeen || []);
    s.positions = new Map(data.positions || []);
    s.filed = new Map((data.filed || []).map(([f, ids]) => [f, new Set(ids)]));

    // Repair saves written while the memorial exit was missing its
    // setChapter. Those players walked into 1692 with the chapter still on
    // 'memorial', which froze the goal tracker on memorial steps and — worse
    // — meant the village never gained its exit to the dig, so the game
    // could not be finished. Standing on 1692 ground is proof the transition
    // happened, whatever the saved chapter says.
    if (s.chapter === 'memorial' && (s.visited.has('road') || s.visited.has('village'))) {
      s.chapter = 'march';
    }
    return { state: s, player: data.player || null };
  }

  static clear() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* nothing to do */ }
  }
}
