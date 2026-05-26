'use client'

import { useState } from 'react'
import { Search, Heart, Check, X, ChevronRight, Loader2 } from 'lucide-react'

type Step = 'search' | 'found' | 'not-found' | 'rsvp-form' | 'already-rsvpd' | 'done'

interface GuestMatch {
  id: string
  name: string
  has_plus_one: boolean
  rsvp_status: string
  already_rsvpd: boolean
}

export default function RSVPPage() {
  const [step, setStep] = useState<Step>('search')
  const [nameInput, setNameInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<GuestMatch[]>([])
  const [selectedGuest, setSelectedGuest] = useState<GuestMatch | null>(null)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [plusOneName, setPlusOneName] = useState('')
  const [dietary, setDietary] = useState('')
  const [plusOneDietary, setPlusOneDietary] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const searchGuest = async () => {
    if (!nameInput.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/rsvp?name=${encodeURIComponent(nameInput)}`)
      const data = await res.json()
      if (data.found && data.guests?.length > 0) {
        setMatches(data.guests)
        if (data.guests.length === 1) {
          const g = data.guests[0]
          setSelectedGuest(g)
          setStep(g.already_rsvpd ? 'already-rsvpd' : 'rsvp-form')
        } else {
          setStep('found')
        }
      } else {
        setStep('not-found')
      }
    } finally {
      setSearching(false)
    }
  }

  const submitRSVP = async () => {
    if (!selectedGuest || attending === null) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: selectedGuest.id,
          attending,
          plus_one_name: plusOneName || null,
          dietary: dietary || null,
          plus_one_dietary: plusOneDietary || null,
          email: email || null,
        }),
      })
      if (res.ok) setStep('done')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #EDF4EA 0%, #FAF8F4 50%)' }}>
      {/* Header */}
      <div className="text-center pt-12 pb-6 px-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart size={16} fill="#7A9C6E" className="text-[#7A9C6E]" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-light text-stone-800 mb-1">
          Jennifer & Myles
        </h1>
        <p className="text-sm text-stone-400">TBD · The Barn at Stonegate</p>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md">

          {/* SEARCH STEP */}
          {step === 'search' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-light text-stone-800 mb-1 text-center">RSVP</h2>
              <p className="text-sm text-stone-400 text-center mb-6">Enter your name as it appears on your invitation</p>
              <div className="relative mb-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchGuest()}
                  placeholder="Your full name"
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 text-base focus:outline-none focus:border-[#7A9C6E] focus:ring-2 focus:ring-[#7A9C6E]/20 pr-12"
                  autoFocus
                />
                <Search size={18} className="absolute right-4 top-3.5 text-stone-300" />
              </div>
              <button
                onClick={searchGuest}
                disabled={searching || !nameInput.trim()}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                style={{ background: '#7A9C6E' }}
              >
                {searching ? <><Loader2 size={16} className="animate-spin" /> Searching…</> : <>Find my invitation <ChevronRight size={16} /></>}
              </button>
            </div>
          )}

          {/* MULTIPLE MATCHES */}
          {step === 'found' && matches.length > 1 && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-light text-stone-800 mb-1">We found a few matches</h2>
              <p className="text-sm text-stone-400 mb-5">Select your name below</p>
              <div className="space-y-2">
                {matches.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { setSelectedGuest(g); setStep(g.already_rsvpd ? 'already-rsvpd' : 'rsvp-form') }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:border-[#7A9C6E] hover:bg-[#EDF4EA]/40 transition-all text-left"
                  >
                    <span className="font-medium text-stone-700">{g.name}</span>
                    <ChevronRight size={16} className="text-stone-300" />
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('search')} className="mt-4 text-sm text-stone-400 hover:text-stone-600 w-full text-center">
                ← Try again
              </button>
            </div>
          )}

          {/* NOT FOUND */}
          {step === 'not-found' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-amber-400" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-light text-stone-800 mb-2">Name not found</h2>
              <p className="text-sm text-stone-400 mb-6">We couldn&apos;t find &ldquo;{nameInput}&rdquo; on the guest list. Please try your full name or contact us directly.</p>
              <button onClick={() => { setStep('search'); setNameInput('') }} className="w-full py-3 rounded-2xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50">
                Try again
              </button>
            </div>
          )}

          {/* ALREADY RSVP'd */}
          {step === 'already-rsvpd' && selectedGuest && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#EDF4EA] flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-[#7A9C6E]" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-light text-stone-800 mb-2">
                {selectedGuest.rsvp_status === 'attending' ? 'You\'re coming! 🎉' : 'RSVP received'}
              </h2>
              <p className="text-sm text-stone-400 mb-2">
                {selectedGuest.name}, your RSVP has already been recorded as{' '}
                <strong>{selectedGuest.rsvp_status === 'attending' ? 'attending' : 'unable to attend'}</strong>.
              </p>
              <p className="text-xs text-stone-300">Need to make a change? Contact us at hello@ourwedding.com</p>
            </div>
          )}

          {/* RSVP FORM */}
          {step === 'rsvp-form' && selectedGuest && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-light text-stone-800 mb-1">
                Hi, {selectedGuest.name.split(' ')[0]}!
              </h2>
              <p className="text-sm text-stone-400 mb-6">We can&apos;t wait to celebrate with you.</p>

              {/* Attending? */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-600 mb-2">Will you be joining us?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAttending(true)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                      attending === true ? 'border-[#7A9C6E] bg-[#EDF4EA] text-[#4A6B3E]' : 'border-stone-200 text-stone-500'
                    }`}
                  >
                    <Heart size={14} className={attending === true ? 'fill-[#7A9C6E] text-[#7A9C6E]' : ''} />
                    Yes, I&apos;ll be there!
                  </button>
                  <button
                    onClick={() => setAttending(false)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition-all ${
                      attending === false ? 'border-red-200 bg-red-50 text-red-600' : 'border-stone-200 text-stone-500'
                    }`}
                  >
                    Regretfully no
                  </button>
                </div>
              </div>

              {attending === true && (
                <>
                  {/* Plus one */}
                  {selectedGuest.has_plus_one && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-stone-600 mb-1.5">
                        You&apos;re welcome to bring a plus one — their name?
                        <span className="text-stone-400 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={plusOneName}
                        onChange={e => setPlusOneName(e.target.value)}
                        placeholder="Plus one's full name"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]"
                      />
                      {plusOneName && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={plusOneDietary}
                            onChange={e => setPlusOneDietary(e.target.value)}
                            placeholder="Their dietary requirements (if any)"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dietary */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Any dietary requirements?</label>
                    <select
                      value={dietary}
                      onChange={e => setDietary(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white text-stone-700"
                    >
                      <option value="">No restrictions</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="gluten-free">Gluten free</option>
                      <option value="nut-allergy">Nut allergy</option>
                      <option value="halal">Halal</option>
                      <option value="kosher">Kosher</option>
                      <option value="other">Other (we'll follow up)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email */}
              {attending !== null && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Best email for your confirmation{attending ? ' and updates' : ''}?
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]"
                  />
                </div>
              )}

              <button
                onClick={submitRSVP}
                disabled={attending === null || submitting}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                style={{ background: '#7A9C6E' }}
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit RSVP'}
              </button>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EDF4EA] flex items-center justify-center mx-auto mb-5">
                {attending ? <Heart size={28} fill="#7A9C6E" className="text-[#7A9C6E]" /> : <Check size={28} className="text-[#7A9C6E]" />}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-light text-stone-800 mb-2">
                {attending ? 'We\'ll see you there! 🌿' : 'We\'ll miss you!'}
              </h2>
              <p className="text-sm text-stone-400 mb-6">
                {attending
                  ? `Your RSVP is confirmed${email ? ` — a confirmation is on its way to ${email}` : ''}. We can't wait to celebrate with you!`
                  : 'Thank you for letting us know. We\'ll be thinking of you!'}
              </p>
              {attending && (
                <a
                  href="/info"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-medium"
                  style={{ background: '#7A9C6E' }}
                >
                  View wedding details <ChevronRight size={14} />
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
