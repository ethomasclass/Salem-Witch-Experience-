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
- **A notebook** recording everything learned and who it came from, exportable
  as plain text for an assignment.
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
- **A goal tracker** in the corner, one step at a time with a progress count,
  and the standing question underneath once the memorial has raised it.
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
student in front of a primary source, so they copy it down. Each is
knowledge-gated like a conversation topic, so copying is the reward for the
conversation work rather than a scavenger hunt, and several of them
contradict the person who told the player about them.

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
game in one self-contained file, about 340 KB. Download it and double-click
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
