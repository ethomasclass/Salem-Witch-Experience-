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

/** A bench inscription. Twenty of these, and they are all the same shape —
 *  which is the memorial's actual design argument: no ranking, no
 *  interesting one, just twenty people and what was done to them. */
export function benchScript(b) {
  const lines = [
    { say: 'A granite slab, cantilevered out of the wall. Just long enough to sit on.', who: null },
    { say: `Cut into the edge:  ${b.name}`, who: null },
    { say: `${b.fate} · ${b.date}`, who: null },
  ];
  if (b.name === 'REBECCA NURSE') {
    lines.push(
      { learn: 'present.nurse', source: 'observed' },
      { say: 'It is exactly like the other nineteen. Same stone, same lettering, same length.', who: null },
      { say: 'You will want to remember this one.', who: null },
    );
  } else if (b.name === 'GILES COREY') {
    lines.push({ say: 'It is the only one that does not say HANGED.', who: null });
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
    { say: 'It marks a line. Somebody thought it was worth walking out here to cut it again.', who: null },
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
