'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sprout, Droplets, Bug, Apple, ClipboardList } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: Sprout },
  { href: '/plants', label: 'Plants', icon: Sprout },
  { href: '/watering', label: 'Watering', icon: Droplets },
  { href: '/pests', label: 'Pests', icon: Bug },
  { href: '/harvest', label: 'Harvest', icon: Apple },
  { href: '/plan', label: 'Plan', icon: ClipboardList },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-green-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-bold text-lg mr-4 flex items-center gap-2">
          <Sprout className="w-5 h-5" /> My Garden
        </span>
        {links.slice(1).map(({ href, label, icon: Icon }) => (
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
  )
}
