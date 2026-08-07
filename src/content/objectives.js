// Objectives.
//
// The design doc is firm that the game should never look like a worksheet,
// so this is deliberately not a quest log. It is one line at a time, in the
// corner, telling a student who has never played a game like this what to do
// next — and nothing else.
//
// Two kinds:
//
//   step     the immediate next thing. Completing it reveals the next one.
//   standing the question the whole game is about, always visible underneath
//            once it has been raised. It never gets a checkmark, because the
//            game does not grade the answer.
//
// Ordering matters: the first incomplete step is the one shown. Anything a
// player can reach out of order still completes silently when they do it.

export const STEPS = [
  {
    id: 'enter',
    text: 'Walk into the memorial',
    done: (s) => s.knows('present.memorial'),
  },
  {
    id: 'threshold',
    text: 'Read the stones you walked in over',
    done: (s) => s.knows('present.threshold'),
  },
  {
    id: 'panels',
    text: 'Read the three panels by the wall',
    done: (s) => s.knows('present.happened') && s.knows('present.court') && s.knows('present.argument'),
  },
  {
    id: 'nurse',
    text: 'Find the bench for Rebecca Nurse',
    done: (s) => s.knows('present.nurse'),
  },
  {
    id: 'nora',
    text: 'Talk to the girl on the wall',
    done: (s) => s.hasSpokenTo('nora'),
  },
  {
    id: 'gap',
    text: 'Go through the gap in the far wall',
    done: (s) => s.visited.has('road'),
  },
  {
    id: 'walk',
    text: 'Walk north to Salem Village',
    done: (s) => s.visited.has('village'),
  },
  {
    id: 'meetnurse',
    text: 'Find Rebecca Nurse — she lives west of the meetinghouse',
    done: (s) => s.hasSpokenTo('nurse'),
  },
  {
    id: 'clues',
    text: 'Look around the village. Four things here are worth examining',
    done: (s) => ['clue.woodpile', 'clue.seating', 'clue.marker', 'clue.accounts']
      .filter((f) => s.knows(f)).length >= 4,
  },
  {
    id: 'people',
    text: 'Talk to everyone in the village',
    done: (s) => ['tituba', 'parris', 'annjr', 'mercy', 'ingersoll', 'nurse']
      .every((id) => s.hasSpokenTo(id)),
  },
];

/** The question the whole game exists to ask. Raised by the third panel at
 *  the memorial, then never dismissed. */
export const STANDING = {
  id: 'why',
  text: 'What caused it?',
  active: (s) => s.knows('present.argument'),
};

/** The step currently in play, or null when they're all done. */
export function currentStep(state) {
  return STEPS.find((o) => !o.done(state)) || null;
}

/** How many steps are complete — used for the small counter. */
export function progress(state) {
  const done = STEPS.filter((o) => o.done(state)).length;
  return { done, total: STEPS.length };
}
