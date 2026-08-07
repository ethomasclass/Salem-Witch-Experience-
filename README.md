# Salem Village, 1692

A top-down exploration game for high school US History. You walk a small
Puritan village three times across one year, talk to the people living in it,
and travel forward occasionally to ask historians what you just saw.

You cannot change anything. You walk around, talk to people, notice things,
and go home.

The full design is in [`docs/DESIGN.md`](docs/DESIGN.md).

---

## Status

**Chapter zero (the memorial, present day) and chapter one (March 1692) are
playable.** The remaining chapters are designed but not built.

| | |
|---|---|
| Audience | High school, general US History |
| Runtime, when complete | ~32 min |
| Runtime, current build | ~14 min |
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
- **Gossip as currency** — carrying a rumour from one house to another opens a
  topic that was not there before.
- **Source-sensitive replies** — characters react to *who* told you something,
  not only to what you know.
- **A notebook** recording everything learned and who it came from, exportable
  as plain text for an assignment.
- **Three interpretive panels** at the memorial giving the baseline a student
  needs — what happened, how the court worked, and the four things historians
  still argue about. The last one is the only place the game asks its question
  out loud.
- **A goal tracker** in the corner, one step at a time, with the standing
  question underneath it once the memorial has raised it.
- **Sound**, synthesised at runtime — footsteps that change with the ground,
  per-character dialogue blips, wind and crows in 1692, traffic in the
  present. One mute button, and the setting is remembered.
- **A working farm village**: barn, hayrick, orchard, dry-laid stone walls,
  free-ranging swine, cattle, sheep, hens, and four more villagers to talk to.

### What is not built yet

June 1692, September 1692, and the three present-day interludes. The player
character is currently a pure observer; the single "noticing" moment belongs
to the September chapter. No portrait mood variants are in use yet.

---

## Running it

### For a classroom — the single file

**[`dist/salem-village-1692.html`](dist/salem-village-1692.html)** is the whole
game in one self-contained file, about 150 KB. Download it and double-click
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
| Talk / examine / advance | Z, Space or Enter |
| Back out of a conversation | X or Esc |
| Notebook | N |

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

Mercy Lewis's thread in this build is settler-side only. This needs closing
before the June chapter, which is where the frontier material does its real
work.

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
    maps.js           the village, its interiors, and the road
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
