// The fifteen documents.
//
// The player never picks one up. They are a student standing in front of a
// primary source, so they do the only thing available: copy it down. That
// needs no time-travel rule and no explanation.
//
// ---------------------------------------------------------------------
// A NOTE ON FIDELITY, WHICH MATTERS MORE HERE THAN ANYWHERE ELSE
//
// Presenting invented text to a student as a quotation from a primary
// source would be a worse sin than anything else this game could do. So
// every document carries a `fidelity` field, shown on the reader screen:
//
//   'close'         follows the surviving document closely in substance and
//                   largely in wording. Still check against the archive
//                   before this goes in front of a class.
//   'reconstructed' written in the form and language of the record — warrant
//                   formulas, account-book conventions, the standard clauses
//                   — but not a transcription of one specific surviving
//                   sheet. The substance is documented; the exact wording is
//                   a rendering.
//
// The distinction is displayed to the player, on purpose. A student noticing
// that some sources are transcriptions and some are reconstructions is a
// student doing source criticism, which is the entire point.
//
// ---------------------------------------------------------------------
// LENGTH, WHICH IS A HISTORICAL QUESTION AND NOT ONLY A DESIGN ONE
//
// These are excerpts, and they are meant to fit the reader without
// scrolling. A document a student scrolls through is a document a student
// skims. Two rules follow, and both are load-bearing:
//
//   * `original` lines are hand-wrapped to about 29 characters, because
//     that is the width of the reader's left column. Let a line run longer
//     and it wraps, doubling the line count for no gain.
//   * Anything cut from a transcription is marked `[…]` on its own line.
//     Silently trimming a source and still calling it the document would
//     teach exactly the wrong habit, in a game whose whole subject is what
//     a record does and does not say.
//
// `gloss` is a translation plus one pointed observation. It is not a place
// to re-narrate what the player has already been told by a person — that
// work belongs in dialogue, where somebody can be wrong about it.
//
// tools/check-fit.mjs measures every document against the real column box
// using the real fonts. Run it after editing anything here.
// ---------------------------------------------------------------------
//
// Everything here should be checked against Bernard Rosenthal, *Records of
// the Salem Witch-Hunt* (Cambridge, 2009), and the Salem Witch Trials
// Documentary Archive at the University of Virginia, both cited on screen.
// ---------------------------------------------------------------------

export const DOCUMENTS = {

  /* ---------------------------------------------------------------- *
   * March — money, land, and status, all in writing
   * ---------------------------------------------------------------- */

  parrisAgreement: {
    id: 'parrisAgreement',
    title: 'The village agreement with Mr. Parris',
    date: '1689',
    kind: 'A signature',
    fidelity: 'reconstructed',
    cite: 'Salem Village Book of Record, 1689. See Rosenthal, Records of the Salem Witch-Hunt.',
    note: 'The promise, in writing, that the village then broke.',
    original: [
      'Agreed with Mr Samuel Parris',
      'to take the office of the',
      'ministry among us:',
      '',
      'First, that he is to have',
      'Sixty six pounds for his',
      'yearly salary, one third part',
      'in money, and the other two',
      'third parts in provisions.',
      '',
      'Item: that his fire wood be',
      'given in freely to him.',
      '[…]',
    ],
    gloss: [
      'Parris was hired on these terms. Sixty-six pounds a year, mostly paid in corn and meat.',
      '',
      'And his firewood free.',
      '',
      'Two years later the village stopped collecting the tax that paid him, and stopped delivering the wood.',
      '',
      'His woodpile is outside.',
    ],
  },

  seatingList: {
    id: 'seatingList',
    title: 'Seating of the meeting house',
    date: '1690',
    kind: 'A number',
    fidelity: 'reconstructed',
    cite: 'Salem Village Book of Record. Seating committees are documented throughout the 1680s–90s.',
    note: 'Status, priced. Nailed where everyone reads it twice a week.',
    original: [
      'The Committee chosen to seat',
      'the meeting house, having',
      'regard to age, to office, and',
      'to what each man payeth to the',
      'rates, do order as followeth:',
      '',
      ' Foremost  Capt.Walcott £2 4s',
      '           Mr T.Putnam  £2 1s',
      ' Second    Goodm.Nurse  £1 6s',
      ' […]',
      ' Hindmost  Sarah Good       —',
    ],
    gloss: [
      'A committee ranked every household in church by what it paid in tax.',
      '',
      'Twice a Sunday the whole village sits down in the order of who matters.',
      '',
      'The last name has no sum beside it at all.',
    ],
  },

  accountBookPage: {
    id: 'accountBookPage',
    title: "A page of Ingersoll's account book",
    date: '1691–92',
    kind: 'A number',
    fidelity: 'reconstructed',
    cite: 'Ordinary-keepers\' account books of the period; Putnam credit in the village is documented in Boyer & Nissenbaum, Salem Possessed.',
    note: 'Debt as a map of who cannot afford to disagree.',
    original: [
      ' Debtor          £  s  d  Owed to',
      ' Jno. Willard    1  4  0  Putnam',
      ' Jos. Herrick    2 11  6  Putnam',
      ' Wm. Sibley      3  0  0  Putnam',
      ' Sar. Bibber        9  0  Ingersoll',
      ' Jno. Procter    1  2  0  Ingersoll',
      ' Geo. Jacobs     1 15  0  Putnam',
      ' Isr. Porter        —     —',
    ],
    gloss: [
      'Who owes what, and to whom. Read the right-hand column.',
      '',
      'When a Putnam says something in this village, a great many people have a financial reason not to contradict him.',
      '',
      'One name here owes them nothing: Porter.',
    ],
  },

  topsfieldPetition: {
    id: 'topsfieldPetition',
    title: 'Petition concerning the Topsfield line',
    date: '1680s',
    kind: 'A signature',
    fidelity: 'reconstructed',
    cite: 'The Topsfield–Salem Village boundary dispute ran from the 1660s; see Boyer & Nissenbaum, Salem Possessed, ch. 3.',
    note: 'A land quarrel thirty years old, with the same families on each side.',
    original: [
      'To the Honoured Generall Court:',
      '',
      'The humble petition of severall',
      'inhabitants of Salem Village',
      'sheweth, that the men of',
      'Topsfield have presumed to fell',
      'timber upon lands granted unto',
      'Salem, and carried away the same.',
      '[…]',
      '  Thomas Putnam  John Putnam',
      '  Nath. Putnam   Edw. Putnam',
      '',
      'Contra, for Topsfield:',
      '  Jacob Towne    John Towne',
      '  Isaac Easty    Joseph Towne',
    ],
    gloss: [
      'A boundary quarrel already thirty years old when this was written.',
      '',
      'Read the two lists of names. Putnams on one side. Townes and Eastys on the other.',
      '',
      'Rebecca Nurse was born a Towne. Mary Easty is her sister.',
      '',
      'In 1692 all three Towne sisters were accused.',
    ],
  },

  /* ---------------------------------------------------------------- *
   * June — the machinery
   * ---------------------------------------------------------------- */

  nurseWarrant: {
    id: 'nurseWarrant',
    title: 'Warrant for the arrest of Rebecca Nurse',
    date: '23 March 1692',
    kind: 'A signature',
    fidelity: 'close',
    cite: 'Warrant for the apprehension of Rebecca Nurse, 23 March 1692. Essex County Court Archives.',
    note: 'The machinery starting. It is a printed-form kind of document.',
    original: [
      'Salem, March the 23d, 1691/2',
      '',
      'To the Marshall of Essex:',
      '',
      'You are hereby required to',
      'bring before us Rebekah Nurse,',
      'wife of Franc\'s Nurse, tomorrow',
      'at the house of Lt Ingersalls,',
      '',
      'who stands charged with sundry',
      'acts of Witchcraft done to Ann',
      'Putnam, Ann Putnam junr, and',
      'Abigail Williams &c.',
      '[…]',
      '   John Hathorne   } Assists',
      '   Jonathan Corwin }',
    ],
    gloss: [
      'An arrest warrant, issued the day before she was taken.',
      '',
      'Where is she to be brought? Ingersoll\'s. The tavern — there was nowhere else big enough.',
      '',
      'The "&c." is the clerk not bothering to list the rest.',
      '',
      'She was seventy-one and ill in bed.',
    ],
  },

  nursePetition: {
    id: 'nursePetition',
    title: 'The petition for Rebecca Nurse',
    date: '1692',
    kind: 'Thirty-nine signatures',
    fidelity: 'close',
    cite: 'Petition for Rebecca Nurse, 1692. Essex County Court Archives, Salem Witchcraft, vol. 1.',
    note: 'The whole village saying she is not a witch, and it not mattering.',
    original: [
      'We whose names are here unto',
      'subscribed can testifie that we',
      'have knowne her for many yeares,',
      'and accordinge to our',
      'observation her Life was',
      'accordinge to her profession,',
      'and we never had any cause to',
      'suspect her of any such thinge',
      'as she is nowe accused of.',
      '',
      '  Israel Porter  Eliz. Porter',
      '  Joshua Rea     John Putnam Sr',
      '  Sarah Leach    Rebecca Putnam',
      '  […] and twenty-nine others',
    ],
    gloss: [
      'Thirty-nine neighbours signed to say they had known her for years and had never seen anything in it.',
      '',
      'Read the names. John Putnam Sr. Rebecca Putnam.',
      '',
      'Even inside the family driving the accusations, people signed for her.',
      '',
      'The jury acquitted her. The judges sent them back out. They convicted her.',
    ],
  },

  putnamDeposition: {
    id: 'putnamDeposition',
    title: 'Deposition of Ann Putnam, junior',
    date: '1692',
    kind: 'Not meant for you',
    fidelity: 'reconstructed',
    cite: 'Depositions of Ann Putnam Jr., 1692. Many surviving examples are in the hand of her father, Thomas Putnam.',
    note: 'Spectral evidence, sworn by a twelve-year-old. Look at the handwriting.',
    original: [
      'The deposition of Ann Putnam',
      'junr, who testifieth and saith:',
      '',
      'That on the 13th of March 1692',
      'I saw the Apperishtion of',
      'Rebekah Nurse, and she did most',
      'greviously torment me by',
      'pinching and pricking me,',
      '',
      'urging me vehemently to writ in',
      'her book. […]',
      '',
      ' Sworn upon her oath before the',
      ' Jurors of Inquest.',
    ],
    gloss: [
      'Sworn testimony that the SHAPE of Rebecca Nurse came into a room and hurt a twelve-year-old.',
      '',
      'Nobody else could see it. Nothing could disprove it. The court accepted it anyway.',
      '',
      'Now look at the document instead of the words. Ann is twelve. She did not write this — her father did.',
      '',
      'She swore to it. He wrote it.',
    ],
  },

  jailBill: {
    id: 'jailBill',
    title: "The jail keeper's account",
    date: '1692',
    kind: 'A number',
    fidelity: 'reconstructed',
    cite: 'Prison charges appear in the 1692 accounts and in later restitution claims; see Rosenthal, Records of the Salem Witch-Hunt.',
    note: 'They were charged for their own imprisonment. Including the irons.',
    original: [
      'The account of the keeper of',
      'their Majesties Gaol in Salem,',
      'for persons committed upon',
      'suspicion of witchcraft:',
      '',
      ' Dyett, 9 weeks     1  2  6',
      ' Chains and shackles    6  8',
      ' Fees at commitment     2  0',
      ' Fees at discharge      2  0',
      ' Removing of the body   5  0',
      '',
      ' No prisoner to be released',
      ' until the charges be',
      ' satisfied.',
    ],
    gloss: [
      'Prison was not free. The accused were billed for their own food, their own fees, and — read it again — their own chains.',
      '',
      'Nobody was released until the bill was paid. People found not guilty stayed in jail for months.',
      '',
      'The last charge is for moving a body.',
    ],
  },

  /* ---------------------------------------------------------------- *
   * September — the end of it
   * ---------------------------------------------------------------- */

  eastyPetition: {
    id: 'eastyPetition',
    title: 'The petition of Mary Easty',
    date: 'September 1692',
    kind: 'Not meant for you',
    fidelity: 'close',
    cite: 'Petition of Mary Easty to the Court, September 1692. Essex County Court Archives, Salem Witchcraft, vol. 2.',
    note: 'She is not asking for her life.',
    original: [
      'To the honoured Judge now',
      'sitting in Salem: […]',
      'I petition to your honours',
      'not for my own life, for I',
      'know I must die, and my',
      'appointed time is set,',
      '',
      'but that, if it be possible,',
      'no more innocent blood may',
      'be shed, which cannot be',
      'avoyded in the way and',
      'course you goe in. […]',
      '',
      'But by my own innocency I',
      'know you are in the wrong',
      'way.',
    ],
    gloss: [
      'Rebecca Nurse\'s sister, writing when she knew she was going to be hanged.',
      '',
      'Read what she asks for. Not her life. She asks the court to change its methods so it stops killing other people.',
      '',
      'And she does not accuse the judges of malice. She says they are doing their best.',
    ],
  },

  coreyRecord: {
    id: 'coreyRecord',
    title: 'The court record: Giles Corey stands mute',
    date: '19 September 1692',
    kind: 'A number',
    fidelity: 'reconstructed',
    cite: 'The pressing of Giles Corey, 19 September 1692; recorded by Samuel Sewall in his diary.',
    note: 'Two days. Follow the money.',
    original: [
      'Giles Corey, being indicted for',
      'witchcraft, and called upon to',
      'plead unto his indictment,',
      'refused to plead, standing mute.',
      '',
      'Being three times required, and',
      'three times refusing, sentence',
      'was passed that he be pressed',
      'with weights until he plead or',
      'die.',
      '',
      ' Sept. 19, 1692. About noon, at',
      ' Salem, Giles Corey was press\'d',
      ' to death for standing Mute.',
      '        — S. Sewall, his diary',
    ],
    gloss: [
      'A trial could not begin until the accused entered a plea. Refuse, and the court could crush you under stones until you did.',
      '',
      'He was eighty-one. It took two days.',
      '',
      'Now the part that is not courage: convicted felons had their estates seized. Untried men did not. He kept the farm for his sons-in-law.',
    ],
  },

  seizureInventory: {
    id: 'seizureInventory',
    title: "Inventory of goods seized by the Sheriff",
    date: '1692',
    kind: 'A number',
    fidelity: 'reconstructed',
    cite: 'Seizures by Sheriff George Corwin are documented in later restitution petitions, 1710–11.',
    note: 'What the law took out of a household while the family was in jail.',
    original: [
      'An account of what was seized',
      'and carried away by the Sheriff',
      'from the house of a person',
      'condemned:',
      '',
      ' 5 cows              12  0  0',
      ' a yoke of oxen       8  0  0',
      ' 8 loads of hay       4  0  0',
      ' provisions           3 10  0',
      ' brass and pewter     2  4  0',
      ' the beds             1 16  0',
      '',
      ' Also a barrel of cider, and',
      ' the wife left with nothing to',
      ' keep the children.',
    ],
    gloss: [
      'The oxen — which is to say the ability to plough. The hay that would have fed the animals through winter. The beds.',
      '',
      'The family left behind was not accused of anything.',
      '',
      'Working out what caused 1692 means weighing this: some people ended up better off.',
    ],
  },

  deathWarrantReturn: {
    id: 'deathWarrantReturn',
    title: 'Return upon the death warrant',
    date: '22 September 1692',
    kind: 'A signature',
    fidelity: 'reconstructed',
    cite: 'Execution returns, September 1692. Eight people were hanged on 22 September, the last executions of the episode.',
    note: 'Eight people. One line each.',
    original: [
      'According to the within written',
      'precept, I have taken the bodyes',
      'of the persons within named and',
      'caused them to be hanged by the',
      'neck untill they were dead,',
      '',
      ' Martha Corey    Mary Easty',
      ' Alice Parker    Mary Parker',
      ' Ann Pudeator    Wilmot Redd',
      ' Margaret Scott  Sam. Wardwell',
      '',
      'and have made return hereof.',
      '',
      '     George Corwin, Sheriff',
    ],
    gloss: [
      'Eight people, on one morning, on a ledge above the town.',
      '',
      'This is only the paperwork afterwards — a sheriff confirming an instruction was carried out, on the same form used for any writ.',
      '',
      'Nobody knew it yet, but these were the last executions.',
      '',
      'Read the names again, then go and look at the benches.',
    ],
  },

  /* ---------------------------------------------------------------- *
   * The present — the reckoning
   * ---------------------------------------------------------------- */

  annApology: {
    id: 'annApology',
    title: 'The confession of Ann Putnam, junior',
    date: '1706',
    kind: 'A signature',
    fidelity: 'close',
    cite: 'Ann Putnam Jr.\'s confession, read aloud in Salem Village church by Rev. Joseph Green, 1706.',
    note: 'She was twelve when you met her. She is twenty-six here.',
    original: [
      'I desire to be humbled before',
      'God for that sad providence',
      'that befell my family. […]',
      '',
      'that I, in my childhood,',
      'should be made an instrument',
      'for the accusing of several',
      'persons, whereby their lives',
      'were taken away, whom now I',
      'believe were innocent. […]',
      '',
      'And particularly, as I was a',
      'chief instrument of accusing',
      'Goodwife Nurse and her two',
      'sisters, I desire to lie in',
      'the dust.',
    ],
    gloss: [
      'Fourteen years on, she stood in the village meeting house while the minister read this out over her head. She is the only one of the girls who ever did.',
      '',
      'She names Rebecca Nurse. She also says she bore nobody any malice — and whether you believe that is a real historical argument.',
    ],
  },

  sewallApology: {
    id: 'sewallApology',
    title: 'The bill of Samuel Sewall',
    date: '14 January 1697',
    kind: 'A signature',
    fidelity: 'close',
    cite: 'Samuel Sewall\'s bill, read at Old South Church, Boston, 14 January 1697, by Rev. Samuel Willard.',
    note: 'One judge out of nine.',
    original: [
      'Samuel Sewall, sensible of the',
      'reiterated strokes of God upon',
      'himself and family, and being',
      'sensible that as to the guilt',
      'contracted upon the opening of',
      'the late commission of Oyer and',
      'Terminer at Salem,',
      '',
      'he is, upon many accounts, more',
      'concerned than any that he',
      'knows of,',
      '',
      'desires to take the blame and',
      'shame of it, asking pardon of',
      'men. […]',
    ],
    gloss: [
      'Five years on, one of the judges stood in a Boston church while this was read aloud. He stood the whole time.',
      '',
      'Now the other half of this document, which does not exist: the chief justice, William Stoughton, never apologised.',
      '',
      'He became governor. There is a county named after him.',
    ],
  },

  johnsonAct: {
    id: 'johnsonAct',
    title: 'An Act relative to Elizabeth Johnson Jr.',
    date: '2022',
    kind: 'A signature',
    fidelity: 'close',
    cite: 'Massachusetts Session Laws, 2022. Passed after a campaign by an eighth-grade class in North Andover.',
    note: 'Written by thirteen-year-olds.',
    original: [
      'SECTION —.  The conviction and',
      'sentence of Elizabeth Johnson,',
      'Jr., of the crime of witchcraft',
      'in the year sixteen hundred and',
      'ninety-three are hereby',
      'declared null and void.',
      '',
      'The names of all persons',
      'convicted of witchcraft in the',
      'years sixteen hundred and',
      'ninety-two and ninety-three,',
      'and their heirs, are hereby',
      'declared free from any and all',
      'disgrace or cause of distress.',
    ],
    gloss: [
      'Massachusetts cleared the others in stages — 1711, 1957, 1992, 2001 — and each time she was left off the list. She had no descendants to be annoyed about it.',
      '',
      'She stayed a convicted witch for 329 years.',
      '',
      'In 2021 an eighth-grade class found out, did the research, and drafted this bill.',
    ],
  },
};

/** Documents grouped by the chapter they can first be copied in. */
export const DOCS_BY_CHAPTER = {
  march: ['parrisAgreement', 'seatingList', 'accountBookPage', 'topsfieldPetition'],
  june: ['nurseWarrant', 'nursePetition', 'putnamDeposition', 'jailBill'],
  september: ['eastyPetition', 'coreyRecord', 'seizureInventory', 'deathWarrantReturn'],
  present: ['annApology', 'sewallApology', 'johnsonAct'],
};

export const DOC_COUNT = Object.keys(DOCUMENTS).length;

export const FIDELITY_LABEL = {
  close: 'Follows the surviving document closely',
  reconstructed: 'Reconstructed in the form of the record',
};
