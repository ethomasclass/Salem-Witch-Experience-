# Portrait source images

Drop the full-size generated portraits here, straight out of the image
model. **Do not downsample or recolour them by hand** — the build does
both, and it needs the originals to do it well.

Naming, because the loader finds files by character id and mood with no
mapping table in between:

```
tituba-neutral.png     tituba-hard.png
parris-neutral.png     parris-hard.png
annjr-neutral.png      annjr-hard.png
mercy-neutral.png      mercy-hard.png
marywarren-neutral.png marywarren-hard.png
ingersoll-neutral.png  ingersoll-hard.png
nurse-neutral.png
francis-neutral.png
nora-neutral.png
archaeologist-neutral.png
historian-neutral.png
descendant-neutral.png
```

The ids are the keys in `src/content/npcs.js`. Anything here that doesn't
match an id is ignored by the build rather than erroring, so a stray file
is harmless.

These stay full-size and checked in on purpose: they are the editable
source. If a face needs redoing later you want the 1024px original, not a
64px thumbnail. The build reads from here and writes the small quantized
versions into the bundle; nothing in this folder ships to a student.

The prompts that produced them are in `docs/PORTRAIT-PROMPTS.md`.

---

## Building

```sh
node tools/build-portraits.mjs             # writes src/content/portraits.js
node tools/build-portraits.mjs --contact   # also a 4x contact sheet
node tools/build-portraits.mjs --raw       # skip the palette quantize, to compare
```

The tool downsamples 2048 -> 64 by repeated halving (a single drawImage that
big makes Chromium pick a cheap filter and the face turns to porridge), then
snaps every pixel to that character's own ramps from `npcs.js` using a
luminance-weighted match. Output lands as data URIs in
`src/content/portraits.js`, about 3 KB per face.

Which mood shows is decided by chapter, in `main.js`: `neutral` in the
memorial and March, `hard` from June on. `titubaJail` and `nurseJail` are
separate cast entries but the same two faces, so they alias.
