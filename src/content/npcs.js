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
                'Of course he did. A man keeps an ordinary, he keeps everything else that passes through it too.',
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
        if: { notSpokenTo: ['parris'] },
        then: [
          'You will forgive me. I am at my sermon.',
          { say: 'There are three sheets in front of him. Two are crossed through.', who: null },
          'Every week I must find something to say to people who have decided in advance not to hear it.',
        ],
        else: ['Yes? I am still at it.'],
      },
    ],
    topics: [
      {
        id: 'girls', label: 'Your daughter and your niece.',
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
        id: 'firewood', label: 'The woodpile outside is nearly empty.',
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
        ],
      },
      {
        id: 'deed', label: 'They gave you the parsonage outright?',
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
        id: 'congregation', label: 'What will you preach on Sunday?',
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
        if: { notSpokenTo: ['annjr'] },
        then: [
          { say: 'A girl of about twelve, sitting very straight, mending something she has clearly been given to keep her occupied.', who: null },
          'You are the one who has been walking about the village.',
          'Mother says I\'m not to talk to people I don\'t know.',
          { say: 'She keeps talking.', who: null },
          'What do you want to know?',
        ],
        else: ['You came back.'],
      },
    ],
    topics: [
      {
        id: 'girls', label: 'The girls at the parsonage.',
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
        id: 'mother', label: 'Your mother.',
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
        id: 'topsfield', label: 'There is a boundary stone in the woods.',
        require: ['clue.marker'],
        lines: [
          { say: 'She puts the mending down entirely.', who: null },
          'You went up there.',
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
        ],
      },
      {
        id: 'mercy', label: 'The young woman outside.',
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
        if: { notSpokenTo: ['mercy'] },
        then: [
          { say: 'She is hauling water and does not put the bucket down.', who: null },
          'If you are looking for Mr. Putnam he is not here.',
          'If you\'re here to stare at the girls, the parsonage is that way, and you\'re not the first today.',
        ],
        else: ['Still here, then.'],
      },
    ],
    topics: [
      {
        id: 'news', label: 'What are people saying?',
        lines: [
          { say: 'She sets the bucket down after all.', who: null },
          'What are they not saying.',
          'Goodwife Sibley had a cake made. Rye meal and the girls\' own water, baked and given to the dog, to make the witch cry out.',
          { learn: ['fact.witchcake'] },
          'Tituba made it, because Goodwife Sibley told her to and Tituba is not in a position to say no to anybody.',
          'And within the week the girls began giving names.',
          { say: 'She picks the bucket back up.', who: null },
          'You may draw your own line between those two things. Everyone else here has.',
        ],
      },
      {
        id: 'maine', label: 'You are not from here.',
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
        id: 'putnams', label: 'What is it like in that house?',
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
        if: { notSpokenTo: ['ingersoll'] },
        then: [
          'Sit where you like. It is early yet.',
          { say: 'A heavy man of about sixty, wiping something that is already clean.', who: null },
          'I keep the ordinary — that\'s what we call a tavern — and I\'m a deacon of the church. Which means I hear everything twice. Once sober and once not.',
        ],
        else: ['Back for more, are you.'],
      },
    ],
    topics: [
      {
        id: 'news', label: 'What is the talk?',
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
          'That was not a fortnight ago. And this week the girls have started giving names.',
          'I am not saying the one made the other. I am saying I keep an ordinary, and I have watched a great many things start in this room, and they all start about that quick.',
        ],
      },
      {
        id: 'parsonage', label: 'Mr. Parris.',
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
        id: 'accounts', label: 'Your account book.',
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
        ],
      },
      {
        id: 'strangers', label: 'You have had visitors.',
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

  woodman: {
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
          { learn: 'fact.factions' },
        ],
      },
    ],
  },
};

/** Portrait moods, so a character can visibly harden between chapters. */
export const MOOD_BY_CHAPTER = {
  march: 'neutral',
  june: 'hard',
  september: 'hard',
};
