// Things the player can examine.
//
// The design doc's rule: "The causes are in the furniture." What the player
// finds should be environmental and concrete, not textual. Nothing here is a
// document handed over to be read — it is a woodpile you can count, a chart
// nailed to a wall, a line of credits in a book, and five miles of road.
//
// These are written as narration (no speaker, no portrait) so they read as
// the player noticing rather than as someone explaining.

export const CLUES = {

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
    { say: 'The front rows are written in a heavier hand: the men who pay the largest rates, and their wives, and the elders. Behind them, in smaller writing, everyone else. At the back, names with no title at all.', who: null },
    { learn: 'clue.seating', source: 'observed' },
    { say: 'Twice every Sabbath, this whole village sits down in the exact order of who matters. Nobody has to be told where they stand. They can read it on the wall.', who: null },
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
    { say: 'They walk it to pay their rates, argue their deeds, and answer to the court. Then they walk back.', who: null },
  ],
};
