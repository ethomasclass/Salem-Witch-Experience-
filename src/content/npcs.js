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
          'And in October they elected a village committee out of the very men who have opposed me from the first day, and that committee has not collected the rate for my salary since.',
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
          'Mother says I am not to talk to people I do not know.',
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
          'I have seen them. Everyone has seen them, they do not hide it any more.',
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
          'More than one. I am not going to say how many to a stranger.',
          { learn: ['fact.annsr'] },
          'She wakes in the night sometimes and says their names, and my father tells me to go back to bed.',
          { say: 'She looks at the door as if checking it.', who: null },
          'In this house we do not say that a thing is nobody\'s fault. If a child dies there is a reason, and if there is a reason there is somebody it belongs to.',
          'That is what I have been taught. I do not know another way to think about it.',
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
          'If you are looking to gawp at the girls, the parsonage is that way and you are not the first today.',
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
          'I do not sleep well. That is the part they complain of.',
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
          'I am a covenanted member of the church in Salem Town. I walk in when I am able. I am not always able now.',
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
          'Everyone here has something between them and somebody. It has never signified.',
        ],
      },
      {
        id: 'seating', label: 'The seats in the meetinghouse.',
        require: ['clue.seating'],
        lines: [
          'Ah. You have looked at the chart.',
          'They seat us by what we are worth. Rates paid, land held, age, standing. The committee sits and decides it and then it is nailed up where everyone can read it.',
          { learn: ['fact.factions'] },
          'And every Sabbath, twice, the whole village sits down in the exact order of who matters.',
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
          'I keep the ordinary and I am a deacon of the church, which means I hear everything twice — once sober and once not.',
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
          'They have not collected his rate since. Nor sent his wood.',
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
};

/** Portrait moods, so a character can visibly harden between chapters. */
export const MOOD_BY_CHAPTER = {
  march: 'neutral',
  june: 'hard',
  september: 'hard',
};
