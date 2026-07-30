import { Plant, PlantType } from './types'

export interface GardenAreaLite {
  name: string
  status: string
}

export interface InspectionItem {
  key: string
  title: string
  symptoms: string
  treatment: string
  appliesToTypes?: PlantType[]
  appliesToNameIncludes?: string[]
  areaNameIncludes?: string[]
}

const GENERAL_ITEMS: InspectionItem[] = [
  {
    key: 'aphids',
    title: 'Aphids',
    symptoms: 'Tiny green or black insects clustered on new growth; leaves curl or look distorted.',
    treatment: 'Spray with soapy water (1 tsp dish soap per 1L water) directly on the insects, including leaf undersides. Repeat every 3-4 days until gone.',
  },
  {
    key: 'powdery-mildew',
    title: 'Powdery mildew',
    symptoms: 'White powdery coating on leaves, usually starting on older growth.',
    treatment: 'Spray with diluted baking soda (1 tsp per 1L water). Improve air circulation and avoid wetting leaves when watering.',
  },
  {
    key: 'scale',
    title: 'Scale insects',
    symptoms: 'Small brown or waxy bumps stuck to stems or the underside of leaves; sticky residue nearby.',
    treatment: 'Wipe off with a cloth dipped in rubbing alcohol. For a heavy infestation, spray with neem oil weekly until clear.',
  },
  {
    key: 'spider-mites',
    title: 'Spider mites',
    symptoms: 'Fine webbing between leaves/stems and stippled, yellow-bronze speckling on leaves — worse in hot, dry weather.',
    treatment: 'Spray the whole plant (including leaf undersides) with water to raise humidity and dislodge mites. Follow with insecticidal soap if it persists.',
  },
  {
    key: 'heat-scorch',
    title: 'Heat stress / leaf scorch',
    symptoms: 'Brown, crispy leaf edges or bleached patches, especially on west-facing plants in the afternoon sun.',
    treatment: 'Hang 30-50% shade cloth for afternoon hours (2-7pm), or water in the evening to cool the root zone.',
  },
  {
    key: 'root-rot',
    title: 'Root rot / overwatering',
    symptoms: 'Yellowing leaves, soggy soil, or a foul smell near the base of the plant.',
    treatment: 'Let the soil dry out between waterings and improve drainage. For container plants, trim away any visibly rotted roots.',
  },
  {
    key: 'nutrient-deficiency',
    title: 'Nutrient deficiency',
    symptoms: 'Leaves look pale green or yellowish without any visible pests — usually a feeding issue.',
    treatment: 'Apply a balanced fertilizer (or the species-specific one already used for this plant) and water it in well.',
  },
  {
    key: 'mulch-basin',
    title: 'Mulch & water basin check',
    symptoms: 'Mulch layer thinner than 10cm, or the earth basin wall around the base has eroded.',
    treatment: 'Top up wood-chip mulch in a donut shape, not touching the trunk. Rebuild the basin edge with a hoe if needed.',
  },
]

const SPECIFIC_ITEMS: InspectionItem[] = [
  {
    key: 'fruit-flies',
    title: 'Fruit flies',
    symptoms: 'Small flies hovering around ripening fruit; soft spots or larvae inside fallen fruit.',
    treatment: 'Hang fruit-fly traps (apple cider vinegar + a drop of dish soap). Remove and dispose of any fallen fruit immediately — do not compost it.',
    appliesToTypes: ['tree'],
  },
  {
    key: 'citrus-leaf-miner',
    title: 'Citrus leaf miner',
    symptoms: 'Silvery, winding trails on new leaves; curled or distorted new growth.',
    treatment: 'Prune off and destroy affected new growth. Avoid excess nitrogen fertilizer, which encourages the tender new growth miners prefer.',
    appliesToNameIncludes: ['orange', 'lemon', 'red pomelo'],
  },
  {
    key: 'papaya-ringspot',
    title: 'Papaya ringspot mottling',
    symptoms: 'Mottled or distorted leaves, ring-shaped spots on fruit.',
    treatment: 'Remove and destroy affected leaves/fruit. Control aphids, which spread the virus. There is no cure once infected — monitor for spread to other plants.',
    appliesToNameIncludes: ['papaya'],
  },
  {
    key: 'grey-mold',
    title: 'Grey mold (botrytis)',
    symptoms: 'Fuzzy grey mold on fruit or flowers, usually after humid weather.',
    treatment: 'Remove affected fruit immediately. Improve air flow around the plants and avoid wetting the foliage when watering.',
    appliesToNameIncludes: ['strawberry'],
  },
  {
    key: 'cranberry-ph-drift',
    title: 'Soil pH drift (chlorosis)',
    symptoms: 'Yellowing leaves with green veins — a sign the soil has become too alkaline for this acid-loving plant.',
    treatment: 'Test soil pH (target 4.5-5.5). If above 6, add more vinegar to the watering water and check more often.',
    appliesToNameIncludes: ['cranberry'],
  },
  {
    key: 'blossom-end-rot',
    title: 'Blossom end rot',
    symptoms: 'Dark, sunken spot on the bottom of tomatoes or peppers.',
    treatment: 'Keep watering consistent — avoid swings between very dry and very wet. Add a calcium-rich amendment if it keeps recurring.',
    appliesToNameIncludes: ['vegetable bed'],
  },
]

const AREA_ITEMS: InspectionItem[] = [
  {
    key: 'basil-downy-mildew',
    title: 'Basil downy mildew',
    symptoms: 'Yellow patches on top of leaves, gray fuzz underneath.',
    treatment: 'Remove affected leaves. Water at soil level, not on the foliage, and ensure good spacing for airflow.',
    areaNameIncludes: ['herb garden'],
  },
]

export function getCatalogForPlant(plant: Plant): InspectionItem[] {
  const name = plant.name.toLowerCase()
  return [
    ...GENERAL_ITEMS,
    ...SPECIFIC_ITEMS.filter(item =>
      item.appliesToTypes?.includes(plant.type) ||
      item.appliesToNameIncludes?.some(n => name.includes(n))
    ),
  ]
}

export function getCatalogForArea(area: GardenAreaLite): InspectionItem[] {
  if (area.status !== 'complete') return []
  const name = area.name.toLowerCase()
  return AREA_ITEMS.filter(item => item.areaNameIncludes?.some(n => name.includes(n)))
}
