// Salem Village and its interiors, March 1692.
//
// Geography is compressed but not invented. The meetinghouse sits at the
// centre with the parsonage close by; Ingersoll's ordinary is a short walk
// off; the Nurse homestead lies west and the Putnam land east, with the
// disputed Topsfield boundary north through the woods. Salem Town is five
// miles south, and the road there is walkable — the design doc is firm that
// the player should have that distance "in their legs" rather than be told
// about it.
//
// Ground is built with small stamping helpers rather than hand-typed ASCII.
// Counting columns in a 46-wide string is how ragged maps and mystery
// collision bugs happen; these helpers cannot produce a ragged grid.

/* ---------------------------------------------------------------------- *
 * Ground helpers
 * ---------------------------------------------------------------------- */

function grid(w, h, fill = '.') {
  return Array.from({ length: h }, () => new Array(w).fill(fill));
}

const rows = (g) => g.map((r) => r.join(''));

function box(g, x, y, w, h, ch) {
  for (let j = y; j < y + h; j++) {
    if (!g[j]) continue;
    for (let i = x; i < x + w; i++) {
      if (i < 0 || i >= g[j].length) continue;
      g[j][i] = ch;
    }
  }
}

/** Horizontal road, `t` tiles thick, starting at row y. */
function hroad(g, x0, x1, y, t = 2, ch = '-') { box(g, x0, y, x1 - x0 + 1, t, ch); }

/** Vertical road. */
function vroad(g, x, y0, y1, t = 2, ch = '-') { box(g, x, y0, t, y1 - y0 + 1, ch); }

/**
 * A rough patch of old snow lying in the shade.
 *
 * A strict circle test at small radii produces a hard plus-shape that reads
 * as a rendering artefact rather than as snow, so the edge is fattened and
 * then eroded with a deterministic hash. Same seed every load — the map must
 * not shimmer between sessions.
 */
function patch(g, cx, cy, r, ch = '*') {
  const h = (x, y) => {
    let n = x * 374761393 + y * 668265263 + r * 144665;
    n = (n ^ (n >>> 13)) >>> 0;
    return ((Math.imul(n, 1274126177) ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const rr = r * r + r * 0.9;
  for (let j = -r - 1; j <= r + 1; j++) {
    for (let i = -r - 1; i <= r + 1; i++) {
      const d = i * i + j * j;
      if (d > rr) continue;
      // Erode the outer ring so the blob has an irregular coastline.
      if (d > rr - r * 1.4 && h(cx + i, cy + j) < 0.45) continue;
      const y = cy + j, x = cx + i;
      if (!g[y] || x < 0 || x >= g[y].length) continue;
      if (g[y][x] === '.') g[y][x] = ch;   // never cover a road
    }
  }
}

/** A room: wall border, floor inside, one door gap in the bottom wall. */
function room(w, h, doorX) {
  const g = grid(w, h, 'f');
  box(g, 0, 0, w, 1, '#');
  box(g, 0, h - 1, w, 1, '#');
  box(g, 0, 0, 1, h, '#');
  box(g, w - 1, 0, 1, h, '#');
  g[h - 1][doorX] = 'f';
  return g;
}

/** Scatter evergreens along a rectangle's edge, skipping listed columns. */
function treeLine(kind, x0, x1, y, step = 2, skip = []) {
  const out = [];
  for (let x = x0; x <= x1; x += step) {
    if (skip.includes(x)) continue;
    out.push({ kind, x, y });
  }
  return out;
}

/* ---------------------------------------------------------------------- *
 * The village
 * ---------------------------------------------------------------------- */

const VW = 46, VH = 38;

function villageGround() {
  const g = grid(VW, VH, '.');

  // The two roads that organise the whole village.
  hroad(g, 4, 41, 20, 2);          // east-west, past the meetinghouse
  vroad(g, 22, 16, VH - 1, 2);     // north-south, out toward Salem Town

  // Spurs to each door.
  vroad(g, 10, 22, 28, 1);         // parsonage
  vroad(g, 33, 17, 20, 1);         // Ingersoll's tavern
  vroad(g, 33, 22, 29, 1);         // Putnam house
  vroad(g, 7, 14, 20, 1);          // Nurse homestead
  vroad(g, 28, 3, 20, 1);          // north, into the woods

  // A brook through the north woods.
  //
  // Colonial boundaries followed water, because water is the one line in a
  // forest that two parties can agree on without a survey. Putting the
  // disputed Topsfield line on a stream makes a thirty-year quarrel legible
  // at a glance: the marker stone stands on the bank of the thing being
  // argued over. The ford at x=14 is the only way across, and it is left
  // deliberately narrow — you should have to look for the crossing.
  hroad(g, 0, 21, 9, 1, '~');
  g[9][14] = '.';                  // the ford
  g[9][15] = '.';
  // The brook leaves the map east through the trees rather than stopping in
  // mid-air, which is what a one-tile stub would look like.
  g[8][21] = '~'; g[8][22] = '~'; g[7][22] = '~'; g[7][23] = '~';

  // Old snow in the shaded north and along the treelines.
  patch(g, 6, 4, 3); patch(g, 17, 3, 4); patch(g, 38, 5, 3);
  patch(g, 2, 16, 2); patch(g, 43, 27, 3); patch(g, 12, 34, 2);
  patch(g, 40, 14, 2);

  return rows(g);
}

export const VILLAGE = {
  id: 'village',
  name: 'Salem Village',
  ground: villageGround(),
  props: [
    // --- the meetinghouse, centre of everything ------------------------
    { kind: 'meetinghouse', x: 18, y: 10, w: 9, h: 6, doorCol: 4 },

    // --- the parsonage. Note how small the woodpile is beside it. ------
    // `smoke: 'faint'` is the woodpile clue, drawn instead of stated: this
    // chimney gives two thin wisps where every other house gives five.
    { kind: 'house', x: 8, y: 24, w: 6, h: 5, doorCol: 2, windows: [1, 4], chimney: 'center', leanTo: 'right', smoke: 'faint' },
    { kind: 'woodpile', x: 14, y: 27 },

    // --- Ingersoll's ordinary (the tavern) -----------------------------
    { kind: 'house', x: 30, y: 12, w: 7, h: 5, doorCol: 3, windows: [1, 5], chimney: 'left', roofFrac: 0.46, smoke: 'lit' },

    // --- the Nurse homestead, west ------------------------------------
    { kind: 'house', x: 4, y: 9, w: 6, h: 5, doorCol: 3, windows: [1, 4], chimney: 'right', leanTo: 'left' },
    { kind: 'fence', x: 4, y: 15 }, { kind: 'fence', x: 5, y: 15 },
    { kind: 'fence', x: 6, y: 15 }, { kind: 'fence', x: 8, y: 15 },
    { kind: 'fence', x: 9, y: 15 }, { kind: 'fence', x: 10, y: 15 },

    // --- the Putnam house, east ----------------------------------------
    { kind: 'house', x: 31, y: 25, w: 6, h: 5, doorCol: 2, windows: [0, 4], chimney: 'center' },
    { kind: 'fence', x: 30, y: 31 }, { kind: 'fence', x: 31, y: 31 },
    { kind: 'fence', x: 32, y: 31 }, { kind: 'fence', x: 34, y: 31 },
    { kind: 'fence', x: 35, y: 31 }, { kind: 'fence', x: 36, y: 31 },

    { kind: 'well', x: 25, y: 22 },
    { kind: 'cart', x: 28, y: 18 },

    // --- the working farm ----------------------------------------------
    // Salem Village was a farming community, not a street of houses. On
    // most properties the biggest building was the barn.
    { kind: 'barn', x: 37, y: 23, w: 8, h: 6 },
    { kind: 'hayrick', x: 28, y: 26 },
    { kind: 'hayrick', x: 2, y: 21 },

    // Dry-laid field walls: every stone in them was pulled out of the field
    // by hand, which is why boundaries mattered enough to kill over.
    ...Array.from({ length: 9 }, (_, i) => ({ kind: 'stonewall', x: 16 + i, y: 24 })),
    ...Array.from({ length: 6 }, (_, i) => ({ kind: 'stonewall', x: 16, y: 25 + i })),
    ...Array.from({ length: 7 }, (_, i) => ({ kind: 'stonewall', x: 1 + i, y: 17 })),
    ...Array.from({ length: 8 }, (_, i) => ({ kind: 'stonewall', x: 36 + i, y: 9 })),

    // Orchard — mostly for cider, which is what a family actually drank.
    ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({
      kind: 'appletree', x: 2 + c * 3, y: 26 + r * 3,
    }))),

    // Livestock. The swine are on the road on purpose: free-ranging pigs
    // trespassing into a neighbour's field was one of the commonest causes
    // of ill-feeling in a New England village, and Rebecca Nurse mentions
    // exactly that quarrel with the Putnams.
    { kind: 'pig', x: 26, y: 18 }, { kind: 'pig', x: 27, y: 19 },
    { kind: 'pig', x: 25, y: 19 },
    { kind: 'cow', x: 39, y: 14 }, { kind: 'cow', x: 41, y: 17 },
    { kind: 'sheep', x: 19, y: 27 }, { kind: 'sheep', x: 21, y: 28 },
    { kind: 'sheep', x: 20, y: 30 },
    { kind: 'chicken', x: 12, y: 30 }, { kind: 'chicken', x: 14, y: 31 },
    { kind: 'chicken', x: 11, y: 32 },

    // --- the disputed boundary, north in the woods ---------------------
    { kind: 'marker', x: 15, y: 4 },

    // --- woods ----------------------------------------------------------
    ...treeLine('pine', 0, 44, 0, 2),
    ...treeLine('pine', 0, 44, 2, 4, [28]),
    ...treeLine('pine', 0, 12, 6, 3),
    ...treeLine('pine', 18, 26, 5, 3),
    ...treeLine('pine', 34, 44, 6, 3),
    ...treeLine('pine', 0, 2, 10, 2),
    ...treeLine('pine', 42, 44, 10, 2),
    ...treeLine('pine', 0, 2, 24, 3),
    ...treeLine('pine', 42, 44, 24, 3),
    ...treeLine('pine', 0, 18, 35, 3),
    ...treeLine('pine', 26, 44, 35, 3),
    { kind: 'house', x: 2, y: 30, w: 5, h: 5, doorCol: 2, windows: [0, 3], chimney: 'center' },
    { kind: 'house', x: 38, y: 3, w: 6, h: 5, doorCol: 3, windows: [1, 4], chimney: 'left', leanTo: 'right' },
    { kind: 'baretree', x: 12, y: 17 },
    { kind: 'baretree', x: 27, y: 30 },
    { kind: 'baretree', x: 16, y: 30 },
    { kind: 'baretree', x: 38, y: 20 },
    { kind: 'baretree', x: 20, y: 3 },
  ],
  warps: [
    { x: 22, y: 15, to: 'meetinghouse', tx: 6, ty: 8, dir: 'up' },
    { x: 10, y: 28, to: 'parsonage', tx: 5, ty: 7, dir: 'up' },
    { x: 33, y: 16, to: 'tavern', tx: 5, ty: 7, dir: 'up' },
    { x: 7, y: 13, to: 'nursehouse', tx: 4, ty: 6, dir: 'up' },
    { x: 33, y: 29, to: 'putnamhouse', tx: 4, ty: 6, dir: 'up' },
    { x: 22, y: 37, to: 'road', tx: 7, ty: 1, dir: 'down' },
    { x: 23, y: 37, to: 'road', tx: 8, ty: 1, dir: 'down' },
  ],
  interact: [
    { id: 'woodpile', x: 14, y: 27, w: 2, h: 1 },
    { id: 'marker', x: 15, y: 4 },
    { id: 'well', x: 25, y: 22, w: 2, h: 2 },
    { id: 'meetinghouseOutside', x: 18, y: 15, w: 4, h: 1 },
    { id: 'meetinghouseOutside', x: 23, y: 15, w: 4, h: 1 },
  ],
  npcs: [
    { id: 'mercy', x: 29, y: 23, dir: 'down' },
    { id: 'swineboy', x: 26, y: 20, dir: 'up' },
    { id: 'goodwife', x: 24, y: 21, dir: 'right' },
    { id: 'woodman', x: 6, y: 22, dir: 'down' },
    { id: 'watchman', x: 29, y: 15, dir: 'down' },
  ],

  // The same village, dressed three times. This is the emotional engine of
  // the whole game and it costs one object per chapter.
  byChapter: {
    march: {
      // Behind the parsonage the ground dips. In March this is nothing; once
      // the chapter is done it is the way out, and it lands on the same
      // ground three hundred and thirty years later.
      addWarps: [
        { x: 11, y: 22, to: 'dig', tx: 11, ty: 10, dir: 'up',
          gate: 'march', script: 'toDig', setChapter: 'dig' },
      ],
    },
    june: {
      name: 'Salem Village · June',
      // Carts and strangers. The road is busy for the first time.
      addProps: [
        { kind: 'cart', x: 24, y: 17 },
        { kind: 'cart', x: 31, y: 20 },
        { kind: 'cart', x: 19, y: 18 },
      ],
      addWarps: [
        // Out of June and into the room where the paperwork ended up.
        { x: 22, y: 9, to: 'archive', tx: 8, ty: 11, dir: 'up',
          gate: 'june', script: 'toArchive', setChapter: 'archive' },
        { x: 23, y: 9, to: 'archive', tx: 9, ty: 11, dir: 'up',
          gate: 'june', script: 'toArchive', setChapter: 'archive' },
      ],
      npcs: [
        { id: 'mercy', x: 29, y: 23, dir: 'down' },
        { id: 'goodwife', x: 24, y: 21, dir: 'right' },
        { id: 'watchman', x: 29, y: 15, dir: 'down' },
        { id: 'stranger', x: 26, y: 19, dir: 'left' },
        { id: 'stranger2', x: 20, y: 19, dir: 'right' },
        { id: 'francis', x: 7, y: 16, dir: 'down' },
      ],
    },
    september: {
      name: 'Salem Village · September',
      addWarps: [
        { x: 22, y: 9, to: 'memorial', tx: 13, ty: 6, dir: 'down',
          gate: 'september', script: 'toReckoning', setChapter: 'reckoning' },
        { x: 23, y: 9, to: 'memorial', tx: 14, ty: 6, dir: 'down',
          gate: 'september', script: 'toReckoning', setChapter: 'reckoning' },
      ],
      addInteract: [
        { id: 'emptyHouse', x: 2, y: 34, w: 5, h: 1 },
        { doc: 'seizureInventory', x: 30, y: 30, w: 2, h: 1 },
      ],
      addProps: [
        { kind: 'paper', x: 30, y: 30 },
        // What is left behind rather than what is gone. A cart standing in
        // the road with nobody loading it, and hay nobody is going to need,
        // because the household that cut it is in Salem jail or scattered.
        { kind: 'cart', x: 20, y: 17 },
        { kind: 'hayrick', x: 35, y: 19 },
      ],

      // Half the livestock is gone.
      //
      // This is the sheriff's inventory, told without a document: five cows,
      // a yoke of oxen, the hay, the beds. A player who has copied that page
      // and then walks past an empty pen has been told the same thing twice,
      // and the second time nobody had to say it.
      //
      // Deliberately half and not all — a village with no animals at all
      // reads as abandoned, and Salem Village in September 1692 was not
      // abandoned. It was still there, with a fifth of it missing.
      hideProps: [
        { kind: 'pig', x: 26, y: 18 }, { kind: 'pig', x: 27, y: 19 },
        { kind: 'cow', x: 39, y: 14 },
        { kind: 'sheep', x: 19, y: 27 }, { kind: 'sheep', x: 21, y: 28 },
        { kind: 'chicken', x: 12, y: 30 }, { kind: 'chicken', x: 14, y: 31 },
        { kind: 'cart', x: 28, y: 18 },
      ],

      // Almost nobody. No locked doors, no gates — just an empty road.
      npcs: [
        { id: 'francis', x: 7, y: 16, dir: 'down' },
        { id: 'goodwife', x: 24, y: 21, dir: 'right' },
        { id: 'neighbour', x: 27, y: 24, dir: 'left' },
      ],
    },
  },
};

/* ---------------------------------------------------------------------- *
 * The road to Salem Town
 *
 * Five miles. The player only has to walk a compressed version of it once,
 * but the far end must visibly be a richer place — that resentment is one of
 * the four causal threads and it is far better felt than explained.
 * ---------------------------------------------------------------------- */

function roadGround() {
  const g = grid(16, 36, '.');
  vroad(g, 7, 0, 35, 2);
  patch(g, 2, 6, 2); patch(g, 13, 14, 3); patch(g, 3, 22, 2);
  // The verge is better kept as you approach the town.
  box(g, 5, 30, 6, 6, '-');
  return rows(g);
}

export const ROAD = {
  id: 'road',
  name: 'The road to Salem Town',
  ground: roadGround(),
  props: [
    ...treeLine('pine', 0, 4, 2, 2),
    ...treeLine('pine', 11, 14, 3, 2),
    ...treeLine('pine', 0, 4, 8, 2),
    ...treeLine('pine', 11, 14, 10, 2),
    ...treeLine('pine', 0, 4, 15, 3),
    ...treeLine('pine', 11, 14, 17, 3),
    { kind: 'baretree', x: 2, y: 20 },
    { kind: 'baretree', x: 12, y: 23 },
    // Salem Town money: bigger houses, more glass, better kept.
    { kind: 'house', x: 0, y: 26, w: 6, h: 6, doorCol: 3, windows: [0, 1, 4], chimney: 'left' },
    { kind: 'house', x: 10, y: 28, w: 6, h: 6, doorCol: 2, windows: [0, 4, 5], chimney: 'right' },
    { kind: 'fence', x: 6, y: 32 }, { kind: 'fence', x: 6, y: 33 },
    { kind: 'fence', x: 9, y: 33 }, { kind: 'fence', x: 9, y: 34 },
  ],
  warps: [
    { x: 7, y: 0, to: 'village', tx: 22, ty: 36, dir: 'up' },
    { x: 8, y: 0, to: 'village', tx: 23, ty: 36, dir: 'up' },
  ],
  byChapter: {
    june: {
      addProps: [
        { kind: 'house', x: 11, y: 20, w: 5, h: 5, doorCol: 2, windows: [0], chimney: null, roofFrac: 0.44 },
        { kind: 'bars', x: 11, y: 22 }, { kind: 'bars', x: 15, y: 22 },
      ],
      addWarps: [{ x: 13, y: 24, to: 'jail', tx: 6, ty: 8, dir: 'up' }],
      addInteract: [{ id: 'jailOutside', x: 11, y: 24, w: 2, h: 1 }],
    },
  },
  triggers: [
    // Walking south from the village: the payoff at the rich end.
    { id: 'roadEnd', x: 7, y: 30, w: 2, h: 1 },
    // Walking north at the start of the game: arriving in the village. Fires
    // once, on the opening walk, so it never interrupts a later trip south.
    { id: 'arriveVillage', x: 7, y: 2, w: 2, h: 1 },
  ],
  interact: [],
  npcs: [],
};

/* ---------------------------------------------------------------------- *
 * Interiors
 * ---------------------------------------------------------------------- */

export const PARSONAGE = {
  id: 'parsonage',
  name: 'The parsonage',
  indoor: true,
  ground: (() => {
    const g = room(11, 9, 5);
    box(g, 3, 2, 5, 1, 'H');     // hearthstone apron
    return rows(g);
  })(),
  props: [
    { kind: 'hearth', x: 4, y: 1 },
    { kind: 'table', x: 2, y: 5 },
    { kind: 'paper', x: 2, y: 5 },
  ],
  warps: [{ x: 5, y: 8, to: 'village', tx: 10, ty: 29, dir: 'down' }],
  interact: [
    { id: 'parsonageHearth', x: 4, y: 1, w: 3, h: 2 },
    { doc: 'parrisAgreement', x: 2, y: 5, w: 2, h: 1, require: ['clue.woodpile'],
      locked: 'A folded paper on the table, covered in sums. It is some kind of agreement, and it will mean nothing to you until you have seen what the village actually gave him. The woodpile is outside the front door.' },
  ],
  npcs: [
    { id: 'tituba', x: 3, y: 3, dir: 'down' },
    { id: 'parris', x: 8, y: 4, dir: 'left' },
  ],
  byChapter: {
    june: { npcs: [{ id: 'parris', x: 8, y: 4, dir: 'left' }] },
    september: { npcs: [{ id: 'parris', x: 8, y: 4, dir: 'left' }] },
  },
};

export const MEETINGHOUSE = {
  id: 'meetinghouse',
  name: 'The meetinghouse',
  indoor: true,
  ground: rows(room(13, 10, 6)),
  props: [
    { kind: 'seatingchart', x: 5, y: 1 },
    // The seating list itself. Its own locked message says "a second sheet
    // is pinned up beside the seating chart" — and for the whole life of
    // this map there was no sheet there to see. The interactable existed,
    // was reachable, and was completely invisible, so a player examined the
    // chart, found nothing else, walked out, and watched the goal counter
    // sit at two of four forever.
    { kind: 'paper', x: 7, y: 1 },
    ...[2, 3, 4, 8, 9, 10].map((x) => ({ kind: 'pew', x, y: 5 })),
    ...[2, 3, 4, 8, 9, 10].map((x) => ({ kind: 'pew', x, y: 7 })),
  ],
  warps: [{ x: 6, y: 9, to: 'village', tx: 22, ty: 16, dir: 'down' }],
  interact: [
    { id: 'seatingChart', x: 5, y: 1, w: 2, h: 2 },
    { id: 'pews', x: 2, y: 5, w: 3, h: 1 },
    { id: 'pews', x: 8, y: 7, w: 3, h: 1 },
    { doc: 'seatingList', x: 7, y: 1, w: 1, h: 2, require: ['clue.seating'],
      locked: 'A second sheet is pinned up beside the seating chart. Look at the chart itself first — this one is only the working.' },
  ],
  npcs: [],
  byChapter: {
    june: {
      name: 'The meetinghouse · the court sits here',
      addProps: [{ kind: 'table', x: 5, y: 3 }, { kind: 'paper', x: 5, y: 3 }],
      addInteract: [
        { doc: 'putnamDeposition', x: 5, y: 3, w: 2, h: 1 },
        { id: 'courtRoom', x: 8, y: 3, w: 3, h: 1 },
      ],
    },
    september: {
      addProps: [
        { kind: 'table', x: 5, y: 3 }, { kind: 'paper', x: 5, y: 3 },
        { kind: 'paper', x: 8, y: 3 }, { kind: 'paper', x: 10, y: 3 },
      ],
      addInteract: [
        { doc: 'coreyRecord', x: 5, y: 3, w: 2, h: 1 },
        { doc: 'deathWarrantReturn', x: 8, y: 3, w: 1, h: 1 },
        { doc: 'eastyPetition', x: 10, y: 3, w: 1, h: 1 },
      ],
    },
  },
};

export const TAVERN = {
  id: 'tavern',
  name: "Ingersoll's tavern",
  indoor: true,
  ground: (() => {
    const g = room(11, 9, 5);
    box(g, 7, 1, 3, 1, 'H');
    return rows(g);
  })(),
  props: [
    { kind: 'hearth', x: 7, y: 1 },
    { kind: 'table', x: 2, y: 3 },
    { kind: 'accountbook', x: 2, y: 3 },
    { kind: 'table', x: 2, y: 6 },
    // The loose pages further down the table. Same bug as the seating list:
    // the document was reachable and invisible, so the player saw a bare
    // table. June happened to escape it only because the Nurse warrant adds
    // its own sheet to the same table three months later.
    { kind: 'paper', x: 2, y: 6 },
  ],
  warps: [{ x: 5, y: 8, to: 'village', tx: 33, ty: 17, dir: 'down' }],
  interact: [
    { id: 'accountBook', x: 2, y: 3, w: 2, h: 1 },
    { doc: 'accountBookPage', x: 2, y: 6, w: 2, h: 1, require: ['clue.accounts'],
      locked: 'More pages of the same ledger, further down the table. Read the page Ingersoll has open first.' },
  ],
  npcs: [
    { id: 'ingersoll', x: 6, y: 4, dir: 'left' },
  ],
  byChapter: {
    june: {
      name: "Ingersoll's tavern · full house",
      addProps: [{ kind: 'paper', x: 3, y: 6 }],
      addInteract: [{ doc: 'nurseWarrant', x: 3, y: 6, w: 1, h: 1 }],
      npcs: [
        { id: 'ingersoll', x: 6, y: 4, dir: 'left' },
        { id: 'marywarren', x: 8, y: 6, dir: 'left' },
        { id: 'stranger3', x: 3, y: 2, dir: 'down' },
      ],
    },
    september: { npcs: [{ id: 'ingersoll', x: 6, y: 4, dir: 'left' }] },
  },
};

export const NURSEHOUSE = {
  id: 'nursehouse',
  name: 'The Nurse homestead',
  indoor: true,
  ground: (() => {
    const g = room(9, 8, 4);
    box(g, 2, 2, 3, 1, 'H');
    return rows(g);
  })(),
  props: [
    { kind: 'hearth', x: 2, y: 1 },
    { kind: 'table', x: 5, y: 4 },
  ],
  warps: [{ x: 4, y: 7, to: 'village', tx: 7, ty: 14, dir: 'down' }],
  interact: [],
  npcs: [{ id: 'nurse', x: 5, y: 3, dir: 'down' }],
  byChapter: {
    june: {
      name: 'The Nurse homestead · quiet',
      addProps: [{ kind: 'paper', x: 5, y: 4 }],
      addInteract: [{ doc: 'nursePetition', x: 5, y: 4, w: 2, h: 1 }],
      npcs: [],
    },
    september: {
      addProps: [{ kind: 'paper', x: 5, y: 4 }],
      addInteract: [{ doc: 'nursePetition', x: 5, y: 4, w: 2, h: 1 }],
      npcs: [],
    },
  },
};

export const PUTNAMHOUSE = {
  id: 'putnamhouse',
  name: 'The Putnam house',
  indoor: true,
  ground: (() => {
    const g = room(10, 8, 4);
    box(g, 5, 2, 3, 1, 'H');
    return rows(g);
  })(),
  props: [
    { kind: 'hearth', x: 5, y: 1 },
    { kind: 'table', x: 2, y: 4 },
  ],
  warps: [{ x: 4, y: 7, to: 'village', tx: 33, ty: 30, dir: 'down' }],
  props: [
    { kind: 'hearth', x: 5, y: 1 },
    { kind: 'table', x: 2, y: 4 },
    { kind: 'paper', x: 2, y: 4 },
  ],
  interact: [
    { doc: 'topsfieldPetition', x: 2, y: 4, w: 2, h: 1, require: ['clue.marker'],
      locked: 'Papers on the table in several different hands, arguing about a boundary line. You would have to have seen that boundary for any of this to mean anything. There is a stone somewhere in the woods north of the village.' },
  ],
  npcs: [{ id: 'annjr', x: 3, y: 3, dir: 'down' }],
  byChapter: {
    june: { npcs: [{ id: 'annjr', x: 3, y: 3, dir: 'down' }] },
    september: { npcs: [{ id: 'annjr', x: 3, y: 3, dir: 'down' }] },
  },
};

/* ---------------------------------------------------------------------- *
 * Present day — the Salem Witch Trials Memorial, Charter Street
 *
 * Dedicated in 1992 for the tercentenary. A low granite enclosure with
 * twenty benches cantilevered out of the wall, one per person executed,
 * each cut with a name, a means of execution and a date. Black locust
 * trees inside. At the entrance, the victims' own protests of innocence
 * are inscribed into the threshold stones — and they run into the wall and
 * stop mid-sentence, to be walked over by everyone who comes in.
 *
 * That threshold is the first thing the player touches in this game, and
 * it is the whole thesis in one object: their words were cut off, and we
 * are still walking on them.
 * ---------------------------------------------------------------------- */

// The twenty executed, in the order they were killed. Nineteen hanged on
// Proctor's Ledge; Giles Corey pressed to death for refusing to plead.
export const EXECUTED = [
  { name: 'BRIDGET BISHOP',   fate: 'HANGED',           date: 'JUNE 10, 1692' },
  { name: 'SARAH GOOD',       fate: 'HANGED',           date: 'JULY 19, 1692' },
  { name: 'ELIZABETH HOWE',   fate: 'HANGED',           date: 'JULY 19, 1692' },
  { name: 'SUSANNAH MARTIN',  fate: 'HANGED',           date: 'JULY 19, 1692' },
  { name: 'REBECCA NURSE',    fate: 'HANGED',           date: 'JULY 19, 1692' },
  { name: 'SARAH WILDES',     fate: 'HANGED',           date: 'JULY 19, 1692' },
  { name: 'GEORGE BURROUGHS', fate: 'HANGED',           date: 'AUGUST 19, 1692' },
  { name: 'MARTHA CARRIER',   fate: 'HANGED',           date: 'AUGUST 19, 1692' },
  { name: 'GEORGE JACOBS SR.',fate: 'HANGED',           date: 'AUGUST 19, 1692' },
  { name: 'JOHN PROCTOR',     fate: 'HANGED',           date: 'AUGUST 19, 1692' },
  { name: 'JOHN WILLARD',     fate: 'HANGED',           date: 'AUGUST 19, 1692' },
  { name: 'GILES COREY',      fate: 'PRESSED TO DEATH', date: 'SEPTEMBER 19, 1692' },
  { name: 'MARTHA COREY',     fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'MARY EASTEY',      fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'ALICE PARKER',     fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'MARY PARKER',      fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'ANN PUDEATOR',     fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'WILMOT REDD',      fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'MARGARET SCOTT',   fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
  { name: 'SAMUEL WARDWELL',  fate: 'HANGED',           date: 'SEPTEMBER 22, 1692' },
];

const MW = 28, MH = 34;

// Where the twenty benches sit. Order matters: this list is zipped against
// EXECUTED in order, and slot 4 — Rebecca Nurse — is deliberately the one
// beside the gap in the north wall. The last name the player reads in the
// present is hers, with the date she is hanged, and then they step through
// the gap into the March before any of it happened.
const BENCH_SLOTS = [
  { x: 6, y: 20 }, { x: 6, y: 18 }, { x: 6, y: 16 }, { x: 6, y: 14 },
  { x: 15, y: 5 },                                    // <- beside the gap
  { x: 6, y: 12 }, { x: 6, y: 10 }, { x: 6, y: 8 }, { x: 6, y: 6 },
  { x: 8, y: 5 }, { x: 10, y: 5 }, { x: 17, y: 5 },
  ...[6, 8, 10, 12, 14, 16, 18, 20].map((y) => ({ x: 20, y })),
];

function memorialGround() {
  const g = grid(MW, MH, 'B');     // red brick sidewalk, a city block
  box(g, 5, 4, 18, 18, 'G');       // granite paving inside the enclosure
  box(g, 6, 5, 16, 16, 'L');       // the lawn
  box(g, 0, 24, MW, 3, 'A');       // Charter Street
  return rows(g);
}

// The low wall: three sides plus a south face, with a gap at x=13-14 in each
// of the north and south walls — the entrance, and the way out of 1692.
const WALL_GAP = [13, 14];
const memorialWall = () => [
  ...Array.from({ length: 18 }, (_, i) => ({ kind: 'lowwall', x: 5, y: 4 + i })),
  ...Array.from({ length: 18 }, (_, i) => ({ kind: 'lowwall', x: 22, y: 4 + i })),
  ...Array.from({ length: 16 }, (_, i) => 6 + i)
    .filter((x) => !WALL_GAP.includes(x))
    .flatMap((x) => [{ kind: 'lowwall', x, y: 4 }, { kind: 'lowwall', x, y: 21 }]),
];

export const MEMORIAL = {
  id: 'memorial',
  name: 'Salem Witch Trials Memorial',
  era: 'present',
  ground: memorialGround(),
  props: [
    ...memorialWall(),
    ...BENCH_SLOTS.map((b) => ({ kind: 'membench', x: b.x, y: b.y })),

    { kind: 'locust', x: 9, y: 9 },
    { kind: 'locust', x: 16, y: 15 },
    { kind: 'locust', x: 1, y: 15 },
    { kind: 'locust', x: 24, y: 8 },

    // The three interpretive panels: the baseline a student needs before
    // 1692, where nobody can explain what is coming because nobody knows.
    { kind: 'signboard', x: 6, y: 22 },
    { kind: 'signboard', x: 10, y: 22 },
    { kind: 'signboard', x: 17, y: 22 },
    { kind: 'bin', x: 3, y: 23 },

    // Across the street. Salem sells this history; the game just shows it.
    { kind: 'shopfront', x: 8, y: 29, w: 7, h: 5 },
  ],
  // Stepping through the gap in the north wall puts you at the Salem Town
  // end of the road in 1692 — so the first thing you do in the past is walk
  // the five miles from the money to the village that resents it. No
  // explanation of how you got there, ever: any mechanism invites a student
  // to interrogate the mechanism instead of the history.
  warps: [
    // The one chapter transition that was never wired.
    //
    // Every other exit in this file carries `gate` and `setChapter`; these
    // two carried neither, so walking out of the memorial moved the player
    // to the 1692 road while `state.chapter` stayed 'memorial' for the whole
    // of March. The village then built with no March cast — everyone the
    // player met answered with a greeting and nothing else, because their
    // topics are gated on `chapter: 'march'` — and the goal box went on
    // showing memorial steps that could no longer be completed.
    //
    // It survived because it is invisible from inside any one system: the
    // maps are right, the objectives are right, the dialogue is right, and
    // the only thing wrong is a chapter name that nothing on screen prints.
    { x: 13, y: 4, to: 'road', tx: 7, ty: 28, dir: 'up',
      gate: 'memorial', script: 'arrive1692', setChapter: 'march' },
    { x: 14, y: 4, to: 'road', tx: 8, ty: 28, dir: 'up',
      gate: 'memorial', script: 'arrive1692', setChapter: 'march' },
  ],
  interact: [
    { id: 'threshold', x: 13, y: 21, w: 2, h: 1 },
    { id: 'panelHappened', x: 6, y: 22, w: 2, h: 2 },
    { id: 'panelCourt', x: 10, y: 22, w: 2, h: 2 },
    { id: 'panelArgument', x: 17, y: 22, w: 2, h: 2 },
    { id: 'shopWindow', x: 8, y: 29, w: 7, h: 1 },
    // Each bench carries its own inscription.
    ...BENCH_SLOTS.map((b, i) => ({
      id: 'bench', x: b.x, y: b.y, w: 2, h: 1, bench: EXECUTED[i],
    })),
  ],
  triggers: [
    { id: 'arriveMemorial', x: 11, y: 22, w: 6, h: 1 },
    // The threshold is too important to leave to chance, so it fires by
    // being walked over — which is also exactly how it works in life.
    { id: 'threshold', x: 13, y: 21, w: 2, h: 1 },
  ],
  npcs: [
    { id: 'nora', x: 18, y: 19, dir: 'left' },
  ],
  byChapter: {
    reckoning: {
      name: 'Salem Witch Trials Memorial',
      addProps: [
        { kind: 'paper', x: 9, y: 18 }, { kind: 'paper', x: 11, y: 18 },
        { kind: 'paper', x: 13, y: 18 },
      ],
      addInteract: [
        { doc: 'annApology', x: 9, y: 18, w: 1, h: 1 },
        { doc: 'sewallApology', x: 11, y: 18, w: 1, h: 1 },
        { doc: 'johnsonAct', x: 13, y: 18, w: 1, h: 1 },
      ],
      addTriggers: [{ id: 'arriveReckoning', x: 12, y: 8, w: 4, h: 1 }],
      npcs: [
        { id: 'nora', x: 18, y: 19, dir: 'left' },
        { id: 'descendant', x: 8, y: 12, dir: 'right' },
      ],
    },
  },
};


/* ---------------------------------------------------------------------- *
 * Interlude A — the parsonage cellar hole, present day
 *
 * The excavated foundation of the Salem Village parsonage, off Centre
 * Street in Danvers. A real site: a rectangle of fieldstone in a patch of
 * trees behind a residential street, with a sign and nothing else.
 *
 * The player steps into it from the 1692 parsonage dooryard. Same ground,
 * three hundred and thirty years apart.
 * ---------------------------------------------------------------------- */

function digGround() {
  const g = grid(22, 20, 'L');       // mown grass
  box(g, 6, 5, 11, 8, 'G');          // the excavated floor
  box(g, 0, 17, 22, 3, 'B');         // the path in from the street
  return rows(g);
}

export const DIG = {
  id: 'dig',
  name: 'The parsonage foundation, Danvers',
  era: 'present',
  ground: digGround(),
  props: [
    // The cellar hole: a low wall of fieldstone on all four sides.
    ...Array.from({ length: 11 }, (_, i) => ({ kind: 'lowwall', x: 6 + i, y: 4 })),
    ...Array.from({ length: 11 }, (_, i) => 6 + i)
      .filter((x) => x !== 11)
      .map((x) => ({ kind: 'lowwall', x, y: 13 })),
    ...Array.from({ length: 8 }, (_, i) => ({ kind: 'lowwall', x: 5, y: 5 + i })),
    ...Array.from({ length: 8 }, (_, i) => ({ kind: 'lowwall', x: 17, y: 5 + i })),
    { kind: 'signboard', x: 8, y: 15 },
    { kind: 'locust', x: 1, y: 3 }, { kind: 'locust', x: 18, y: 2 },
    { kind: 'locust', x: 19, y: 9 }, { kind: 'locust', x: 0, y: 10 },
    { kind: 'bin', x: 14, y: 16 },
  ],
  warps: [
    // Back the way you came — into June.
    //
    // Gated like every other chapter exit. Ungated, a player could walk in
    // one side of the cellar and out the other without ever asking Dr. Reyes
    // how small the house was — which is the only place the game explains
    // that nine people lived in two rooms with no corridors, and so the only
    // place it explains how two children could not be ill privately.
    { x: 11, y: 18, to: 'village', tx: 11, ty: 22, dir: 'up',
      gate: 'dig', script: 'toJune', setChapter: 'june' },
    { x: 12, y: 18, to: 'village', tx: 12, ty: 22, dir: 'up', gate: 'dig',
      script: 'toJune', setChapter: 'june' },
  ],
  interact: [
    { id: 'digSign', x: 8, y: 15, w: 2, h: 2 },
    { id: 'cellarFloor', x: 8, y: 8, w: 6, h: 3 },
  ],
  triggers: [{ id: 'arriveDig', x: 6, y: 16, w: 10, h: 1 }],
  npcs: [{ id: 'archaeologist', x: 13, y: 9, dir: 'left' }],
};

/* ---------------------------------------------------------------------- *
 * The Salem jail — June
 *
 * A cellar on Prison Lane. Prisoners were charged for their food and their
 * irons, and nobody was released until the bill was paid.
 * ---------------------------------------------------------------------- */

export const JAIL = {
  id: 'jail',
  name: "Their Majesties' Gaol, Salem",
  indoor: true,
  ground: (() => {
    const g = room(13, 10, 6);
    box(g, 1, 1, 11, 3, 'H');        // stone floor at the cell end
    return rows(g);
  })(),
  props: [
    ...Array.from({ length: 11 }, (_, i) => ({ kind: 'bars', x: 1 + i, y: 4 })),
    { kind: 'straw', x: 3, y: 2 }, { kind: 'straw', x: 4, y: 2 },
    { kind: 'straw', x: 8, y: 2 }, { kind: 'straw', x: 9, y: 3 },
    { kind: 'straw', x: 2, y: 3 },
    { kind: 'table', x: 9, y: 6 },
    { kind: 'paper', x: 9, y: 6 },
  ],
  warps: [{ x: 6, y: 9, to: 'road', tx: 7, ty: 30, dir: 'down' }],
  interact: [
    { doc: 'jailBill', x: 9, y: 6, w: 2, h: 1 },
    { id: 'jailStraw', x: 2, y: 5, w: 3, h: 1 },
  ],
  triggers: [{ id: 'arriveJail', x: 6, y: 8, w: 1, h: 1 }],
  // The bars are between you and them. You talk through the grate.
  npcs: [
    { id: 'nurseJail', x: 4, y: 3, dir: 'down' },
    { id: 'titubaJail', x: 9, y: 3, dir: 'down' },
    // Right at the end, away from the two adults, in the part of the cellar
    // the window does not reach.
    { id: 'dorothy', x: 11, y: 3, dir: 'down' },
  ],
};

/* ---------------------------------------------------------------------- *
 * Interlude B — the trial papers, present day
 *
 * A reading room with the surviving court records in it. The one place in
 * the whole game where a modern character is allowed to explain something.
 * ---------------------------------------------------------------------- */

export const ARCHIVE = {
  id: 'archive',
  name: 'Reading room',
  era: 'present',
  indoor: true,
  ground: rows(room(18, 13, 8)),
  props: [
    ...Array.from({ length: 6 }, (_, i) => ({ kind: 'archivebox', x: 2 + i, y: 1 })),
    ...Array.from({ length: 6 }, (_, i) => ({ kind: 'archivebox', x: 10 + i, y: 1 })),
    { kind: 'table', x: 5, y: 5 }, { kind: 'table', x: 7, y: 5 },
    { kind: 'table', x: 9, y: 5 },
    { kind: 'paper', x: 6, y: 5 }, { kind: 'paper', x: 9, y: 5 },
    { kind: 'table', x: 12, y: 8 },
  ],
  warps: [
    // Gated: this room is where the famous tidy explanation gets taken
    // apart, and a student who walks straight out has skipped the single
    // most useful twenty seconds in the game.
    { x: 8, y: 12, to: 'village', tx: 22, ty: 17, dir: 'down',
      gate: 'archive', script: 'toSeptember', setChapter: 'september' },
  ],
  interact: [
    { id: 'archiveTable', x: 5, y: 5, w: 6, h: 1 },
    { id: 'archiveBoxes', x: 2, y: 1, w: 6, h: 1 },
  ],
  triggers: [{ id: 'arriveArchive', x: 8, y: 11, w: 1, h: 1 }],
  npcs: [{ id: 'historian', x: 11, y: 5, dir: 'left' }],
};

export const MAPS = {
  memorial: MEMORIAL,
  dig: DIG,
  jail: JAIL,
  archive: ARCHIVE,
  village: VILLAGE,
  road: ROAD,
  parsonage: PARSONAGE,
  meetinghouse: MEETINGHOUSE,
  tavern: TAVERN,
  nursehouse: NURSEHOUSE,
  putnamhouse: PUTNAMHOUSE,
};
