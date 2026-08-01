import { CORNERS, ZONES, UNPLACED, FUTURE_IDEAS } from '@/lib/landscapePlan'
import { CheckCircle2 } from 'lucide-react'

function cornerByKey(key: string) {
  return CORNERS.find(c => c.key === key)!
}

function CornerCell({ cornerKey }: { cornerKey: string }) {
  const corner = cornerByKey(cornerKey)
  return (
    <div className="bg-stone-100 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-1">
      <span className="text-[10px] uppercase tracking-wide text-stone-400">{corner.label}</span>
      <span className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
        {corner.landmark}
        {corner.flag === 'attention' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
        {corner.flag === 'dormant' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
      </span>
    </div>
  )
}

function Chip({ children, flagged }: { children: React.ReactNode; flagged?: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1
      ${flagged ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
      {flagged && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      {children}
    </span>
  )
}

const EDGE_CHIPS: Record<string, { label: string; flagged?: boolean }[]> = {
  north: [
    { label: 'Patio & balcony' },
    { label: 'Carob tree (male, not planted here)' },
    { label: 'Small Mango' },
  ],
  west: [
    { label: 'Cypress hedge', flagged: true },
    { label: 'Podranea ricasoliana' },
    { label: 'Papaya · Lemon · Orange · Tibouchina (behind hedge)' },
    { label: 'Laundry-room entrance' },
  ],
  east: [
    { label: 'Bananas' },
    { label: 'Apricot + Red Pomelo' },
    { label: 'Tecoma' },
  ],
  south: [
    { label: 'Bougainvillea bed' },
    { label: 'Tecoma stans' },
    { label: 'Carport' },
  ],
}

export default function SketchPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">Garden Sketch</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Property layout mapped from a walkthrough on July 31, 2026 — south entry, west/carport side, north backyard, and east side, walked as one loop.
        </p>
      </div>

      {/* Loop map */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-8">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: '1fr 2.2fr 1fr', gridTemplateRows: '2.2fr 1fr 0.7fr' }}
        >
          <div style={{ gridRow: 1, gridColumn: 1 }}><CornerCell cornerKey="nw" /></div>
          <div style={{ gridRow: 1, gridColumn: 2 }} className="bg-stone-50 rounded-lg p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-green-700">North · Backyard</span>
            <div className="flex flex-wrap gap-1.5">
              {EDGE_CHIPS.north.map(c => <Chip key={c.label} flagged={c.flagged}>{c.label}</Chip>)}
            </div>
          </div>
          <div style={{ gridRow: 1, gridColumn: 3 }}><CornerCell cornerKey="ne" /></div>

          <div style={{ gridRow: 2, gridColumn: 1 }} className="bg-stone-50 rounded-lg p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-green-700">West</span>
            <div className="flex flex-col gap-1.5 items-start">
              {EDGE_CHIPS.west.map(c => <Chip key={c.label} flagged={c.flagged}>{c.label}</Chip>)}
            </div>
          </div>
          <div style={{ gridRow: 2, gridColumn: 2 }} className="border border-dashed border-stone-300 rounded-lg flex items-center justify-center text-center p-3">
            <span className="text-[10px] uppercase tracking-wide text-stone-400 leading-relaxed">
              House<br />(set toward the south edge)
            </span>
          </div>
          <div style={{ gridRow: 2, gridColumn: 3 }} className="bg-stone-50 rounded-lg p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-green-700">East</span>
            <div className="flex flex-col gap-1.5 items-start">
              {EDGE_CHIPS.east.map(c => <Chip key={c.label} flagged={c.flagged}>{c.label}</Chip>)}
            </div>
          </div>

          <div style={{ gridRow: 3, gridColumn: 1 }}><CornerCell cornerKey="sw" /></div>
          <div style={{ gridRow: 3, gridColumn: 2 }} className="bg-stone-50 rounded-lg p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-green-700">South · Entry Path</span>
            <div className="flex flex-wrap gap-1.5">
              {EDGE_CHIPS.south.map(c => <Chip key={c.label} flagged={c.flagged}>{c.label}</Chip>)}
            </div>
          </div>
          <div style={{ gridRow: 3, gridColumn: 3 }}><CornerCell cornerKey="se" /></div>
        </div>
        <p className="text-xs text-stone-400 mt-3">
          Schematic, not to scale. Corners are landmarks confirmed by two walkthrough videos each — the reliable anchors of this map.
          The house sits toward the south edge of the lot, which is why the backyard (north) is by far the biggest zone.
        </p>
      </div>

      {/* Zone sections */}
      <div className="flex flex-col gap-4 mb-8">
        {ZONES.map(zone => (
          <div key={zone.key} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h2 className="font-bold text-stone-900">
                {zone.label}{zone.sublabel && <span className="text-stone-500 font-normal"> — {zone.sublabel}</span>}
              </h2>
              <span className="text-xs font-mono text-amber-700">{zone.order} / 4</span>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Opens at <span className="font-medium text-stone-700">{zone.opensAt}</span>, closes at <span className="font-medium text-stone-700">{zone.closesAt}</span>.
            </p>
            <p className="text-sm text-stone-700 mb-4">{zone.blurb}</p>
            <div className="flex flex-col gap-2">
              {zone.features.map(f => (
                <div key={f.name} className={`rounded-lg border p-3 ${f.flagged ? 'border-amber-200 bg-amber-50/50' : 'border-stone-100 bg-stone-50'}`}>
                  <p className="text-sm font-semibold text-stone-800">{f.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Not yet pinned down */}
      {UNPLACED.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Not yet pinned down</h2>
          <div className="flex flex-col gap-2">
            {UNPLACED.map(item => (
              <div key={item.title} className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future ideas */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Future landscape ideas</h2>
        {FUTURE_IDEAS.length === 0 ? (
          <div className="border border-dashed border-stone-300 rounded-xl p-5 text-sm text-stone-400">
            Nothing here yet — this is where new landscaping ideas go once changes get discussed: new beds, replacing the dying cypress, what to do with the struggling vegetable bed, etc.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {[...FUTURE_IDEAS].sort((a, b) => Number(!!a.done) - Number(!!b.done)).map(idea => (
              <div key={idea.title} className={`rounded-xl border p-4 ${idea.done ? 'bg-stone-50 border-stone-100 opacity-70' : 'bg-white border-stone-200'}`}>
                <div className="flex items-center gap-1.5">
                  {idea.done && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                  <p className={`text-sm font-semibold ${idea.done ? 'text-stone-500 line-through' : 'text-stone-800'}`}>{idea.title}</p>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{idea.description}</p>
                <p className="text-[10px] text-stone-400 mt-1">{idea.addedAt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
