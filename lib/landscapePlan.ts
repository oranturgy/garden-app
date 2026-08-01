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
      { name: 'Tecoma stans', description: 'Yellow-flowering shrub in a rock-circle bed near the bike parking — a separate plant from the Tecoma on the east side of the house.' },
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
      { name: 'Papaya, Lemon, Orange, Tibouchina', description: "All behind the hedge per description — only Papaya's broad leaves were clearly identifiable through the gaps on camera; Lemon, Orange and Tibouchina weren't individually confirmed on video." },
      { name: 'Podranea ricasoliana', description: "A pink trumpet vine scrambling up through the cypress hedge — the pink bloom glimpsed on camera was this, not Tibouchina as first guessed (Tibouchina's bloom is purple, not pink)." },
      { name: 'Field Strawberry (1 of 2 boxes)', description: 'A scalloped terracotta window box with young seedlings, sitting on a wooden utility-box cover near this side\'s covered porch. The second box is on the east side.' },
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
      { name: 'Patio & balcony', description: 'Hanging egg chair, dining table and chairs, string lights, plus a dense cluster of potted houseplants (Monstera, Pothos, and others) along the wall.' },
      { name: 'Carob tree (חרוב)', description: 'Big multi-trunk tree with tie-down straps, right off the patio — looks like a male carob (carob is dioecious; male trees never produce pods, which explains why it just reads as a shade tree). Not planted here — inherited with the property, not currently tracked in the app.' },
      { name: 'Small Mango', description: 'Young staked sapling, dead-center of the lawn, its own drip line.' },
      { name: 'Storage shed & hedge border', description: 'Shed against the house; a dense hedge runs along one edge of the lawn.' },
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
      { name: 'Bananas', description: 'Young banana plants — this side of the garden only, not the north/backyard.' },
      { name: 'Apricot & Red Pomelo', description: 'A mature Apricot with a full round canopy and its own drip ring, with the Red Pomelo planted right beside it.' },
      { name: 'Utility nook', description: 'Storage cabinet, BBQ grill, an old crib frame against the house — not a planting area.' },
      { name: 'Field Strawberry (2 of 2) & Cranberry', description: 'The second Field Strawberry window box sits right next to the Cranberry, planted in a black bucket to control soil acidity — both tucked close to the utility nook.' },
      { name: 'Tecoma', description: 'Right against the house, near the utility nook — a follow-up photo confirmed a full, healthy canopy. Earlier read of a blurry video frame as "cut back hard" was a misread, not a real issue.' },
    ],
  },
]

export const UNPLACED: { title: string; description: string }[] = []

export interface FutureIdea {
  title: string
  description: string
  addedAt: string
  done?: boolean
}

export const FUTURE_IDEAS: FutureIdea[] = [
  {
    title: 'Vegetable bed — winter transition prep',
    description: "Work compost/soil enrichment into the bed before the winter crop rotation (per the area's own summer June–Aug / winter Sept–March plan). Already queued as task #65 (\"VEGETABLE BED: Prepare and enrich the soil\", September week 1) — whatever comes out of the current health diagnosis should fold into this same pass rather than being a separate fix.",
    addedAt: '2026-08-01',
  },
  {
    title: 'ID the two unknown plants',
    description: 'The big backyard tree turned out to be a male carob (חרוב), and the south-side yellow-flowering shrub is Tecoma stans.',
    addedAt: '2026-08-01',
    done: true,
  },
]
