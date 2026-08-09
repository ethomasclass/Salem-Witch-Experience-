// The March 1692 cast.
//
// Timing is precise and it matters: this is the first week of March 1692.
// Betty Parris and Abigail Williams have been ill since midwinter. Doctor
// Griggs has already suggested the evil hand. Mary Sibley's witch cake was
// baked days ago. And nobody has been arrested yet.
//
// That week is the whole reason the March chapter works. Every grievance in
// the village is fully loaded and completely ordinary. The player meets a
// functioning community with a land dispute, a salary fight and a cold
// minister — and only later finds out what those ordinary things turned
// into.
//
// Voice rule: period-inflected but readable. No "forsooth". Where a real
// person's documented words exist they are used and marked in a comment;
// everything else is connective tissue written to be consistent with what
// the records show about that person.

import { FLESH, HAIR, CLOTH } from '../palette.js';

const LINEN = '#d8d2c2';

export const NPCS = {

  /* -------------------------------------------------------------------- *
   * NORA ALVAREZ, 17 — present day
   *
   * Summer job at the memorial. The design doc calls for a peer voice, and
   * the rule for every present-day character is that they ask questions
   * rather than answer them: the moment a modern character starts
   * explaining the seventeenth century, the game turns into a worksheet
   * with a walking animation.
   *
   * She sounds seventeen. Contractions, deflection, a joke when it gets
   * heavy. She is not a docent and she is not the theme.
   * -------------------------------------------------------------------- */
  nora: {
    id: 'nora',
    name: 'Nora',
    spec: {
      flesh: FLESH.olive, hair: HAIR.black,
      coat: CLOTH.staffTeal, under: CLOTH.denim,
    },
    greet: [
      {
        if: { notSpokenTo: ['nora'] },
        then: [
          { say: 'A girl about your age, in a staff polo, sitting on the wall with her phone face-down beside her.', who: null },
          'Hey. You can sit on them, by the way. Everyone stands there trying to figure out if they\'re allowed.',
          'You\'re allowed. That\'s the whole point of a bench.',
        ],
        else: ['Hey again.'],
      },
    ],
    topics: [
      {
        id: 'job', label: 'Do you work here?',
        lines: [
          'Sort of. I do the visitor cart in summer and I keep an eye on this place.',
          'It\'s mostly telling people the bathroom is not in the cemetery.',
          { say: 'She nods at the graveyard on the other side of the wall.', who: null },
          'That\'s the Old Burying Point back there. It\'s older than the memorial by about three hundred years, and people get them confused constantly.',
          'None of the twenty are buried here, if that\'s what you were going to ask. They didn\'t get graves. That was sort of the point of executing them as witches.',
          { learn: 'present.nograves' },
        ],
      },
      {
        id: 'real', label: 'Do people ask you if it was real?',
        lines: [
          { say: 'She laughs, but not like it\'s funny.', who: null },
          'Every single day.',
          '"Was it real?" And I never know what to tell them, because — what are you asking me?',
          'Because if you mean were there actual witches, then no, obviously.',
          'But if you mean did twenty real people actually get killed by an actual court that actually sat right over there and wrote it all down —',
          { say: 'She taps the bench she\'s sitting on.', who: null },
          'Then it\'s the realest thing in this whole city.',
          { learn: 'present.realquestion' },
          'And people go "oh, right," and then they go buy a witch hat. I\'m not even mad about it. I just think it\'s weird that both things are on the same street.',
        ],
      },
      {
        id: 'shop', label: 'What do you think about the shops?',
        require: ['present.tourism'],
        lines: [
          { say: 'She shrugs, and it\'s a real shrug, not a dismissive one.', who: null },
          'My cousin works at one. It pays better than this does.',
          'Look — this city has, like, a million visitors a year and most of them come because of the witch thing. That pays for roads. It pays for my school.',
          'I\'m not going to stand here and tell you those people are monsters for selling a magnet.',
          'It\'s just... nobody in 1692 called themselves a witch. That was the accusation. That was the thing that got them killed.',
          { say: 'She looks at the shop for a second.', who: null },
          'And now it\'s the brand. That\'s all. I don\'t have a solution, I just notice it.',
        ],
      },
      {
        id: 'johnson', label: 'Has anything changed recently?',
        lines: [
          'Actually, yeah. Two thousand twenty-two.',
          'So there was one person still on the list who\'d never been officially cleared. Elizabeth Johnson Jr. Convicted, sentenced to hang, never executed — and then just... never formally pardoned. For three hundred and twenty-nine years.',
          'Everybody else got cleared eventually. She didn\'t, because she had no descendants to push for it. Nobody was left to be annoyed on her behalf.',
          { say: 'She sits up a bit.', who: null },
          'And then an eighth-grade civics class in North Andover found out and decided that was ridiculous.',
          'They did the research, they wrote the bill, they got a state senator to file it. It went through as an amendment to the state budget.',
          { learn: 'present.johnson' },
          'Thirteen-year-olds. In 2022. Cleared her name.',
          'So when people ask me if this is old history, I usually just tell them that.',
        ],
      },
      {
        id: 'gap', label: 'What\'s the gap in the wall for?',
        require: ['present.threshold'],
        lines: [
          { say: 'She looks where you\'re pointing — the opening in the far wall.', who: null },
          'Huh. I actually don\'t know.',
          'I\'ve worked here two summers and I\'ve never gone through it.',
          { say: 'She picks her phone back up.', who: null },
          'You should go look, I guess. Tell me what\'s over there.',
        ],
      },
    ],
    farewell: ['See you.'],
  },

  /* -------------------------------------------------------------------- *
   * TITUBA
   *
   * Enslaved in the Parris household. The records call her "Tituba Indian";
   * the familiar image of her as African is a later invention, and the
   * design doc is right that the correction is itself worth teaching.
   *
   * In March she has not yet been examined. She is careful, she is watching
   * the player, and she volunteers almost nothing — because a woman in her
   * position speaking freely to a stranger is a woman taking a risk.
   * -------------------------------------------------------------------- */
  tituba: {
    id: 'tituba',
    name: 'Tituba',
    spec: {
      flesh: FLESH.brown, hair: HAIR.black,
      coat: CLOTH.undyed, skirt: CLOTH.russet,
      apron: LINEN, coif: LINEN,
    },
    greet: [
      {
        if: { notSpokenTo: ['tituba'] },
        then: [
          { say: 'She does not stop working when you come in. She does look up.', who: null },
          'You are not of this village.',
          'I know every face that comes through that door, and I do not know yours.',
          { learn: 'fact.tituba' },
          'No matter. Stand where you are not underfoot.',
        ],
        else: ['You again.'],
      },
    ],
    topics: [
      {
        id: 'girls', label: 'The girls who are ill.',
        lines: [
          'Betty is nine years old. Abigail is eleven.',
          'They have been badly ill since the cold set in. It is not a thing I can name for you.',
          { say: 'She sets down what she is holding.', who: null },
          'They creep under chairs. They put their arms where arms do not go. Betty cried out that something pinched her, and there was nothing there to pinch her.',
          { learn: ['fact.girls'] },
          'The doctor came. Griggs. He looked at them a long while and found nothing in the body to find.',
          'So he said what men say when they have looked and found nothing. He said the evil hand is upon them.',
          { learn: ['fact.griggs'] },
        ],
      },
      {
        id: 'cake', label: 'The cake Mary Sibley had you make.',
        require: ['fact.witchcake'],
        lines: [
          { say: 'For the first time she stops moving entirely.', who: null },
          { bySource: 'fact.witchcake', cases: {
              ingersoll: [
                'Ingersoll told you that.',
                'Of course he did. A man keeps a tavern, he keeps everything else that passes through it too.',
              ],
              mercy: [
                'Mercy told you.',
                { say: 'Something crosses her face that is not quite pity.', who: null },
                'That girl has learned to carry news the way the rest of us carry water. It is how she keeps her place in that house.',
              ],
            },
            default: ['Someone told you. Someone always tells.'],
          },
          'Goodwife Sibley came to me. She told me what to do and I did it. Rye meal, and the water from the girls, and bake it, and give it to the dog.',
          'She said it would show who afflicts them.',
          { say: 'Her voice goes flat.', who: null },
          'I did as I was told. That is what I am for in this house.',
          'And now the girls are naming names, and every one of those names came after that cake.',
          { say: 'She turns back to her work.', who: null },
          'You may think on which of those two things caused the other. The Village has already decided.',
        ],
      },
      {
        id: 'house', label: 'This house is cold.',
        lines: [
          'You noticed.',
          'It has been cold since December. I keep the fire as small as I can and still call it a fire.',
          {
            if: { knows: ['clue.woodpile'] },
            then: [
              'You have seen the pile outside. Then you know as much as I do.',
              'The Village agreed to bring him firewood. The Village stopped bringing it.',
              'I am the one who carries what there is. So I am the one who knows exactly how much there is.',
            ],
            else: [
              'Go and look at the woodpile outside, if you want to understand this household better than most who live in it.',
            ],
          },
          { say: 'She glances at the table by the wall.', who: null },
          'The agreement is there. What they promised him when he came. He keeps it out where it can be seen.',
          { learn: 'paper.agreement' },
        ],
      },
      {
        // She is one of the three. Nobody in the game is better placed to
        // say what the three of them had in common, and she says it flatly,
        // as a description of her own position rather than as a thesis.
        id: 'accused', label: 'Who have the girls named?',
        require: ['fact.girls'],
        lines: [
          'Three, so far.',
          'Sarah Good, who has no house. She goes from door to door with her child and asks, and when she is turned away she says things under her breath. People have called her a nuisance for years. It is not a long walk from nuisance to witch.',
          { learn: ['fact.good'] },
          'Sarah Osborne, who went to law against her own sons over her first husband\'s land, and then married the man she had bought out of service. She has not been to meeting in above a year.',
          { learn: ['fact.osborne'] },
          { say: 'She stops.', who: null },
          'And me.',
          { learn: ['fact.firstthree'] },
          { say: 'She lets that sit for a moment before she goes on.', who: null },
          'Look at the three of us and tell me what we have between us. Not one of us has a man who will stand up in that meeting house and say it is a lie.',
          'That is the whole of it. They did not begin with the difficult ones. They began with the ones nobody would miss.',
        ],
      },
      {
        id: 'self', label: 'Ask about her.',
        require: ['fact.tituba'],
        lines: [
          'What is there to ask?',
          'I belong to Mr. Parris. I came with him from Barbados. Before that — ',
          { say: 'She does not finish it.', who: null },
          'They will write me down as Indian, when they write me down. That much they will get right.',
          'Whatever else they say of me afterward, remember that you were told it here, by me, before anyone had cause to lie about it.',
        ],
      },
    ],
    farewell: [{ say: 'She has already gone back to the fire.', who: null }],
  },

  /* -------------------------------------------------------------------- *
   * REV. SAMUEL PARRIS
   *
   * The faction engine. Aggrieved, and not without cause — the village
   * genuinely did withhold his salary and his firewood. The point is not
   * that he is a villain but that a man this embattled, preaching weekly
   * about enemies inside his own congregation, was pouring fuel on a fire
   * that had not been lit yet.
   * -------------------------------------------------------------------- */
  parris: {
    id: 'parris',
    name: 'Rev. Samuel Parris',
    spec: {
      flesh: FLESH.fair, hair: HAIR.dark,
      coat: CLOTH.black, collar: LINEN, band: true, hat: '#2f2c2b',
    },
    greet: [
      {
        if: { chapter: 'june' },
        then: [
          { say: 'He is writing fast and does not stop. There is a second pile of paper now, and it is not sermons.', who: null },
          'I am taking down the examinations. Every word of them.',
          'Somebody must keep a true record, and it will not be the men who come from Boston for a day and go home again.',
        ],
        else: [],
      },
      {
        if: { chapter: 'september' },
        then: [
          { say: 'The room is cold and the fire is out entirely.', who: null },
          'Yes.',
          { say: 'That is the whole of it. He does not look up.', who: null },
        ],
        else: [],
      },
      {
        if: { chapter: 'march', notSpokenTo: ['parris'] },
        then: [
          'You will forgive me. I am at my sermon.',
          { say: 'There are three sheets in front of him. Two are crossed through.', who: null },
          'Every week I must find something to say to people who have decided in advance not to hear it.',
        ],
        else: [],
      },
      { if: { chapter: 'march', spokenTo: ['parris'] }, then: ['Yes? I am still at it.'], else: [] },
    ],
    topics: [
      /* ---- June ---- */
      {
        id: 'j_tituba', label: 'Where is Tituba?', chapter: 'june',
        lines: [
          { say: 'The pen stops.', who: null },
          'In Salem gaol. The jail. Where she has been since the first of March.',
          'She confessed. You may make of that what you like; the magistrates did.',
          {
            if: { knows: ['june.beating'] },
            then: [
              { say: 'You have already sat in that cellar and heard how the confession was got.', who: null },
              'I will not discuss what passes in my own household with a stranger.',
              { say: 'He goes back to writing, too quickly.', who: null },
            ],
            else: [
              'She is a charge upon me and I have said I will not pay her fees. That is a matter of accounts, not of feeling.',
              { learn: 'june.parrisdisowns' },
            ],
          },
        ],
      },
      {
        id: 'j_record', label: 'You are writing it all down.', chapter: 'june',
        lines: [
          'Every examination. Names, questions, answers, and what the afflicted did while it was said.',
          { learn: 'june.parrisrecords' },
          'It is the only honest thing left to do here and I am doing it.',
          { say: 'He does not appear to hear how that sounds.', who: null },
          'You may think I take satisfaction in this. I have a house with no fire in it and a daughter I sent away to Salem Town in March because she could not stop screaming.',
          'I have got exactly the congregation I preached about. I would give a great deal to have been wrong.',
        ],
      },
      /* ---- September ---- */
      {
        id: 's_over', label: 'It has stopped.', chapter: 'september',
        lines: [
          'So they say.',
          { say: 'He is not writing anything.', who: null },
          'There will be a reckoning about all of this, and it will land here, in this village, on me.',
          'I know what is coming. I have watched enough of it arrive at other men\'s doors this year.',
          { learn: 'sept.parrisreckoning' },
          { say: 'He looks at the empty hearth.', who: null },
          'Four years from now there will not be a soul in that meeting house who will have me. I have known that since August.',
        ],
      },
      {
        id: 'girls', label: 'Your daughter and your niece.', chapter: 'march',
        lines: [
          { say: 'The pen goes down.', who: null },
          'My Betty is nine years old.',
          'I have prayed over her. I have fasted. I have had Griggs to her twice and other ministers besides, and I have watched her bent backward in a chair like something being wrung out.',
          { learn: ['fact.girls', 'fact.griggs'] },
          'You will hear it said in this village that I have made much of it.',
          'Come and sit with her one night and then tell me I have made much of it.',
        ],
      },
      {
        id: 'firewood', chapter: 'march', label: 'The woodpile outside is nearly empty.',
        require: ['clue.woodpile'],
        lines: [
          { say: 'He looks at you for a long moment.', who: null },
          { bySource: 'clue.woodpile', cases: {
              observed: [
                'You went and looked. Good. Most people here have managed not to.',
              ],
              tituba: [
                'Tituba told you.',
                'She would know. She is the one who has to make it last.',
              ],
            },
            default: ['Someone has been talking, then.'],
          },
          'My call to this village was agreed in writing. Salary, and the parsonage, and my firewood found for me. That was the agreement.',
          'I have had no firewood delivered since November.',
          { learn: ['fact.salary'] },
          'And in October they elected a new village committee, made up of the very men who have opposed me from the first day. That committee sets the rate — the tax that pays me — and they have not collected a penny of it since.',
          'They will not dismiss me. That would require a vote, and a reason, and courage.',
          { say: 'He straightens the sheets that are crossed through.', who: null },
          'So instead they let me be cold, and wait for me to leave of my own accord.',
          'The agreement is on the table there. Read it, if you think I am making a grievance out of nothing. Every term of it is written out and signed by men who are still living.',
          { learn: 'paper.agreement' },
          { say: 'He returns to his papers, and speaks without looking up.', who: null },
          'If you want the version this village tells itself rather than the one I am telling you, go to the ordinary on the road. Deacon Ingersoll hears everything twice and believes most of it.',
        ],
      },
      {
        id: 'deed', chapter: 'march', label: 'They gave you the parsonage outright?',
        require: ['fact.salary'],
        lines: [
          'They did. Voted, and recorded.',
          'And there are men in this village who will tell you the vote was improper, that no minister before me was given the deed to the house and the land under it, and that I contrived it.',
          { learn: ['fact.parris_deed'] },
          'What they mean is that they cannot now put me out of it.',
          { say: 'He almost smiles. It does not reach anything.', who: null },
          'A minister who cannot be evicted is a minister who must be endured. They find that intolerable.',
        ],
      },
      {
        id: 'congregation', chapter: 'march', label: 'What will you preach on Sunday?',
        lines: [
          { say: 'He turns a sheet toward you without letting go of it.', who: null },
          // Parris's surviving sermon notes from this spring genuinely do run
          // on this theme; the March 27 sermon is the famous one.
          'That there are devils as well as saints in the Church itself.',
          'That a man may sit in that meetinghouse every Sabbath of his life, in a good seat, in a good coat, and be an enemy of Christ the whole while.',
          { learn: ['fact.factions'] },
          'I do not name anyone. I am not required to.',
          {
            if: { knows: ['clue.seating'] },
            then: [
              { say: 'You think of the seating chart nailed up in that meetinghouse. Every person in the village knows exactly which good seats he means.', who: null },
            ],
            else: [],
          },
          'They will know who they are.',
        ],
      },
    ],
    farewell: ['Mind the door. The house is cold enough.'],
  },

  /* -------------------------------------------------------------------- *
   * ANN PUTNAM JR., 12
   *
   * The spine of the whole game. She will file more formal complaints than
   * almost anyone in Salem. In 1706 she will stand in this village's church
   * while her public apology is read aloud over her head.
   *
   * In March she is twelve years old and has not done anything yet.
   * -------------------------------------------------------------------- */
  annjr: {
    id: 'annjr',
    name: 'Ann Putnam Jr.',
    spec: {
      flesh: FLESH.fair, hair: HAIR.brown, child: true,
      coat: CLOTH.saddGreen, skirt: CLOTH.saddGreen,
      apron: LINEN, coif: LINEN,
    },
    greet: [
      {
        if: { chapter: 'june' },
        then: [
          { say: 'She is not mending anything. She is sitting with her hands in her lap and two grown men are waiting for her to be ready.', who: null },
          'You may sit if you like. They will wait.',
          { say: 'They do wait.', who: null },
        ],
        else: [],
      },
      {
        if: { chapter: 'september' },
        then: [
          { say: 'She is by the window. She has been twelve years old for six months.', who: null },
          { say: 'She looks at you, and keeps looking, in a way nobody in this village has looked at you before.', who: null },
          'Have you been here before?',
          {
            if: { metBefore: ['annjr'] },
            then: [{ say: 'You have. You stood in this room in March and she told you her mother was unwell. She has never once been able to see you properly until now.', who: null }],
            else: [{ say: 'You have. Not in this room, and never in front of her. She should have no idea. She is looking at you anyway.', who: null }],
          },
          { say: 'There is no answer you can give her. There is no option here to choose.', who: null },
          { learn: 'sept.noticed' },
          { say: 'She waits.', who: null },
          { say: 'Then she nods, once, as if you had said something, and goes back inside the house.', who: null },
        ],
        else: [],
      },
      {
        if: { chapter: 'march', notSpokenTo: ['annjr'] },
        then: [
          { say: 'A girl of about twelve, sitting very straight, mending something she has clearly been given to keep her occupied.', who: null },
          'You are the one who has been walking about the village.',
          'Mother says I\'m not to talk to people I don\'t know.',
          { say: 'She keeps talking.', who: null },
          'What do you want to know?',
        ],
        else: [],
      },
      { if: { chapter: 'march', spokenTo: ['annjr'] }, then: ['You came back.'], else: [] },
    ],
    topics: [
      /* ---- June ---- */
      {
        id: 'j_complaints', label: 'You have been giving names.', chapter: 'june',
        lines: [
          'I have told what I have seen.',
          { say: 'Very steady. She has said this to magistrates.', who: null },
          'Goodwife Nurse. Goodwife Corey. Goodman Procter and his wife. Others.',
          { learn: 'june.annnames' },
          'They come to me. Their shapes come, and they pinch me and press me and hold a book out to be signed.',
          {
            if: { spokenTo: ['nurseJail'] },
            then: [
              { say: 'You sat with Rebecca Nurse yesterday in a cellar in Salem. She asked after this child by name.', who: null },
              'You have been to see her.',
              { say: 'It is not quite a question.', who: null },
              'She has been in our house. She held me when I was small. I know that.',
              { say: 'She looks at her hands.', who: null },
              'I do not choose what comes into the room.',
            ],
            else: [],
          },
        ],
      },
      {
        id: 'j_written', label: 'Who writes your depositions?', chapter: 'june',
        lines: [
          { say: 'A pause you would not have got from her in March.', who: null },
          'My father writes them.',
          { learn: 'june.fatherwrites' },
          'I say it and he sets it down and then it is read back to me and I say that it is true.',
          'It is always true when it is read back. He is careful.',
          { say: 'She smooths the front of her apron.', who: null },
          'He has a very good memory for what has been done to this family. Better than mine. I am twelve.',
          'The one he wrote out for the court is in the meeting house, with the rest of it. You may read what I said.',
          { learn: 'paper.deposition' },
          { say: 'She does not say "what I wrote".', who: null },
          { say: 'She glances at the door.', who: null },
          'Mercy is outside. She is always outside now. She sleeps in this room and she will not stay in it.',
          'Ask her what she sees. She sees it differently from me and I do not know why, and I would rather you asked her than me.',
        ],
      },
      /* ---- March ---- */
      {
        id: 'girls', chapter: 'march', label: 'The girls at the parsonage.',
        lines: [
          'Betty and Abigail.',
          'I\'ve seen them. Everyone has. They don\'t hide it any more.',
          { learn: ['fact.girls'] },
          { say: 'She threads the needle again, badly, and starts over.', who: null },
          'When it takes them they do not look like themselves. Abigail ran across the room on all fours.',
          'People come to watch now. From Beverly and Topsfield and further.',
          { learn: ['fact.strangers'] },
          'They stand in the room and watch her and then they go home and tell it.',
          'Nobody asks whether she wants watching.',
        ],
      },
      {
        id: 'mother', chapter: 'march', label: 'Your mother.',
        lines: [
          { say: 'The mending stops.', who: null },
          'My mother has buried children.',
          'More than one. I\'m not going to tell a stranger how many.',
          { learn: ['fact.annsr'] },
          'She wakes in the night sometimes and says their names, and my father tells me to go back to bed.',
          { say: 'She looks at the door as if checking it.', who: null },
          'In this house we do not say that a thing is nobody\'s fault. If a child dies there is a reason, and if there is a reason there is somebody it belongs to.',
          'That\'s what I\'ve been taught. I don\'t know another way to think about it.',
        ],
      },
      {
        id: 'topsfield', chapter: 'march', label: 'What does your father argue about?',
        lines: [
          { say: 'She puts the mending down entirely.', who: null },
          {
            if: { knows: ['clue.marker'] },
            then: ['You went up there. To the stone.'],
            else: ['The line. It is always the line.'],
          },
          'That line is the Topsfield line, and it has been argued over since before I was born. My grandfather argued it. My father argues it now.',
          { learn: ['fact.topsfield'] },
          'The Topsfield men say the grant was theirs. We say it was ours and they took the timber off it besides.',
          'The Townes are Topsfield people. Goodwife Nurse was a Towne before she married.',
          {
            if: { spokenTo: ['nurse'] },
            then: [
              { say: 'You have already sat in Rebecca Nurse\'s kitchen. She did not mention any of this.', who: null },
              'I expect she was very kind to you. She is kind to everyone. That is not the same as there being nothing between our families.',
            ],
            else: [],
          },
          'You will hear it called a small thing. It is not a small thing. It is the only thing my father has talked about at that table my whole life.',
          'The petition about it is on our table. My father put his name to it. His father\'s name is on the older one underneath.',
          { learn: 'paper.topsfield' },
          {
            if: { knows: ['clue.marker'] },
            then: ['You have been up and seen the stone, then. Then you know it is a real line and not a story.'],
            else: [
              'If you think it is a small thing, go north into the woods and find the stone. It is there. It is a real mark on a real rock and men have walked out in the rain to argue about it.',
              'And when you have seen it, go and ask the family on the other side of it what they think. Their farm is west.',
            ],
          },
        ],
      },
      {
        id: 'mercy', chapter: 'march', label: 'The young woman outside.',
        lines: [
          'Mercy. She is our servant.',
          'She came to us from the eastward, from the Maine country, after the fighting there.',
          {
            if: { knows: ['fact.mercymaine'] },
            then: [
              { say: 'You already know what happened to her family. Ann says it as though it were a fact about the household, like the number of cows.', who: null },
            ],
            else: [{ learn: ['fact.mercymaine'] }],
          },
          'She does not sleep well. Sometimes she wakes the whole house.',
          'Mother says we are charitable to have taken her in.',
          { say: 'She picks the mending back up.', who: null },
          'I like her. She tells me things.',
        ],
      },
    ],
    farewell: ['Mind you shut the gate. The dog gets out.'],
  },

  /* -------------------------------------------------------------------- *
   * MERCY LEWIS, ~19
   *
   * The war-trauma thesis standing in a dooryard. Orphaned in the Maine
   * raids, in service in the Putnam house — which is to say she is living
   * inside the household that will do more accusing than any other.
   *
   * The design doc flags a real gap here: told only from the settler side,
   * this thread is half a story. That note is reproduced in the README as
   * work to do before the June chapter, not quietly dropped.
   * -------------------------------------------------------------------- */
  mercy: {
    id: 'mercy',
    name: 'Mercy Lewis',
    spec: {
      flesh: FLESH.fair, hair: HAIR.auburn,
      coat: CLOTH.undyed, skirt: CLOTH.russet,
      apron: LINEN, coif: LINEN,
    },
    greet: [
      {
        if: { chapter: 'june' },
        then: [
          { say: 'No bucket. She is standing in the road with three people listening to her.', who: null },
          'You are the one who was here in March.',
          { say: 'In March she would not stop working long enough to look at you.', who: null },
        ],
        else: [],
      },
      {
        if: { chapter: 'march', notSpokenTo: ['mercy'] },
        then: [
          { say: 'She is hauling water and does not put the bucket down.', who: null },
          'If you are looking for Mr. Putnam he is not here.',
          'If you\'re here to stare at the girls, the parsonage is that way, and you\'re not the first today.',
        ],
        else: [],
      },
      { if: { chapter: 'march', spokenTo: ['mercy'] }, then: ['Still here, then.'], else: [] },
    ],
    topics: [
      {
        id: 'j_now', label: 'You are one of them now.', chapter: 'june',
        lines: [
          'I am afflicted. Yes.',
          { say: 'She says it the way you would say your own name.', who: null },
          'In March I carried water and nobody in that house knew what I was called. Now Mr Putnam waits at the door of a room until I am ready to come out of it.',
          { learn: 'june.mercyafflicted' },
          {
            if: { knows: ['fact.mercymaine'] },
            then: [
              { say: 'You know what happened to her family in Maine.', who: null },
              'You know where I came from.',
              'When it takes me I see a room with things in it that should not be in a room. Dark shapes at the edge of the fire.',
              'I told you in March that I do not sleep well. I did not tell you what I see.',
              { learn: 'june.mercysees' },
              'The magistrates ask me who it is. They want a name and they are very patient about waiting for one.',
              { say: 'She looks north, past the trees, for slightly too long. She did that in March too.', who: null },
              'And I find that I always have one.',
            ],
            else: [
              'When it takes me I see things in the room that should not be there. The magistrates ask me for a name and they wait until I give one.',
              { learn: 'june.mercysees' },
            ],
          },
        ],
      },
      {
        id: 'news', chapter: 'march', label: 'What are people saying?',
        lines: [
          { say: 'She sets the bucket down after all.', who: null },
          'What are they not saying.',
          'Goodwife Sibley had a cake made. Rye meal and the girls\' own water, baked and given to the dog, to make the witch cry out.',
          { learn: ['fact.witchcake'] },
          'Tituba made it, because Goodwife Sibley told her to and Tituba is not in a position to say no to anybody.',
          'And within the week the girls began giving names.',
          { say: 'She picks the bucket back up.', who: null },
          'You may draw your own line between those two things. Everyone else here has.',
          { say: 'She starts to go, and then does not.', who: null },
          'If you want to understand this place before you understand the girls, go and look at the wood stacked against the parsonage. It is the first thing anyone here would show you.',
          'Half this village has stopped paying the minister. That quarrel is older than the sickness and it will still be here after.',
        ],
      },
      {
        id: 'maine', chapter: 'march', label: 'You are not from here.',
        lines: [
          'No.',
          'Casco Bay. The Maine country, eastward.',
          { say: 'She says the next part quickly, the way you say a thing you have had to say many times.', who: null },
          'The Indians came. My father and mother were killed. I came south.',
          { learn: ['fact.mercymaine'] },
          'There are a good number of us down here now. Servants mostly. You will find one in half the houses in this village if you ask, and most people do not ask.',
          {
            if: { spokenTo: ['annjr'] },
            then: ['The Putnams call it charity that they took me. I call it a place to sleep and work enough to earn it. Both are true.'],
            else: [],
          },
          'I don\'t sleep well. That\'s the part they complain about.',
          { say: 'She looks north, past the trees, for slightly too long.', who: null },
          'When those girls scream that they see something in the room, this village thinks it is hearing about the Devil.',
          'I have been in a room where the thing you are afraid of is actually outside the door. It does not sound different from the inside.',
        ],
      },
      {
        // Norton's argument, from the inside, by somebody who would not
        // recognise it as an argument. She is not making a case about
        // causes. She is describing where the refugee girls ended up living.
        id: 'others', chapter: 'march', label: 'Are there others like you here?',
        require: ['fact.mercymaine'],
        lines: [
          'Some.',
          { say: 'She counts, and it does not take her long.', who: null },
          'There is a girl over at Topsfield who was at Casco when I was. There are two more in the town. And there is one in this village who came down from Falmouth, though she does not speak of it and neither will I.',
          'We are servants, mostly. That is what happens to a girl with no family left — somebody takes her in and she works.',
          { learn: ['fact.maine_refugees'] },
          { say: 'She shifts the bucket to the other hand.', who: null },
          'And here is a thing I have noticed and would rather not have noticed.',
          'The houses that took us in are the houses where the girls are crying out.',
          {
            if: { spokenTo: ['annjr'] },
            then: [
              'I sleep in the same room as Ann Putnam. She has grown up hearing her mother count the dead. I lie down next to her having seen mine.',
              { say: 'She looks north again.', who: null },
              'I do not know what to make of that. I only know it is true of both of us.',
            ],
            else: ['I sleep in the Putnam house. You should go and see who else sleeps in it.'],
          },
        ],
      },
      {
        id: 'putnams', chapter: 'march', label: 'What is it like in that house?',
        require: ['fact.annsr'],
        lines: [
          'Full of the dead.',
          'Mistress Putnam has lost children and she has not put a single one of them down.',
          'She keeps their names. She keeps the dates. She keeps a very exact account of everything that has been taken from her.',
          { learn: ['fact.factions'] },
          'And in this village, when a thing has been taken from you, there is always somebody who took it.',
          'Little Ann has grown up at that table hearing every grievance her family has, going back before she was born. Land, timber, the line up at Topsfield, the ministers, the seating in the meetinghouse. All of it.',
          { say: 'She hefts the bucket.', who: null },
          'She is twelve. She has a very long memory for a person who has not lived very long.',
        ],
      },
    ],
    farewell: ['This water is not carrying itself.'],
  },

  /* -------------------------------------------------------------------- *
   * REBECCA NURSE, 71
   *
   * Devout, propertied, a covenanted church member, and in a few weeks
   * thirty-nine of her neighbours will sign a petition for her. The jury
   * will acquit; the room will erupt; they will be asked to reconsider; they
   * will convict.
   *
   * She is here in March so that the player has sat in her kitchen. That is
   * the entire design: the June and September chapters only land on someone
   * you have already met.
   * -------------------------------------------------------------------- */
  nurse: {
    id: 'nurse',
    name: 'Rebecca Nurse',
    spec: {
      flesh: FLESH.fair, hair: HAIR.white, stoop: true,
      coat: CLOTH.murrey, skirt: CLOTH.murrey,
      collar: LINEN, coif: LINEN,
    },
    greet: [
      {
        if: { notSpokenTo: ['nurse'] },
        then: [
          { say: 'An old woman by the fire. She is seventy-one and she gets up anyway.', who: null },
          'Come in, come in, and shut it behind you.',
          'I do not hear as well as I did, so you will have to speak up and I will not apologise for it.',
          'Sit. You look cold.',
        ],
        else: ['Back again. Sit down.'],
      },
    ],
    topics: [
      {
        id: 'village', label: 'How long have you lived here?',
        lines: [
          'Long enough to have buried most of the people I started with.',
          'I was a Towne, of Topsfield. I married Francis and we came here, and we have had eight children and most of them lived, which is more than many can say.',
          'We took this farm on a mortgage. Three hundred acres. We are paying it still and we will be paying it when I am gone.',
          { learn: ['fact.nurseland'] },
          { say: 'She says it with plain pride, and no apology.', who: null },
          'I am a full member of the church in Salem Town — I took the covenant, which not everybody here has. I walk in when I am able. I am not always able now.',
        ],
      },
      {
        id: 'girls', label: 'The girls at the parsonage.',
        lines: [
          { say: 'She makes a small sound.', who: null },
          'Those poor children.',
          'I have not gone to see them. Half the village has gone to see them and I will not.',
          { learn: ['fact.girls'] },
          'It is not a spectacle. It is two little girls who are not well, in a house where nobody is happy.',
          'And people are standing about in that room saying words like "the evil hand" over their heads, where they can hear it.',
          { say: 'She sets her hands in her lap.', who: null },
          'Children believe what grown people tell them about themselves. That is the whole of it.',
          'If you tell a frightened child for long enough that something has hold of her, she will find it. Not because she is wicked. Because she is a child and you are the grown person.',
        ],
      },
      {
        id: 'putnams', label: 'The Putnams and your family.',
        require: ['fact.topsfield'],
        lines: [
          { say: 'She is quiet for a moment.', who: null },
          { bySource: 'fact.topsfield', cases: {
              annjr: [
                'Little Ann told you that.',
                'She would. She has heard it at that table since she could sit up at it.',
              ],
            },
            default: ['Somebody has been telling you about the Topsfield line.'],
          },
          'It is true. My people and theirs have gone at that boundary for thirty years and more. Before that, their fathers and mine.',
          'And my husband and I have had words with that family over our fences, and there was a business with their swine in our field that I will not go into.',
          'It is nothing. It is what neighbours do.',
          { say: 'She says the next part gently, and it is the most frightening thing anyone says to you in this village.', who: null },
          'You cannot live five miles from a family for forty years and not have something between you.',
          'Everyone here has something between them and somebody. It has never once come to anything.',
          { say: 'She goes back to the mending.', who: null },
          'If you want the whole of it, it is written down. There is a petition on the Putnams\' own table with my neighbours\' names on it, and not one of them ours.',
          { learn: 'paper.topsfield' },
        ],
      },
      {
        id: 'property', label: 'You hold land in your own name.',
        require: ['fact.nurseland'],
        lines: [
          { say: 'She looks up from the mending.', who: null },
          'I do. The farm is in both our names and it will go to our children, and I have had a hand in every decision about it for forty years.',
          'That is not usual and I know it is not usual.',
          { say: 'She thinks about how much to say, and says it.', who: null },
          'There is a kind of woman this village is uneasy about, and I will tell you what she looks like, because I have watched it my whole life.',
          'She is past her childbearing. She has land, or she stands to get land, and there is no son or brother it would more naturally have gone to. She has been to law at least once, and won.',
          { learn: ['fact.womenproperty'] },
          'Goodwife Osborne was that woman. She went to law against her own sons over her husband\'s ground and she was not forgiven it.',
          { say: 'She goes back to the mending, and her hands are steady.', who: null },
          'And I am that woman. I would be a fool not to have noticed.',
        ],
      },
      {
        id: 'seating', label: 'The seats in the meetinghouse.',
        require: ['clue.seating'],
        lines: [
          'Ah. You have looked at the chart.',
          'They seat us by what we are worth. Rates paid, land held, age, standing. The committee sits and decides it and then it is nailed up where everyone can read it.',
          { learn: ['fact.factions'] },
          'And twice every Sunday, the whole village sits down in the exact order of who matters.',
          { say: 'She almost laughs.', who: null },
          'I have been moved forward once in my life and back once. I remember both.',
          'You may think that is a small vanity in an old woman. Go and stand in that room and look at who is in the front and who is at the back, and then tell me it is small.',
          'And there is a second sheet pinned up beside the chart. The committee\'s own working, with the names they moved still crossed through on it.',
          { learn: 'paper.seating' },
          'They left it up. I have never decided whether that was carelessness or whether somebody wanted it read.',
        ],
      },
    ],
    farewell: ['Go carefully. The road is bad this time of year.'],
  },

  /* -------------------------------------------------------------------- *
   * NATHANIEL INGERSOLL
   *
   * Deacon, and keeper of the ordinary. The tavern is where the village's
   * information actually moves, which makes him the gossip hub — and the
   * natural place for the player to pick up the rumour that unlocks Tituba.
   * -------------------------------------------------------------------- */
  ingersoll: {
    id: 'ingersoll',
    name: 'Nathaniel Ingersoll',
    spec: {
      flesh: FLESH.ruddy, hair: HAIR.grey,
      coat: CLOTH.russet, collar: LINEN, hat: '#4a423a',
    },
    greet: [
      {
        if: { chapter: 'june' },
        then: [
          { say: 'Every seat is taken and there are people standing. He is working and he looks ill.', who: null },
          'If you want a seat you will not get one.',
          'They examined four people in this room before they moved it to the meeting house. In here. Where you are standing.',
          { learn: 'june.examinations' },
        ],
        else: [],
      },
      {
        if: { chapter: 'september' },
        then: [
          { say: 'The room is empty in the middle of the day. He is wiping something that is already clean.', who: null },
          {
            if: { metBefore: ['ingersoll'] },
            then: [
              'You were in here in March. The room was full and I was glad of it.',
              { say: 'He does not look up.', who: null },
            ],
            else: [],
          },
          'Sit anywhere.',
          { say: 'There is nobody to sit near.', who: null },
        ],
        else: [],
      },
      {
        if: { chapter: 'march', notSpokenTo: ['ingersoll'] },
        then: [
          'Sit where you like. It is early yet.',
          { say: 'A heavy man of about sixty, wiping something that is already clean.', who: null },
          'I keep the ordinary — that\'s what we call a tavern — and I\'m a deacon of the church. Which means I hear everything twice. Once sober and once not.',
        ],
        else: [],
      },
      { if: { chapter: 'march', spokenTo: ['ingersoll'] }, then: ['Back for more, are you.'], else: [] },
    ],
    topics: [
      {
        id: 'j_trade', label: 'Business is good.', chapter: 'june',
        lines: [
          { say: 'He stops wiping.', who: null },
          'Do not.',
          'I have taken more money across that bar in a fortnight than in the last two years. I am a deacon of this church. And I have watched them bring a seventy-one-year-old woman through that door in irons — chained, at the wrists.',
          { learn: 'june.ingersollguilt' },
          'She sat in that chair. There.',
          { say: 'He does not look at the chair.', who: null },
          'I have thought about shutting. And then I think, if I shut, they will only do it somewhere else and I will have lost the money as well.',
          'That is the kind of reasoning a man does at four in the morning and is ashamed of by noon.',
        ],
      },
      {
        id: 'j_warrant', label: 'What is that paper?', chapter: 'june',
        lines: [
          'The warrant. For Goodwife Nurse.',
          'They served it here because there is nowhere else in this village big enough to serve anything in.',
          { learn: ['june.warrantfound', 'paper.warrant'] },
          'You may read it. Half the county has.',
        ],
      },
      {
        id: 's_after', label: 'Where is everybody?', chapter: 'september',
        lines: [
          'Home.',
          { say: 'He keeps wiping.', who: null },
          'In June this room had men from three towns in it standing on the benches. Now they have all remembered they have farms.',
          { learn: 'sept.quiet' },
          'Nobody in this village wants to be remembered as having enjoyed it. Including me.',
          { say: 'He puts the cloth down.', who: null },
          'There are eight people dead from the twenty-second alone. Martha Corey sat where you are sitting once a week for years.',
          'And what I keep thinking about is that I have their names in my account book. All of them. They owed me for cider.',
        ],
      },
      {
        id: 'news', chapter: 'march', label: 'What is the talk?',
        lines: [
          'The parsonage. What else.',
          'Those two children have been ill since Christmas and Griggs can find nothing in them, so he has said what he has said.',
          { learn: ['fact.girls', 'fact.griggs'] },
          { say: 'He leans on the bar.', who: null },
          'And then Goodwife Sibley — Mary Sibley, who ought to have known better and who sits in this church every week — had a cake made.',
          'Rye meal, and the girls\' own water, baked up and fed to a dog. To make the witch cry out. It is an old country trick and it is not a Christian one.',
          { learn: ['fact.witchcake'] },
          'She had the Parris woman do it. The Indian. Tituba.',
          { say: 'He straightens up.', who: null },
          'That was not two weeks ago. And this week the girls have started giving names.',
          'I am not saying the one made the other. I am saying I keep an ordinary — a tavern — and I have watched a great many things start in this room, and they all start about that quick.',
          { say: 'He taps the book lying open on the bar.', who: null },
          'And if you want to know how this village really works, do not listen to me. Look at that. Everyone in it is in there, and the book does not have an opinion.',
        ],
      },
      {
        id: 'parsonage', chapter: 'march', label: 'Mr. Parris.',
        lines: [
          { say: 'He weighs how much to say, and says most of it.', who: null },
          'There is a quarrel and there has been for years.',
          'He was called here in eighty-nine and the terms were agreed — salary, the parsonage, his firewood found for him.',
          { learn: ['fact.salary'] },
          'And then in October the village elected a new committee, and every man on it is one of those that never wanted him.',
          'They have not collected the tax that pays him since. Nor sent his wood.',
          {
            if: { knows: ['clue.woodpile'] },
            then: ['You have seen his woodpile, I dare say. Then you have seen the argument.'],
            else: ['Walk past the parsonage and look at his woodpile. That is the argument, in a heap, where anyone can count it.'],
          },
          'Half this village is Putnam and half is Porter and the minister is what they have found to fight about this year.',
          { learn: ['fact.factions'] },
        ],
      },
      {
        id: 'accounts', chapter: 'march', label: 'Your account book.',
        require: ['clue.accounts'],
        lines: [
          { say: 'He does not close it.', who: null },
          'You have been reading my book.',
          'It is no secret. Everyone in this village owes somebody, and most of it goes through here one way or another.',
          'Look who the credits run to, if you are going to look at all.',
          { say: 'A great many entries end in the same name.', who: null },
          'The Putnams have money out to half the households on that page. Timber, cattle, seed, cash against the harvest.',
          { learn: ['fact.factions'] },
          'That is not wickedness. That is what a big family with land does in a small place.',
          'But it does mean that when a Putnam says a thing in this village, there are a great many people who have a reason not to contradict him.',
          { say: 'He turns a loose sheet out of the back of the book and leaves it on the bar.', who: null },
          'That one has come out of the binding. Read it properly if you are going to read it at all.',
          { learn: 'paper.accounts' },
        ],
      },
      {
        id: 'seatinglist', chapter: 'march', label: 'How are the meetinghouse seats decided?',
        lines: [
          'I am a deacon of that church. I have sat on the committee that does it.',
          'It is not malice. Somebody has to put five hundred people in a room in some order, and the order we use is what each household pays in rates.',
          { say: 'He stops wiping.', who: null },
          'That is a defence, and I notice I am making one.',
          {
            if: { knows: ['clue.seating'] },
            then: ['You have stood in front of the chart, then. You will have seen where the back rows start.'],
            else: ['Go and look at it. It is nailed up by the door where nobody can avoid it, which is not an accident either.'],
          },
          'The working sheet is still pinned up beside the chart. Names crossed out and written in again — that is how the thing is actually done.',
          { learn: 'paper.seating' },
          'A man can be moved back a row by a vote of six men in a room, and then sit in that row in front of his neighbours every Sunday for the rest of his life.',
        ],
      },
      {
        id: 'strangers', chapter: 'march', label: 'You have had visitors.',
        lines: [
          'From Beverly, Topsfield, Andover. Come to see the girls.',
          { learn: ['fact.strangers'] },
          'I will not pretend it has been bad for trade.',
          { say: 'He does not look entirely comfortable saying it.', who: null },
          'They come in here after, and they sit where you are sitting, and they tell it all back to each other louder than they heard it.',
          'By the time it goes home to Andover it has grown.',
        ],
      },
    ],
    farewell: ['Mind the step on your way out.'],
  },

  /* -------------------------------------------------------------------- *
   * Ambient villagers
   *
   * No topic trees — they say their piece and go back to work. Their job is
   * to make the village feel inhabited, and to let the player overhear the
   * ordinary version of every grievance the named cast will state outright.
   * A village of six hundred people should not contain six people.
   * -------------------------------------------------------------------- */

  swineboy: {
    // Visibly working: the sprite loops two frames on the spot.
    busy: true,
    id: 'swineboy',
    name: 'A boy with the swine',
    spec: {
      flesh: FLESH.fair, hair: HAIR.brown, child: true,
      coat: CLOTH.russet, under: CLOTH.undyed,
    },
    greet: [
      { say: 'A boy of about ten, trying to turn three pigs off the road with a stick. He is losing.', who: null },
      'Get on! Get ON —',
      { say: 'One of them goes straight past him into the field.', who: null },
      'They get into Goodman Nurse\'s rye and then it is my father who hears about it.',
      'Every year. Every single year.',
    ],
  },

  goodwife: {
    // Visibly working: the sprite loops two frames on the spot.
    busy: true,
    id: 'goodwife',
    name: 'A woman at the well',
    spec: {
      flesh: FLESH.ruddy, hair: HAIR.grey,
      coat: CLOTH.madder, skirt: CLOTH.madder,
      apron: LINEN, coif: LINEN,
    },
    greet: [
      { say: 'She is drawing water and does not hurry over it. This is where you hear things.', who: null },
      'You will be here about the girls.',
      { say: 'She does not wait for you to answer.', who: null },
      'Everyone is here about the girls. There were two carts through this morning from Beverly.',
      'I have lived in this village forty years and nobody came to look at us before.',
      { learn: 'fact.strangers' },
    ],
  },

  /* ------------------------------------------------------------------ *
   * The rye farmer.
   *
   * THE HARD RULE, and everything about this character depends on it:
   * nobody alive in 1692 could connect blighted rye to a fit. The ergot
   * theory is Linnda Caporael's, published in Science in 1976. If this man
   * diagnoses anything, the history breaks.
   *
   * So he gives the player evidence and no interpretation. Every detail he
   * describes is real and is what the modern argument actually rests on:
   * black sclerotia replacing the grain (period farmers knew them as
   * cockspur or spurred rye and knew nothing else about them), a wet
   * growing season in 1691, a harvest you cannot afford to throw away, and
   * cattle slipping their calves — ergot causes abortion in livestock, and
   * a farmer would absolutely notice that and never know why.
   *
   * Then Dr. Whitfield hands the player the theory AND takes it apart. A
   * student who found this man walks into the archive certain they have
   * cracked it, and learns why a tidy cause that explains one symptom and
   * none of the pattern is usually the wrong answer. That sequence is the
   * best teaching this game does, and it only works because the evidence
   * was planted three chapters before the argument.
   * ------------------------------------------------------------------ */
  ryefarmer: {
    busy: true,
    id: 'ryefarmer',
    name: 'A man at the rye field',
    spec: {
      flesh: FLESH.ruddy, hair: HAIR.brown,
      coat: CLOTH.russet, under: CLOTH.undyed,
    },
    greet: [
      {
        if: { notSpokenTo: ['ryefarmer'] },
        then: [
          { say: 'He is turning the edge of a field over with a spade, without much conviction. It is the first week of March and there is nothing to plant yet.', who: null },
          'Ground is still hard. I am wasting my morning and I know it.',
        ],
        else: ['Still hard.'],
      },
    ],
    topics: [
      {
        id: 'harvest', label: 'How was the harvest?',
        lines: [
          { say: 'He straightens up. This is clearly a thing he has wanted to say to somebody.', who: null },
          'Which one. This year was middling. The year before it was bad and nobody wants to hear about it any more.',
          'Ninety-one. Wettest spring I have farmed through. The rye stood in water at the low end for a fortnight and I could do nothing but look at it.',
          { learn: 'fact.wetyear' },
          'And it came in with spurs on it.',
        ],
      },
      {
        id: 'spurs', label: 'Spurs?',
        require: ['fact.wetyear'],
        lines: [
          { say: 'He goes to the wall, moves a stone, and takes out a twist of cloth. He has kept some.', who: null },
          { say: 'Inside are three or four grains of rye — except that they are not grains. They are black, curved, and about the length of a fingernail. They sit in the palm of his hand like little horns.', who: null },
          'Cockspur. Spurred rye. My father called it that and his father called it that.',
          { learn: 'fact.spurredrye' },
          'It comes in a wet year and it comes in the low ground, and there is not a thing to be done about it.',
          { say: 'He tips them back into the cloth carefully, the way you would handle something you did not intend to lose.', who: null },
        ],
      },
      {
        id: 'ate', label: 'What did you do with it?',
        require: ['fact.spurredrye'],
        lines: [
          { say: 'He looks at you as though you have asked something very stupid, and then realises you are not from here.', who: null },
          'Did with it? We ate it.',
          'You do not throw away a harvest. You winnow what you can and you grind the rest and you eat it through the winter, because the alternative is that you do not eat.',
          { learn: 'fact.atetherye' },
          'Half this village ate off that field. The parsonage had their share of it too — they are owed corn and rye by the agreement, whatever the committee says about the rate.',
          { say: 'He goes back to the spade.', who: null },
        ],
      },
      {
        id: 'cattle', label: 'Was anything else wrong that winter?',
        require: ['fact.spurredrye'],
        lines: [
          { say: 'He stops.', who: null },
          'Two of my cows slipped their calves. Before their time, both of them, within the month.',
          { learn: 'fact.cattle' },
          'I have had a cow slip in a hard winter. I have never had two in a wet one.',
          { say: 'He shrugs, because there is no more to be got out of it than that.', who: null },
          'A bad year is a bad year. You do not get an account of why.',
        ],
      },
    ],
    farewell: ['Mind the low end if you walk down there. It does not drain.'],
  },

  woodman: {
    // Visibly working: the sprite loops two frames on the spot.
    busy: true,
    id: 'woodman',
    name: 'A man splitting wood',
    spec: {
      flesh: FLESH.olive, hair: HAIR.dark,
      coat: CLOTH.saddGreen, under: CLOTH.russet,
    },
    greet: [
      { say: 'He sets the axe down but keeps hold of it.', who: null },
      'Mind yourself, there is a wedge in this one.',
      {
        if: { knows: ['clue.woodpile'] },
        then: [
          { say: 'There is a great deal of wood here. Far more than the minister has.', who: null },
          'You have been up at the parsonage, then.',
          { say: 'He gets back to it.', who: null },
          'I cut what my family burns. I am not obliged to cut what his does. That was the village\'s bargain, not mine.',
          'Take it up with the committee. Everyone else does.',
        ],
        else: [
          'A cord and a half so far this week and it is not near enough.',
          'March is the month that finds out who laid in enough in October.',
        ],
      },
    ],
  },

  watchman: {
    id: 'watchman',
    name: 'A man on watch',
    spec: {
      flesh: FLESH.fair, hair: HAIR.auburn,
      coat: CLOTH.slate, collar: LINEN, hat: '#43403c',
    },
    greet: [
      { say: 'He is standing where he can see the road, with a musket propped beside him.', who: null },
      'Village watch. You will have come up the Salem road.',
      {
        if: { knows: ['fact.mercymaine'] },
        then: [
          'Then you know why we keep one.',
          { say: 'He glances north, the way Mercy Lewis did.', who: null },
          'The war is up the eastward, not here. But there are families in this village who came down from Casco and Falmouth with nothing, and they do not think it is far enough away.',
          'We have had the watch set every night since the autumn. Some nights I think it is for the Indians.',
          'Some nights I think it is so the men have somewhere to be.',
        ],
        else: [
          'We keep a watch through the night, and have since the autumn.',
          'There is fighting up the eastward — the Maine country. It has not come near us. That is not the same as nobody being afraid of it.',
          { learn: ['fact.maine_fear'] },
          'Fifty miles. Men in this village have gone up there and not all of them came back, and we have had families come down with what they could carry. You do not keep a watch through the winter for a thing you think is finished.',
          { learn: 'fact.factions' },
        ],
      },
    ],
  },

  /* ==================================================================== *
   * JUNE 1692
   *
   * Mid-to-late June. Bridget Bishop was hanged on 10 June. The court sits
   * again on 30 June. Rebecca Nurse is in the Salem jail awaiting trial;
   * Tituba has been in prison since 1 March and will never be tried.
   *
   * The two people from March who are now in prison are both people the
   * player sat with. That is not arranged — it is what happened, and it is
   * why March was built around those two.
   * ==================================================================== */

  /** Francis Nurse, in his own dooryard, without his wife. */
  francis: {
    id: 'francis',
    name: 'Francis Nurse',
    spec: {
      flesh: FLESH.ruddy, hair: HAIR.white, stoop: true,
      coat: CLOTH.russet, under: CLOTH.undyed, collar: LINEN,
    },
    greet: [
      {
        if: { notSpokenTo: ['francis'] },
        then: [
          { say: 'An old man standing in a dooryard with nothing in his hands.', who: null },
          'She is not here.',
          { say: 'He says it before you ask.', who: null },
          'Everyone who comes up that path is coming to ask me where my wife is, so I have got into the habit of saying it first.',
        ],
        else: [
          {
            if: { chapter: 'september', metBefore: ['francis'] },
            then: [
              'You were here in June, asking after her.',
              { say: 'He does not finish the thought. There is nothing to finish it with.', who: null },
            ],
            else: ['Still here.'],
          },
        ],
      },
    ],
    topics: [
      /* ------------------------------------------------------------ *
       * September. Ten weeks after the nineteenth of July.
       *
       * Every character in this game holds it together in every scene.
       * That restraint is why the good lines land — but a village where
       * nobody's voice ever goes is a village where nothing has happened
       * to anybody, and something has happened to this man.
       *
       * He does not weep and nothing is described. He simply cannot get
       * to the end of a sentence, and the game does not help him.
       * ------------------------------------------------------------ */
      {
        id: 's_her', label: 'I am sorry about your wife.', chapter: 'september',
        lines: [
          { say: 'He nods, the way a man does when he has been told this a great many times and has a way of getting through it.', who: null },
          'Thank you. That is kindly said.',
          { say: 'And then he does not say anything else.', who: null },
          { say: 'The pause goes on long enough that you understand he is not deciding what to say. He is waiting to see whether he can.', who: null },
          'They would not give her back.',
          { say: 'His voice does something on the second word and he stops and starts again.', who: null },
          'They would not give her back to me. Do you understand. She was to be left up there with the others, in the rocks, and no ground said over her.',
          { learn: 'sept.noburial' },
          { say: 'He looks at the fence he is mending, and at his own hands on it.', who: null },
          'So we went up at night and we brought her home. Myself and my sons.',
          'That is all I have done for her since March. That is the whole of it.',
          { say: 'Nobody in this village has ever been charged for that, and nobody has ever written it down.', who: null },
        ],
      },
      {
        id: 'where', label: 'Where is she?',
        lines: [
          'Salem. The gaol on Prison Lane.',
          'They came for her on the twenty-fourth of March. She was ill in bed and had been for a week. They took her anyway.',
          { learn: 'june.nursejailed' },
          'She is seventy-one years old and she is in a cellar five miles from here, and I am told she is to be tried at the end of this month.',
          { say: 'He looks down the road south.', who: null },
          'You may go and see her, if you have a mind to. Straight down that road, and it is on the left before you reach the houses. They let people stand at the bars. They charge for it one way or another, but they let people stand there.',
          'Tell her I have the paper. Thirty-nine names. Tell her that.',
        ],
      },
      {
        id: 'petition', label: 'What are you doing about it?',
        require: ['june.nursejailed'],
        lines: [
          'What can be done. I have written to the court.',
          'And I have taken a paper round this village, and I have got thirty-nine names on it.',
          { learn: 'june.petition' },
          'Thirty-nine neighbours who have known her forty years, saying they have never in their lives seen anything in her that could be called what they are calling it.',
          { say: 'He almost smiles.', who: null },
          'There are Putnams on that paper. Their own kin signed for her.',
          'It is on the table inside. You may read it. I would rather somebody did.',
          { learn: 'paper.nursepetition' },
          'I have been told by men who know the law that it may not signify. But it is what I have.',
        ],
      },
      {
        id: 'why', label: 'Why her?',
        require: ['june.nursejailed'],
        lines: [
          { say: 'He takes longer over this than over anything else.', who: null },
          'I have thought about very little else since March.',
          {
            if: { knows: ['fact.topsfield'] },
            then: [
              'You know about the Topsfield line, then. And about my wife being a Towne.',
              'Her sister Mary is taken as well. And her sister Sarah. All three of the Towne girls.',
              { learn: 'june.threesisters' },
              'You may call that a coincidence if you like. I have run out of the strength for it.',
            ],
            else: [
              'My wife was born a Towne, of Topsfield. There is a line up there that our families have argued over since before I was married.',
              { learn: 'fact.topsfield' },
              'Her two sisters are taken as well. All three of them.',
              { learn: 'june.threesisters' },
            ],
          },
          'And we have had words with that family over our fences, and over their swine in our field, and over the seating in the meeting house.',
          'Small things. Every one of them a small thing.',
        ],
      },
    ],
    farewell: ['Tell her I have the hay in. She will want to know.'],
  },

  /** Rebecca Nurse, in the Salem jail. The scene the game is built for. */
  nurseJail: {
    id: 'nurseJail',
    name: 'Rebecca Nurse',
    spec: {
      flesh: FLESH.fair, hair: HAIR.white, stoop: true,
      coat: CLOTH.undyed, skirt: CLOTH.undyed, coif: LINEN,
    },
    greet: [
      {
        if: { notSpokenTo: ['nurseJail'] },
        then: [
          { say: 'The cell is a cellar with a grate in it. The floor is stone and there is straw on the stone.', who: null },
          { say: 'She is sitting against the wall. She gets up anyway.', who: null },
          {
            // Whether she knows you is decided three chapters ago, in a
            // kitchen, by a player who had no reason yet to bother.
            if: { metBefore: ['nurse'] },
            then: [
              'Well. I did not expect you.',
              { say: 'She sounds pleased. That is the worst part.', who: null },
              'You came to the house in the spring. I remember. Come where I can see you — my eyes are no better than they were.',
            ],
            else: [
              { say: 'She looks at you the way you would look at anyone who had come a long way to stare.', who: null },
              'I do not know your face.',
              'Well. Come where I can see it, then. My eyes are not what they were.',
            ],
          },
        ],
        else: ['You came back.'],
      },
    ],
    topics: [
      {
        id: 'how', label: 'How are you?',
        lines: [
          'Cold. Old. It is a cellar.',
          'They have me in irons some days and not others and I have not worked out the rule of it.',
          { learn: 'june.irons' },
          { say: 'She says this the way she said the road was bad in March.', who: null },
          'My daughters come when they can. They bring what they can bring.',
          'And I am charged for every day I am here, you understand. The dyett, the fees, the chains. It is written in a book.',
          { learn: 'paper.jailbill' },
          { say: 'She nods at the table by the stair, out past the bars.', who: null },
          'It is on that table. Go and see what a week of me costs.',
          'If they let me go tomorrow I could not walk out of the door until it was paid.',
        ],
      },
      {
        id: 'trial', label: 'What happens next?',
        lines: [
          'I am to be tried at the end of the month.',
          { say: 'She is entirely calm about it.', who: null },
          'Francis has taken a paper round the village. Thirty-nine names, he tells me. Thirty-nine neighbours.',
          'Some of them are Putnams. I want you to understand that. Their own family signed for me.',
          { learn: 'june.petition' },
          'I have lived in this place forty years. I am a full member of the church in the Town — covenanted, sworn in, the whole of it. They will look at the paper and they will look at me and they will see an old woman who has never done anybody any harm.',
          { say: 'She pats the wall beside her, the way you would pat a table.', who: null },
          'It will be sorted out. These things are sorted out.',
          { say: 'Then, after a moment, and in a different voice:', who: null },
          'There is a girl at Ingersoll\'s who said in May that none of it was true. Mary Warren. She said it out loud and then she was in here herself for a fortnight, and now she is carrying pots again.',
          'If you are going back up that road, go and look at her. I would like to know what they did to her, and nobody will tell me.',
        ],
      },
      {
        id: 'girls', label: 'Do you know who accused you?',
        lines: [
          'The Putnam child. Little Ann. And her mother. And the others.',
          { say: 'No anger in it at all.', who: null },
          'I have known that child since she was born. I have been in that house.',
          'They say my shape came into a room and hurt her. My shape.',
          { learn: 'june.spectral' },
          'I asked them at the examination how I could answer it. If a thing that looks like me does something in a room I have never been in, what am I to say?',
          'And the girls fell down on the floor and cried out, and the room took that for an answer.',
        ],
      },
      {
        /* The scene the whole game exists for. */
        id: 'warn', label: 'Tell her what happens on the nineteenth of July.',
        require: ['present.nurse'],
        lines: [
          { say: 'You have known this since before you met her. It was cut into a bench in a city that does not exist yet.', who: null },
          { say: 'You say it out loud.', who: null },
          { say: 'The nineteenth of July. Hanged. Along with four other women, on a ledge above the town.', who: null },
          { say: 'It comes out steadier than you expected, and that is somehow worse.', who: null },
          { say: 'She listens to the whole of it. She does not interrupt.', who: null },
          { learn: 'june.warned' },
          { say: 'Then she reaches through the grate and puts her hand on your arm. Her hand is cold and the grip is not weak.', who: null },
          'Child.',
          'You have been in that village three months and you have listened to everything anybody has told you, and you have believed all of it.',
          { say: 'She is being kind. She thinks she is being kind.', who: null },
          'People say a great many things when they are frightened. You must learn which of them to carry and which to put down.',
          'There are thirty-nine names on that paper.',
          { say: 'She lets go of your arm.', who: null },
          'Have you eaten? You look as if you have walked from the village.',
          { say: 'You have.', who: null },
        ],
      },
    ],
    farewell: ['Go carefully. The road is bad this time of year.'],
  },

  /** Tituba, in the same jail. She confessed and she lived. */
  /* ------------------------------------------------------------------ *
   * Dorothy Good, four years old.
   *
   * She was a sentence in an optional clue, weighted the same as a line
   * about tax rates: "her four-year-old daughter is in here too." She is in
   * the room the player walks through, so she should be in it.
   *
   * Nothing is depicted. She is not suffering on screen and she does not
   * complain — she is a small child being perfectly ordinary in a cellar,
   * which is worse than any description of a cell would be. Everything she
   * says is a thing a four-year-old actually says.
   *
   * She is deliberately not on any goal list. A child is not a checklist
   * item. The arrival narration points at her and the player decides.
   * ------------------------------------------------------------------ */
  dorothy: {
    id: 'dorothy',
    name: 'Dorothy Good',
    spec: {
      flesh: FLESH.fair, hair: HAIR.brown, child: true,
      coat: CLOTH.undyed, skirt: CLOTH.undyed,
    },
    greet: [
      {
        if: { notSpokenTo: ['dorothy'] },
        then: [
          { say: 'There is somebody else down here, right at the end, where the one window does not reach.', who: null },
          { say: 'She is sitting on the floor with her back against the stone, sorting pieces of straw into lengths. Long ones here. Short ones there.', who: null },
          { say: 'She is four years old.', who: null },
          'Are you come for my mother?',
        ],
        else: ['You came back down.'],
      },
    ],
    topics: [
      {
        id: 'name', label: 'What is your name?',
        lines: [
          'Dorothy Good.',
          { say: 'She says both parts of it carefully, the way a child says something they have been made to repeat a great many times to people who wrote it down.', who: null },
          { learn: 'june.dorothy' },
          'I told the men already. I told them twice.',
        ],
      },
      {
        id: 'long', label: 'How long have you been here?',
        lines: [
          { say: 'She thinks about this seriously. It is clearly a real question and she wants to get it right.', who: null },
          'It was cold when I came.',
          'It is not cold now.',
          { say: 'She was brought in on the twenty-fourth of March. It is the middle of June.', who: null },
        ],
      },
      {
        id: 'mother', label: 'Where is your mother?',
        lines: [
          { say: 'She points down the cellar, without looking.', who: null },
          'She is there. She is not well.',
          'There was a baby and now there is not one.',
          { say: 'She says this in exactly the tone she used about the straw.', who: null },
        ],
      },
      {
        id: 'irons', label: '…',
        require: ['june.dorothy'],
        lines: [
          { say: 'You are looking at her wrists before you have decided to.', who: null },
          { say: 'The irons on this child were made for a grown woman. They have been taken in with a twist of cord so that they will stay on her.', who: null },
          { say: 'Somebody sat down and did that. It took them a few minutes and they will have thought about the knot.', who: null },
          { learn: 'june.dorothychain', source: 'observed' },
          'They are not heavy,',
          { say: 'she says, helpfully, because you were looking.', who: null },
        ],
      },
    ],
    farewell: [
      'Will you tell them I said my name right?',
    ],
  },

  titubaJail: {
    id: 'titubaJail',
    name: 'Tituba',
    spec: {
      flesh: FLESH.brown, hair: HAIR.black,
      coat: CLOTH.undyed, skirt: CLOTH.undyed, coif: LINEN,
    },
    greet: [
      {
        if: { notSpokenTo: ['titubaJail'] },
        then: [
          {
            if: { metBefore: ['tituba'] },
            then: [
              { say: 'She is further down the same cellar. She recognises you.', who: null },
              'You.',
              'You were in that kitchen in March, standing where you were not underfoot.',
            ],
            else: [
              { say: 'She is further down the same cellar. She does not know you and does not pretend to.', who: null },
              'Another one come to look.',
              { say: 'She goes back to what she was doing, which is nothing.', who: null },
            ],
          },
          { say: 'She has been in this room since the first of March.', who: null },
        ],
        else: ['Still here. So am I.'],
      },
    ],
    topics: [
      {
        id: 'confess', label: 'You confessed.',
        lines: [
          'I did.',
          { say: 'No shame in it, and no pride either.', who: null },
          'Mr Parris beat me. Before ever I was brought before the magistrates, he beat me, and he told me what it would be well for me to say.',
          { learn: 'june.beating' },
          'So I said it. I said there was a tall man out of Boston, and a book to sign, and a yellow bird, and creatures that came to me.',
          'I made it up out of what I had heard people in this country say about witches. It was not hard. They had told me the shape of it themselves.',
          { say: 'She looks at you steadily.', who: null },
          'And every soul who has confessed since has told the same story. The book. The man. The birds.',
          'They are all repeating me.',
        ],
      },
      {
        id: 'alive', label: 'Why are you still alive?',
        require: ['june.beating'],
        lines: [
          { say: 'She lets the question sit for a moment.', who: null },
          'Because I confessed.',
          'Look about this room and count. Every person here who said they did it is waiting. Every person who said they did not is being tried.',
          { learn: 'june.confessionsurvival' },
          'They do not hang the ones who agree with them. They hang the ones who will not.',
          { say: 'Down the cellar, Rebecca Nurse is talking quietly to somebody about a petition.', who: null },
          'That good old woman down there has told the truth every single day since March.',
          'I have told a lie every day since March.',
          'You may work out for yourself which of us that court is going to kill.',
        ],
      },
      {
        id: 'after', label: 'What happens to you?',
        require: ['june.confessionsurvival'],
        lines: [
          'I will sit here until somebody pays what is owed for me.',
          'Mr Parris will not pay it. He has said so. I am a charge on him and he does not want me back in that house.',
          { say: 'She says the next part flatly, as a fact about the world.', who: null },
          'Somebody will buy me out of here eventually, and I will belong to them instead.',
          'Whatever else is written down about me afterwards — and I think a great deal will be — remember that you were told this here, by me.',
        ],
      },
    ],
    farewell: ['Mind the step. It is worse than it looks.'],
  },

  /** Mary Warren. The machine's logic, standing in a tavern. */
  marywarren: {
    id: 'marywarren',
    name: 'Mary Warren',
    spec: {
      flesh: FLESH.fair, hair: HAIR.brown,
      coat: CLOTH.slate, skirt: CLOTH.slate, apron: LINEN, coif: LINEN,
    },
    greet: [
      {
        if: { notSpokenTo: ['marywarren'] },
        then: [
          { say: 'A young woman of about twenty, sitting very upright at the end of a table with people around her.', who: null },
          { say: 'When she moves her hands, three people at the next table stop talking to watch.', who: null },
          'You have not been here before.',
          'People come every day now. From Andover, from Boston. To see us.',
        ],
        else: ['You again.'],
      },
    ],
    topics: [
      {
        id: 'us', label: 'To see you?',
        lines: [
          'The afflicted.',
          { say: 'She says it like a job title.', who: null },
          'I am servant to John Procter. Was. I am not sure what I am now.',
          'In the spring I was one of the afflicted, and I was believed, and men who had never once looked at me wrote down every word I said.',
        ],
      },
      {
        id: 'recant', label: 'What happened in April?',
        lines: [
          { say: 'Something goes out of her face.', who: null },
          'I said it was not true.',
          'I told them the girls did but dissemble. That we had made it up, all of it.',
          { learn: 'june.recant' },
          { say: 'Her hands are flat on the table and she is looking at them.', who: null },
          'And within two weeks I was in irons myself, and the same girls I had stood beside were crying out that my shape was tormenting them.',
          'They put me in that cellar in Salem. I was examined three times.',
          'So I stopped saying it was not true.',
          { learn: 'june.onlyexit' },
          'And the fits came back, and I was believed again, and here I am at the head of the table with people from Boston watching my hands.',
          { say: 'She looks up.', who: null },
          'There is only one way out of being accused in this village and it is to be an accuser. That is not a wicked thing I worked out. It is arithmetic.',
        ],
      },
      {
        id: 'believe', label: 'Do you believe it?',
        require: ['june.onlyexit'],
        lines: [
          { say: 'A very long pause.', who: null },
          'I do not know any more.',
          'When it comes on me it is real. My arms go where I do not put them. I am not pretending in that moment, whatever I said in April.',
          'And afterwards I remember saying a name, and I do not always remember deciding to.',
          { say: 'She picks up her cup and puts it down again without drinking.', who: null },
          'You want me to tell you it is all a lie, so that somebody is to blame and it is a smaller thing.',
          'It is not a smaller thing.',
          { say: 'She looks toward the door, and the road beyond it.', who: null },
          'If you want to know how a name gets into a room, do not ask me. Go to the Putnam house, south-east past the bend, and ask the child.',
          'She is twelve. She has not been out of that house in weeks. And what she says gets written down and read to a court.',
        ],
      },
    ],
    farewell: ['They will want me at the meeting house. They always do.'],
  },

  /** Out-of-towners. Trade is good and nobody is comfortable. */
  /* -------------------------------------------------------------------- *
   * The June crush
   *
   * In June the tavern was where they held the examinations before the room
   * got too small for them, and Ingersoll says so — "every seat is taken and
   * there are people standing". Three characters were standing in it. The
   * meetinghouse, which is where the court moved TO, was empty.
   *
   * So: five more, in the two rooms, all of them there to watch. None has a
   * topic tree; they say one thing and it is the same thing from five angles,
   * which is the point. A room this full in June is what makes the same room
   * in September, with one man wiping a clean bar, land at all.
   * -------------------------------------------------------------------- */

  crowd1: {
    id: 'crowd1', name: 'A woman at the back',
    spec: { flesh: FLESH.fair, hair: HAIR.grey, coat: CLOTH.saddGreen, skirt: CLOTH.undyed, coif: LINEN },
    greet: [
      { say: 'She has found a place against the wall where she can see and not be seen.', who: null },
      'I will not sit. If you sit you are in it.',
      { say: 'She does not explain what she means by in it.', who: null },
    ],
  },

  crowd2: {
    id: 'crowd2', name: 'A man from Topsfield',
    spec: { flesh: FLESH.ruddy, hair: HAIR.brown, coat: CLOTH.russet, collar: LINEN, hat: '#4a423a' },
    greet: [
      'Topsfield. Come down this morning.',
      { learn: 'fact.strangers' },
      { say: 'He works out how to say the next part and says it anyway.', who: null },
      'My family have been at law with the Putnams over a boundary line since before I was born.',
      'And now they are naming people. And I have come five miles to stand in a room and find out whether they are going to name us.',
    ],
  },

  crowd3: {
    id: 'crowd3', name: 'A girl sent to watch',
    spec: { flesh: FLESH.olive, hair: HAIR.dark, coat: CLOTH.undyed, skirt: CLOTH.saddGreen, coif: LINEN },
    greet: [
      { say: 'She cannot be more than fourteen and she is here on her own.', who: null },
      'My mistress sent me. She wants to know what is said and she will not come herself.',
      { say: 'She says the rest very quietly.', who: null },
      'She has told me to remember it exactly. I have been trying not to.',
    ],
  },

  crowd4: {
    id: 'crowd4', name: 'A man writing',
    spec: { flesh: FLESH.fair, hair: HAIR.dark, coat: CLOTH.black, collar: LINEN },
    greet: [
      { say: 'He has a board on his knee and paper on the board, and he does not stop.', who: null },
      'You will want to stand further back. They will be brought through there.',
      { say: 'He writes without looking up.', who: null },
      'Somebody has to set it down. It is the only part of this that will last.',
      { learn: 'june.examinations' },
    ],
  },

  crowd5: {
    id: 'crowd5', name: 'A man who will not go in',
    spec: { flesh: FLESH.brown, hair: HAIR.grey, coat: CLOTH.murrey, collar: LINEN },
    greet: [
      { say: 'He is standing just inside the door and has not moved further in.', who: null },
      'I knew her forty year.',
      { say: 'He does not say which her, and does not look at you.', who: null },
      'I have signed nothing and I have said nothing and I am standing here, and I have not worked out yet whether that is the same as agreeing to it.',
    ],
  },

  stranger: {
    id: 'stranger', name: 'A man from Andover',
    spec: { flesh: FLESH.olive, hair: HAIR.dark, coat: CLOTH.saddGreen, collar: LINEN, hat: '#3f3b36' },
    greet: [
      { say: 'He is looking at the meeting house the way you look at a thing you have heard about.', who: null },
      'Is it in there they do it? The examining?',
      'We came down from Andover this morning. Three carts of us.',
      { learn: 'fact.strangers' },
      'I will tell you honestly, I did not believe the half of what was said until I heard it from a man who had seen it.',
      'And now I am here, so I suppose I believe it.',
    ],
  },
  stranger2: {
    id: 'stranger2', name: 'A woman from Beverly',
    spec: { flesh: FLESH.fair, hair: HAIR.auburn, coat: CLOTH.murrey, skirt: CLOTH.murrey, coif: LINEN },
    greet: [
      { say: 'She has a child by the hand and is not sure she should have brought her.', who: null },
      'They say the girls will cry out at anybody who comes near them.',
      { say: 'She glances down at the child.', who: null },
      'I have three names in my head that I have heard said in my own town this month. Three. And Beverly is not Salem Village.',
      { learn: 'june.spreading' },
      'It is not staying here. That is what I have come to see. Whether it is staying here.',
    ],
  },
  stranger3: {
    id: 'stranger3', name: 'A man drinking',
    spec: { flesh: FLESH.ruddy, hair: HAIR.grey, coat: CLOTH.russet, collar: LINEN },
    greet: [
      { say: 'He has been here a while.', who: null },
      'Best two weeks of trade this house has ever had, and Ingersoll looks like a man at a funeral.',
      { say: 'He lowers his voice, which does not help.', who: null },
      'Mind what you say in this room. There is a girl at that end of the table who can put you in Salem gaol by Friday and there is nothing you could say to stop her.',
      'Nothing. That is the thing of it. There is no answer you can give.',
    ],
  },

  /* ==================================================================== *
   * SEPTEMBER 1692
   * ==================================================================== */

  neighbour: {
    id: 'neighbour', name: 'A man over a fence',
    spec: { flesh: FLESH.olive, hair: HAIR.dark, coat: CLOTH.black, collar: LINEN },
    greet: [
      {
        if: { notSpokenTo: ['neighbour'] },
        then: [
          { say: 'He does not stop mending the fence, and he does not look at the road.', who: null },
          'You have been away.',
          { say: 'It is not a question and he does not wait for an answer.', who: null },
        ],
        else: ['Still here.'],
      },
    ],
    topics: [
      {
        id: 'corey', label: 'What happened to Giles Corey?',
        lines: [
          { say: 'He works the rail into the post before he says anything.', who: null },
          'Monday last. About noon.',
          'He would not plead. They asked him three times, in the proper form, and he stood mute all three.',
          'So they laid him under boards and put weights on him until he should plead.',
          { learn: 'sept.corey' },
          { say: 'The rail goes in. He starts on the next one.', who: null },
          'It took two days.',
          'And it was not obstinacy, whatever they will tell you. If a man is tried and convicted the sheriff takes his farm. If he is never tried, the sheriff cannot.',
          { learn: 'sept.forfeiture' },
          'He worked out what it would cost him and he paid it, and his sons-in-law have the land.',
          { say: 'He tests the post.', who: null },
          'Eighty-one years old.',
        ],
      },
      {
        id: 'burial', label: 'Where are they buried?',
        lines: [
          { say: 'Now he stops.', who: null },
          'They are not.',
          'They were put in the rocks by the ledge where it was done. No ground, no service, no stone. They were excommunicate.',
          { learn: 'sept.noburial' },
          { say: 'He looks at the road for the first time.', who: null },
          'I am told that some families went out at night afterwards and brought their people home and put them in their own land.',
          'I do not know who. I have not asked and I will not ask, and if you go about this village asking I will say I never spoke to you.',
          { say: 'Back to the fence.', who: null },
          'You may draw your own conclusions about a law that makes a man a criminal for burying his mother.',
        ],
      },
      {
        id: 'over', label: 'Is it over?',
        lines: [
          'Eight of them on the twenty-second. That is nine days ago.',
          { learn: 'sept.eight' },
          'And since then, nothing. No new warrants that I have heard of.',
          { say: 'He shrugs, and it is not a relaxed shrug.', who: null },
          'People are beginning to say things out loud that they were not saying in June. That the spectral evidence will not do. That ministers in Boston have written against it.',
          'Somebody said the Governor\'s own wife had her name spoken.',
          'I do not know if that is true. I notice that it stopped.',
          { learn: 'sept.stopped' },
          { say: 'He looks toward the meeting house.', who: null },
          'It is all written down in there, on the table at the front. Every warrant, every return, in a good clear hand.',
          'Nobody has moved any of it. Go and read it, if you have the stomach. Somebody ought to.',
          { learn: 'paper.court' },
          { say: 'He works the next rail in before he says the rest.', who: null },
          'And when you have read it, go and look at the house it came out of. The Putnams are still in it, south-east past the bend.',
          'They have not moved either. That is the part I cannot get past.',
        ],
      },
    ],
    farewell: ['Mind the road.'],
  },

  /* ==================================================================== *
   * PRESENT DAY — the interludes
   *
   * Rule, everywhere except the historian: they ask questions, they do not
   * answer them.
   * ==================================================================== */

  archaeologist: {
    id: 'archaeologist',
    name: 'Dr. Reyes',
    spec: { flesh: FLESH.brown, hair: HAIR.black, coat: CLOTH.staffTeal, under: CLOTH.denim },
    greet: [
      {
        if: { notSpokenTo: ['archaeologist'] },
        then: [
          { say: 'A woman crouched at the edge of the stone lining, brushing dirt off something.', who: null },
          'Careful where you put your feet — the north corner is soft.',
          'This is the parsonage cellar. Or it was. Everything above this is gone.',
          { learn: 'dig.foundation' },
        ],
        else: ['Still here. It is a slow job.'],
      },
    ],
    topics: [
      {
        id: 'size', label: 'This is small.',
        lines: [
          'Isn\'t it.',
          { say: 'She stands up and paces it out for you.', who: null },
          'That\'s the whole footprint. Two rooms down, a loft over, a chimney in the middle doing all the heating.',
          'Nine or ten people lived in it. Parris, his wife, three children, and Tituba and John Indian.',
          { learn: 'dig.small' },
          'Put your class in here and you would not be able to shut the door.',
          { say: 'She goes back to the trowel.', who: null },
          'People always want me to say something about that. I am not going to. It is a room and I am telling you the size of it.',
        ],
      },
      {
        id: 'finds', label: 'What have you found?',
        lines: [
          'What you always find. Redware sherds. Nails. Window lead — a lot of window lead, which means a lot of very small panes.',
          'Animal bone with butchery marks. A bone-handled knife. Two thimbles.',
          { say: 'She turns over what is in her palm.', who: null },
          'And pins. Constantly pins. They are the most common find on any site of this period and they are the single most boring object in the world.',
          { learn: 'dig.finds' },
          {
            if: { knows: ['fact.girls'] },
            then: [
              { say: 'Pins.', who: null },
              { say: 'The afflicted girls were repeatedly found with pins stuck into them, and said the shapes of the accused had put them there.', who: null },
              'Yes. I know what you are thinking. Everyone thinks it.',
              'Pins are in every house in the seventeenth century because clothes were pinned together. That is all this find tells you.',
              'What people did with them is a different question and it is not one the dirt can answer.',
            ],
            else: [],
          },
        ],
      },
      {
        id: 'cold', label: 'What was it like to live here?',
        lines: [
          'Cold, and dark, and loud.',
          'One fire. Windows about the size of a sheet of paper, because glass was imported and expensive.',
          'No corridors. You get from one room to the next by going through it. There is nowhere in this building where a person could be by themselves.',
          { learn: 'dig.noprivacy' },
          { say: 'She sits back on her heels.', who: null },
          'Which means when two children in this house started having fits in January, there was no room they could do it in where the whole household was not present.',
          'And every adult in it was watching, and every adult in it had an opinion.',
          { say: 'She points the trowel at you, not unkindly.', who: null },
          'That is as far as I go. The objects tell you the shape of the room. What people did in a room that shape is your problem, not mine.',
        ],
      },
    ],
    farewell: ['Mind the north corner on your way out.'],
  },

  historian: {
    id: 'historian',
    name: 'Dr. Whitfield',
    spec: { flesh: FLESH.fair, hair: HAIR.grey, coat: CLOTH.slate, under: CLOTH.denim, collar: LINEN },
    greet: [
      {
        if: { notSpokenTo: ['historian'] },
        then: [
          { say: 'A reading room. Grey boxes on grey shelves. On the table in front of her, in a cradle, is a sheet of paper from 1692.', who: null },
          'Gloves off, actually — the oils are less of a problem than the snagging. Just clean hands.',
          'You have questions. Everyone who comes in here has the same three, so let us get them out of the way.',
        ],
        else: ['Ask.'],
      },
    ],
    topics: [
      {
        id: 'spectral', label: 'How could the court accept that evidence?',
        lines: [
          'Right. Spectral evidence.',
          { say: 'She turns a sheet toward you.', who: null },
          'A witness testifies that the accused person\'s SHAPE — their spirit, their apparition — came into a room and hurt them.',
          'Nobody else can see it. It leaves no mark that anyone can point to. And the accused was, by definition, somewhere else at the time.',
          { learn: 'law.spectral' },
          'So think about what a defence would even look like. You cannot produce a witness, because there is nothing to witness. You cannot give an alibi, because your body being elsewhere is the whole claim.',
          'There is no possible answer. That is not a flaw in how the court used the evidence. That IS the evidence.',
          { say: 'She sets it down.', who: null },
          'Some ministers said so at the time. Increase Mather wrote that it were better ten suspected witches escape than one innocent person be condemned.',
          'He wrote that in October. Twenty people were already dead.',
        ],
      },
      {
        id: 'counsel', label: 'Did they have lawyers?',
        lines: [
          'No. There was no right to counsel in a capital case in English law at this date, and there were barely any lawyers in the colony anyway.',
          { learn: 'law.nocounsel' },
          'So a seventy-one-year-old woman who is deaf in one ear cross-examines her own accusers, in a packed room, while girls scream and fall on the floor every time she opens her mouth.',
          { say: 'She lets that sit.', who: null },
          'There is a moment in the Nurse trial that I think about a great deal. The jury acquitted her. She was found not guilty.',
          'The room erupted. And the chief justice observed that she had used a particular phrase, and asked the jury whether they had considered it.',
          'They went out again. They came back and convicted her.',
          { learn: 'law.nurseverdict' },
          'She was hard of hearing. She almost certainly did not catch the question when it was put to her in court.',
        ],
      },
      {
        id: 'charter', label: 'Who gave this court its authority?',
        lines: [
          'Now that is the question nobody asks, and it is the best one.',
          'Massachusetts had no legal government between 1689 and May 1692. The old charter had been revoked. The colony had thrown out the royal governor and was running itself on nerve.',
          { learn: 'law.charter' },
          'Sir William Phips arrived with the new charter in May, walked into a colony with jails already full of accused witches, and created a special court to clear the backlog.',
          'Court of Oyer and Terminer — "to hear and to determine". Assembled quickly, out of his own council, with a chief justice who had no legal training.',
          'It had no settled rules of evidence, because it had never sat before.',
          { say: 'She shrugs.', who: null },
          'Every English legal safeguard that would have slowed this down was either not in force yet or had been swept away in the previous three years.',
          'The timing is not incidental. It is close to being the whole answer.',
        ],
      },
      {
        id: 'confess', label: 'Why did anyone confess?',
        lines: [
          'Because it worked.',
          { learn: 'law.confession' },
          'Not one person who confessed to witchcraft was executed in 1692. Not one.',
          'Every single person hanged had refused to confess.',
          { say: 'She counts it off.', who: null },
          'So the court built a machine in which the honest were killed and the liars survived, and then treated the resulting confessions as proof that the whole thing was real.',
          'Fifty-odd people confessed. Every confession made the next accusation easier to believe.',
          'If you want one sentence for what went wrong here, it is that: the court could not tell the difference between evidence and the incentive it had created.',
        ],
      },
      {
        // The war argument, named and attributed, and immediately given the
        // same treatment every other single-cause answer gets in this room.
        // She is the only character permitted to cite a historian, and she
        // does it to show the player that these are positions people hold
        // rather than facts the game is withholding.
        id: 'war', label: 'Did the war have anything to do with it?',
        require: ['fact.mercymaine'],
        lines: [
          { say: 'She sits forward.', who: null },
          'You met somebody from the eastward, then. Good. That is not an accident of the record — it is the record.',
          'The colony had been at war on its northern frontier for four years. Whole settlements burned. Survivors came south with nothing, and a great many of them were girls who went into service in exactly the households that produced the accusations.',
          { learn: ['fact.maine_refugees'] },
          { say: 'She counts it off on her fingers, and it is clearly a thing she has said before.', who: null },
          'And several of the men who sat as magistrates in 1692 had carried responsibility for defending that frontier. It had gone very badly. Some of them had a great deal to answer for and no way to answer it.',
          { learn: ['fact.maine_magistrates'] },
          'Mary Beth Norton made that case in 2002 and it changed the field. Her argument is that these people were not imagining an invisible enemy out of nothing — there was a visible one fifty miles north that they had already failed to stop.',
          { say: 'And then, because she cannot help herself:', who: null },
          'It is a strong argument. It is also not a complete one.',
          'It does not explain why the first three accused were a beggar, a woman who had gone to law against her sons, and an enslaved woman — none of whom had anything to do with Maine.',
          'Every one of the four cases does that. Explains a great deal, and then stops.',
        ],
      },
      {
        id: 'women', label: 'Was there a pattern in who got accused?',
        lines: [
          'Yes. And it is the least comfortable of the four, so people skip it.',
          'The overwhelming majority of the accused were women. That much is not in dispute.',
          'What Carol Karlsen showed in 1987 is that a striking number of them were women who held property, or stood to inherit it, in a line where there was no son or brother it would otherwise have gone to. Widows without heirs. Daughters without brothers. Women who had already been to court, and won.',
          { learn: ['fact.womenproperty'] },
          {
            if: { knows: ['fact.nurseland'] },
            then: [
              { say: 'She raises an eyebrow.', who: null },
              'You have been to the Nurse farm. Then you have stood in a house held by a woman in exactly that position, and you can decide for yourself how much it explains.',
            ],
            else: [],
          },
          'The argument is not that anybody sat down and planned to seize an estate. It is quieter than that: a society uneasy about women outside the ordinary line of inheritance had a word ready for them, and in 1692 that word became actionable.',
          { say: 'She shrugs.', who: null },
          'And then it does what all four of them do. It stops. It does not explain Giles Corey, who was a man of eighty-one, or George Burroughs, who was a minister.',
        ],
      },
      {
        id: 'ergot', label: 'Was it ergot poisoning?',
        lines: [
          { say: 'She sighs, but she is not annoyed. She has had this one a thousand times.', who: null },
          'Ah. The bread.',
          {
            // A student who stood in that field and held the spurs in March
            // arrives here certain they have solved it. She takes them
            // seriously first, and then takes it apart, which is the only
            // order in which the lesson lands.
            if: { knows: ['fact.spurredrye'] },
            then: [
              { say: 'You tell her about the man at the rye field. The wet spring. The black spurs he keeps in a twist of cloth. The cows that slipped their calves.', who: null },
              { say: 'She puts her pen down and listens to the whole of it.', who: null },
              'That is a very good piece of fieldwork and I want you to notice that you did it before you knew what it was for.',
              'Yes. That is ergot — Claviceps purpurea, a fungus that replaces the grain. It grows in wet springs, in low ground, exactly where he told you. It causes convulsions in people and abortion in cattle, which is why his cows slipped.',
              { learn: 'law.ergot_claim' },
              'He could not possibly have known that. Nobody could, until 1976.',
              { say: 'She lets you enjoy it for a moment.', who: null },
              'Now. Three problems.',
            ],
            else: [
              'The idea is that rye infected with a fungus, ergot, caused hallucinations and convulsions. It got published in Science in 1976 and it has never gone away, because it is tidy.',
              { learn: 'law.ergot_claim' },
              'Three problems.',
            ],
          },
          'One: the symptoms do not match. Ergotism produces gangrene or convulsions with vomiting and diarrhoea. The afflicted girls had none of that, and they recovered completely.',
          'Two: whole households ate from the same bread. Only certain people in those households were afflicted, and the afflicted were overwhelmingly girls and young women in a handful of families.',
          'Three, and this is the one that finishes it —',
          { say: 'She taps the table.', who: null },
          'Even if every girl in Salem Village had been poisoned, it tells you nothing about WHO they named.',
          'It does not explain why the accusations follow a land dispute. It does not explain why three sisters from one Topsfield family were all taken. It does not explain the court.',
          { learn: 'law.ergot_rebut' },
          {
            if: { knows: ['fact.atetherye'] },
            then: [
              { say: 'And you already have the thing that finishes it, because he told you himself.', who: null },
              'He said half the village ate off that field. Half the village. And how many people were afflicted?',
              { say: 'A handful of girls and young women, in a handful of related households.', who: null },
              'You went and got the evidence, and the evidence does not do what the theory needs it to do. That is not a failure. That is the job.',
            ],
            else: [],
          },
          'A satisfying single cause that explains one symptom and none of the pattern is usually the wrong answer. That is worth more to you than anything else I have said today.',
        ],
      },
    ],
    farewell: ['Come back if you think of a better question. People rarely do.'],
  },

  descendant: {
    id: 'descendant',
    name: 'Ellen Towne-Putnam',
    spec: { flesh: FLESH.fair, hair: HAIR.grey, coat: CLOTH.murrey, under: CLOTH.denim },
    greet: [
      {
        if: { notSpokenTo: ['descendant'] },
        then: [
          { say: 'A woman in her sixties, sitting on one of the benches with a coffee, entirely at home.', who: null },
          'You look like you have had a day.',
          { say: 'She shifts along to make room.', who: null },
          'Sit down. That is what they are for. People forget.',
        ],
        else: ['Sit down again if you like.'],
      },
    ],
    topics: [
      {
        id: 'who', label: 'Do you come here a lot?',
        lines: [
          'Couple of times a year.',
          { say: 'She nods at the bench you are sitting on.', who: null },
          'That one is family.',
          'And so is the man who signed the complaint against her.',
          { learn: 'reck.bothsides' },
          { say: 'She lets you work it out.', who: null },
          'Towne on my mother\'s side. Putnam on my father\'s. Rebecca Nurse was a Towne.',
          'Three hundred years is a lot of weddings. Half of Essex County is in the same position and most of them have no idea.',
        ],
      },
      {
        id: 'feel', label: 'How do you feel about that?',
        require: ['reck.bothsides'],
        lines: [
          { say: 'She thinks about it properly, which not everyone does.', who: null },
          'People want me to say it is agony. It is not agony. It was three hundred years ago and I never met any of them.',
          'What it does do is stop me being able to pick a side and feel good about it.',
          { learn: 'reck.noside' },
          'Because if I say "the Putnams were monsters" — well. My grandfather was a Putnam and he was a kind man who fixed my bicycle.',
          'And if I say "it was just how things were back then" — no. Twenty people. My relative among them. That will not do either.',
          { say: 'She drinks her coffee.', who: null },
          'So I sit here twice a year and I do not resolve it. I have come to think that is the correct amount of resolved.',
        ],
      },
      {
        id: 'ann', label: 'What about Ann Putnam?',
        lines: [
          'The girl. Twelve years old.',
          'She named more people than almost anybody, including my relative on that bench.',
          { say: 'She turns her cup around.', who: null },
          'And in 1706 she stood up in the village church while the minister read out her apology over her head, in front of everybody, and she was the only one of them who ever did.',
          { learn: 'reck.annapology' },
          'It is on paper. You can read it.',
          'She never married. Both her parents died within two weeks of each other when she was nineteen and she raised nine younger brothers and sisters on her own. She died at thirty-seven.',
          { say: 'She looks over at the wall.', who: null },
          'People ask me if I forgive her. I think that is a strange question to ask a stranger about a child who has been dead for three hundred years.',
          'What I will say is that she is the only one who put her name to being wrong. Nineteen judges and jurymen and ministers had the same chance.',
        ],
      },
      {
        id: 'lesson', label: 'What should I take from this?',
        require: ['reck.noside'],
        lines: [
          { say: 'She laughs.', who: null },
          'Oh, no. I am not doing that for you.',
          'Every school group that comes through here wants the sentence at the end. "And the lesson of Salem is—" and then something about tolerance.',
          { say: 'She shakes her head.', who: null },
          'Here is the only thing I will give you.',
          'Nobody involved in this thought they were doing something evil. The judges thought they were protecting the colony. The girls were frightened. The neighbours who testified had genuinely had a bad year and genuinely wanted to know why.',
          'It was ordinary people, following the rules they had, in a bad situation, and the result was twenty dead.',
          { learn: 'reck.ordinary' },
          'If you leave here thinking they were stupid or wicked, you have learned nothing and you are more like them than you were when you came in.',
          { say: 'She stands up and brushes off her coat.', who: null },
          'Right. What do you think caused it? Not me. You.',
        ],
      },
    ],
    farewell: ['Go on. Have a think.'],
  },
};

/** Portrait moods, so a character can visibly harden between chapters. */
export const MOOD_BY_CHAPTER = {
  march: 'neutral',
  june: 'hard',
  september: 'hard',
};
