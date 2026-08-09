# Salem Village, 1692

A top-down exploration game for high school US History. You walk a small
Puritan village three times across one year, talk to the people living in it,
and travel forward occasionally to ask historians what you just saw.

You cannot change anything. You walk around, talk to people, notice things,
and go home.

**[`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md)** is the teacher's route through
the whole game — every goal in order, where each item is, and what to do when
a class gets stuck.

The design is in [`docs/DESIGN.md`](docs/DESIGN.md); the chapter-by-chapter
plan it was built from is in [`docs/OUTLINE.md`](docs/OUTLINE.md).

---

## Status

**The whole game is playable, start to finish.** Seven chapters: the
memorial, March 1692, the parsonage dig, June 1692, the trial papers,
September 1692, and back to the memorial.

| | |
|---|---|
| Audience | High school, general US History |
| Runtime | ~32 min |
| Platform | Browser, no install, no accounts |
| Look | GBA-era Pokémon, oblique projection |

### What is in this build

- **The Salem Witch Trials Memorial**, present day: twenty benches carrying the
  real names, means of execution and dates; the threshold stones, whose
  inscriptions are cut off mid-sentence by the wall; and Nora, seventeen,
  working a summer job.
- **The village**: meetinghouse, parsonage, Ingersoll's ordinary, the Nurse
  homestead, the Putnam house, the woods, and the road to Salem Town.
- **Six characters** with topic-based conversations: Tituba, Rev. Samuel
  Parris, Ann Putnam Jr., Mercy Lewis, Rebecca Nurse, Nathaniel Ingersoll —
  plus four ambient villagers who say their piece and go back to work.
- **Five environmental clues**: the meetinghouse seating chart, the parsonage
  woodpile, the boundary marker, Ingersoll's account book, and the five-mile
  walk to Salem Town.
- **A brook through the north woods**, with one narrow ford. Colonial
  boundaries followed water because water is the one line in a forest two
  parties can agree on without a survey — so the disputed Topsfield line runs
  along it, and the marker stone stands on the bank of the thing being argued
  over.
- **Gossip as currency** — carrying a rumour from one house to another opens a
  topic that was not there before.
- **A farmer at the rye field** who describes a wet spring, black spurs on the
  heads of his rye that he keeps in a twist of cloth, eating the harvest
  anyway because there was nothing else, and two cows that slipped their
  calves. He does not diagnose anything, because nobody could have — the
  ergot hypothesis is Caporael, 1976. A student who found him gets told by
  the historian later that it was a good piece of fieldwork *and* has it taken
  apart, using the farmer's own words.
- **Furnished interiors** — hearths, beds, desks, dressers, a spinning wheel,
  a woodpile — and an archive reading room that actually looks like one: wall
  of shelves, coloured spines, reading lamps. Indoor maps render at 2× zoom,
  so about ten tiles by seven are visible at once and set pieces have to be
  grouped rather than spread.
- **Contradictions that land.** When a second account arrives that cannot both
  be true with one you already hold, whoever you are standing in front of says
  so, once. Both accounts go into a third notebook tab with who told you each.
  Six pairs, all of them seams that were already in the writing.
- **A position you can take.** On any disputed claim you may mark which source
  you find more credible — or that you cannot tell, which is a real answer and
  survives into the export. Nothing is scored.
- **People who remember you.** Characters know whether you met them *before*
  all this, not merely whether you have met. Rebecca Nurse in the June jail
  either knows your face from her own kitchen in March or does not, and the
  scene is a different scene either way.
- **Benches that remember.** On the last visit to the memorial, the stones of
  people you actually met or read about say so. The rest stay silent rather
  than scolding you for what you missed.
- **Source-sensitive replies** — characters react to *who* told you something,
  not only to what you know.
- **A notebook filed by who told you.** Headings, closed by default, one
  screen of them — a finished game holds about ninety entries, which as one
  flat list was seven screens of unbroken prose. Filed by source rather than
  by date on purpose: the axis a notebook is organised on is the thing it
  teaches, and this one teaches that every fact in it arrived through a
  particular person who had a particular reason to say it. The plain-text
  export carries the same grouping, with continuous numbering.
- **The papers as a collection**, not a bibliography: fifteen slots, all
  fifteen always visible, each drawn from the document's own evidence type —
  a ledger, a fair clerk's hand with one signature doing the work, thirty-nine
  uneven hands, or something small and dense that was never meant to be read
  by you. Empty slots show what is still out there. Selecting one **reopens
  it** — until now a document could be read exactly once, at the table it was
  found on.
- **An ending that reads your own path back to you** before it asks its
  question — who you met alive, whether you told Rebecca Nurse the date and
  what she said, whether a twelve-year-old looked at you in September, and
  which of your sources you believed when they disagreed. Built entirely
  from what you did. It never scores, never says what you missed, and never
  says whether you were right.
- **Three interpretive panels** at the memorial giving the baseline a student
  needs — what happened, how the court worked, and the four things historians
  still argue about. The last one is the only place the game asks its question
  out loud.
- **A cold open.** Five cards before the title fades in: the death toll, how
  it was done, that it took ten months, and that nobody has ever agreed on
  why. Skippable, and skipped automatically on Continue. A student who walks
  into the memorial cold reads twenty bench names as decoration.
- **A title screen that is a picture of the place**, not a gradient — the
  memorial itself, drifting slowly, with Nora already sitting on the wall.
- **A goal tracker** in the corner that asks for **one thing at a time**, with
  a progress count and the standing question underneath. A four-part goal
  names only the part still outstanding, and it takes that line from the same
  waypoint the edge chevron points at, so the arrow and the words cannot
  disagree.
- **People who tell you where to go.** If the person you were talking to knows
  something about what you still owe, they say it as you leave — once each,
  in their own voice, and only if they would plausibly know. It is deliberately
  patchy: a pointer on every goodbye would train students that the last line
  of every conversation is machinery, and they would stop reading it.
- **An edge chevron** pointing toward the current goal, which vanishes as soon
  as the target is on screen. Deliberately not a minimap — a map in the corner
  makes players watch the corner instead of the village.
- **An interaction prompt** over the player naming the verb: talk, look, read.
- **Drawn portraits** for the twelve speaking characters, in two moods —
  everyone the player meets again after March wears a visibly harder face.
  Quantized to each character's own sprite ramps so the two cannot drift
  apart, and any that fails to decode falls back to the procedural face.
  Sources and prompts: [`art/portraits/`](art/portraits/) and
  [`docs/PORTRAIT-PROMPTS.md`](docs/PORTRAIT-PROMPTS.md).
  **No likeness survives of anyone in this story; every face is imagined,
  and the game says so on its title screen and in the student's export.**
- **Sound**, synthesised at runtime — footsteps that change with the ground,
  per-character dialogue blips, wind and crows in 1692, traffic in the
  present, and a thinner, colder wind with almost no crows in September —
  a village that has lost a fifth of its households should not sound like
  the one the player walked through in March. One mute button, and the
  setting is remembered.
- **A working farm village**: barn, hayrick, orchard, dry-laid stone walls,
  free-ranging swine, cattle, sheep, hens, and four more villagers to talk to.
- **A village that moves.** The livestock wander on a loose tether around
  where they started — loose enough to let the swine cross a boundary wall
  into a neighbour's field, which is the exact grievance Rebecca Nurse
  describes. Villagers who are working loop on the spot. Every chimney draws
  woodsmoke **except the parsonage's**, whose fire is banked low: a student
  who notices the difference has found the salary dispute without reading a
  word about it.
- **And a village that empties.** By September, visibly half as much
  livestock, a cart standing in the road with nobody loading it, and hay
  nobody is coming back for. The sheriff's inventory, told without a
  document.

### The document collection

Fifteen real surviving documents. The player never picks one up — they are a
student in front of a primary source, so they copy it down. Several of them
contradict the person who told the player about them.

**A person tells you about a paper before the paper exists.** Eleven of the
fifteen are unlocked by a named character in conversation, and until that
conversation happens the sheet is not drawn at all — so there is no table to
stand at hopefully, and no "not yet" message to argue with. Once somebody has
named it, the paper is there and lit until it is read. Where a document has a
scenery object attached — the account book, the seating chart — the object and
the paper are one interactable: examining it plays the observation and then
opens the reader on the same keypress.

More than one person can name the same paper, and the notebook records
whichever one the player actually heard it from. Four documents stay
unannounced, as rewards for wandering: the sheriff's inventory in the road
and the three papers on the memorial grass at the end.

While a document is still locked, the goal in the corner names the **person**
to ask rather than the table it will eventually be on.

The reader shows original text beside a plain modern gloss, with the citation
**and a fidelity label**: `close` follows the surviving document, and
`reconstructed` is written in the form of the record without transcribing one
specific sheet. That distinction is shown to the player on purpose — a
student noticing that some sources are transcriptions and some are
reconstructions is a student doing source criticism.

**Every document is an excerpt that fits one screen with no scrolling.** A
source a student scrolls through is a source a student skims, and fifteen of
them at three screens apiece is longer than the rest of the game put
together. Anything cut is marked `[…]` — silently trimming a document and
still calling it the document would teach exactly the wrong habit here.

`node tools/check-fit.mjs` measures all fifteen against the real column box
with the real fonts and fails if any of them overflow. Run it after editing
`src/content/documents.js`; it needs the game served locally.

`node tools/check-maps.mjs` checks that every document has a paper sprite a
player can actually see, and that everything can be walked to. It exists
because two documents shipped correctly defined, correctly gated, reachable
— and invisible, standing on empty tiles.

`node tools/check-play.mjs` plays each chapter the way the most thorough
possible student would — take every topic whose conditions are met, examine
everything, copy every document whose gate is open, repeat until nothing new
lands — and asks whether the chapter's own steps come out done. It exists
because person-gating moved the critical path off the map and into the
dialogue trees, where nothing was checking it: a document gated on a flag
taught only by a topic that is itself unobtainable is a chapter no class can
finish, and every individual piece of it looks correct. Verified by deleting
one `learn` and confirming it names the chapter and the step.

`node tools/check-chapters.mjs` starts at the title screen, presses through
the cold open, and then walks every chapter's exit tile to make sure the
chapter actually advances. It exists because the exit from the memorial once
moved the player into 1692 without setting the chapter, which quietly made the
game unfinishable — and every test at the time set the chapter directly, so
none of them touched the one broken line. This checker is only allowed to
change chapter by walking through a warp, and it looks for exits by their
*gate* rather than by the `setChapter` it is testing for. Both restrictions
are load-bearing: the first version searched for warps that already carried
`setChapter`, so deleting `setChapter` made the exit vanish from the search
and the checker passed with the original bug reintroduced.

> **Before this goes in front of a class**, check every transcription against
> Rosenthal's *Records of the Salem Witch-Hunt* and the Salem Witch Trials
> Documentary Archive. Both are cited on screen.

### Still to do

The Wabanaki gap below, and a real classroom playtest — the timings are
estimates.

---

## Running it

### For a classroom — the single file

**[`dist/salem-village-1692.html`](dist/salem-village-1692.html)** is the whole
game in one self-contained file, about 548 KB. Download it and double-click
it. No server, no install, no network. Email it, put it on a shared drive, or
upload it to Canvas or Google Classroom as a file.

That file is checked in deliberately rather than gitignored, so a teacher can
download one thing from GitHub and have a working game. Rebuild it after any
change to `src/`:

```sh
node tools/bundle.mjs
```

### For editing the source

The game is plain HTML, CSS and ES modules — no build tooling, no
dependencies. In this form it **must be served over http**, because browsers
block ES modules loaded from `file://`:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static host works for a shared link. GitHub Pages is the obvious one.

### Controls

| | |
|---|---|
| Move | Arrow keys or WASD |
| Run | Hold Shift — or just keep walking, it speeds up on its own |
| Talk, examine, advance, copy a document | Z, Space or Enter |
| Close a reader, back out of a conversation | X or Esc |
| Notebook | N — then ← → for its three tabs |
| Take a position | On the disputes tab: 1, 2, or 3 |

**Everything is one press of Z.** Examining a thing you can see (a stone, a
woodpile, a chart) records it. Opening a document copies it. The notebook has
a tab for each, switched with the arrow keys.

On a touchscreen Chromebook or tablet, on-screen controls appear
automatically.

---

## Classroom notes

- **No accounts and no data collection.** Progress is saved to `localStorage`
  and never leaves the student's browser. This is deliberate, for COPPA and
  FERPA reasons — see the constraint in the design doc.
- **The exit artifact.** "Copy my notes" produces plain text: every piece of
  evidence the student gathered, each tagged with where it came from, plus the
  question to answer. It is written to be pasted into an assignment.
- **Sourcing is the point.** Two students can finish with different notebooks
  and both be right about the facts, because characters contradict each other
  and the game never adjudicates. The disagreement is the lesson.
- **Nothing violent is depicted.** Every atrocity in the later chapters
  arrives as something a person tells you, standing in their own kitchen.
- **Dorothy Good is in the jail**, four years old, on no goal list, found
  only by students who look. Nothing is depicted: she is an ordinary small
  child sorting straw in a cellar, which is worse than any description of
  one would be. Read her scene before you run this.
- **Reading load.** The game holds about 12,500 words. A student who sees
  most of it reads at roughly 240 words a minute for half an hour. The
  prose is deliberately plain — grade 2.4 in 1692, 3.4 in the present, at
  around eight words a sentence — but the *volume* is real, and it is worth
  knowing when you plan the period.
- **Sound can be switched off** from the button under the game, and the
  choice is remembered. Nothing plays until a key is pressed.

---

## Historical grounding

The game opens at the memorial on Charter Street, dedicated in 1992. The
threshold inscriptions really do run into the wall and stop mid-sentence, and
the player really is standing on them.

The March chapter is set in the first week of March 1692, deliberately: Betty
Parris and Abigail Williams have been ill since midwinter, Doctor Griggs has
already suggested the evil hand, Mary Sibley's witch cake was baked days ago
— and nobody has been arrested yet.

Every grievance in the village is fully loaded and completely ordinary. That
is the whole reason the chapter works.

Real people are used with their documented positions. The four causal threads
follow Boyer & Nissenbaum (*Salem Possessed*), Norton (*In the Devil's
Snare*), Karlsen (*The Devil in the Shape of a Woman*), and the legal history
of spectral evidence and the lost charter. Primary sources are free through
the Salem Witch Trials Documentary Archive and Bernard Rosenthal's *Records of
the Salem Witch-Hunt*.

### Known gap, carried forward from the design doc

> The war-trauma material is told entirely as settler trauma unless a Wabanaki
> voice is in it. Work from published interviews or actual consultation rather
> than writing that character from scratch.

Mercy Lewis's June thread — the one where she describes what she sees when
it takes her, and where the game connects the Maine raids to the accusations
— is told entirely from the settler side. This is the biggest remaining
weakness in the writing and it needs a Wabanaki voice before this is used
widely.

---

## Code layout

```
index.html            page shell, touch controls, export buttons
tools/bundle.mjs      concatenates the modules into one standalone file
dist/                 the built single-file game (checked in on purpose)
src/
  palette.js          every colour in the game, with the reasoning
  main.js             game loop, input handling, mode switching
  engine/
    pixels.js         pixel-art primitives (seeded noise, dither, blit)
    art-ground.js     terrain tiles, generated in 16 edge variants each
    art-props.js      buildings, trees, and the examinable objects
    art-actors.js     character sprites and dialogue portraits
    world.js          map building, collision, camera, depth sorting
    dialogue.js       the script interpreter and topic menus
    state.js          knowledge flags, sources, save/load
    ui.js             dialogue box, choices, notebook, goals, title
    audio.js          runtime-synthesised sound; no audio files
  content/
    maps.js           every map, and how the village is dressed per chapter
    documents.js      the fifteen primary sources, with fidelity labels
    npcs.js           the cast and everything they say
    clues.js          what the player finds by looking
    knowledge.js      flag -> plain English, for the notebook and export
    objectives.js     the goal tracker, and the standing question
    directions.js     what each character says about where to go next
    disputes.js       the contradiction pairs the notebook tracks
    reckoning.js      the closing scene, assembled from what you did
    portraits.js      drawn faces, embedded as data URIs
```

All art is drawn procedurally at boot — there are no image assets to load,
which keeps the whole game a handful of text files and avoids a filtered
school network blocking a sprite sheet.

Two things worth knowing before editing:

- **Projection.** Buildings show a roof *and* a front facade in the same
  image. Props sort against the player by their baseline every frame. Break
  that sort and the village flattens into a diagram.
- **Knowledge is never a bare boolean.** Every flag remembers who the player
  heard it from, which is what makes `bySource` replies possible.
