// Rain → watering-plan rules (Nir Yitzhak). Used by /api/cron/rain-check.
//
//   < 2 mm   : ignored
//   2–5 mm   : light  — counts as a watering only for shallow / frequent plants (water every ≤ 2 days)
//   5–15 mm  : moderate — counts as a watering for every outdoor, manually watered plant
//   ≥ 15 mm  : heavy — same as moderate, and no plant is due again for HEAVY_SKIP_DAYS days
//
// Plants on drip (auto_watered = 1) and plants under a roof / indoors (rain_exposed = 0) are never touched.

export const RAIN_MIN_MM = 2
export const RAIN_MODERATE_MM = 5
export const RAIN_HEAVY_MM = 15
export const SHALLOW_MAX_FREQUENCY_DAYS = 2
export const HEAVY_SKIP_DAYS = 3

export type RainTier = 'light' | 'moderate' | 'heavy'

export function rainTier(mm: number): RainTier | null {
  if (mm < RAIN_MIN_MM) return null
  if (mm < RAIN_MODERATE_MM) return 'light'
  if (mm < RAIN_HEAVY_MM) return 'moderate'
  return 'heavy'
}

export function plantGetsCredit(tier: RainTier, waterFrequencyDays: number): boolean {
  return tier !== 'light' || waterFrequencyDays <= SHALLOW_MAX_FREQUENCY_DAYS
}

export function rainTierLabel(tier: string): string {
  if (tier === 'light') return 'Light rain — counted as watering for the vegetable bed and thirsty plants only'
  if (tier === 'moderate') return 'Moderate rain — counted as one watering for all outdoor plants'
  return `Heavy rain — outdoor plants need no watering for ${HEAVY_SKIP_DAYS} days`
}

// Today's date (YYYY-MM-DD) in Israel time
export function jerusalemToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date())
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// Rain-skip is active while today is before the skip-until date
export function rainSkipActive(skipUntil: string | null | undefined, today = jerusalemToday()): boolean {
  return !!skipUntil && today < skipUntil
}
