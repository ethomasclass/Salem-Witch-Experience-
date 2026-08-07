// Salem Village, 1692 — colour.
//
// Design rule: 1692 is cold greys and muted earth; the present-day interludes
// are warmer and more saturated. Early March in Essex County means dead dun
// grass, mud, patchy old snow and bare trees — which happens to be both
// historically right and the exact opposite temperature from the sunny GBA
// towns this game borrows its shape from.
//
// Every material gets a ramp of 3-4 shades plus a near-black outline. That
// ramp count is what separates a rich 16-bit look from a flat one.

export const P = {
  // ---- ground ----------------------------------------------------------
  // Dun, not green. Nothing has greened up yet in the first week of March,
  // and keeping red slightly ahead of green in every step of this ramp is
  // what stops the village reading as a summer town.
  grassHi:   '#918366',
  grass:     '#7c7053',
  grassLo:   '#685d45',
  grassDeep: '#554c38',

  mudHi:     '#7f6c55',
  mud:       '#6b5a46',
  mudLo:     '#584938',
  mudDeep:   '#453a2c',

  // Old snow that has thawed and refrozen several times — never white.
  snowHi:    '#bcc0c4',
  snow:      '#a9aeb3',
  snowLo:    '#8e9497',

  waterHi:   '#5b7280',
  water:     '#4a5f6b',
  waterLo:   '#3a4b56',

  // ---- timber & building -----------------------------------------------
  // Unpainted riven clapboard, weathered a few winters. Paint was an expense
  // almost nobody in the village was carrying in 1692.
  wallHi:    '#9d9484',
  wall:      '#877e6f',
  wallLo:    '#6e6659',
  wallDeep:  '#565044',

  roofHi:    '#6c6d73',
  roof:      '#585a60',
  roofLo:    '#46484e',
  roofDeep:  '#36383d',

  // Interior floorboards: distinctly darker than the wall sheathing, and
  // laid across rather than up, so a room never reads as one flat texture.
  floorHi:   '#6d6154',
  floorMid:  '#5a5044',
  floorLo:   '#4a4136',
  floorSeam: '#332c25',

  doorHi:    '#7a6249',
  door:      '#63503b',
  doorLo:    '#4c3d2d',

  glass:     '#2b3037',
  glassLit:  '#7c8790',
  frame:     '#a9a191',

  stoneHi:   '#8a8c8f',
  stone:     '#72747a',
  stoneLo:   '#5c5e64',

  // ---- vegetation -------------------------------------------------------
  barkHi:    '#5d4c3d',
  bark:      '#4a3c30',
  barkLo:    '#382d24',

  pineHi:    '#4c5f47',
  pine:      '#3c4d39',
  pineLo:    '#2e3c2c',

  brushHi:   '#6a5e46',
  brush:     '#564c38',

  // ---- ink --------------------------------------------------------------
  outline:   '#26262a',
  ink:       '#1b1c1f',
  shadow:    'rgba(28,28,32,0.28)',

  // ---- ui ---------------------------------------------------------------
  boxFill:   '#efeade',
  boxFill2:  '#ded7c6',
  boxEdge:   '#3a3630',
  boxInk:    '#26241f',
  boxDim:    '#6b6558',
  accent:    '#7d3f2c',
};

// Cloth colours for villagers. Puritan dress was not the black-and-white of
// later illustration — it was madder red, murrey, russet, sadd greens and
// undyed wool. Black cloth was expensive and reserved for Sunday best by
// those who could afford it, which is itself a class signal worth showing.
export const CLOTH = {
  russet:   ['#8a6a4c', '#725640', '#5a4331'],
  murrey:   ['#7a4750', '#633a41', '#4c2c32'],
  madder:   ['#95513f', '#7b4133', '#613228'],
  saddGreen:['#5f6647', '#4d533a', '#3c412e'],
  undyed:   ['#b0a894', '#978f7d', '#7c7566'],
  slate:    ['#5c626c', '#4b5058', '#3b3f46'],
  black:    ['#3e3c3d', '#312f30', '#242223'],
  linen:    ['#cfc8b6', '#b5ae9c', '#98917f'],
};

// Skin ramps: highlight, mid, shadow.
export const FLESH = {
  fair:   ['#e0bb9a', '#c79b7a', '#a67a5c'],
  ruddy:  ['#dcae8a', '#bf8e6b', '#9c6e4f'],
  olive:  ['#c9a077', '#a9825d', '#876446'],
  brown:  ['#a9784f', '#8a5e3d', '#6b472d'],
  deep:   ['#7d5334', '#63402a', '#4b301f'],
};

export const HAIR = {
  black:  ['#3b3b3e', '#2b2b2e', '#1e1e21'],
  dark:   ['#4a3b2e', '#382c22', '#271e17'],
  brown:  ['#6b5238', '#54402b', '#3e2f20'],
  grey:   ['#a09a90', '#87817a', '#6b6660'],
  white:  ['#cfcac2', '#b0aba3', '#8f8a83'],
  auburn: ['#7d4b32', '#633a26', '#4a2b1c'],
};
