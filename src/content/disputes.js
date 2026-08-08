// Where the sources disagree.
//
// The design doc's promise is that "two students can finish with different
// notebooks and both be right about the facts, because characters contradict
// each other and the game never adjudicates." That was true, and it was also
// invisible: a student could copy Parris's account of the examinations and
// Tituba's account of the same afternoon into the same notebook, one after
// the other, and never register that they cannot both be the whole truth.
//
// So the game notices out loud, once, at the moment the second account
// arrives — and then marks the claim disputed and shows both sides with who
// said them. It still does not adjudicate. Naming a disagreement is not the
// same as settling it, and the settling is the student's job.
//
// EVERY PAIR HERE IS ALREADY IN THE WRITING. Nothing was invented to create
// a conflict; these are the seams that were always in the content, and the
// only new thing is that the game now points at them.
//
// `a` and `b` are knowledge flags, or 'doc:<id>' for a copied document.
// `line` is what a character says when the second one lands — written to be
// spoken by whoever the player is standing in front of, so it must work in
// anyone's mouth.

export const DISPUTES = [
  {
    id: 'parris-tituba',
    a: 'june.parrisrecords',
    b: 'june.beating',
    line: 'That is not the account Mr. Parris gave you.',
    claim: 'What happened in the parsonage before Tituba was examined',
    sideA: 'Parris says he wrote the examinations down himself — names, questions, answers, everything the afflicted did while it was said.',
    sideB: 'Tituba says he beat her first and told her what it would be well for her to say.',
  },
  {
    id: 'ergot',
    a: 'law.ergot_claim',
    b: 'law.ergot_rebut',
    line: 'The tidy explanation and the objection to it do not sit together.',
    claim: 'Whether ergot poisoning explains 1692',
    sideA: 'Ergot-infected rye can cause hallucinations and convulsions, and it is the explanation most people have heard.',
    sideB: 'The symptoms are wrong, whole households ate the same bread, and it says nothing at all about WHO was accused.',
  },
  {
    id: 'who-swore-it',
    a: 'june.fatherwrites',
    b: 'doc:putnamDeposition',
    line: 'The paper says she swore it. She says her father wrote it.',
    claim: 'Whose words the depositions actually are',
    sideA: 'Ann Putnam Jr. says her father writes them down and reads them back to her for agreement.',
    sideB: 'The deposition itself is sworn in her name, upon her oath, before the Jurors of Inquest.',
  },
  {
    id: 'how-names-arrive',
    a: 'june.annnames',
    b: 'june.mercysees',
    line: 'Mercy Lewis does not describe it the way Ann Putnam does.',
    claim: 'How a name arrives during a fit',
    sideA: 'Ann Putnam Jr. says the shapes come to her, and she says whose they are.',
    sideB: 'Mercy Lewis says she sees dark shapes at the edge of a room, and that the magistrates wait patiently until she produces a name.',
  },
  {
    id: 'what-started-it',
    a: 'fact.griggs',
    b: 'fact.witchcake',
    line: 'That is a different account of what set it off.',
    claim: 'What turned an illness into an accusation',
    sideA: 'Doctor Griggs examined the girls, found nothing physical, and suggested the evil hand was upon them.',
    sideB: 'Mary Sibley had a witch cake baked and fed to a dog — and it was after that that the girls began naming names.',
  },
  {
    id: 'ingersoll-himself',
    a: 'june.ingersollguilt',
    b: 'sept.quiet',
    line: 'He tells it differently now than he did in June.',
    claim: 'How Nathaniel Ingersoll accounts for his own part',
    sideA: 'In June he said he was taking more money than ever and was ashamed of it, and that Rebecca Nurse was brought through his door in irons.',
    sideB: 'In September he says nobody in the village wants to be remembered as having enjoyed it.',
  },
];

/** Anything that fires a dispute, for a fast membership test. */
export const DISPUTED_KEYS = new Set(DISPUTES.flatMap((d) => [d.a, d.b]));

/** The disputes both of whose sides the player now holds. */
export function activeDisputes(state) {
  const has = (k) => (k.startsWith('doc:') ? state.hasDoc(k.slice(4)) : state.knows(k));
  return DISPUTES.filter((d) => has(d.a) && has(d.b));
}

/**
 * Which dispute, if any, has just been completed by learning `key`.
 *
 * Returns null when the player already had both sides, so the line fires
 * once — at the moment the second account arrives — and never again.
 */
export function disputeCompletedBy(state, key) {
  if (!DISPUTED_KEYS.has(key)) return null;
  const has = (k) => (k.startsWith('doc:') ? state.hasDoc(k.slice(4)) : state.knows(k));
  return DISPUTES.find((d) => {
    const other = d.a === key ? d.b : d.b === key ? d.a : null;
    return other !== null && has(other);
  }) || null;
}

/** Who the player heard a side from, for the notebook. */
export function sideSourceOf(state, key) {
  return key.startsWith('doc:') ? 'the document itself' : state.sourceOf(key);
}
