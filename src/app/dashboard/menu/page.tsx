'use client'
import { useState } from 'react'
import { UtensilsCrossed, Wine } from 'lucide-react'
import { PageHeader, Card } from '@/components/ui'

export default function MenuPage() {
  const [guests, setGuests] = useState(150)
  const [hours, setHours]   = useState(5)
  const [menu, setMenu]     = useState([
    { course: 'Appetizer', items: 'Bruschetta, caprese skewers, shrimp cocktail' },
    { course: 'Salad',     items: 'Mixed greens with balsamic vinaigrette' },
    { course: 'Main',      items: 'Filet mignon OR roasted salmon OR mushroom risotto (V)' },
    { course: 'Dessert',   items: 'Wedding cake + dessert bar' },
  ])

  const drinks = {
    wine:      Math.ceil(guests * hours * 0.5 / 5),
    beer:      Math.ceil(guests * hours * 0.6),
    champagne: Math.ceil(guests / 8),
    water:     Math.ceil(guests * hours * 0.25),
  }

  return (
    <div>
      <PageHeader title="Menu & drinks" />
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <UtensilsCrossed size={20} className="text-[var(--sage)]" />
            <h3 className="font-medium text-[#e8f0e6]">Menu</h3>
          </div>
          {menu.map((c, i) => (
            <div key={i} className="border-b border-[#1a2419] pb-3 mb-3 last:border-0 last:mb-0">
              <p className="text-xs font-bold text-[var(--subheader)] uppercase tracking-wider mb-1">{c.course}</p>
              <textarea value={c.items} onChange={e => setMenu(p => p.map((m, j) => j === i ? { ...m, items: e.target.value } : m))}
                className="w-full text-sm text-[var(--title)] resize-none border-0 focus:outline-none bg-transparent" rows={2} />
            </div>
          ))}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Wine size={20} className="text-[var(--sage)]" />
            <h3 className="font-medium text-[#e8f0e6]">Drink calculator</h3>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-[#7a9878] mb-1 block">Guests: <strong>{guests}</strong></label>
              <input type="range" min={20} max={500} step={5} value={guests} onChange={e => setGuests(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-[#7a9878] mb-1 block">Open bar hours: <strong>{hours}h</strong></label>
              <input type="range" min={1} max={8} step={0.5} value={hours} onChange={e => setHours(+e.target.value)} className="w-full" />
            </div>
          </div>
          {[['Wine', drinks.wine, 'bottles'], ['Beer', drinks.beer, 'cans'], ['Champagne', drinks.champagne, 'bottles'], ['Water', drinks.water, 'cases']].map(([l, v, u]) => (
            <div key={String(l)} className="flex justify-between py-2.5 border-b border-[#1a2419] last:border-0">
              <span className="text-sm text-[var(--title)]">{l}</span>
              <div className="text-right">
                <span className="text-lg font-light text-[var(--sage)]" style={{ fontFamily: 'var(--font-display)' }}>{v}</span>
                <span className="text-xs text-[#5a7057] ml-1">{u}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
