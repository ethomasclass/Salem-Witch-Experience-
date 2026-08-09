// Objectives.
//
// The design doc is firm that the game should never look like a worksheet,
// so this is deliberately not a quest log. It is one line at a time, in the
// corner, telling a student who has never played a game like this what to do
// next — and nothing else.
//
// Steps are scoped to the chapter. The first incomplete step in the current
// chapter is the one shown; anything reached out of order completes silently.
// When a chapter's steps are all done, its exit opens.

// The lists each goal counts against, named once so the goal text and the
// progress counter can never drift apart.
const CLUE_SET  = ['clue.woodpile', 'clue.seating', 'clue.accounts', 'clue.marker'];
const MARCH_CAST = ['tituba', 'parris', 'annjr', 'mercy', 'ingersoll', 'nurse'];
const MARCH_DOCS = ['parrisAgreement', 'seatingList', 'accountBookPage', 'topsfieldPetition'];
const JUNE_CAST  = ['marywarren', 'annjr', 'mercy'];
const JUNE_DOCS  = ['nursePetition', 'nurseWarrant', 'putnamDeposition', 'jailBill'];
const LAW_SET    = ['law.nocounsel', 'law.charter', 'law.confession'];
const SEPT_DOCS  = ['eastyPetition', 'coreyRecord', 'deathWarrantReturn'];
const RECK_DOCS  = ['annApology', 'sewallApology', 'johnsonAct'];


/* ---------------------------------------------------------------------- *
 * Where a goal is
 *
 * Each step says where in the world it points, which drives the small
 * chevron at the screen edge. Deliberately NOT a minimap: the whole village
 * is about six screenfuls, and a map in the corner makes players watch the
 * corner instead of the village — and this game is entirely about noticing
 * the village.
 *
 * A multi-part goal returns the FIRST thing still outstanding, so the arrow
 * points at the next unfinished piece rather than at an average of four
 * places.
 * ---------------------------------------------------------------------- */

const firstMissing = (s, list, has) => list.find((e) => !has(s, e)) || null;
const byFlag = (s, e) => s.knows(e.flag);
const byDoc  = (s, e) => s.hasDoc(e.doc);
const byNpc  = (s, e) => s.hasSpokenTo(e.npc);
const at = (map, x, y) => () => ({ map, x, y });

const PANEL_WHERE = [
  { flag: 'present.happened', map: 'memorial', x: 6, y: 22,
    line: 'Read the first panel on the pavement, by the entrance' },
  { flag: 'present.court',    map: 'memorial', x: 10, y: 22,
    line: 'Read the second panel, further along the pavement' },
  { flag: 'present.argument', map: 'memorial', x: 17, y: 22,
    line: 'Read the last panel, at the far end of the pavement' },
];
const CLUE_WHERE = [
  { flag: 'clue.woodpile', map: 'village', x: 14, y: 27,
    line: 'Look at the woodpile stacked against the parsonage' },
  { flag: 'clue.seating',  map: 'meetinghouse', x: 5, y: 1,
    line: 'Go into the meetinghouse and look at the seating chart' },
  { flag: 'clue.accounts', map: 'tavern', x: 2, y: 3,
    line: 'Go into the tavern and look at the account book' },
  { flag: 'clue.marker',   map: 'village', x: 15, y: 4,
    line: 'A boundary stone stands in the woods, north of the village' },
];
const MARCH_CAST_WHERE = [
  { npc: 'nurse',     map: 'nursehouse', x: 5, y: 3,
    line: 'Talk to Rebecca Nurse, at the farm west of the meetinghouse' },
  { npc: 'tituba',    map: 'parsonage', x: 3, y: 3,
    line: 'Talk to Tituba, inside the parsonage' },
  { npc: 'parris',    map: 'parsonage', x: 8, y: 4,
    line: 'Talk to Rev. Parris, inside the parsonage' },
  { npc: 'ingersoll', map: 'tavern', x: 6, y: 4,
    line: 'Talk to Nathaniel Ingersoll, behind the bar in the tavern' },
  { npc: 'annjr',     map: 'putnamhouse', x: 3, y: 3,
    line: 'Talk to Ann Putnam, inside the Putnam house, south-east' },
  { npc: 'mercy',     map: 'village', x: 29, y: 23,
    line: 'Talk to Mercy Lewis, out in the road on the east side' },
];
const MARCH_DOC_WHERE = [
  { doc: 'parrisAgreement',   map: 'parsonage', x: 2, y: 5,
    line: 'Read the paper on the desk in the parsonage' },
  { doc: 'seatingList',       map: 'meetinghouse', x: 7, y: 1,
    line: 'Read the seating list at the front of the meetinghouse' },
  { doc: 'accountBookPage',   map: 'tavern', x: 2, y: 6,
    line: 'Read the loose account page on the tavern table' },
  { doc: 'topsfieldPetition', map: 'putnamhouse', x: 2, y: 4,
    line: 'Read the petition on the table in the Putnam house' },
];
const JUNE_CAST_WHERE = [
  { npc: 'marywarren', map: 'tavern', x: 8, y: 6,
    line: 'Talk to Mary Warren, working in the tavern' },
  { npc: 'annjr',      map: 'putnamhouse', x: 3, y: 3,
    line: 'Talk to Ann Putnam again, inside the Putnam house' },
  { npc: 'mercy',      map: 'village', x: 29, y: 23,
    line: 'Talk to Mercy Lewis again, out in the road' },
];
const JUNE_DOC_WHERE = [
  { doc: 'nursePetition',    map: 'nursehouse', x: 5, y: 4,
    line: 'Read the petition left on the table in the Nurse house' },
  { doc: 'nurseWarrant',     map: 'tavern', x: 3, y: 6,
    line: 'Read the warrant lying on the tavern table' },
  { doc: 'putnamDeposition', map: 'meetinghouse', x: 5, y: 3,
    line: 'Read the deposition in the meetinghouse' },
  { doc: 'jailBill',         map: 'jail', x: 9, y: 6,
    line: 'Read the jailer’s bill, on the far side of the jail' },
];
const SEPT_DOC_WHERE = [
  { doc: 'coreyRecord',        map: 'meetinghouse', x: 5, y: 3,
    line: 'Read the first paper on the court table in the meetinghouse' },
  { doc: 'deathWarrantReturn', map: 'meetinghouse', x: 8, y: 3,
    line: 'Read the middle paper on the court table' },
  { doc: 'eastyPetition',      map: 'meetinghouse', x: 10, y: 3,
    line: 'Read the last paper on the court table' },
];
const RECK_DOC_WHERE = [
  { doc: 'annApology',    map: 'memorial', x: 9, y: 18,
    line: 'Read the first of three papers lying on the grass' },
  { doc: 'sewallApology', map: 'memorial', x: 11, y: 18,
    line: 'Read the second paper on the grass' },
  { doc: 'johnsonAct',    map: 'memorial', x: 13, y: 18,
    line: 'Read the last paper on the grass' },
];

export const STEPS_BY_CHAPTER = {

  memorial: [
    { id: 'enter', where: at('memorial', 13, 21), text: 'Walk in through the gap in the wall', done: (s) => s.knows('present.memorial') },
    { id: 'threshold', where: at('memorial', 13, 21), text: 'Read the stones you walked in over', done: (s) => s.knows('present.threshold') },
    { id: 'panels', where: (s) => firstMissing(s, PANEL_WHERE, byFlag), text: 'Read the three panels on the pavement outside the wall',
      done: (s) => s.knows('present.happened') && s.knows('present.court') && s.knows('present.argument'),
      count: (s) => [['present.happened', 'present.court', 'present.argument']
        .filter((f) => s.knows(f)).length, 3] },
    { id: 'nurse', where: at('memorial', 15, 5), text: 'Find the bench for Rebecca Nurse, beside the far gap',
      done: (s) => s.knows('present.nurse') },
    { id: 'nora', where: at('memorial', 18, 19), text: 'Talk to the girl sitting on the wall', done: (s) => s.hasSpokenTo('nora') },
    { id: 'gap', where: at('memorial', 13, 4), text: 'Go through the gap in the far wall', done: (s) => s.visited.has('road') },
  ],

  march: [
    { id: 'walk', where: at('village', 22, 20), text: 'Walk north up the road to Salem Village', done: (s) => s.visited.has('village') },
    { id: 'meetnurse', where: at('nursehouse', 5, 3), text: 'Find Rebecca Nurse. Her farm is west, past the meetinghouse',
      done: (s) => s.hasSpokenTo('nurse') },
    // Named, not hinted. A student who cannot find the boundary stone is not
    // learning anything from being kept in the dark about it.
    { id: 'clues', where: (s) => firstMissing(s, CLUE_WHERE, byFlag), text: 'Look at four things: the woodpile by the parsonage, the seating chart inside the meetinghouse, the account book in the tavern, and a stone in the north woods',
      done: (s) => CLUE_SET.every((f) => s.knows(f)),
      count: (s) => [CLUE_SET.filter((f) => s.knows(f)).length, CLUE_SET.length] },
    { id: 'people', where: (s) => firstMissing(s, MARCH_CAST_WHERE, byNpc), text: 'Talk to everyone who lives here',
      done: (s) => MARCH_CAST.every((id) => s.hasSpokenTo(id)),
      count: (s) => [MARCH_CAST.filter((id) => s.hasSpokenTo(id)).length, MARCH_CAST.length] },
    { id: 'papers', where: (s) => firstMissing(s, MARCH_DOC_WHERE, byDoc), text: 'Four papers are now readable, indoors on tables. Stand at one and press Z',
      done: (s) => MARCH_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [MARCH_DOCS.filter((d) => s.hasDoc(d)).length, MARCH_DOCS.length] },
    { id: 'leave', where: at('village', 11, 22), text: 'Behind the parsonage the ground dips. Walk onto it',
      done: (s) => s.visited.has('dig') },
  ],

  dig: [
    { id: 'look', where: at('dig', 11, 9), text: 'You are standing in the cellar. Press Z to look at it',
      done: (s) => s.knows('dig.stood') },
    { id: 'ask', where: at('dig', 13, 9), text: 'Ask Dr. Reyes how small the house was, and what it was like to live in',
      done: (s) => s.knows('dig.small') && s.knows('dig.noprivacy'),
      count: (s) => [['dig.small', 'dig.noprivacy'].filter((f) => s.knows(f)).length, 2] },
    { id: 'back', where: at('dig', 11, 18), text: 'Walk south, out of the cellar and down to the path',
      done: (s) => s.knows('june.arrived') },
  ],

  june: [
    { id: 'nursegone', where: at('village', 7, 16), text: 'Rebecca Nurse is not at home. Her husband is in the dooryard, west — ask him',
      done: (s) => s.knows('june.nursejailed') },
    { id: 'town', where: at('jail', 6, 7), text: 'Walk south down the road. The jail is on the left, before the town',
      done: (s) => s.visited.has('jail') },
    { id: 'sit', where: at('jail', 4, 4), text: 'Stand below the bars and talk to her through them',
      done: (s) => s.hasSpokenTo('nurseJail') },
    { id: 'tituba', where: at('jail', 9, 4), text: 'Tituba is in the same cellar, further along the bars',
      done: (s) => s.hasSpokenTo('titubaJail') },
    { id: 'accusers', where: (s) => firstMissing(s, JUNE_CAST_WHERE, byNpc), text: 'Talk to the accusers: Mary Warren in the tavern, Ann Putnam indoors, Mercy Lewis in the road',
      done: (s) => JUNE_CAST.every((id) => s.hasSpokenTo(id)),
      count: (s) => [JUNE_CAST.filter((id) => s.hasSpokenTo(id)).length, JUNE_CAST.length] },
    { id: 'papers', where: (s) => firstMissing(s, JUNE_DOC_WHERE, byDoc), text: 'Four papers: the Nurse house, the tavern, the meetinghouse, and the jail',
      done: (s) => JUNE_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [JUNE_DOCS.filter((d) => s.hasDoc(d)).length, JUNE_DOCS.length] },
    { id: 'leave', where: at('village', 22, 9), text: 'Walk round to the north side of the meetinghouse',
      done: (s) => s.visited.has('archive') },
  ],

  archive: [
    { id: 'spectral', where: at('archive', 11, 5), text: 'Ask Dr. Whitfield how the court could accept that evidence',
      done: (s) => s.knows('law.spectral') },
    { id: 'rest', where: at('archive', 11, 5), text: 'Ask about lawyers, about the court\'s authority, and about why anyone confessed',
      done: (s) => LAW_SET.every((f) => s.knows(f)),
      count: (s) => [LAW_SET.filter((f) => s.knows(f)).length, LAW_SET.length] },
    { id: 'ergot', where: at('archive', 11, 5), text: 'Ask her whether it was ergot poisoning', done: (s) => s.knows('law.ergot_rebut') },
    { id: 'back', where: at('archive', 8, 12), text: 'Leave by the door at the bottom of the room',
      done: (s) => s.knows('sept.arrived') },
  ],

  september: [
    { id: 'find', where: at('village', 27, 24), text: 'Almost nobody will talk to you now. One man is mending a fence, east',
      done: (s) => s.hasSpokenTo('neighbour') },
    { id: 'corey', where: at('village', 27, 24), text: 'Ask him about Giles Corey, and where the dead are buried',
      done: (s) => s.knows('sept.corey') && s.knows('sept.noburial'),
      count: (s) => [['sept.corey', 'sept.noburial'].filter((f) => s.knows(f)).length, 2] },
    { id: 'putnam', where: at('putnamhouse', 3, 3), text: 'Go inside the Putnam house, south-east', done: (s) => s.knows('sept.noticed') },
    { id: 'papers', where: (s) => firstMissing(s, SEPT_DOC_WHERE, byDoc), text: 'Three papers on the court table inside the meetinghouse',
      done: (s) => SEPT_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [SEPT_DOCS.filter((d) => s.hasDoc(d)).length, SEPT_DOCS.length] },
    { id: 'leave', where: at('village', 22, 9), text: 'Walk round to the north side of the meetinghouse',
      done: (s) => s.visited.has('memorial') && s.chapter === 'reckoning' },
  ],

  reckoning: [
    { id: 'descendant', where: at('memorial', 8, 12), text: 'A woman is sitting on one of the benches. Talk to her',
      done: (s) => s.hasSpokenTo('descendant') },
    { id: 'ann', where: at('memorial', 8, 12), text: 'Ask her about Ann Putnam', done: (s) => s.knows('reck.annapology') },
    { id: 'papers', where: (s) => firstMissing(s, RECK_DOC_WHERE, byDoc), text: 'Three last papers, on the grass in the middle',
      done: (s) => RECK_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [RECK_DOCS.filter((d) => s.hasDoc(d)).length, RECK_DOCS.length] },
    { id: 'answer', where: null, text: 'Say what you think caused it', done: (s) => !!s.answer },
  ],
};

/** The question the whole game exists to ask. Raised by the third panel at
 *  the memorial, then never dismissed. */
export const STANDING = {
  id: 'why',
  text: 'What caused it?',
  active: (s) => s.knows('present.argument') && !s.answer,
};

export function stepsFor(state) { return STEPS_BY_CHAPTER[state.chapter] || []; }

/**
 * The one thing the player is being asked for right now.
 *
 * A step that covers four items used to print all four: "look at the woodpile,
 * the seating chart, the account book, and a stone in the north woods". That
 * is a to-do list, and it reads as one — a student scans it, picks the nearest
 * item, and stops reading the game. Worse, the counter said 2/4 while the text
 * still named all four, so the two that were done stayed on screen as though
 * they were still owed.
 *
 * The waypoint already knows which item is outstanding, because the wayfinder
 * arrow points at it. So the text comes from the same place the arrow does,
 * and the two cannot disagree.
 */
export function outstanding(state, step) {
  if (!step) return null;
  const w = typeof step.where === 'function' ? step.where(state) : step.where;
  return w && (w.flag || w.doc || w.npc) ? w : null;
}

/** The goal line to print: the outstanding item if the step has parts. */
export function stepText(state, step) {
  if (!step) return null;
  const w = outstanding(state, step);
  return (w && w.line) || step.text;
}

/** What the outstanding item IS — a flag, a document, or a person — so a
 *  character standing in front of the player can point at it. */
export function outstandingKey(state) {
  const w = outstanding(state, currentStep(state));
  return w ? (w.npc || w.doc || w.flag) : null;
}

/** The step currently in play, or null when the chapter is finished. */
export function currentStep(state) {
  return stepsFor(state).find((o) => !o.done(state)) || null;
}

export function progress(state) {
  const steps = stepsFor(state);
  return { done: steps.filter((o) => o.done(state)).length, total: steps.length };
}

// Steps that ARE the exit, and so must not gate themselves. "answer" is in
// here for the same reason: it is completed by the closing screen, which
// only opens once the chapter is otherwise finished.
const EXIT_STEPS = new Set(['leave', 'back', 'gap', 'answer']);

/** True when every step in the named chapter is complete — used to open
 *  the exits, so a player cannot skip past the point of a chapter. */
export function chapterComplete(state, chapter) {
  return (STEPS_BY_CHAPTER[chapter] || [])
    .filter((o) => !EXIT_STEPS.has(o.id))
    .every((o) => o.done(state));
}

/** What is still missing, for the message shown at a closed exit. */
export function remainingIn(state, chapter) {
  return (STEPS_BY_CHAPTER[chapter] || [])
    .filter((o) => !EXIT_STEPS.has(o.id))
    .filter((o) => !o.done(state));
}
