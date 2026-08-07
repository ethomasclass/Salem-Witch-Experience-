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

export class GameState {
  constructor() {
    this.flags = new Map();        // flag -> { source, chapter, at }
    this.chapter = 'memorial';     // memorial|march|dig|june|archive|september|reckoning
    this.docs = new Map();         // doc id -> { chapter, at }
    this.answer = '';              // the player's final answer, never graded
    this.talkedTo = new Set();     // npc ids the player has spoken with
    this.lastSpoke = null;         // most recent npc id
    this.visited = new Set();      // map ids
    this.finalAnswer = '';
  }

  /** Record a piece of knowledge. `source` is an npc id, a prop id, or
   *  'observed' for something the player simply saw. */
  learn(flag, source = 'observed') {
    if (this.flags.has(flag)) return false;
    this.flags.set(flag, { source, chapter: this.chapter, at: Date.now() });
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
    return true;
  }

  hasDoc(id) { return this.docs.has(id); }

  docLog() {
    return [...this.docs.entries()]
      .sort((a, b) => a[1].at - b[1].at)
      .map(([id, rec]) => ({ id, ...rec }));
  }

  markSpoke(npcId) {
    this.talkedTo.add(npcId);
    this.lastSpoke = npcId;
  }

  hasSpokenTo(npcId) { return this.talkedTo.has(npcId); }

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
      visited: [...this.visited],
      finalAnswer: this.finalAnswer,
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
    s.visited = new Set(data.visited || []);
    s.finalAnswer = data.finalAnswer || '';
    return { state: s, player: data.player || null };
  }

  static clear() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* nothing to do */ }
  }
}
