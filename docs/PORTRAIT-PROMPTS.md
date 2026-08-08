# Portrait prompts

Ready-to-paste prompts for generating the dialogue portraits with an image
model (these were written for Gemini's image model, "Nano Banana", but they
work anywhere).

**Paste one whole block per message.** Do not paste the template with slots
in it and do not batch two characters into one request — the follow-up
"harden the expression" edit has to be anchored to a single image.

---

## Before you start

**Generate at 1024×1024, square.** Never ask for 64×64 directly; models
produce mush at small sizes. The downsample to 64×64 happens afterwards,
with nearest-neighbour or box sampling — never bicubic — followed by a
quantize onto the ramps below. Expect the model to miss the palette; the
quantize pass is what makes twelve portraits look like one game instead of
twelve AI images.

**Only these characters need portraits.** The ambient villagers ("a man
splitting wood", "a woman at the well") say one thing and go back to work,
and the procedural portrait is fine for them.

**The palette lines are not decoration.** Each is the exact 3-shade ramp the
character's walking sprite already uses, pulled from `src/content/npcs.js`.
Keeping them matched is what stops the portrait and the sprite looking like
two different people.

---

## The two-step flow

1. Paste the character's block. Regenerate until the face is right.
2. Then, **uploading that image**, paste the hardening edit at the bottom of
   this file. That gives you the same person in September rather than a
   second, unrelated character.

---

## A note before you generate faces for these people

No likeness survives of Tituba, Rebecca Nurse, Ann Putnam Jr., or anyone
else in 1692 here. A generated portrait is an invention shown to a student
as a real person, which is exactly the problem the documents' `fidelity`
labels already handle so carefully. Whatever you generate should carry the
same honesty somewhere the player can see it: no likenesses survive, these
faces are imagined.

**Tituba especially.** Contemporary records describe her as "Indian"; the
familiar depiction of her as an African woman is a nineteenth-century
invention that has stuck. The skin ramp below is the one currently in the
game. Whether to change it is a deliberate decision worth making yourself
rather than letting an image model make it for you.

---

# 1692

## Tituba

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: An adult woman in her thirties, enslaved in a minister's household
in a small farming village in Massachusetts in 1692. Dark hair almost
entirely covered by a plain white linen coif tied under the chin. Coarse
undyed wool bodice, plain linen collar. Tired and guarded but entirely
self-possessed — she is not frightened and she is not smiling. She is
watching you and deciding what to say.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #a9784f #8a5e3d #6b472d
    hair:  #3b3b3e #2b2b2e #1e1e21
    cloth: #b0a894 #978f7d #7c7566
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking slightly past the viewer.
- Plain 1690s New England working dress. NO black-hat-and-buckle
  costume-shop Puritan clothing.
- No text, no border, no watermark, no signature, no frame.
```

## Rev. Samuel Parris

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A man of about forty, a village minister. Clean-shaven, dark brown
hair to the collar. Black wool coat with a white linen falling band at the
throat. His face is drawn and aggrieved — a man who is certain he is owed
something and has been saying so for two years.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #4a3b2e #382c22 #271e17
    cloth: #3e3c3d #312f30 #242223
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking slightly past the viewer.
- Plain 1690s ministerial dress. The white band at the throat is the only
  bright thing in the image. NO buckled hat, NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

## Ann Putnam Jr.

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A girl of twelve. Round-faced, brown hair mostly under a plain
linen coif with a few strands escaping. Sadd-green wool bodice, linen apron
strap at the shoulder. Ordinary and slightly bored — she looks like
somebody's kid, because she is. Nothing about her should look sinister.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Child proportions: larger head relative to shoulders, softer jaw.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #6b5238 #54402b #3e2f20
    cloth: #5f6647 #4d533a #3c412e
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking slightly past the viewer.
- Plain 1690s village dress. NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

## Mercy Lewis

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A young woman of about seventeen, a servant in a farming
household. Auburn hair under a plain linen coif. Undyed wool bodice, russet
skirt, linen apron. Watchful and a little too still. She was orphaned by
frontier raids in Maine as a child and it is behind her eyes without being
written on her face.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #7d4b32 #633a26 #4a2b1c
    cloth: #b0a894 #978f7d #7c7566
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking slightly past the viewer.
- Plain 1690s servant's dress. NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

## Rebecca Nurse

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A woman of seventy-one. White hair entirely under a plain linen
coif. Deeply lined face, slightly stooped shoulders. Murrey (dark
brownish-red) wool bodice with a linen collar. She is unwell and it shows,
but she is calm and completely unafraid. A woman of standing in her church
who has never in her life been accused of anything.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Elderly proportions: lined face, softer jaw, shoulders slightly lower
  in frame than a younger character.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #cfcac2 #b0aba3 #8f8a83
    cloth: #7a4750 #633a41 #4c2c32
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking directly and steadily at the viewer.
- Plain 1690s dress. NO witch imagery of any kind. NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

## Nathaniel Ingersoll

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A man of about sixty who keeps the village tavern and is a deacon
of the church. Grey hair, weathered ruddy face, broad shoulders. Russet
wool coat. Genial by trade and uneasy underneath it — he is doing well out
of something he wishes were not happening.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #dcae8a #bf8e6b #9c6e4f
    hair:  #a09a90 #87817a #6b6660
    cloth: #8a6a4c #725640 #5a4331
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking slightly past the viewer.
- Plain 1690s dress. NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

## Francis Nurse

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A man in his seventies, a farmer, husband of Rebecca Nurse. White
hair, weathered face, stooped. Russet wool coat, worn. He is exhausted and
holding himself together in public. He has spent months collecting
signatures from neighbours and it has not worked.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Elderly proportions: lined face, shoulders slightly lower in frame.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #dcae8a #bf8e6b #9c6e4f
    hair:  #cfcac2 #b0aba3 #8f8a83
    cloth: #8a6a4c #725640 #5a4331
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Looking slightly past the viewer.
- Plain 1690s farming dress. NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

## Mary Warren

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A servant girl of about twenty. Brown hair under a plain linen
coif. Slate-grey wool bodice, linen collar. Frightened and covering it
badly. She said out loud that the afflicted girls were pretending, was
accused within a fortnight, and went back to accusing. All of that is in
her face at once.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #6b5238 #54402b #3e2f20
    cloth: #5c626c #4b5058 #3b3f46
    linen: #cfc8b6 #b5ae9c #98917f
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Mouth closed. Eyes slightly wide. Looking past the viewer, not at them.
- Plain 1690s servant's dress. NO costume-shop Puritan.
- No text, no border, no watermark, no signature, no frame.
```

---

# Present day

These four are the warm, saturated half of the game. Same construction, but
modern clothing and a noticeably less cold feel.

## Nora — seventeen, summer job at the memorial

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A seventeen-year-old girl working a summer job at a historic site
in Massachusetts, present day. Black hair tied back. A teal staff polo
shirt over a denim collar. Friendly, a bit flat, mildly over it — she has
answered the same question four hundred times this month and still gives a
real answer.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #c9a077 #a9825d #876446
    hair:  #3b3b3e #2b2b2e #1e1e21
    cloth: #41908b #31716d #245452
    denim: #4d5d76 #3c495e #2d3748
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Modern casual dress. Present day, not historical.
- No text, no border, no watermark, no signature, no frame.
```

## Dr. Reyes — archaeologist, at the parsonage dig

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: An archaeologist in her forties, present day, standing in an
excavated cellar hole. Black hair tied back. Teal field shirt. Practical,
warm, and visibly enjoying being asked a real question about her site.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #a9784f #8a5e3d #6b472d
    hair:  #3b3b3e #2b2b2e #1e1e21
    cloth: #41908b #31716d #245452
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Modern practical field clothing. Present day, not historical.
- No text, no border, no watermark, no signature, no frame.
```

## Dr. Whitfield — historian, in the archive

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A historian in her sixties, present day, in a reading room full of
document boxes. Grey hair, reading glasses pushed up. Slate-blue shirt.
Precise and dry. She is the person who takes the tidy famous explanation
apart, and she enjoys it.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #a09a90 #87817a #6b6660
    cloth: #5c626c #4b5058 #3b3f46
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Modern professional dress. Present day, not historical.
- No text, no border, no watermark, no signature, no frame.
```

## Ellen Towne-Putnam — descendant, at the memorial

```
A single character portrait, head and shoulders, facing the viewer, in
16-bit Super Nintendo / Game Boy Advance JRPG pixel art style.

SUBJECT: A woman in her seventies, present day, sitting on a bench at a
memorial. Grey hair. A murrey (dark brownish-red) cardigan. Calm and
unsentimental. She is descended from both sides of this — the accused and
the accusers — and has made her peace with saying so out loud.

STRICT REQUIREMENTS:
- Head and upper shoulders only. Centered. Head about 60% of frame height.
- Flat cel shading, exactly 3 tones per material: highlight, midtone,
  shadow. No gradients, no airbrushing, no blur, no anti-aliasing.
- Hard 1-pixel dark outline around the silhouette, colour #26262a.
- Background: flat #3b3f46, darkening toward the bottom. No scenery.
- PALETTE LOCK — use only these colours:
    skin:  #e0bb9a #c79b7a #a67a5c
    hair:  #a09a90 #87817a #6b6660
    cloth: #7a4750 #633a41 #4c2c32
    outline: #26262a
    background: #3b3f46
- Lighting from the upper left.
- Modern dress. Present day, not historical.
- No text, no border, no watermark, no signature, no frame.
```

---

# The hardening edit

Once a portrait is right, **upload it** and send this. Do not re-prompt from
scratch — the whole point is that it is recognisably the same person.

```
Keep this exact character: same face, same bone structure, same palette,
same background, same pose, same framing, same lighting. Change ONLY the
expression.

Several months older and visibly hardened. Brows lowered slightly. Mouth
set in a flat line. Eyes narrower and more guarded. The same person on a
much worse day.

Do not change the hair, the clothing, the colours, the composition or the
crop. Do not add scenery, text or effects.
```

Worth doing for: **Ann Putnam Jr., Mercy Lewis, Mary Warren, Parris,
Ingersoll, Tituba.** These are the six the player meets more than once, and
the change between March and September is the point.

Rebecca Nurse does not need one. She is the same person every time you see
her, including in the jail, and that is deliberate.

---

# Handing them over

Name the files by character id and mood, so the loader can find them
without a mapping table:

```
tituba-neutral.png     tituba-hard.png
parris-neutral.png     parris-hard.png
annjr-neutral.png      annjr-hard.png
mercy-neutral.png      mercy-hard.png
nurse-neutral.png
ingersoll-neutral.png  ingersoll-hard.png
francis-neutral.png
marywarren-neutral.png marywarren-hard.png
nora-neutral.png
archaeologist-neutral.png
historian-neutral.png
descendant-neutral.png
```

The ids come from `src/content/npcs.js`. Full-size 1024×1024 is fine — the
downsample and quantize happen in the build, so the originals stay editable
if a face needs redoing later.
