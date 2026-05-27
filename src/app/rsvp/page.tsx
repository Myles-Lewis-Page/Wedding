'use client'

import { useState } from 'react'
import { Search, Heart, Check, ChevronRight, Loader2, Edit3, X } from 'lucide-react'

interface GuestData {
  id: string
  name: string
  has_plus_one: boolean
  already_rsvpd: boolean
  rsvp_status: string
  dietary: string | null
  email: string | null
  plus_one_name: string | null
  plus_one_dietary: string | null
}

type Step = 'search' | 'multiple' | 'not-found' | 'form' | 'details' | 'editing' | 'done'

const DIETARY_OPTIONS = ['', 'Vegetarian', 'Vegan', 'Gluten-free', 'Nut allergy', 'Halal', 'Kosher', 'Other']

export default function RSVPPage() {
  const [step, setStep] = useState<Step>('search')
  const [nameInput, setNameInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<GuestData[]>([])
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [attending, setAttending] = useState<boolean | null>(null)
  const [dietary, setDietary] = useState('')
  const [plusOneName, setPlusOneName] = useState('')
  const [plusOneDietary, setPlusOneDietary] = useState('')
  const [email, setEmail] = useState('')

  const search = async () => {
    if (!nameInput.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/rsvp?name=${encodeURIComponent(nameInput)}`)
      const data = await res.json()
      if (data.found && data.guests?.length > 0) {
        setMatches(data.guests)
        if (data.guests.length === 1) {
          selectGuest(data.guests[0])
        } else {
          setStep('multiple')
        }
      } else {
        setStep('not-found')
      }
    } finally {
      setSearching(false)
    }
  }

  const selectGuest = (g: GuestData) => {
    setGuest(g)
    if (g.already_rsvpd) {
      setStep('details')
    } else {
      setStep('form')
    }
  }

  const startEdit = () => {
    if (!guest) return
    setAttending(guest.rsvp_status === 'attending')
    setDietary(guest.dietary || '')
    setPlusOneName(guest.plus_one_name || '')
    setPlusOneDietary(guest.plus_one_dietary || '')
    setEmail(guest.email || '')
    setStep('editing')
  }

  const submit = async (isEdit = false) => {
    if (!guest || attending === null) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guest.id,
          attending,
          plus_one_name: plusOneName || null,
          dietary: dietary || null,
          plus_one_dietary: plusOneDietary || null,
          email: email || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        // Update local guest state with new data
        setGuest(g => g ? {
          ...g,
          rsvp_status: attending ? 'attending' : 'declined',
          already_rsvpd: true,
          dietary: dietary || null,
          email: email || null,
          plus_one_name: plusOneName || null,
          plus_one_dietary: plusOneDietary || null,
        } : g)
        setStep(isEdit ? 'details' : 'done')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor = guest?.rsvp_status === 'attending' ? '#7A9C6E' : '#dc2626'
  const statusLabel = guest?.rsvp_status === 'attending' ? 'Attending 🎉' : 'Unable to attend'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #EDF4EA 0%, #FAF8F4 60%)' }}
    >
      {/* Header */}
      <div className="text-center pt-12 pb-6 px-6">
        <Heart size={18} fill="#7A9C6E" className="text-[#7A9C6E] mx-auto mb-4" />
        <h1 className="text-4xl font-light text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Jennifer & Myles
        </h1>
        <p className="text-sm text-stone-400">Your invitation · RSVP</p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">

          {/* ── SEARCH ── */}
          {step === 'search' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-light text-stone-800 mb-1 text-center" style={{ fontFamily: 'var(--font-display)' }}>RSVP</h2>
              <p className="text-sm text-stone-400 text-center mb-6">Enter your name as it appears on your invitation</p>
              <div className="relative mb-3">
                <input
                  type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Your full name"
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 text-base focus:outline-none focus:border-[#7A9C6E] focus:ring-2 focus:ring-[#7A9C6E]/20 pr-12"
                  autoFocus
                />
                <Search size={18} className="absolute right-4 top-4 text-stone-300" />
              </div>
              <button onClick={search} disabled={searching || !nameInput.trim()}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#7A9C6E' }}>
                {searching ? <><Loader2 size={16} className="animate-spin" />Searching…</> : <>Find my invitation <ChevronRight size={16} /></>}
              </button>
            </div>
          )}

          {/* ── MULTIPLE MATCHES ── */}
          {step === 'multiple' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>We found a few matches</h2>
              <p className="text-sm text-stone-400 mb-5">Select your name below</p>
              <div className="space-y-2">
                {matches.map(g => (
                  <button key={g.id} onClick={() => selectGuest(g)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:border-[#7A9C6E] hover:bg-[#EDF4EA]/40 transition-all text-left">
                    <span className="font-medium text-stone-700">{g.name}</span>
                    <div className="flex items-center gap-2">
                      {g.already_rsvpd && <span className="text-xs text-[#7A9C6E] bg-[#EDF4EA] px-2 py-0.5 rounded-full">RSVPd</span>}
                      <ChevronRight size={16} className="text-stone-300" />
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => { setStep('search'); setNameInput('') }} className="mt-4 text-sm text-stone-400 hover:text-stone-600 w-full text-center">← Try again</button>
            </div>
          )}

          {/* ── NOT FOUND ── */}
          {step === 'not-found' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-light text-stone-800 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Name not found</h2>
              <p className="text-sm text-stone-400 mb-6">We couldn&apos;t find &ldquo;{nameInput}&rdquo; on the guest list. Please try your full name or contact us.</p>
              <button onClick={() => { setStep('search'); setNameInput('') }}
                className="w-full py-3 rounded-2xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50">
                Try again
              </button>
            </div>
          )}

          {/* ── ALREADY RSVPd — DETAILS VIEW ── */}
          {step === 'details' && guest && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Status banner */}
              <div className="px-8 pt-8 pb-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-light text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
                    Hi, {guest.name.split(' ')[0]}!
                  </h2>
                  <button onClick={startEdit}
                    className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#7A9C6E] transition-colors">
                    <Edit3 size={14} /> Edit
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium mb-6"
                  style={{ background: statusColor + '15', color: statusColor }}>
                  <Check size={14} /> {statusLabel}
                </div>

                <div className="space-y-3">
                  <Row label="Name" value={guest.name} />
                  <Row label="Email" value={guest.email || 'Not provided'} />
                  <Row label="Dietary needs" value={guest.dietary || 'None'} />
                  {guest.has_plus_one && (
                    <>
                      <Row label="Plus one" value={guest.plus_one_name || 'Not bringing one'} />
                      {guest.plus_one_name && (
                        <Row label="Plus one dietary" value={guest.plus_one_dietary || 'None'} />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="px-8 py-5 bg-stone-50 border-t border-stone-100">
                <a href="/info"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-medium"
                  style={{ background: '#7A9C6E' }}>
                  View wedding details <ChevronRight size={14} />
                </a>
              </div>
            </div>
          )}

          {/* ── EDIT FORM ── */}
          {step === 'editing' && guest && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
                  Update your RSVP
                </h2>
                <button onClick={() => setStep('details')} className="text-stone-400 hover:text-stone-600">
                  <X size={18} />
                </button>
              </div>

              {/* Attending */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-600 mb-2">Will you be joining us?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAttending(true)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${attending === true ? 'border-[#7A9C6E] bg-[#EDF4EA] text-[#4A6B3E]' : 'border-stone-200 text-stone-500'}`}>
                    <Heart size={14} className={attending === true ? 'fill-[#7A9C6E] text-[#7A9C6E]' : ''} />
                    Yes, I&apos;ll be there!
                  </button>
                  <button onClick={() => setAttending(false)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition-all ${attending === false ? 'border-red-200 bg-red-50 text-red-600' : 'border-stone-200 text-stone-500'}`}>
                    Regretfully no
                  </button>
                </div>
              </div>

              {attending === true && (
                <>
                  {guest.has_plus_one && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-stone-600 mb-1.5">Plus one&apos;s name <span className="text-stone-400 font-normal">(optional)</span></label>
                      <input type="text" value={plusOneName} onChange={e => setPlusOneName(e.target.value)}
                        placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] mb-2" />
                      {plusOneName && (
                        <select value={plusOneDietary} onChange={e => setPlusOneDietary(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white">
                          {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o || 'No dietary restrictions'}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Your dietary requirements</label>
                    <select value={dietary} onChange={e => setDietary(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white">
                      {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o || 'No restrictions'}</option>)}
                    </select>
                  </div>
                </>
              )}

              {attending !== null && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Email for updates</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" />
                </div>
              )}

              <button onClick={() => submit(true)} disabled={attending === null || submitting}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: '#7A9C6E' }}>
                {submitting ? <><Loader2 size={16} className="animate-spin" />Saving…</> : 'Save changes'}
              </button>
            </div>
          )}

          {/* ── FRESH RSVP FORM ── */}
          {step === 'form' && guest && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Hi, {guest.name.split(' ')[0]}!
              </h2>
              <p className="text-sm text-stone-400 mb-6">We can&apos;t wait to celebrate with you.</p>

              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-600 mb-2">Will you be joining us?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAttending(true)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${attending === true ? 'border-[#7A9C6E] bg-[#EDF4EA] text-[#4A6B3E]' : 'border-stone-200 text-stone-500'}`}>
                    <Heart size={14} className={attending === true ? 'fill-[#7A9C6E] text-[#7A9C6E]' : ''} />
                    Yes, I&apos;ll be there!
                  </button>
                  <button onClick={() => setAttending(false)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition-all ${attending === false ? 'border-red-200 bg-red-50 text-red-600' : 'border-stone-200 text-stone-500'}`}>
                    Regretfully no
                  </button>
                </div>
              </div>

              {attending === true && (
                <>
                  {guest.has_plus_one && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-stone-600 mb-1.5">
                        You&apos;re welcome to bring a plus one <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input type="text" value={plusOneName} onChange={e => setPlusOneName(e.target.value)}
                        placeholder="Plus one's full name"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] mb-2" />
                      {plusOneName && (
                        <select value={plusOneDietary} onChange={e => setPlusOneDietary(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white">
                          {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o || 'No dietary restrictions'}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Any dietary requirements?</label>
                    <select value={dietary} onChange={e => setDietary(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white">
                      {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o || 'No restrictions'}</option>)}
                    </select>
                  </div>
                </>
              )}

              {attending !== null && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Best email for confirmation{attending ? ' and updates' : ''}?
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" />
                </div>
              )}

              <button onClick={() => submit(false)} disabled={attending === null || submitting}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: '#7A9C6E' }}>
                {submitting ? <><Loader2 size={16} className="animate-spin" />Submitting…</> : 'Submit RSVP'}
              </button>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EDF4EA] flex items-center justify-center mx-auto mb-5">
                {attending ? <Heart size={28} fill="#7A9C6E" className="text-[#7A9C6E]" /> : <Check size={28} className="text-[#7A9C6E]" />}
              </div>
              <h2 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {attending ? "We'll see you there! 🌿" : "We'll miss you!"}
              </h2>
              <p className="text-sm text-stone-400 mb-6">
                {attending
                  ? `Your RSVP is confirmed${email ? ` — a confirmation is heading to ${email}` : ''}. We can't wait to celebrate with you!`
                  : "Thank you for letting us know. We'll be thinking of you!"}
              </p>
              <div className="space-y-2">
                {attending && (
                  <a href="/info" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-medium" style={{ background: '#7A9C6E' }}>
                    View wedding details <ChevronRight size={14} />
                  </a>
                )}
                <button onClick={() => setStep('details')}
                  className="w-full py-3 rounded-2xl text-sm text-stone-500 border border-stone-200 hover:bg-stone-50">
                  View my RSVP
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-stone-50 last:border-0">
      <span className="text-xs font-medium text-stone-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-stone-700 text-right flex-1">{value}</span>
    </div>
  )
}
