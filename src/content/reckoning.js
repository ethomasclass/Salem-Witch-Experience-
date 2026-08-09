// The reckoning: what the game says back before it asks its question.
//
// Thirty-two minutes of village and then a blank text box is an assignment
// prompt, not an ending. This is the beat in between — the game reading the
// player's own path back to them, out of state it already has, and then
// getting out of the way.
//
// THREE RULES, and the whole thing falls apart without them.
//
//   1. It reports what the player DID. Never what they missed. No counts out
//      of a total, no percentage, no "you only found eight of fifteen". A
//      memorial that grades you is a score screen, and the twenty benches are
//      deliberately identical for exactly this reason.
//
//   2. It does not adjudicate. It can say the player believed Tituba over
//      Parris. It cannot say they were right to. Historians have been at this
//      for three hundred and thirty years.
//
//   3. It works for a student who rushed. Somebody who talked to three people
//      and copied one paper still gets an ending that is about them and does
//      not sound disappointed.

import { DISPUTES, activeDisputes } from './disputes.js';
import { shortSourceName } from './knowledge.js';

/** People, not papers: how many living sources actually told this player
 *  something. 'observed' is the player's own eyes and does not count. */
function voices(state) {
  const who = new Set();
  for (const [, rec] of state.flags) {
    if (rec.source && rec.source !== 'observed') who.add(rec.source);
  }
  return who;
}

export function reckoningScript(state) {
  const L = [];
  const say = (text) => L.push({ say: text, who: null });

  say('Charter Street. The traffic is still there, and the shop across the road is still open.');
  say('Twenty benches, all the same length.');

  // --- Rebecca Nurse, who is the spine of the whole structure -----------
  //
  // She is the only one of the twenty the player can meet alive. That is the
  // reason the memorial is chapter zero and the reason her bench is the one
  // beside the gap.
  const metHer = state.talkedTo.has('nurse') || state.talkedTo.has('nurseJail');
  if (metHer) {
    say('Of the twenty people named on this wall, you met one of them alive.');
    if (state.knows('june.warned')) {
      say('You stood on the other side of a grate in June and told her the date that is cut into her bench. She did not believe you. She asked whether you had eaten.');
      say('She was hanged on the nineteenth of July, which is what the stone says, and which you already knew in March.');
    } else if (state.talkedTo.has('nurseJail')) {
      say('You saw her twice. Once in her own kitchen, and once through a grate, and she was worried about her sister both times.');
    } else {
      say('You sat in her kitchen in March. She offered you something to eat and complained about the road.');
    }
  } else {
    say('You read her name here before you knew whose it was.');
  }

  // --- the noticing -----------------------------------------------------
  //
  // The one moment in the game where somebody looks back. It belongs here
  // more than anywhere, and it is the only line in this script that says
  // something about the player rather than about 1692.
  if (state.knows('sept.noticed')) {
    say('And in September a twelve-year-old girl in the Putnam house stopped what she was doing, looked directly at you, and asked whether you had been there before.');
    say('There was no answer you could give her. There was no option on the screen.');
    if (state.knows('reck.annapology')) {
      say('Fourteen years later she stood in that meeting house while her apology was read out over her head. She was the only one of them who ever did.');
    }
  }

  // --- who talked to you ------------------------------------------------
  const n = voices(state).size;
  if (n >= 8) {
    say(`${n} people told you something. Not one of them was lying to you, and no two of them agreed.`);
  } else if (n >= 3) {
    say(`${n} people told you something, and they did not tell you the same thing.`);
  } else if (n > 0) {
    say('You did not talk to many of them. What you did hear, you heard first-hand, from somebody standing in their own kitchen.');
  } else {
    say('You did not ask anybody. Everything you have, you saw yourself.');
  }

  // --- what the player made of the disagreements ------------------------
  //
  // This is the only place in the game that reads a judgement back, and it
  // is deliberately the player's own words about their own sources.
  const live = activeDisputes(state);
  const decided = live.filter((d) => state.positionOn(d.id) && state.positionOn(d.id) !== 'unsure');
  const unsure = live.filter((d) => state.positionOn(d.id) === 'unsure');

  if (decided.length) {
    say('You took a side.');
    for (const d of decided.slice(0, 3)) {
      const side = state.positionOn(d.id) === 'a' ? d.a : d.b;
      const who = shortSourceName(side.startsWith('doc:') ? 'document' : state.sourceOf(side));
      say(`On ${lower(d.claim)} — you believed ${who}.`);
    }
  }
  if (unsure.length) {
    say(unsure.length === 1
      ? `On ${lower(unsure[0].claim)}, you could not tell which account was true, and you said so. That is a real answer and it is written down as one.`
      : `On ${unsure.length} of them you could not tell, and you said so. That is a real answer and it is written down as one.`);
  }
  if (live.length && !decided.length && !unsure.length) {
    say('Your sources contradicted each other and you left every one of those contradictions open. Somebody will have to close them eventually.');
  }

  // --- the papers -------------------------------------------------------
  const docs = state.docs.size;
  if (docs >= 12) {
    say(`You copied ${docs} papers down in a handwriting nobody in 1692 could read.`);
  } else if (docs > 0) {
    say(`You copied ${docs} ${docs === 1 ? 'paper' : 'papers'} down.`);
  }

  // --- the descendant ---------------------------------------------------
  if (state.knows('reck.bothsides')) {
    say('The woman on the bench has an ancestor who was hanged and an ancestor who signed the complaint against her. Half of Essex County is in the same position, and most of them have never looked.');
  }

  // --- handover ---------------------------------------------------------
  say('None of it adds up to one answer, and it was never going to.');
  say('Nobody here is going to tell you which of it matters most. That has been the arrangement since the first stone you stood on, the one with the sentence that runs into the wall and stops.');
  say('So: what caused it?');

  return L;
}

/** Claims are written as headings — "What happened in the parsonage before
 *  Tituba was examined" — and have to drop into mid-sentence. */
function lower(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export const DISPUTE_COUNT = DISPUTES.length;
