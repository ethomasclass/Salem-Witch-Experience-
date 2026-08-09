// The four cases historians actually argue, and the evidence a student can
// file under them.
//
// ---------------------------------------------------------------------
// THE ONE RULE THIS FILE EXISTS TO ENFORCE
//
// Nothing here says which theory a piece of evidence supports.
//
// That was the fork, and it matters more than it looks. The game could tag
// every fact with its cause and present four ready-made arguments, and a
// student who rushed would still see them. But deciding that Ingersoll's
// ledger is evidence about land and money — and noticing that it is *also*
// evidence about who had the standing to accuse whom — is the entire
// historical skill this game exists to practise. A game that files the
// evidence has done the reading for them and left them the typing.
//
// So the four cases are stated, the evidence is marked as arguable, and the
// filing is the player's. It is unscored, it is optional, a student who
// files nothing still finishes, and whatever they do file goes into the
// export as their own argument rather than the game's.
//
// ---------------------------------------------------------------------
// WHICH ENTRIES ARE FILABLE
//
// Not all of them. A finished notebook holds about ninety entries and most
// are texture — what a room smelled like, who was standing where. Asking a
// class to sort ninety items in a thirty-minute period would turn the best
// idea in the game into data entry.
//
// `ARGUABLE` is the subset a historian would actually cite in an argument
// about causes: roughly a third. Marking an entry arguable says "this is
// evidence about why", which is a different and much weaker claim than
// saying which why it is evidence for.
// ---------------------------------------------------------------------

export const THEORIES = [
  {
    id: 'land',
    short: 'Land and money',
    title: 'LAND AND MONEY',
    blurb: 'A village split into two factions, feuding families, a disputed boundary, and a pattern in who accused whom.',
    // Named so a student can look the argument up afterwards. Deliberately
    // not presented as the answer — each of these historians is arguing
    // against the others.
    cite: 'Paul Boyer and Stephen Nissenbaum, Salem Possessed (1974)',
  },
  {
    id: 'war',
    short: 'The frontier war',
    title: 'THE WAR',
    blurb: 'A brutal war to the north, and refugees from it living in the very households that did most of the accusing.',
    cite: 'Mary Beth Norton, In the Devil\'s Snare (2002)',
  },
  {
    id: 'women',
    short: 'Who was accused',
    title: 'WHO WAS ACCUSED',
    blurb: 'Mostly women — and often women who stood to inherit property, or who had already been difficult in public.',
    cite: 'Carol Karlsen, The Devil in the Shape of a Woman (1987)',
  },
  {
    id: 'law',
    short: 'The law itself',
    title: 'THE LAW ITSELF',
    blurb: 'Spectral evidence, no defence counsel, a colony that had lost its charter, and a religion in which confessing was the only way to live.',
    cite: 'Bernard Rosenthal, Salem Story (1993)',
  },
];

export const THEORY_IDS = THEORIES.map((t) => t.id);

/**
 * Knowledge flags that are evidence about causes rather than texture.
 *
 * Adding a flag here is a claim that a historian could build an argument on
 * it — NOT a claim about which argument. Several of these are cited by more
 * than one of the four, which is the point: the same ledger is evidence for
 * a village quarrel and for who had the standing to be believed.
 */
export const ARGUABLE = new Set([
  // the village, its money, and its quarrels
  'fact.factions', 'fact.salary', 'fact.parris_deed', 'fact.topsfield',
  'fact.nurseland', 'clue.woodpile', 'clue.seating', 'clue.accounts',
  'clue.marker', 'clue.road',

  // the war to the north
  'fact.mercymaine', 'fact.maine_refugees', 'fact.maine_magistrates',
  'fact.maine_fear',

  // who was accused, and what they had in common
  'fact.tituba', 'fact.firstthree', 'fact.osborne', 'fact.good',
  'fact.womenproperty', 'fact.annsr', 'june.spectral', 'june.fatherwrites',

  // how the sickness started, and the bodily explanations
  'fact.girls', 'fact.griggs', 'fact.witchcake',
  'fact.wetyear', 'fact.spurredrye', 'fact.atetherye', 'fact.cattle',

  // the court
  'law.spectral', 'law.nocounsel', 'law.charter', 'law.confession',
  'law.ergot_rebut', 'sept.forfeiture', 'june.irons',
]);

/** Every filable entry the player currently holds. */
export function filableEntries(state, KNOWLEDGE) {
  return state.knowledgeLog()
    .filter((e) => ARGUABLE.has(e.flag) && KNOWLEDGE[e.flag])
    .map((e) => ({ flag: e.flag, text: KNOWLEDGE[e.flag], source: e.source }));
}

/** How many pieces of evidence the player has filed under each theory. */
export function filedCounts(state) {
  const counts = {};
  for (const t of THEORY_IDS) counts[t] = 0;
  for (const [, set] of state.filed) for (const id of set) if (counts[id] !== undefined) counts[id] += 1;
  return counts;
}
