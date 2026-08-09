// Things the player can examine.
//
// The design doc's rule: "The causes are in the furniture." What the player
// finds should be environmental and concrete, not textual. Nothing here is a
// document handed over to be read — it is a woodpile you can count, a chart
// nailed to a wall, a line of credits in a book, and five miles of road.
//
// These are written as narration (no speaker, no portrait) so they read as
// the player noticing rather than as someone explaining.

/* ---------------------------------------------------------------------- *
 * Present day
 *
 * Different register on purpose. The 1692 voice is period-inflected; this
 * one is plain contemporary English, because the player is a student
 * standing on a city street in Massachusetts and it should feel like it.
 * ---------------------------------------------------------------------- */

/**
 * What a bench says once you know who is on it.
 *
 * The whole seven-chapter shape exists so that the player walks past these
 * twenty stones twice: once at the start, when the names mean nothing, and
 * once at the end, when some of them are people. Everything below is
 * gated on what the player actually did, so on the first visit none of it
 * fires and the benches are what the memorial intends them to be — twenty
 * identical slabs with no interesting one.
 *
 * The rest stay silent rather than saying "you never learned about this
 * person." Twelve benches scolding a student for what they missed would
 * turn a memorial into a score screen.
 *
 * Each entry is checked in order; the first match is the one that speaks,
 * so the closest connection wins over the more distant one.
 */
const BENCH_MEMORY = {
  'REBECCA NURSE': [
    { when: (s) => s.knows('june.warned'), say:
      'You told her this date. You stood on the other side of the bars in June and said it out loud, and she asked whether you had eaten.' },
    { when: (s) => s.talkedTo.has('nurseJail'), say:
      'The last time you saw her she was on the other side of a grate, and she was worried about her sister.' },
    { when: (s) => s.talkedTo.has('nurse'), say:
      'You sat in her kitchen in March. She offered you something to eat and asked after nobody in particular.' },
  ],
  'SARAH GOOD': [
    { when: (s) => s.hasDoc('jailBill'), say:
      'She gave birth in the jail you walked into. The child died there.' },
    { when: (s) => s.hasDoc('seatingList'), say:
      'Hers is the last name on the seating list. The one with no sum written beside it.' },
  ],
  'GILES COREY': [
    { when: (s) => s.hasDoc('coreyRecord'), say:
      'Two days under the stones, so that the farm would go to his sons-in-law instead of to the sheriff. He worked out what it would cost him.' },
    { when: () => true, say: 'It is the only one that does not say HANGED.' },
  ],
  'MARY EASTEY': [
    { when: (s) => s.hasDoc('eastyPetition'), say:
      'She asked the court to change its methods so that it would stop killing other people. She already knew it was too late for her.' },
    { when: (s) => s.knows('june.threesisters'), say:
      'Rebecca Nurse\'s sister. One of the three Towne girls the Putnams had been in court with for thirty years.' },
  ],
  'MARTHA COREY': [
    { when: (s) => s.hasDoc('deathWarrantReturn'), say:
      'First of the eight names on the sheriff\'s return. You copied that list down.' },
  ],
  'ALICE PARKER':   [{ when: (s) => s.hasDoc('deathWarrantReturn'), say: 'One of the eight on the sheriff\'s return.' }],
  'MARY PARKER':    [{ when: (s) => s.hasDoc('deathWarrantReturn'), say: 'One of the eight on the sheriff\'s return.' }],
  'ANN PUDEATOR':   [{ when: (s) => s.hasDoc('deathWarrantReturn'), say: 'One of the eight on the sheriff\'s return.' }],
  'WILMOT REDD':    [{ when: (s) => s.hasDoc('deathWarrantReturn'), say: 'One of the eight on the sheriff\'s return.' }],
  'MARGARET SCOTT': [{ when: (s) => s.hasDoc('deathWarrantReturn'), say: 'One of the eight on the sheriff\'s return.' }],
  'SAMUEL WARDWELL':[{ when: (s) => s.hasDoc('deathWarrantReturn'), say: 'One of the eight on the sheriff\'s return. He confessed, and then took it back. That is why he is on this wall and other confessors are not.' }],
  'JOHN PROCTOR': [
    { when: (s) => s.hasDoc('accountBookPage'), say:
      'His name is in Ingersoll\'s account book, owing one pound two to Ingersoll himself.' },
  ],
  'GEORGE JACOBS SR.': [
    { when: (s) => s.hasDoc('accountBookPage'), say:
      'His name is in Ingersoll\'s account book, owing one fifteen. To the Putnams.' },
  ],
  'JOHN WILLARD': [
    { when: (s) => s.hasDoc('accountBookPage'), say:
      'His name is at the top of Ingersoll\'s account book, owing one pound four. To the Putnams.' },
  ],
};

/** A bench inscription. Twenty of these, and they are all the same shape —
 *  which is the memorial's actual design argument: no ranking, no
 *  interesting one, just twenty people and what was done to them. */
export function benchScript(b, state) {
  const lines = [
    { say: 'A granite slab, cantilevered out of the wall. Just long enough to sit on.', who: null },
    { say: `Cut into the edge:  ${b.name}`, who: null },
    { say: `${b.fate} · ${b.date}`, who: null },
  ];

  if (b.name === 'REBECCA NURSE') {
    lines.push(
      { learn: 'present.nurse', source: 'observed' },
      { say: 'It is exactly like the other nineteen. Same stone, same lettering, same length.', who: null },
    );
  }

  const memory = state && (BENCH_MEMORY[b.name] || []).find((m) => m.when(state));
  if (memory) {
    lines.push({ say: memory.say, who: null });
    // Only Rebecca Nurse gets a second beat, because she is the one the
    // player was told to remember before they had any reason to.
    if (b.name === 'REBECCA NURSE' && state.knows('june.warned')) {
      lines.push({ say: 'She was right that you had been listening to frightened people. She was wrong about the rest of it.', who: null });
    }
  } else if (b.name === 'REBECCA NURSE') {
    lines.push({ say: 'You will want to remember this one.', who: null });
  }

  return lines;
}

export const PRESENT_CLUES = {

  arriveMemorial: [
    { say: 'Charter Street, Salem, Massachusetts. Present day.', who: null },
    { say: 'Traffic behind you. A gift shop across the road with witch hats in the window.', who: null },
    { say: 'And in front of you, through a gap in a low granite wall, a small square of grass with twenty stone benches around the edge of it.', who: null },
    { learn: 'present.memorial', source: 'observed' },
  ],

  /* The threshold stones. This is the first thing the player touches, and
   * it is the entire game in one object. It is also completely real. */
  threshold: [
    { say: 'The entrance is paved with flat stones, and there is writing carved into them. You are standing on it.', who: null },
    { say: 'They are quotes. Things the accused actually said at their trials.', who: null },
    { say: '"I am wholly innocent of such wickedness —"', who: null },
    { say: '"God knows I am innocent —"', who: null },
    { say: '"I can deny it to my dying day —"', who: null },
    { say: 'You keep waiting for the ends of the sentences.', who: null },
    { say: 'They run into the base of the wall and stop. All of them. Mid-sentence, mid-word, cut off in stone.', who: null },
    { learn: 'present.threshold', source: 'observed' },
    { say: 'That is not damage. Somebody designed it that way.', who: null },
  ],

  /* ------------------------------------------------------------------ *
   * The three interpretive panels.
   *
   * A student may arrive knowing nothing about 1692 at all, and the game
   * cannot rely on the village to teach the basics — inside 1692 nobody
   * knows what is coming, so nobody can explain it. So the baseline goes
   * here, on plaques, at a real memorial, where plaques belong.
   *
   * Panel three is where the game asks its question out loud. It is the
   * only place it ever does.
   * ------------------------------------------------------------------ */

  panelHappened: [
    { say: 'PANEL ONE — WHAT HAPPENED', who: null },
    { say: 'In January 1692, two girls in the household of the Salem Village minister began having fits that no one could explain. A doctor examined them and suggested witchcraft.', who: null },
    { say: 'By the end of February, three women had been arrested. One of them confessed, and named others.', who: null },
    { say: 'Over the next eight months more than a hundred and fifty people were arrested across Essex County. Farmers, church members, a former minister, a four-year-old girl.', who: null },
    { say: 'Nineteen were hanged. One man was crushed to death under stones. At least five more died in jail.', who: null },
    { learn: 'present.happened', source: 'observed' },
    { say: 'It was over in under a year. Nobody was executed after 22 September 1692. Within five years, people who had taken part were publicly apologising.', who: null },
  ],

  panelCourt: [
    { say: 'PANEL TWO — THE COURT', who: null },
    { say: 'The trials were held by a special court created by the governor in May 1692: the Court of Oyer and Terminer — "to hear and to determine."', who: null },
    { say: 'It accepted spectral evidence. A witness could testify that the accused person\'s spirit had appeared and tormented them. Nobody else could see it. There was no way to disprove it.', who: null },
    { say: 'The accused were not allowed lawyers.', who: null },
    { learn: 'present.court', source: 'observed' },
    { say: 'And confessing kept you alive. Not one person who confessed to witchcraft was executed.', who: null },
    { say: 'Every single person hanged in 1692 had insisted they were innocent.', who: null },
    { say: 'These were not people who did not know any better. They were people following rules — and the rules were the problem.', who: null },
  ],

  panelArgument: [
    { say: 'PANEL THREE — WHY?', who: null },
    { say: 'Historians have argued about this for three hundred years. Almost nobody thinks it was one thing.', who: null },
    { say: 'Some point to LAND AND MONEY — a village split into two factions, feuding families, a disputed boundary, and a pattern in who accused whom.', who: null },
    { say: 'Some point to WAR — a brutal frontier conflict to the north, and refugees from it living in the very households that did most of the accusing.', who: null },
    { say: 'Some point to WHO WAS ACCUSED — mostly women, and often women who stood to inherit property, or who had already been difficult.', who: null },
    { say: 'And some point to THE LAW ITSELF — spectral evidence, no defence counsel, a colony that had lost its charter, and a religion in which confessing was the only way to survive.', who: null },
    { learn: 'present.argument', source: 'observed' },
    { say: 'All four have real evidence behind them. None of them explains everything on its own.', who: null },
    { say: 'This memorial does not tell you the answer. It is not settled.', who: null },
    { say: 'So: what caused it?', who: null },
    { say: 'Go and find out. Everything you notice goes in your notebook — press N to read it back.', who: null },
  ],

  memorialSign: [
    { say: 'An interpretive sign, the kind every historic site has.', who: null },
    { say: 'Dedicated in 1992, three hundred years after the trials. Twenty benches for the twenty people executed.', who: null },
    { say: 'Nineteen were hanged. One was crushed to death under stones for refusing to enter a plea.', who: null },
    { say: 'Five more died in jail waiting for trial. They do not have benches.', who: null },
    { learn: 'present.jaildeaths', source: 'observed' },
  ],

  shopWindow: [
    { say: 'The shop across the street sells witch hats, fridge magnets, hot sauce with a cartoon witch on the label, and tickets for a ghost tour leaving at seven.', who: null },
    { say: 'It is a normal shop. People are inside buying things and none of them look like villains.', who: null },
    { learn: 'present.tourism', source: 'observed' },
    { say: 'It is about two hundred feet from the benches.', who: null },
  ],

  /* The transition. No mechanism, no explanation, no comment afterwards. */
  arrive1692: [
    { say: 'You step through the gap in the wall.', who: null },
    { say: '...', who: null },
    { say: 'The traffic noise is gone. So is the road, and the wall, and the shop.', who: null },
    { say: 'You are standing on a rutted cart track in cold air that smells like woodsmoke and low tide. There are two large houses behind you with glass in every window.', who: null },
    { say: 'This is Salem Town, and it is the first week of March, 1692.', who: null },
    { say: 'Nobody has been arrested. Nothing has happened yet.', who: null },
    { say: 'The village is five miles north. Start walking.', who: null },
  ],

  arriveVillage: [
    { say: 'That took a while.', who: null },
    { say: 'The houses have been getting smaller for the last mile. Less glass. No paint at all now.', who: null },
    { learn: 'clue.road', source: 'observed' },
    { say: 'This is Salem Village. Everyone who lives here walks that road to pay their taxes, argue their land claims, and answer to the court in the town you just left.', who: null },
    { say: 'Then they walk back.', who: null },
  ],
};

export const CLUES = {
  ...PRESENT_CLUES,

  /* ---- transitions and arrivals ------------------------------------ */

  toDig: [
    { say: 'Behind the parsonage the ground dips where a cellar was dug.', who: null },
    { say: 'You step down into it.', who: null },
    { say: '...', who: null },
    { say: 'The house is gone. The dip is still here, and it is lined with fieldstone, and there is a laminated sign on two posts.', who: null },
    { say: 'Somewhere behind you a car goes past.', who: null },
  ],

  arriveDig: [
    { say: 'Danvers, Massachusetts. It was called Salem Village until 1752, when the town changed its name and did not say why.', who: null },
    { say: 'This is a patch of trees behind a residential street. There is a rectangle of stone in the ground, about the size of a classroom.', who: null },
    { learn: 'dig.here', source: 'observed' },
  ],

  digSign: [
    { say: 'SITE OF THE SALEM VILLAGE PARSONAGE, 1681–1784.', who: null },
    { say: 'Home of the Reverend Samuel Parris and his household, including Tituba. The first accusations of 1692 originated in this house.', who: null },
    { say: 'Excavated in 1970. Please do not climb on the foundation.', who: null },
    { learn: 'dig.sign', source: 'observed' },
  ],

  cellarFloor: [
    { say: 'You are standing on the cellar floor of the house you were in an hour ago.', who: null },
    { say: 'The hearth was over there. Tituba was standing about where that root is.', who: null },
    { say: 'Pace it out. It is not big. Two rooms and a loft, and nine or ten people in it, and one fire.', who: null },
    { learn: 'dig.stood', source: 'observed' },
  ],

  toJune: [
    { say: 'You walk back up out of the cellar hole.', who: null },
    { say: '...', who: null },
    { say: 'It is warm. The mud has dried into ruts and there is dust on everything.', who: null },
    { say: 'It is June. Three months have gone by and you were not here for any of them.', who: null },
    { learn: 'june.arrived', source: 'observed' },
    { say: 'There are more carts on that road than you have ever seen on it.', who: null },
  ],

  toArchive: [
    { say: 'You walk out of the meeting house where the court has been sitting.', who: null },
    { say: '...', who: null },
    { say: 'Fluorescent light. Grey boxes on grey shelves, floor to ceiling, with catalogue numbers on the spines.', who: null },
    { say: 'The paperwork survived. All of it. It is in this room.', who: null },
  ],

  arriveArchive: [
    { say: 'Every warrant, every deposition, every bill for chains. Three hundred and thirty years old, in acid-free boxes, in a reading room.', who: null },
    { learn: 'law.papers', source: 'observed' },
  ],

  archiveBoxes: [
    { say: 'Grey archival boxes, numbered. There are a great many of them.', who: null },
    { say: 'This is the strangest thing about 1692, and nobody says it out loud: it is one of the best-documented events in early American history.', who: null },
    { say: 'The court wrote everything down. They were not hiding. They thought they were doing law.', who: null },
    { learn: 'law.documented', source: 'observed' },
  ],

  archiveTable: [
    { say: 'A single sheet in a foam cradle, under a low light.', who: null },
    { say: 'The handwriting is small and fast and the paper has gone the colour of weak tea.', who: null },
    { say: 'Somebody sat down and wrote this, and then somebody was hanged.', who: null },
  ],

  toSeptember: [
    { say: 'You leave the reading room the way you came in.', who: null },
    { say: '...', who: null },
    { say: 'Cold again. Not March cold — the tail end of a hot summer, with the first edge of autumn under it.', who: null },
    { say: 'Late September. The road is empty.', who: null },
    { learn: 'sept.arrived', source: 'observed' },
    { say: 'There is nobody at the well. There is nobody on the road. There is nobody at all.', who: null },
  ],

  toReckoning: [
    { say: 'You walk out past the meeting house for the last time.', who: null },
    { say: '...', who: null },
    { say: 'Traffic. A gift shop. Twenty stone benches around a square of grass.', who: null },
    { say: 'You have been here before. You did not know any of their names then.', who: null },
  ],

  arriveReckoning: [
    { say: 'The threshold stones are still cut off mid-sentence. You still walked over them coming in.', who: null },
    { say: 'Go and read the benches again.', who: null },
    { learn: 'reck.returned', source: 'observed' },
  ],

  /* ---- June ---------------------------------------------------------- */

  jailOutside: [
    { say: 'A low building on Prison Lane with a grate at ground level. You can hear people underneath the street.', who: null },
    { say: 'There is no guard on the door. There does not need to be — nobody in there can pay what is owed to get out.', who: null },
    { learn: 'june.jailoutside', source: 'observed' },
  ],

  arriveJail: [
    { say: 'The gaol is a cellar. The floor is stone and there is straw on the stone and it has been a warm month.', who: null },
    { say: 'There are more people down here than you expected. Some of them are children.', who: null },
    { learn: 'june.jail', source: 'observed' },
  ],

  jailStraw: [
    { say: 'Straw on stone, and it has not been changed in a while.', who: null },
    { say: 'Sarah Good is at the far end. She was pregnant when they took her in March and she is not now.', who: null },
    { say: 'The baby was born in this room and did not live. Her four-year-old daughter is in here too, and has been since March, in irons made for an adult.', who: null },
    { learn: 'june.dorothy', source: 'observed' },
  ],

  courtRoom: [
    { say: 'They have moved the benches. There is a table across the top of the room and a rail put up in front of it.', who: null },
    { say: 'This is a church on Sunday and a courtroom the rest of the week, and it is the same room and the same people either way.', who: null },
    { learn: 'june.courtroom', source: 'observed' },
    { say: 'The seating chart is still nailed by the door.', who: null },
  ],

  /* ---- September ----------------------------------------------------- */

  emptyHouse: [
    { say: 'The door is not locked. Nothing in this village is locked.', who: null },
    { say: 'There is a table, and a cold hearth, and a chair pushed back from the table as if somebody had got up in a hurry.', who: null },
    { say: 'Nobody has been here for some time.', who: null },
    { learn: 'sept.empty', source: 'observed' },
    { say: 'The game does not tell you whose house this was. You could work it out.', who: null },
  ],

  sheriffInventory: [
    { say: 'A paper nailed to the doorpost, official, with a seal on it.', who: null },
    { say: 'It is a list of what was taken out of this house by the sheriff.', who: null },
  ],


  /* Reverend Parris's contract promised him firewood. The village stopped
   * delivering it. The whole salary dispute, rendered as an object you can
   * look at and estimate. */
  woodpile: [
    { say: 'The parsonage woodpile.', who: null },
    { say: 'Two courses of split log, and not a long row of it. You could carry the whole pile in a few armfuls.', who: null },
    { say: 'It is the first week of March in Massachusetts. The ground is still hard.', who: null },
    { learn: 'clue.woodpile', source: 'observed' },
    { say: 'Whatever else is wrong in this house, someone in it is going to be cold for another six weeks.', who: null },
  ],

  /* The boundary marker. Small, easy to miss, and the entire faction thesis
   * hangs off it. It is supposed to underwhelm. */
  marker: [
    { say: 'A stone post, about knee height, set into the ground where the trees thin out.', who: null },
    { say: 'There is a notch cut into one face. It has been recut at least once — the newer cut is a little off the old one.', who: null },
    { learn: 'clue.marker', source: 'observed' },
    { say: 'The line it marks runs down to the brook and follows it. That is how boundaries were drawn out here — you cannot argue with water.', who: null },
    { say: 'Except that somebody has, twice. Somebody thought it was worth walking all the way out here to cut that notch again.', who: null },
  ],

  /* The meetinghouse seating chart. A literal map of who matters, seen by
   * every person in the village twice every Sunday. */
  seatingChart: [
    { say: 'A sheet nailed to the wall by the door, where nobody can avoid it.', who: null },
    { say: 'It is the seating. Every household in the village, assigned a place.', who: null },
    { say: 'The front rows are written in a heavier hand: the men who pay the most tax, and their wives, and the elders. Behind them, in smaller writing, everyone else. At the back, names with no title at all.', who: null },
    { learn: 'clue.seating', source: 'observed' },
    { say: 'Twice every Sunday, this whole village sits down in the exact order of who matters. Nobody has to be told where they stand. They can read it on the wall.', who: null },
  ],

  pews: [
    { say: 'Hard benches, no cushions, no backs to speak of. Services run for hours.', who: null },
    { say: 'The wood at the front is better finished than the wood at the back.', who: null },
  ],

  /* Ingersoll's account book. Debt as a map of resentment. */
  accountBook: [
    { say: 'The ordinary\'s account book, open on the table. Nobody minds you looking.', who: null },
    { say: 'Two columns, a name against each entry: goods and cash, out and owing. Timber. Cattle. Seed against the harvest. Small sums and a few large ones.', who: null },
    { say: 'You start reading down the credit side and stop, because you have read the same surname four times in six lines.', who: null },
    { learn: 'clue.accounts', source: 'observed' },
    { say: 'Putnam. Putnam. Putnam.', who: null },
  ],

  parsonageHearth: [
    { say: 'The fire is banked as low as a fire can be and still be a fire.', who: null },
    { say: 'There is a chair pulled close to it, and a blanket over the arm of the chair, and it is the middle of the day.', who: null },
    { learn: 'clue.hearth', source: 'observed' },
  ],

  well: [
    { say: 'The village well. The water is very cold and the bucket rope is worn through in two places.', who: null },
    { say: 'This is where people meet without having arranged to meet.', who: null },
  ],

  meetinghouseOutside: [
    { say: 'The meetinghouse. It is the largest building in the village and it is not a handsome one — a plain box, unpainted, no steeple.', who: null },
    { say: 'It is also the courthouse, the town hall, and the only room big enough to hold everybody.', who: null },
    { say: 'Whatever this village decides about itself, it will decide in here.', who: null },
  ],

  /* Fires once, at the far end of the road. The design doc asks for the
   * five miles to be something the player has "in their legs" — so this is
   * a walk, not a paragraph, and the payoff waits until the far end. */
  roadEnd: [
    { say: 'You have been walking a while.', who: null },
    { say: 'The road is better here — gravelled in places, and someone maintains it. The houses have begun to change.', who: null },
    { say: 'More glass. Painted trim. A second storey. Fenced gardens, kept up. One of these houses has more window than the whole of Salem Village put together.', who: null },
    { learn: 'clue.road', source: 'observed' },
    { say: 'This is Salem Town. It is five miles from the meetinghouse you started at, and it is a different world, and everyone in the village walks this road.', who: null },
    { say: 'They walk it to pay their taxes, argue their land claims, and answer to the court. Then they walk back.', who: null },
  ],
};
