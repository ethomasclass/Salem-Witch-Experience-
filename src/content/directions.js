// Where to go next, said by a person instead of by the corner of the screen.
//
// The objective HUD tells the player what is outstanding. That works, and a
// student who has never played a game before needs it. But a player who only
// reads the corner is playing the corner: they take the line, walk the arrow,
// press Z, and never look at the village the whole game is made of.
//
// So the people give directions too — but only when the player is actually
// stuck, and only about things the game has not just told them.
//
// ---------------------------------------------------------------------
// WHAT WENT WRONG THE FIRST TIME, BECAUSE ALL OF IT IS ENCODED HERE NOW
//
// The first version fired a pointer at the end of every conversation whose
// current goal this character happened to have a line about. Four separate
// failures came out of that, and they are worth naming because the fix for
// each is a rule in this file or in the caller:
//
//   1. THE AMBIENT VILLAGERS NEVER SHUT UP. A character with no topics ends
//      their conversation the instant the greeting finishes, so the woman at
//      the well, the man splitting wood, the watchman and the swineboy each
//      appended a direction to their single line, every time, forever. Those
//      are the characters a player walks past most. Most directions in the
//      game were therefore coming from people the player had not had a
//      conversation with at all — which is exactly the "this is machinery"
//      reading the pointer was supposed to avoid.
//
//   2. THEY POINTED AT PAPERS THE PLAYER HAD JUST BEEN TOLD ABOUT. Documents
//      became person-gated in the change before this one: the character who
//      unlocks a paper already says, in a written line, where it is. The
//      pointer then fired afterwards and said it again — in several cases
//      naming the wrong furniture, because the pointer text had not been
//      updated when the paper moved. Tituba sent the player to "his desk"
//      for an agreement lying on the table; Ingersoll sent them to "that
//      table" for a page now sitting on his bar.
//      => Every document pointer is deleted. If a paper needs explaining,
//         it gets explained by the person who unlocks it, in one place.
//
//   3. THEY POINTED AT THINGS IN THE ROOM. Ingersoll, standing four tiles
//      from his own account book, would tell the player to go and look at
//      his account book.
//      => Suppressed when the target is close enough to see — the same rule
//         the wayfinder chevron already uses, and for the same reason: if
//         you can see it, you do not need directions to it. NOT "same map":
//         the village is forty-six tiles by thirty-eight, and the boundary
//         stone in the north woods is genuinely a hike from the well.
//
//   4. THE EIGHT BEST LINES COULD NEVER FIRE. Francis Nurse, in his dooryard,
//      having just said his wife has been taken: "She is in the jail at Salem
//      town. South, down the road. They let people stand at the bars." Dead,
//      because a goal that points at one fixed place carried no name for what
//      was there, and only named things could be pointed at.
//      => `at()` waypoints take a key.
//
// ---------------------------------------------------------------------
// RULES FOR WRITING THESE
//
//   1. NOBODY POINTS AT THEMSELVES.
//
//   2. NOBODY IS OMNISCIENT. These are things a person in this village in
//      1692 would plausibly know: where a neighbour lives, what is nailed up
//      in the meetinghouse, which road the jail is on. Nobody refers to the
//      player's notebook, or to chapters, or to progress.
//
//   3. IT IS A DIRECTION, NOT AN INSTRUCTION. "Rebecca Nurse is west, past
//      the meetinghouse — the big farm" is a person talking. "Go talk to
//      Rebecca Nurse" is the HUD with a portrait on it. If the line does not
//      also tell you something about the speaker, it does not belong here.
//
//   4. NO DOCUMENTS. See failure 2.
//
// A value may be a plain string, or an object keyed by chapter when the same
// direction needs a different voice in March and in June. `tools/check-maps`
// fails on any line that can never fire.

export const DIRECTIONS = {

  /* ---- the memorial, today ------------------------------------------- */
  //
  // Nora is the only person at the memorial, so if a player is lost in the
  // first five minutes she is the only one who can un-lose them. She is also
  // seventeen and bored, which is the voice these have to be in.

  nora: {
    'present.happened': 'There are signs in the pavement out front. Everyone walks over them. They\'re the only part that tells you what actually happened.',
  },

  /* ---- the parsonage ------------------------------------------------- */

  tituba: {
    'nurse': 'Goodwife Nurse is west of the meeting house. The big farm. She is kind to me, which is not nothing.',
    'ingersoll': 'The ordinary is on the road. The man who keeps it hears everything.',
    'clue.woodpile': 'If you go out the back there is wood stacked against the wall. I cut it. You may look at how much of it there is.',
    'clue.accounts': 'The ordinary keeps a book of what everyone owes. That book knows this village better than the minister does.',
  },

  parris: {
    'nurse': 'The Nurse farm is west. They do not come to my meeting. You may make of that what you like.',
    'ingersoll': 'Deacon Ingersoll keeps the ordinary. He will tell you he hears everything. He is not wrong.',
    'clue.seating': 'The seating is set down in the meeting house. Who sits where is not my invention. It is the committee\'s.',
  },

  /* ---- the village --------------------------------------------------- */

  nurse: {
    'tituba': 'The minister\'s woman. She is in that house from dark to dark. Nobody asks her anything.',
    'annjr': 'The Putnam girl. Their house is south-east, past the bend. She is twelve.',
    'clue.marker': 'There is a boundary stone north, in the woods. My husband has stood at it in the rain arguing about which side of it a tree is on.',
    'clue.accounts': 'Ingersoll writes down what is owed. That is not gossip, that is a ledger.',
  },

  ingersoll: {
    'clue.seating': 'You want to know how this village ranks itself, go and look at where it sits on a Sunday.',
    'nurse': 'Goodwife Nurse. West, past the meeting house. Seventy-one years old and she still walks it.',
    'mercy': {
      march: 'The Lewis girl is usually out in the road. She works for the Putnams and she is not often indoors.',
      june: 'The Lewis girl is in the road, where she always is. I have nothing to say about her that I would say twice.',
    },
    'clue.marker': 'The boundary stone is north in the trees. Men have come in here still angry about it.',
    'francis': 'Old Francis is up at the farm, west. He stands in that dooryard all day now.',
  },

  annjr: {
    'mercy': 'Mercy is outside. She is always outside now.',
    'nurse': 'Goodwife Nurse is west. My mother would not have me say anything about her, so I will not.',
    'clue.marker': 'The stone in the north woods is ours. That is what my father says when he has been at it a while.',
  },

  mercy: {
    'annjr': 'Ann is indoors. She is nearly always indoors.',
    'tituba': 'The minister\'s woman was there when it started. She was there before any of it.',
    'marywarren': 'Mary Warren is at the ordinary, carrying pots. She was one of us and now she is carrying pots.',
    'clue.woodpile': 'They talk about the minister\'s firewood the way other people talk about the weather. Go and look at the pile if you want to know why.',
  },

  /* ---- the people you walk past -------------------------------------- */
  //
  // These four exist to be passed on the road, so they carry the widest
  // coverage. If a player is lost, the odds are good that the next person
  // they bump into is one of these — and because they have no topics, the
  // caller holds them back until the player has actually stalled.

  goodwife: {
    'nurse': 'Rebecca Nurse? West, past the meeting house. The big farm on the left.',
    'clue.marker': 'North, in the trees, there is a stone with a mark cut in it. Boys dare each other to move it.',
    'clue.seating': 'If you want to know who is who here, go into the meeting house and see who sits at the front.',
    'ingersoll': 'Ingersoll keeps the ordinary, on the road. You cannot miss it, nobody ever has.',
    'annjr': 'The Putnams are south-east, past the bend. The big house.',
    'francis': 'Old Francis Nurse is up at the farm, west. Somebody ought to go and stand with him.',
    'jail': 'The jail is in the town, south down the road. It is a cellar. They let people stand at the bars.',
  },

  woodman: {
    'clue.marker': 'Boundary stone is north of here in the trees. I cut on this side of it and I am careful about it.',
    'nurse': 'Nurse farm is west. Good ground. That is half the trouble.',
    'ingersoll': 'Ordinary is on the road south. I will be in it by dark.',
    'parris': 'The minister is in the parsonage. He is in it a great deal.',
  },

  swineboy: {
    'clue.marker': 'There is a stone in the north woods. I am not supposed to go past it.',
    'annjr': 'The Putnam house is that way, the big one. Ann does not come out much now.',
    'clue.accounts': 'The tavern is on the road. My father is in the book there and he does not know I know.',
  },

  watchman: {
    'clue.marker': 'North, in the trees, there is a boundary stone. I have been sent out to look at it twice this year.',
    'nurse': 'The Nurse place is west of the meeting house.',
    'clue.seating': 'The seating is set down inside. I sit at the back and I am not sorry about it.',
    'ingersoll': 'Ingersoll\'s, on the road. Where else would a man be.',
    'jail': 'Down the road, in the town. There is a cellar under the house they keep them in.',
  },

  ryefarmer: {
    'clue.marker': 'The stone is north of my field. I know exactly where it is, because I have to.',
    'nurse': 'Goodwife Nurse is west. She sent broth over when my wife was bad.',
    'clue.accounts': 'I am in Ingersoll\'s book this year. That is the whole of my news.',
    'ingersoll': 'The ordinary is on the road. He is behind the bar or he is dead.',
  },

  /* ---- June and after ------------------------------------------------ */

  francis: {
    'nurseJail': 'She is in the jail at Salem town. South, down the road. They let people stand at the bars.',
    'jail': 'The jail is south, in the town. Go down the road and it is on your left before you reach the houses.',
    'titubaJail': 'The minister\'s woman is in the same cellar. She confessed in March and she is still there in June. Think about that.',
    'marywarren': 'The Warren girl is back at the ordinary. She said something in May and then she unsaid it.',
  },

  marywarren: {
    'annjr': 'Ann is at her house. She has not been out.',
    'mercy': 'Mercy is in the road. She will not be glad to see me.',
    'nurseJail': 'She is in the jail. In the town, south. You can stand at the bars, people do.',
    'jail': 'It is south, in the town, and it is a cellar. I have not been. I will not go.',
  },

  nurseJail: {
    'marywarren': 'The Warren girl is at the ordinary. She tried to take it back and they turned on her for it.',
  },

  neighbour: {
    'putnamhouse': 'The Putnams are still in their house, south-east. Go and see for yourself. I will not describe it.',
  },
};

/**
 * The line this person has about what the player still owes, or null.
 *
 * Deliberately returns null far more often than not, and the caller adds
 * further conditions on top — see the header. A pointer on every goodbye
 * would train the player that the last line of every conversation is
 * machinery, and they would stop reading it.
 */
/**
 * Close enough to see, and therefore not worth giving directions to.
 *
 * Indoor maps render at 2x zoom, so about ten tiles by seven are on screen
 * at once; outdoors it is twice that. Measured from the speaker, whose
 * position is fixed — the player is standing next to them by definition.
 */
export function withinSight(indoor, dx, dy) {
  // The view is 320x240 at 16px tiles: twenty tiles by fifteen outdoors, and
  // half that indoors, where everything renders at 2x. Half of each is how
  // far you can see from where you are standing.
  const rx = indoor ? 5 : 10;
  const ry = indoor ? 3 : 7;
  return Math.abs(dx) <= rx && Math.abs(dy) <= ry;
}

export function pointerFor(state, npcId, key) {
  if (!npcId || !key || npcId === key) return null;
  const set = DIRECTIONS[npcId];
  if (!set || !set[key]) return null;
  if (state.knows(`pointed.${npcId}.${key}`)) return null;
  const v = set[key];
  return typeof v === 'string' ? v : (v[state.chapter] || null);
}
