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

export const STEPS_BY_CHAPTER = {

  memorial: [
    { id: 'enter', text: 'Walk in through the gap in the wall', done: (s) => s.knows('present.memorial') },
    { id: 'threshold', text: 'Read the stones you walked in over', done: (s) => s.knows('present.threshold') },
    { id: 'panels', text: 'Read the three panels on the pavement outside the wall',
      done: (s) => s.knows('present.happened') && s.knows('present.court') && s.knows('present.argument'),
      count: (s) => [['present.happened', 'present.court', 'present.argument']
        .filter((f) => s.knows(f)).length, 3] },
    { id: 'nurse', text: 'Find the bench for Rebecca Nurse, beside the far gap',
      done: (s) => s.knows('present.nurse') },
    { id: 'nora', text: 'Talk to the girl sitting on the wall', done: (s) => s.hasSpokenTo('nora') },
    { id: 'gap', text: 'Go through the gap in the far wall', done: (s) => s.visited.has('road') },
  ],

  march: [
    { id: 'walk', text: 'Walk north up the road to Salem Village', done: (s) => s.visited.has('village') },
    { id: 'meetnurse', text: 'Find Rebecca Nurse. Her farm is west, past the meetinghouse',
      done: (s) => s.hasSpokenTo('nurse') },
    // Named, not hinted. A student who cannot find the boundary stone is not
    // learning anything from being kept in the dark about it.
    { id: 'clues', text: 'Look at four things: the woodpile by the parsonage, the seating chart inside the meetinghouse, the account book in the tavern, and a stone in the north woods',
      done: (s) => CLUE_SET.every((f) => s.knows(f)),
      count: (s) => [CLUE_SET.filter((f) => s.knows(f)).length, CLUE_SET.length] },
    { id: 'people', text: 'Talk to everyone who lives here',
      done: (s) => MARCH_CAST.every((id) => s.hasSpokenTo(id)),
      count: (s) => [MARCH_CAST.filter((id) => s.hasSpokenTo(id)).length, MARCH_CAST.length] },
    { id: 'papers', text: 'Four papers are now readable, indoors on tables. Stand at one and press Z twice',
      done: (s) => MARCH_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [MARCH_DOCS.filter((d) => s.hasDoc(d)).length, MARCH_DOCS.length] },
    { id: 'leave', text: 'Behind the parsonage the ground dips. Walk onto it',
      done: (s) => s.visited.has('dig') },
  ],

  dig: [
    { id: 'look', text: 'You are standing in the cellar. Press Z to look at it',
      done: (s) => s.knows('dig.stood') },
    { id: 'ask', text: 'Ask Dr. Reyes how small the house was, and what it was like to live in',
      done: (s) => s.knows('dig.small') && s.knows('dig.noprivacy'),
      count: (s) => [['dig.small', 'dig.noprivacy'].filter((f) => s.knows(f)).length, 2] },
    { id: 'back', text: 'Walk south, out of the cellar and down to the path',
      done: (s) => s.knows('june.arrived') },
  ],

  june: [
    { id: 'nursegone', text: 'Rebecca Nurse is not at home. Her husband is in the dooryard, west — ask him',
      done: (s) => s.knows('june.nursejailed') },
    { id: 'town', text: 'Walk south down the road. The jail is on the left, before the town',
      done: (s) => s.visited.has('jail') },
    { id: 'sit', text: 'Stand below the bars and talk to her through them',
      done: (s) => s.hasSpokenTo('nurseJail') },
    { id: 'tituba', text: 'Tituba is in the same cellar, further along the bars',
      done: (s) => s.hasSpokenTo('titubaJail') },
    { id: 'accusers', text: 'Talk to the accusers: Mary Warren in the tavern, Ann Putnam indoors, Mercy Lewis in the road',
      done: (s) => JUNE_CAST.every((id) => s.hasSpokenTo(id)),
      count: (s) => [JUNE_CAST.filter((id) => s.hasSpokenTo(id)).length, JUNE_CAST.length] },
    { id: 'papers', text: 'Four papers: the Nurse house, the tavern, the meetinghouse, and the jail',
      done: (s) => JUNE_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [JUNE_DOCS.filter((d) => s.hasDoc(d)).length, JUNE_DOCS.length] },
    { id: 'leave', text: 'Walk round to the north side of the meetinghouse',
      done: (s) => s.visited.has('archive') },
  ],

  archive: [
    { id: 'spectral', text: 'Ask Dr. Whitfield how the court could accept that evidence',
      done: (s) => s.knows('law.spectral') },
    { id: 'rest', text: 'Ask about lawyers, about the court\'s authority, and about why anyone confessed',
      done: (s) => LAW_SET.every((f) => s.knows(f)),
      count: (s) => [LAW_SET.filter((f) => s.knows(f)).length, LAW_SET.length] },
    { id: 'ergot', text: 'Ask her whether it was ergot poisoning', done: (s) => s.knows('law.ergot_rebut') },
    { id: 'back', text: 'Leave by the door at the bottom of the room',
      done: (s) => s.knows('sept.arrived') },
  ],

  september: [
    { id: 'find', text: 'Almost nobody will talk to you now. One man is mending a fence, east',
      done: (s) => s.hasSpokenTo('neighbour') },
    { id: 'corey', text: 'Ask him about Giles Corey, and where the dead are buried',
      done: (s) => s.knows('sept.corey') && s.knows('sept.noburial'),
      count: (s) => [['sept.corey', 'sept.noburial'].filter((f) => s.knows(f)).length, 2] },
    { id: 'putnam', text: 'Go inside the Putnam house, south-east', done: (s) => s.knows('sept.noticed') },
    { id: 'papers', text: 'Three papers on the court table inside the meetinghouse',
      done: (s) => SEPT_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [SEPT_DOCS.filter((d) => s.hasDoc(d)).length, SEPT_DOCS.length] },
    { id: 'leave', text: 'Walk round to the north side of the meetinghouse',
      done: (s) => s.visited.has('memorial') && s.chapter === 'reckoning' },
  ],

  reckoning: [
    { id: 'descendant', text: 'A woman is sitting on one of the benches. Talk to her',
      done: (s) => s.hasSpokenTo('descendant') },
    { id: 'ann', text: 'Ask her about Ann Putnam', done: (s) => s.knows('reck.annapology') },
    { id: 'papers', text: 'Three last papers, on the grass in the middle',
      done: (s) => RECK_DOCS.every((d) => s.hasDoc(d)),
      count: (s) => [RECK_DOCS.filter((d) => s.hasDoc(d)).length, RECK_DOCS.length] },
    { id: 'answer', text: 'Say what you think caused it', done: (s) => !!s.answer },
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
