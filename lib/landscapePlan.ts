export interface LandscapeCorner {
  key: string
  label: string
  landmark: string
  flag?: 'attention' | 'dormant'
}

export interface LandscapeFeature {
  name: string
  description: string
  flagged?: boolean
}

export interface LandscapeZone {
  key: string
  order: number
  label: string
  sublabel: string
  opensAt: string
  closesAt: string
  blurb: string
  features: LandscapeFeature[]
}

export const CORNERS: LandscapeCorner[] = [
  { key: 'nw', label: 'West ↔ North', landmark: 'White Strawberry' },
  { key: 'ne', label: 'North ↔ East', landmark: 'Loquat' },
  { key: 'sw', label: 'South ↔ West', landmark: 'Sea squill bed', flag: 'dormant' },
  { key: 'se', label: 'East ↔ South', landmark: 'Vegetable bed', flag: 'attention' },
]

export const ZONES: LandscapeZone[] = [
  {
    key: 'south',
    order: 1,
    label: 'South',
    sublabel: 'Entry Path & Vegetable Bed',
    opensAt: 'the vegetable bed by the house',
    closesAt: 'the dormant sea-squill (חצבים) bed near the carport',
    blurb: "The path from the house corner out to the carport. Mostly ornamental beds bordered in stone, plus the raised vegetable bed that's been struggling since planting.",
    features: [
      { name: 'Vegetable bed', description: 'Raised wood-framed bed — tomatoes, cucumbers, pumpkins, hot pepper, zucchini, planted July 3. Sparse and bare-looking on video; flagged as not yet healthy.', flagged: true },
      { name: 'Young sapling bed', description: 'Small tree/shrub bordered with loose stones, right along the path.' },
      { name: 'Bougainvillea bed', description: 'Rock-circle bed with dark mulched soil, bougainvillea and a few small shrubs, some sunken terracotta pots.' },
      { name: 'Yellow-flowering shrub', description: 'A second rock-circle bed near the bike parking, not yet confirmed as a tracked plant — possibly a second Tecoma, separate from the hard-pruned one on the east side.' },
      { name: 'Herb Garden (planned)', description: "The app's Herb Garden concept area is sited on this side of the house but isn't planted yet, so nothing to see here on camera." },
      { name: 'Carport', description: "Bikes and kids' toys — not a planting area, but the walking route through it." },
    ],
  },
  {
    key: 'west',
    order: 2,
    label: 'West',
    sublabel: 'Carport Side',
    opensAt: 'the sea-squill bed',
    closesAt: 'the White Strawberry tree by the fence',
    blurb: 'A tight run along the house wall, screened by a row of columnar cypress ("fence trees"). The car parks on the far side of that hedge, which is why it never shows up on camera from this side.',
    features: [
      { name: 'Cypress hedge', description: 'One tree in the row has gone visibly brown/dry while its neighbors are healthy green — worth a closer look (root issue, borer, or just that one tree dying back).', flagged: true },
      { name: 'Papaya, Lemon, Orange, Tibouchina', description: "All behind the hedge per description — only Papaya's broad leaves and a flash of Tibouchina's purple bloom were clearly visible through the gaps on camera." },
      { name: 'Laundry-room entrance', description: 'Paved side patio with a table and chairs, steps up to the door actually used to get in.' },
      { name: 'Grass strip', description: 'Narrow lawn behind the hedge with a sprinkler and kids\' toys, leading toward the backyard corner.' },
    ],
  },
  {
    key: 'north',
    order: 3,
    label: 'North',
    sublabel: 'Backyard',
    opensAt: 'the White Strawberry corner',
    closesAt: 'the Loquat by the irrigation valve',
    blurb: "The main outdoor living space — patio, lawn, and the youngest plantings (Mango, bananas). Because the house sits toward the south edge of the lot, this backyard is by far the largest zone of the four. Also home to the one tree in the whole garden that wasn't planted here.",
    features: [
      { name: 'Patio & balcony', description: 'Hanging egg chair, dining table and chairs, string lights. Field Strawberry (window boxes) and the Cranberry bucket are somewhere in this cluster under the roof — too packed with furniture and pots on video to pin down the exact spot.' },
      { name: 'Large shade tree', description: 'Big multi-trunk tree with tie-down straps, right off the patio. Not planted here — inherited with the property, not currently tracked in the app.' },
      { name: 'Small Mango', description: 'Young staked sapling, dead-center of the lawn, its own drip line.' },
      { name: 'Storage shed & hedge border', description: 'Shed against the house; a dense hedge runs along one edge of the lawn.' },
      { name: 'Young bananas', description: 'A couple of young banana plants near the irrigation valve manifold, close to the Loquat corner.' },
    ],
  },
  {
    key: 'east',
    order: 4,
    label: 'East',
    sublabel: '',
    opensAt: 'the Loquat / valve corner',
    closesAt: 'back at the vegetable bed — completing the loop',
    blurb: 'The most established fruiting corner of the garden, ending back where the whole tour started.',
    features: [
      { name: 'Bananas', description: 'More young banana plants continuing from the north corner.' },
      { name: 'Apricot & Red Pomelo', description: 'A mature Apricot with a full round canopy and its own drip ring, with the Red Pomelo planted right beside it.' },
      { name: 'Utility nook', description: 'Storage cabinet, BBQ grill, an old crib frame against the house — not a planting area.' },
      { name: 'Tecoma', description: 'Right against the house, cut back hard — just bare trunk with a small tuft of new shoots at the base. Worth watching to see if it recovers.', flagged: true },
    ],
  },
]

export const UNPLACED: { title: string; description: string }[] = [
  {
    title: 'Field Strawberry & Cranberry — location mismatch',
    description: 'Placed both under the backyard (north) balcony roof, but the app\'s plant records currently list Field Strawberry as "west side, under roof" and Cranberry as "east side, under roof." Worth updating those records once the exact spot is confirmed.',
  },
  {
    title: 'Yellow-flowering shrub, south side',
    description: "Seen near the bike parking on the south path — not confirmed whether this is a second Tecoma or something else. Not currently in the app's plant list either way.",
  },
  {
    title: 'Large backyard shade tree',
    description: 'Confirmed not planted here. No action needed unless it should be logged in the app for reference (e.g. so future inspections/tasks can include it).',
  },
]

export interface FutureIdea {
  title: string
  description: string
  addedAt: string
}

export const FUTURE_IDEAS: FutureIdea[] = []
