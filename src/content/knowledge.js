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

  // --- the parsonage dig, present ---------------------------------------
  'dig.here':        'The Salem Village parsonage foundation is still there, in a patch of trees behind a street in Danvers. Danvers changed its name from Salem Village in 1752.',
  'dig.sign':        'The first accusations of 1692 started in the parsonage — the minister\'s own house.',
  'dig.foundation':  'The parsonage cellar was excavated in 1970. Everything above ground level is gone.',
  'dig.small':       'The whole parsonage was two rooms and a loft, with one chimney. Nine or ten people lived in it, including Tituba and John Indian.',
  'dig.finds':       'The dig turns up redware, nails, window lead, butchered bone — and pins, constantly. Pins were in every house because clothes were pinned together.',
  'dig.noprivacy':   'There were no corridors. You got from room to room by walking through them. There was nowhere in that house a child could be ill without the whole household watching.',
  'dig.stood':       'I stood on the floor of the room I had been standing in three months earlier.',

  // --- June 1692 ---------------------------------------------------------
  'june.arrived':    'By June the village is full of carts and strangers, and two of the people I talked to in March are in prison.',
  'june.nursejailed':'Rebecca Nurse was arrested on 24 March, ill in bed, and is in the Salem jail awaiting trial.',
  'june.petition':   'Thirty-nine of her neighbours signed a statement for Rebecca Nurse saying they had never seen anything in her to suggest witchcraft. Some of the signatures are Putnams.',
  'june.threesisters':'All three Towne sisters — Rebecca Nurse, Mary Easty and Sarah Cloyce — were accused. Their family had been in a land dispute with the Putnams for thirty years.',
  'june.irons':      'Prisoners were kept in irons and charged for them. Nobody could be released until their jail fees were paid.',
  'june.spectral':   'Rebecca Nurse was accused of sending her SHAPE into rooms to hurt people. She asked how anyone could answer such a charge, and got no answer.',
  'june.warned':     'I told Rebecca Nurse the date she would be hanged. She did not believe me. She thought I had been listening to frightened people and asked whether I had eaten.',
  'june.beating':    'Tituba says Rev. Parris beat her before she was examined and told her what it would be well for her to say. Her confession supplied the imagery — the book, the man in black, the birds — that every later confession repeated.',
  'june.confessionsurvival':'Nobody who confessed was executed. Everyone who insisted they were innocent was tried. Tituba lied and lived; Rebecca Nurse told the truth.',
  'june.parrisdisowns':'Parris will not pay Tituba\'s jail fees, so she cannot be released.',
  'june.parrisrecords':'Parris is personally recording the examinations — names, questions, answers, and what the afflicted did while it was said.',
  'june.recant':     'Mary Warren publicly said the afflicted girls were pretending. Within a fortnight she was in irons herself, accused by the same girls.',
  'june.onlyexit':   'Mary Warren went back to being an accuser because it was the only way to stop being accused. The only exit from accusation is accusation.',
  'june.mercyafflicted':'Mercy Lewis is now one of the afflicted. In March she was an unnamed servant; in June grown men wait at the door for her.',
  'june.mercysees':  'Mercy Lewis says that when it takes her she sees dark shapes at the edge of a room — and that the magistrates wait patiently until she produces a name.',
  'june.annnames':   'Ann Putnam Jr. has formally accused Rebecca Nurse, Martha Corey, the Proctors and others. She says their shapes come to her.',
  'june.fatherwrites':'Ann Putnam Jr.\'s depositions are written down by her father, Thomas Putnam, and read back to her for agreement.',
  'june.examinations':'The first examinations were held in Ingersoll\'s tavern, because it was the only room in the village big enough, before moving to the meetinghouse.',
  'june.ingersollguilt':'Ingersoll is taking more money than ever and is ashamed of it. Rebecca Nurse was brought through his door in irons.',
  'june.warrantfound':'The arrest warrant was served at the tavern. It is signed by the magistrates Hathorne and Corwin.',
  'june.spreading':  'The accusations are spreading beyond Salem Village — names are being spoken in Beverly and Andover.',
  'june.jail':       'The Salem jail is a cellar. Some of the prisoners are children.',
  'june.jailoutside':'Nobody guards the jail door. Nobody inside can pay the fees required to leave.',
  'june.dorothy':    'Sarah Good gave birth in the jail and the baby died. Her four-year-old daughter has been imprisoned since March.',
  'june.courtroom':  'The meetinghouse is a church on Sunday and a courtroom the rest of the week — same room, same people, and the seating chart still on the wall.',

  // --- the law, present --------------------------------------------------
  'law.papers':      'The trial papers survive — every warrant, deposition and bill, in an archive.',
  'law.documented':  'The court wrote everything down. They were not hiding anything. They believed they were doing law.',
  'law.spectral':    'Spectral evidence made a defence impossible by design: you cannot produce a witness to something invisible, and your body being elsewhere was the entire accusation.',
  'law.nocounsel':   'The accused had no lawyers. They cross-examined their own accusers in a room where girls screamed whenever they spoke.',
  'law.nurseverdict':'The jury acquitted Rebecca Nurse. The chief justice queried a phrase she had used; they were sent back out and returned a conviction. She was hard of hearing and probably never caught the question.',
  'law.charter':     'Massachusetts had no legal government from 1689 to May 1692. The court was created in haste by a brand-new governor, out of his own council, under a chief justice with no legal training. It had never sat before and had no settled rules of evidence.',
  'law.confession':  'The court built a machine in which the honest were killed and the liars survived — and then treated the confessions it had produced as proof the whole thing was real.',
  'law.ergot_claim': 'One famous theory says ergot-infected rye caused hallucinations and convulsions.',
  'law.ergot_rebut': 'Ergot does not fit: the symptoms are wrong, whole households ate the same bread but only certain people were afflicted, and above all it says nothing about WHO was accused. A tidy single cause that explains one symptom and none of the pattern is usually wrong.',

  // --- September 1692 ----------------------------------------------------
  'sept.arrived':    'By late September the village is silent. People who talked to me in March have nothing to say.',
  'sept.corey':      'Giles Corey, 81, refused to plead and was pressed to death under stones. It took two days.',
  'sept.forfeiture': 'By refusing to plead, Giles Corey prevented a trial — and so kept the sheriff from seizing his farm. He worked out the price and paid it.',
  'sept.noburial':   'The executed were denied burial in consecrated ground and left in the rocks by the ledge. Some families went out at night and brought their people home.',
  'sept.eight':      'Eight people were hanged on 22 September 1692.',
  'sept.stopped':    'After 22 September it simply stopped. Ministers had begun writing against spectral evidence, and it was said the governor\'s own wife had been named.',
  'sept.empty':      'There are houses in this village with nobody in them and a chair pushed back from the table.',
  'sept.quiet':      'Nobody in the village wants to be remembered as having enjoyed it.',
  'sept.parrisreckoning':'Parris expects a reckoning to land on him. Within four years the village would refuse to keep him.',
  'sept.noticed':    'In September, Ann Putnam Jr. looked directly at me and asked whether I had been here before. There was nothing I could say.',

  // --- the reckoning, present --------------------------------------------
  'reck.returned':   'I came back to the memorial knowing all twenty names.',
  'reck.bothsides':  'Ellen Towne-Putnam has ancestors on both sides — one hanged, one who signed the complaint. Half of Essex County is in the same position.',
  'reck.noside':     'Having family on both sides makes it impossible to pick a side and feel good about it — and impossible to shrug it off as just how things were.',
  'reck.annapology': 'In 1706 Ann Putnam Jr. stood in the village church while her apology was read aloud over her head. She was the only one of the afflicted girls who ever did it.',
  'reck.ordinary':   'Nobody involved thought they were doing evil. Ordinary people followed the rules they had, in a bad year, and twenty people died.',

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
  francis:    'Told to me by Francis Nurse',
  nurseJail:  'Told to me by Rebecca Nurse, in the Salem jail',
  titubaJail: 'Told to me by Tituba, in the Salem jail',
  marywarren: 'Told to me by Mary Warren',
  neighbour:  'Told to me by a neighbour in the village',
  archaeologist: 'Told to me by Dr. Reyes, at the parsonage dig',
  historian:  'Told to me by Dr. Whitfield, in the archive',
  descendant: 'Told to me by Ellen Towne-Putnam, at the memorial',
  stranger:   'Overheard from a visitor to the village',
  stranger2:  'Overheard from a visitor to the village',
  stranger3:  'Overheard in the tavern',
  goodwife:   'Told to me by a woman at the well',
  woodman:    'Told to me by a man splitting wood',
  watchman:   'Told to me by a man on the village watch',
  swineboy:   'Told to me by a boy with the swine',
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
