// What a piece of knowledge is called when the player reads it back.
//
// Every flag the game can set has a plain-English line here. That line is
// what appears in the notebook and, at the end of the game, in the text the
// student exports for their teacher. Writing them in the player's own voice
// ("I saw...", "She told me...") rather than as system messages keeps the
// exit artifact readable as a piece of student thinking instead of a save
// file dump.

export const KNOWLEDGE = {
  // --- present day -------------------------------------------------------
  'present.memorial':  'The Salem Witch Trials Memorial has twenty benches — one for each person executed in 1692.',
  'present.happened':  'Between January and October 1692, more than 150 people were arrested for witchcraft in Essex County. Nineteen were hanged, one was pressed to death, and at least five died in jail. It was over in under a year.',
  'present.court':     'The Court of Oyer and Terminer accepted spectral evidence — testimony that the accused\'s spirit had appeared to a witness, which nobody else could see and nobody could disprove. The accused had no lawyers. Nobody who confessed was executed; everyone hanged had insisted they were innocent.',
  'present.argument':  'Historians argue about four causes: land and money, the frontier war, who the accused women were, and the law itself. All four have evidence. None explains everything alone.',
  'present.threshold': 'The victims\' own words are carved into the stones at the entrance, and every one of them is cut off mid-sentence by the wall. That was a design decision.',
  'present.nurse':     'One of the benches reads REBECCA NURSE · HANGED · JULY 19, 1692.',
  'present.jaildeaths':'Five more people died in jail waiting for trial. They do not have benches.',
  'present.nograves':  'None of the twenty are buried at the memorial. They were denied graves.',
  'present.tourism':   'There is a shop selling witch hats and ghost tours about two hundred feet from the benches.',
  'present.realquestion': 'Nora gets asked "was it real?" every day. Her answer: no witches, but a real court really killed twenty real people and wrote it all down.',
  'present.johnson':   'Elizabeth Johnson Jr. was the last person still uncleared — for 329 years, because she had no descendants to push for it. An eighth-grade civics class in North Andover got her exonerated in 2022.',

  // --- things seen -------------------------------------------------------
  'clue.woodpile':   'The parsonage woodpile is nearly empty. His contract promised him firewood.',
  'clue.seating':    'The meetinghouse seats are assigned. The best rows go to the wealthiest families, and everyone sees the chart every Sunday.',
  'clue.marker':     'There is a boundary stone in the woods north of the village, between the Nurse land and the Putnam land.',
  'clue.accounts':   "Ingersoll's account book records who owes whom. A surprising number of people owe the Putnams.",
  'clue.road':       'I walked the road to Salem Town. It is five miles, and the houses at the far end are visibly richer.',
  'clue.hearth':     'The parsonage fire is banked low even in March. This house is cold.',

  // --- things told -------------------------------------------------------
  'fact.girls':      'Two girls in the parsonage — Betty Parris, nine, and Abigail Williams, eleven — have been ill since winter. Fits, contortions, and speech no one can make sense of.',
  'fact.griggs':     'Doctor Griggs examined the girls, found nothing physical, and suggested the evil hand was upon them.',
  'fact.witchcake':  'Mary Sibley had Tituba bake a cake of rye meal and the girls\' urine and feed it to a dog, to reveal a witch. It was after this that the girls began naming names.',
  'fact.salary':     'The village has refused to collect the rate for Reverend Parris\'s salary. The committee elected in October was chosen by men who oppose him.',
  'fact.topsfield':  'The Putnams and the Topsfield families — including Rebecca Nurse\'s people, the Townes — have been disputing that boundary line for a generation.',
  'fact.nurseland':  'The Nurse family bought a 300-acre farm on a long mortgage. The Putnams believe some of that land was theirs.',
  'fact.mercymaine': 'Mercy Lewis\'s parents were killed in the fighting in Maine. She came south with nothing and went into service in the Putnam house.',
  'fact.tituba':     'Tituba is enslaved in the Parris household. She is Indian, not African — the records say so, whatever later stories claim.',
  'fact.factions':   'The village is split. The Putnams and their allies on one side, the Porters and theirs on the other. The quarrel is older than the sickness.',
  'fact.parris_deed':'Parris was given the parsonage and its land outright — a thing no previous minister here got, and a thing his opponents have not forgiven.',
  'fact.strangers':  'People are coming in from other towns to look at the afflicted girls.',
  'fact.annsr':      'Ann Putnam Sr. has buried several children. Her grief is a fact everyone in the village knows and steps around.',
};

/** Display name for whoever a piece of knowledge came from. */
export const SOURCES = {
  observed:   'I saw this myself',
  nora:       'Told to me by Nora, at the memorial',
  tituba:     'Told to me by Tituba',
  parris:     'Told to me by Rev. Parris',
  annjr:      'Told to me by Ann Putnam Jr.',
  nurse:      'Told to me by Rebecca Nurse',
  ingersoll:  'Told to me by Nathaniel Ingersoll',
  mercy:      'Told to me by Mercy Lewis',
};

export function sourceName(id) {
  return SOURCES[id] || 'I saw this myself';
}

/** Notebook entries, in the order the player learned them. Internal
 *  bookkeeping flags (asked.*) never surface. */
export function notebookEntries(state) {
  return state.knowledgeLog()
    .filter((e) => KNOWLEDGE[e.flag])
    .map((e) => ({ text: KNOWLEDGE[e.flag], source: e.source, flag: e.flag }));
}
