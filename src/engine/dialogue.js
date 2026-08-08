// The dialogue runner.
//
// Scripts are plain arrays of ops so that writing a conversation stays close
// to writing prose. The interpreter is a small stack machine — enough for
// branching, knowledge gates and source-sensitive replies, and deliberately
// not enough to become a scripting language nobody wants to maintain.
//
//   'a bare string'                  the current speaker says it
//   { say, who, mood }               explicit speaker / portrait mood
//   { learn: 'flag' }                record knowledge, sourced to this NPC
//   { if: {...}, then: [], else: [] } branch on what the player knows
//   { bySource: 'flag', cases: {}, default: [] }
//                                    branch on WHO told them
//   { choice: [ { label, require, then } ] }
//   { end: true }                    stop early
//
// Condition objects accept: knows: [], notKnows: [], spokenTo: [], metBefore: [],
// notMetBefore: [], chapter.

export class DialogueRunner {
  constructor(state) {
    this.state = state;
    this.stack = [];
    this.speaker = null;      // { id, name, spec }
    this.current = null;      // { type: 'say' | 'choice', ... }
    this.onEnd = null;
  }

  get active() { return this.current !== null; }

  start(script, speaker, onEnd = null) {
    this.speaker = speaker || null;
    this.stack = [{ ops: script, i: 0 }];
    this.onEnd = onEnd;
    this.current = null;
    this.step();
  }

  /** Player pressed confirm on a line of text. */
  advance() {
    if (!this.current || this.current.type !== 'say') return;
    this.current = null;
    this.step();
  }

  /** Player picked option `idx` from a choice. */
  choose(idx) {
    if (!this.current || this.current.type !== 'choice') return;
    const opt = this.current.options[idx];
    // Remembered so the caller can tell "asked a question" (reopen the topic
    // list) from "chose to stop talking" (end the conversation).
    this.lastChoiceIndex = idx;
    this.lastChoiceCount = this.current.options.length;
    this.current = null;
    if (opt && opt.then && opt.then.length) {
      this.stack.push({ ops: opt.then, i: 0 });
    }
    this.step();
  }

  // ---- interpreter -----------------------------------------------------

  step() {
    while (this.stack.length) {
      const frame = this.stack[this.stack.length - 1];
      if (frame.i >= frame.ops.length) { this.stack.pop(); continue; }
      const op = frame.ops[frame.i++];
      if (this.exec(op)) return;   // yielded something for the UI to show
    }
    this.finish();
  }

  /** Returns true if this op produced output and execution should pause. */
  exec(op) {
    if (op == null) return false;

    if (typeof op === 'string') {
      this.current = {
        type: 'say',
        who: this.speaker ? this.speaker.name : '',
        text: op,
        speaker: this.speaker,
        mood: 'neutral',
      };
      return true;
    }

    if (op.say !== undefined) {
      this.current = {
        type: 'say',
        who: op.who !== undefined ? op.who : (this.speaker ? this.speaker.name : ''),
        text: op.say,
        // `who: null` means narration — no portrait, no name plate.
        speaker: op.who === null ? null : (op.speaker || this.speaker),
        mood: op.mood || 'neutral',
      };
      return true;
    }

    if (op.learn) {
      const src = op.source || (this.speaker ? this.speaker.id : 'observed');
      const flags = Array.isArray(op.learn) ? op.learn : [op.learn];
      for (const f of flags) this.state.learn(f, src);
      return false;
    }

    if (op.if) {
      const branch = this.test(op.if) ? op.then : op.else;
      if (branch && branch.length) this.stack.push({ ops: branch, i: 0 });
      return false;
    }

    if (op.bySource) {
      // "Who told you that? Was it Putnam?" — the same fact lands
      // differently depending on whose mouth it came out of.
      const src = this.state.sourceOf(op.bySource);
      const branch = (src && op.cases && op.cases[src]) || op.default;
      if (branch && branch.length) this.stack.push({ ops: branch, i: 0 });
      return false;
    }

    if (op.choice) {
      const options = op.choice
        .filter((o) => this.test(o))
        .map((o) => ({ label: o.label, then: o.then || [] }));
      if (!options.length) return false;
      this.current = { type: 'choice', options, speaker: this.speaker };
      return true;
    }

    if (op.end) { this.stack.length = 0; return false; }

    return false;
  }

  /** Evaluate a gate object. Missing keys always pass. */
  test(cond) {
    if (!cond) return true;
    const s = this.state;
    if (cond.require && !s.knowsAll(cond.require)) return false;
    if (cond.knows && !s.knowsAll(cond.knows)) return false;
    if (cond.notKnows && !s.knowsNone(cond.notKnows)) return false;
    if (cond.hide && s.knowsAll(cond.hide)) return false;
    if (cond.spokenTo && !cond.spokenTo.every((id) => s.hasSpokenTo(id))) return false;
    if (cond.notSpokenTo && cond.notSpokenTo.some((id) => s.hasSpokenTo(id))) return false;
    // "You knew me before this started." Names the id from the EARLIER
    // chapter, so the jail versions of Tituba and Rebecca Nurse ask about
    // the March versions of themselves.
    if (cond.metBefore && !cond.metBefore.every((id) => s.metBefore(id))) return false;
    if (cond.notMetBefore && cond.notMetBefore.some((id) => s.metBefore(id))) return false;
    if (cond.chapter && s.chapter !== cond.chapter) return false;
    if (typeof cond.when === 'function' && !cond.when(s)) return false;
    return true;
  }

  finish() {
    this.current = null;
    this.stack.length = 0;
    const cb = this.onEnd;
    this.onEnd = null;
    if (cb) cb();
  }
}

/**
 * Build the topic menu for an NPC out of whatever the player currently
 * knows. Topics the player has no business asking about simply are not
 * listed — the design doc is firm that gating is by knowledge, and that an
 * unavailable topic should be invisible rather than greyed out. A visible
 * locked option tells the player there is a checklist; an absent one lets
 * them discover there was something to ask.
 */
export function buildTopicMenu(npc, state) {
  const runner = { test: DialogueRunner.prototype.test, state };
  const available = (npc.topics || []).filter((t) => {
    // Asked topics drop off the list by default. Two reasons: the shrinking
    // menu shows the player what they have not raised yet, and it guarantees
    // a conversation terminates — otherwise a player holding the confirm key
    // re-picks the first topic forever and can never get out.
    if (!t.repeatable && state.knows(`asked.${npc.id}.${t.id}`)) return false;
    return DialogueRunner.prototype.test.call(runner, t);
  });

  const options = available.map((t) => ({
    label: t.label,
    then: [
      { learn: `asked.${npc.id}.${t.id}`, source: npc.id },
      ...t.lines,
    ],
  }));

  options.push({ label: 'Say nothing more.', then: npc.farewell || [] });
  return options;
}
