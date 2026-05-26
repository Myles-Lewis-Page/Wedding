'use client'
import { useState } from 'react'
import { Wine, Coffee, UtensilsCrossed } from 'lucide-react'

const MEAL_OPTIONS = ['Standard', 'Vegetarian', 'Vegan', 'Gluten-free', 'Kids meal']

export default function MenuPage() {
  const [guests, setGuests] = useState(150)
  const [hoursOpen, setHoursOpen] = useState(5)
  const [menu, setMenu] = useState([
    { course: 'Appetizer', items: 'Bruschetta, caprese skewers, shrimp cocktail' },
    { course: 'Salad', items: 'Mixed green salad with balsamic vinaigrette' },
    { course: 'Main', items: 'Filet mignon OR roasted salmon OR mushroom risotto (V)' },
    { course: 'Dessert', items: 'Wedding cake + dessert bar' },
  ])

  // Drink calculator
  const bottles = {
    wine: Math.ceil((guests * hoursOpen * 0.5) / 5),
    beer: Math.ceil(guests * hoursOpen * 0.6),
    champagne: Math.ceil(guests / 8),
    water: Math.ceil(guests * hoursOpen * 0.25),
  }

  return (
    <div className="p-6">
      <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800 mb-6">Menu & drinks</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Menu */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed size={16} className="text-[#7A9C6E]" />
            <h2 className="font-medium text-stone-800">Wedding menu</h2>
          </div>
          <div className="space-y-3">
            {menu.map((c, i) => (
              <div key={i} className="border-b border-stone-50 pb-3 last:border-0">
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">{c.course}</p>
                <textarea value={c.items} onChange={e => setMenu(prev => prev.map((m, j) => j === i ? { ...m, items: e.target.value } : m))}
                  className="w-full text-sm text-stone-700 resize-none border-0 focus:outline-none bg-transparent"
                  rows={2} placeholder="Add menu items…" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-stone-500 mb-2">Meal options tracking</p>
            <div className="space-y-1.5">
              {MEAL_OPTIONS.map(o => (
                <div key={o} className="flex items-center gap-2">
                  <span className="text-xs text-stone-600 w-28">{o}</span>
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-[#7A9C6E] rounded-full" style={{ width: `${Math.random() * 60 + 10}%` }} /></div>
                  <span className="text-xs text-stone-400 w-8 text-right">{Math.floor(Math.random()*40+5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drink calculator */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wine size={16} className="text-[#7A9C6E]" />
            <h2 className="font-medium text-stone-800">Drink calculator</h2>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Number of adult guests: <strong>{guests}</strong></label>
              <input type="range" min={20} max={500} step={5} value={guests} onChange={e => setGuests(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Open bar duration (hours): <strong>{hoursOpen}h</strong></label>
              <input type="range" min={1} max={8} step={0.5} value={hoursOpen} onChange={e => setHoursOpen(parseFloat(e.target.value))} className="w-full" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Bottles of wine', value: bottles.wine, unit: 'bottles', note: '5 glasses each' },
              { label: 'Beers', value: bottles.beer, unit: 'cans/bottles', note: 'Mix of lager & ale' },
              { label: 'Champagne (toasts)', value: bottles.champagne, unit: 'bottles', note: '8 glasses per bottle' },
              { label: 'Sparkling water cases', value: bottles.water, unit: 'cases', note: '12 bottles per case' },
            ].map(({ label, value, unit, note }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-stone-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-stone-700">{label}</p>
                  <p className="text-xs text-stone-400">{note}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-[#4A6B3E]" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
                  <p className="text-xs text-stone-400">{unit}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-300 mt-4 italic">Estimates based on average consumption. Always buy a little extra!</p>
        </div>
      </div>
    </div>
  )
}
