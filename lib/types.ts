export type PlantType = 'vegetable' | 'herb' | 'fruit' | 'flower' | 'tree' | 'other'
export type SunRequirement = 'full sun' | 'partial shade' | 'full shade'
export type Severity = 'low' | 'medium' | 'high'

export interface Plant {
  id: number
  name: string
  type: PlantType
  variety: string | null
  location: string | null
  planted_date: string | null
  sun_requirement: SunRequirement
  water_frequency_days: number
  water_amount_liters: number | null
  notes: string | null
  created_at: string
  last_watered?: string | null
  days_since_watered?: number | null
}

export interface WateringLog {
  id: number
  plant_id: number
  plant_name?: string
  watered_at: string
  notes: string | null
}

export interface PestLog {
  id: number
  plant_id: number
  plant_name?: string
  observed_at: string
  pest_or_disease: string
  severity: Severity
  treatment: string | null
  resolved: number
  notes: string | null
}

export interface HarvestLog {
  id: number
  plant_id: number
  plant_name?: string
  harvested_at: string
  quantity: string | null
  notes: string | null
}
