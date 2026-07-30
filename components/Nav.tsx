'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sprout, Droplets, Bug, Apple, ClipboardList, LayoutDashboard, Map, ClipboardCheck } from 'lucide-react'

const links = [
  { href: '/',          label: 'Home',    icon: LayoutDashboard },
  { href: '/plants',    label: 'Plants',  icon: Sprout },
  { href: '/watering',  label: 'Water',   icon: Droplets },
  { href: '/pests',     label: 'Pests',   icon: Bug },
  { href: '/harvest',   label: 'Harvest', icon: Apple },
  { href: '/areas',     label: 'Areas',   icon: Map },
  { href: '/plan',      label: 'Plan',    icon: ClipboardList },
  { href: '/inspect',   label: 'Inspect', icon: ClipboardCheck },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav className="hidden sm:flex bg-green-800 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14 w-full">
          <span className="font-bold text-lg mr-4 flex items-center gap-2">
            <Sprout className="w-5 h-5" /> My Garden
          </span>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${pathname === href
                  ? 'bg-green-600 text-white'
                  : 'text-green-100 hover:bg-green-700'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Mobile top bar (logo only) ── */}
      <header className="sm:hidden bg-green-800 text-white px-4 h-12 flex items-center shadow-md">
        <span className="font-bold flex items-center gap-2">
          <Sprout className="w-4 h-4" /> My Garden
        </span>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 pb-safe">
        <div className="grid grid-cols-8 h-16">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors
                  ${active ? 'text-green-700' : 'text-stone-400'}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-green-700' : 'text-stone-400'}`} />
                <span className="text-[10px] leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

    </>
  )
}
