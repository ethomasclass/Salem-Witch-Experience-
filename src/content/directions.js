// Where to go next, said by a person instead of by the corner of the screen.
//
// The objective HUD tells the player what is outstanding. That works, and a
// student who has never played a game before needs it. But a player who only
// reads the corner is playing the corner: they take the line, walk the arrow,
// press Z, and never look at the village the whole game is made of.
//
// So the people give directions too. When a conversation ends, if the person
// you were talking to has something to say about the thing you still owe, they
// say it — once, in their own voice, as the last line before you walk away.
//
// Three rules this file keeps:
//
//   1. NOBODY POINTS AT THEMSELVES. If the outstanding item is "talk to
//      Tituba", Tituba has nothing to add.
//
//   2. NOBODY IS OMNISCIENT. These are things a person in this village in
//      1692 would plausibly know: where a neighbour lives, what is nailed up
//      in the meetinghouse, whose account is behind at the bar. Nobody points
//      at a document they have not seen, and nobody refers to the player's
//      notebook, or to chapters, or to progress.
//
//   3. IT IS A DIRECTION, NOT AN INSTRUCTION. "Rebecca Nurse is west, past
//      the meetinghouse — the big farm" is a person talking. "Go talk to
//      Rebecca Nurse" is the HUD with a portrait on it. If the line does not
//      also tell you something about the speaker, it does not belong here.
//
// Keys are whatever the outstanding waypoint is: a knowledge flag, a document
// id, or an NPC id. Anything not listed simply produces no line, which is the
// correct default — a person with nothing useful to say says nothing.

export const DIRECTIONS = {

  /* ---- the memorial, today ------------------------------------------- */
  //
  // Nora is the only person at the memorial, so if a player is lost in the
  // first five minutes she is the only one who can un-lose them. She is also
  // seventeen and bored, which is the voice these have to be in.

  nora: {
    'present.happened': 'There are signs in the pavement out front. Everyone walks over them. They\'re the only part that tells you what actually happened.',
    'present.court': 'The second sign out there is about the court. That\'s the part people skip.',
    'present.argument': 'The last sign is the one I\'d read, if I were you. It doesn\'t tell you the answer. That\'s sort of the point of it.',
    'present.nurse': 'The benches all have names. There\'s one for Rebecca Nurse over by the far gap. She was seventy-one.',
  },

  /* ---- the parsonage ------------------------------------------------- */

  tituba: {
    'nurse': 'Goodwife Nurse is west of the meeting house. The big farm. She is kind to me, which is not nothing.',
    'parris': 'He is in this house. He is always in this house.',
    'ingersoll': 'The ordinary is on the road. The man who keeps it hears everything.',
    'clue.woodpile': 'If you go out the back there is wood stacked against the wall. I cut it. You may look at how much of it there is.',
    'parrisAgreement': 'There is a paper on his desk about the wood and the salary. He reads it often.',
    'clue.accounts': 'The ordinary keeps a book of what everyone owes. That book knows this village better than the minister does.',
  },

  parris: {
    'tituba': 'She will be at the hearth. She is always at the hearth.',
    'nurse': 'The Nurse farm is west. They do not come to my meeting. You may make of that what you like.',
    'ingersoll': 'Deacon Ingersoll keeps the ordinary. He will tell you he hears everything. He is not wrong.',
    'clue.seating': 'The seating is set down in the meeting house. Who sits where is not my invention. It is the committee\'s.',
    'seatingList': 'The list is up in the meeting house, where anyone may read it and everyone does.',
    'clue.woodpile': 'Look at the woodpile against my house before you decide I am a greedy man.',
    'topsfieldPetition': 'The Putnams keep every paper they have ever signed. Ask at their house.',
  },

  /* ---- the village --------------------------------------------------- */

  nurse: {
    'tituba': 'The minister\'s woman. She is in that house from dark to dark. Nobody asks her anything.',
    'annjr': 'The Putnam girl. Their house is south-east, past the bend. She is twelve.',
    'clue.marker': 'There is a boundary stone north, in the woods. My husband has stood at it in the rain arguing about which side of it a tree is on.',
    'topsfieldPetition': 'My family came from Topsfield. There is a paper about it in the Putnam house, and they did not sign it in our favour.',
    'clue.accounts': 'Ingersoll writes down what is owed. That is not gossip, that is a ledger.',
  },

  ingersoll: {
    'clue.accounts': 'The book is on the table there. I do not hide it. Half this village is in it and they all know it.',
    'accountBookPage': 'There is a loose page on that table. Read it if you want to know who is short this spring.',
    'clue.seating': 'You want to know how this village ranks itself, go and look at where it sits on a Sunday.',
    'seatingList': 'The list is nailed up in the meeting house. It is not a secret. That is the point of it.',
    'nurse': 'Goodwife Nurse. West, past the meeting house. Seventy-one years old and she still walks it.',
    'mercy': 'The Lewis girl is usually out in the road. She works for the Putnams and she is not often indoors.',
    'clue.marker': 'The boundary stone is north in the trees. Men have come in here still angry about it.',
    // June. The examinations were held in this room before they moved to the
    // meetinghouse, and the paperwork stayed where it was written.
    'nurseWarrant': 'There is a warrant on that table. I have not moved it. I am not going to touch it.',
    'putnamDeposition': 'What they swore is written down and it is in the meeting house. Go and read what a sworn statement in this village looks like.',
  },

  annjr: {
    'mercy': 'Mercy is outside. She is always outside now.',
    'nurse': 'Goodwife Nurse is west. My mother would not have me say anything about her, so I will not.',
    'topsfieldPetition': 'There is a paper on our table about Topsfield. My father put his name to it.',
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
  // they bump into is one of these.

  goodwife: {
    'nurse': 'Rebecca Nurse? West, past the meeting house. The big farm on the left.',
    'clue.marker': 'North, in the trees, there is a stone with a mark cut in it. Boys dare each other to move it.',
    'clue.woodpile': 'The wood against the parsonage. Everyone has an opinion about that wood.',
    'clue.seating': 'If you want to know who is who here, go into the meeting house and see who sits at the front.',
    'ingersoll': 'Ingersoll keeps the ordinary, on the road. You cannot miss it, nobody ever has.',
    'mercy': 'The Lewis girl walks that road most of the day. You will meet her.',
    'annjr': 'The Putnams are south-east, past the bend. The big house.',
  },

  woodman: {
    'clue.woodpile': 'That stack against the parsonage? I did not cut it and I am not going to.',
    'clue.marker': 'Boundary stone is north of here in the trees. I cut on this side of it and I am careful about it.',
    'nurse': 'Nurse farm is west. Good ground. That is half the trouble.',
    'ingersoll': 'Ordinary is on the road south. I will be in it by dark.',
    'parris': 'The minister is in the parsonage. He is in it a great deal.',
  },

  swineboy: {
    'mercy': 'Mercy is up the road. She talks to me sometimes.',
    'clue.marker': 'There is a stone in the north woods. I am not supposed to go past it.',
    'annjr': 'The Putnam house is that way, the big one. Ann does not come out much now.',
    'clue.accounts': 'The tavern is on the road. My father is in the book there and he does not know I know.',
  },

  watchman: {
    'clue.marker': 'North, in the trees, there is a boundary stone. I have been sent out to look at it twice this year.',
    'nurse': 'The Nurse place is west of the meeting house.',
    'clue.seating': 'The seating is set down inside. I sit at the back and I am not sorry about it.',
    'ingersoll': 'Ingersoll\'s, on the road. Where else would a man be.',
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
    'titubaJail': 'The minister\'s woman is in the same cellar. She confessed in March and she is still there in June. Think about that.',
    'marywarren': 'The Warren girl is back at the ordinary. She said something in May and then she unsaid it.',
    'nursePetition': 'There is a paper on our table. Thirty-nine of our neighbours put their names to it. It did not answer.',
  },

  marywarren: {
    'annjr': 'Ann is at her house. She has not been out.',
    'mercy': 'Mercy is in the road. She will not be glad to see me.',
    'nurseJail': 'She is in the jail. In the town, south. You can stand at the bars, people do.',
    'jailBill': 'They charge for it. The keeping, the irons, all of it. There is a bill for it in the jail.',
    'nurseWarrant': 'The warrant is still lying on the table in here. Nobody will pick it up and nobody will move it.',
    'putnamDeposition': 'What Ann swore is written out in the meeting house. Read it. Then ask yourself who wrote it down for her.',
  },

  nurseJail: {
    'titubaJail': 'The minister\'s woman is further along the bars. She has been here since March.',
    'marywarren': 'The Warren girl is at the ordinary. She tried to take it back and they turned on her for it.',
    'jailBill': 'They keep an account of what my keeping costs. My family will be sent it.',
  },

  titubaJail: {
    'nurseJail': 'The old woman is along the wall there. She will not say the thing that would let her out.',
    'dorothy': 'There is a child down here. Four years old. Look at her and then tell me what this is.',
  },

  descendant: {
    'annApology': 'One of those papers on the grass is hers. She stood up in that meeting house and had it read out for her.',
    'sewallApology': 'There\'s one from a judge. One. Out of nine.',
    'johnsonAct': 'The last one is the state clearing the names. Look at the date on it before you decide that\'s a happy ending.',
  },

  neighbour: {
    'coreyRecord': 'It is all written down in the meeting house. Every bit of it, in a good clear hand.',
    'deathWarrantReturn': 'The papers are on the table in the meeting house. Nobody has moved them.',
    'eastyPetition': 'The Easty woman wrote something before the end. It is with the rest of it inside.',
    'annjr': 'The Putnams are still in their house. Go and see for yourself, I will not describe it.',
  },
};

/**
 * The line this person has about what the player still owes, or null.
 *
 * Deliberately returns null far more often than not. A pointer on every
 * goodbye would be worse than none: it would train the player that the last
 * line of every conversation is machinery, and they would stop reading it.
 */
export function pointerFor(state, npcId, key) {
  if (!npcId || !key || npcId === key) return null;
  const set = DIRECTIONS[npcId];
  if (!set || !set[key]) return null;
  if (state.knows(`pointed.${npcId}.${key}`)) return null;
  return set[key];
}
