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

export const STEPS_BY_CHAPTER = {

  memorial: [
    { id: 'enter', text: 'Walk into the memorial', done: (s) => s.knows('present.memorial') },
    { id: 'threshold', text: 'Read the stones you walked in over', done: (s) => s.knows('present.threshold') },
    { id: 'panels', text: 'Read the three panels by the wall',
      done: (s) => s.knows('present.happened') && s.knows('present.court') && s.knows('present.argument') },
    { id: 'nurse', text: 'Find the bench for Rebecca Nurse', done: (s) => s.knows('present.nurse') },
    { id: 'nora', text: 'Talk to the girl on the wall', done: (s) => s.hasSpokenTo('nora') },
    { id: 'gap', text: 'Go through the gap in the far wall', done: (s) => s.visited.has('road') },
  ],

  march: [
    { id: 'walk', text: 'Walk north to Salem Village', done: (s) => s.visited.has('village') },
    { id: 'meetnurse', text: 'Find Rebecca Nurse — she lives west of the meetinghouse',
      done: (s) => s.hasSpokenTo('nurse') },
    { id: 'clues', text: 'Four things in this village are worth a closer look',
      done: (s) => ['clue.woodpile', 'clue.seating', 'clue.marker', 'clue.accounts']
        .every((f) => s.knows(f)) },
    { id: 'people', text: 'Talk to everyone who lives here',
      done: (s) => ['tituba', 'parris', 'annjr', 'mercy', 'ingersoll', 'nurse']
        .every((id) => s.hasSpokenTo(id)) },
    { id: 'papers', text: 'Copy down what is written on paper',
      done: (s) => ['parrisAgreement', 'seatingList', 'accountBookPage', 'topsfieldPetition']
        .every((d) => s.hasDoc(d)) },
    { id: 'leave', text: 'Behind the parsonage the ground dips. Step down into it',
      done: (s) => s.visited.has('dig') },
  ],

  dig: [
    { id: 'look', text: 'Stand in the cellar and look at it', done: (s) => s.knows('dig.stood') },
    { id: 'ask', text: 'Ask the archaeologist what the objects say',
      done: (s) => s.knows('dig.small') && s.knows('dig.noprivacy') },
    { id: 'back', text: 'Go back the way you came', done: (s) => s.knows('june.arrived') },
  ],

  june: [
    { id: 'nursegone', text: 'Rebecca Nurse is not at home. Find out where she went',
      done: (s) => s.knows('june.nursejailed') },
    { id: 'town', text: 'Walk to the jail in Salem town', done: (s) => s.visited.has('jail') },
    { id: 'sit', text: 'Sit with her', done: (s) => s.hasSpokenTo('nurseJail') },
    { id: 'tituba', text: 'Tituba is in the same cellar', done: (s) => s.hasSpokenTo('titubaJail') },
    { id: 'accusers', text: 'Talk to the accusers — they are not hiding',
      done: (s) => s.hasSpokenTo('marywarren') && s.hasSpokenTo('annjr') && s.hasSpokenTo('mercy') },
    { id: 'papers', text: 'Copy down the paperwork',
      done: (s) => ['nurseWarrant', 'nursePetition', 'putnamDeposition', 'jailBill']
        .every((d) => s.hasDoc(d)) },
    { id: 'leave', text: 'Leave by the north side of the meetinghouse',
      done: (s) => s.visited.has('archive') },
  ],

  archive: [
    { id: 'spectral', text: 'Ask how the court could accept that evidence',
      done: (s) => s.knows('law.spectral') },
    { id: 'rest', text: 'Ask the rest of your questions',
      done: (s) => s.knows('law.nocounsel') && s.knows('law.charter') && s.knows('law.confession') },
    { id: 'ergot', text: 'Ask about the ergot theory', done: (s) => s.knows('law.ergot_rebut') },
    { id: 'back', text: 'Go back', done: (s) => s.knows('sept.arrived') },
  ],

  september: [
    { id: 'find', text: 'Find out who is still willing to talk to you',
      done: (s) => s.hasSpokenTo('neighbour') },
    { id: 'corey', text: 'Ask what happened while you were away',
      done: (s) => s.knows('sept.corey') && s.knows('sept.noburial') },
    { id: 'putnam', text: 'Go to the Putnam house', done: (s) => s.knows('sept.noticed') },
    { id: 'papers', text: 'Copy down the last of it',
      done: (s) => ['eastyPetition', 'coreyRecord', 'deathWarrantReturn']
        .every((d) => s.hasDoc(d)) },
    { id: 'leave', text: 'Walk out past the meetinghouse', done: (s) => s.visited.has('memorial') && s.chapter === 'reckoning' },
  ],

  reckoning: [
    { id: 'descendant', text: 'Talk to the woman on the bench', done: (s) => s.hasSpokenTo('descendant') },
    { id: 'ann', text: 'Ask her about Ann Putnam', done: (s) => s.knows('reck.annapology') },
    { id: 'papers', text: 'Read the last three papers',
      done: (s) => ['annApology', 'sewallApology', 'johnsonAct'].every((d) => s.hasDoc(d)) },
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
