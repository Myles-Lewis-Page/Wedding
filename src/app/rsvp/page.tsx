'use client'

import { useState, useEffect } from 'react'
import { Search, Heart, Check, ChevronRight, Loader2, Edit3, X, ArrowLeft } from 'lucide-react'

interface Settings {
  heading: string
  subheading: string
  dateText: string
  venueText: string
  heroImage: string
  accentColor: string
  searchLabel: string
  attendingLabel: string
  declineLabel: string
  confirmedMessage: string
  declinedMessage: string
  contactEmail: string
  coupleNames: string
  ourStory: string
  photo1: string
  photo2: string
  photo3: string
  ceremonyTime: string
  receptionTime: string
  dressCode: string
  dressCodeNote: string
}

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

type Page = 'envelope' | 'invite' | 'details' | 'story' | 'rsvp-search' | 'rsvp-form' | 'rsvp-multiple' | 'rsvp-not-found' | 'rsvp-details' | 'rsvp-editing' | 'rsvp-done'

const DIETARY = ['', 'Vegetarian', 'Vegan', 'Gluten-free', 'Nut allergy', 'Halal', 'Kosher', 'Other']

const DEFAULT: Settings = {
  heading: 'Jennifer & Myles',
  subheading: 'Together with their families',
  dateText: 'September 24, 2026',
  venueText: '4:00 PM · The Glass House Garden, Austin TX',
  heroImage: '',
  accentColor: '#7A9C6E',
  searchLabel: 'Enter your name as it appears on your invitation',
  attendingLabel: "Yes, I'll be there!",
  declineLabel: 'Regretfully no',
  confirmedMessage: "We can't wait to celebrate with you!",
  declinedMessage: "Thank you for letting us know. We'll be thinking of you!",
  contactEmail: '',
  coupleNames: 'Jennifer & Myles',
  ourStory: "We didn't expect our story to begin the way it did, but from the very first moment something just felt right.\n\nWhat started with simple conversations quickly turned into something deeper, and little by little we realised we had found someone truly special.\n\nSince then, we've shared so many memories — the quiet moments, the big laughs, the small adventures that somehow become the ones you cherish most.",
  photo1: '',
  photo2: '',
  photo3: '',
  ceremonyTime: '4:00 PM',
  receptionTime: '6:00 PM',
  dressCode: 'Garden Formal',
  dressCodeNote: 'We would love for you to celebrate with us in attire that feels elegant and true to your style.',
}

export default function RSVPPage() {
  const [page, setPage] = useState<Page>('envelope')
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [s, setS] = useState<Settings>(DEFAULT)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // RSVP state
  const [nameInput, setNameInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<GuestData[]>([])
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [dietary, setDietary] = useState('')
  const [plusOneName, setPlusOneName] = useState('')
  const [plusOneDietary, setPlusOneDietary] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/db?t=rsvp-settings')
      .then(r => r.json())
      .then(d => { if (d && !d.error) setS({ ...DEFAULT, ...d }); setLoadingSettings(false) })
      .catch(() => setLoadingSettings(false))
  }, [])

  const openEnvelope = () => {
    setEnvelopeOpen(true)
    setTimeout(() => setPage('invite'), 800)
  }

  const searchGuest = async () => {
    if (!nameInput.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/rsvp?name=${encodeURIComponent(nameInput)}`)
      const data = await res.json()
      if (data.found && data.guests?.length > 0) {
        setMatches(data.guests)
        if (data.guests.length === 1) pickGuest(data.guests[0])
        else setPage('rsvp-multiple')
      } else setPage('rsvp-not-found')
    } finally { setSearching(false) }
  }

  const pickGuest = (g: GuestData) => {
    setGuest(g)
    setPage(g.already_rsvpd ? 'rsvp-details' : 'rsvp-form')
  }

  const startEdit = () => {
    if (!guest) return
    setAttending(guest.rsvp_status === 'attending')
    setDietary(guest.dietary || '')
    setPlusOneName(guest.plus_one_name || '')
    setPlusOneDietary(guest.plus_one_dietary || '')
    setEmail(guest.email || '')
    setPage('rsvp-editing')
  }

  const submit = async (isEdit = false) => {
    if (!guest || attending === null) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guest.id, attending, plus_one_name: plusOneName || null, dietary: dietary || null, plus_one_dietary: plusOneDietary || null, email: email || null }),
      })
      if (res.ok) {
        setGuest(g => g ? { ...g, rsvp_status: attending ? 'attending' : 'declined', already_rsvpd: true, dietary: dietary || null, email: email || null, plus_one_name: plusOneName || null, plus_one_dietary: plusOneDietary || null } : g)
        setPage(isEdit ? 'rsvp-details' : 'rsvp-done')
      }
    } finally { setSubmitting(false) }
  }

  const accent = s.accentColor || '#7A9C6E'
  const accentLight = accent + '18'

  if (loadingSettings) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf7f2' }}>
      <Loader2 size={24} className="animate-spin text-stone-300" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fdf9f5 0%, #f5f0e8 100%)', fontFamily: 'Georgia, serif' }}>

      {/* ── ENVELOPE PAGE ───────────────────────────────────────────────── */}
      {page === 'envelope' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400 mb-2">You&apos;ve got mail from</p>
          <h1 className="text-4xl font-light text-stone-800 mb-12" style={{ fontFamily: 'Palatino, Georgia, serif' }}>{s.coupleNames}</h1>

          {/* Envelope */}
          <div className="relative cursor-pointer select-none" onClick={openEnvelope} style={{ width: 300, height: 200 }}>
            {/* Envelope body */}
            <div className="absolute inset-0 rounded-xl shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8b3a4a 100%)' }}>
              {/* Envelope flap lines */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, transparent 49.5%, rgba(0,0,0,0.15) 50%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom left, transparent 49.5%, rgba(0,0,0,0.1) 50%)' }} />
            </div>

            {/* Flap - animates open */}
            <div className="absolute left-0 right-0 top-0" style={{
              height: '50%',
              transformOrigin: 'top center',
              transform: envelopeOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
              transition: 'transform 0.6s ease',
              background: 'linear-gradient(135deg, #5a1e2d 0%, #7a2e3e 100%)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              borderRadius: '12px 12px 0 0',
            }} />

            {/* Wax seal */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: '#c8956a' }}>
              <span className="text-white font-serif font-bold text-base" style={{ fontFamily: 'Palatino, serif' }}>J</span>
            </div>
          </div>

          <button
            onClick={openEnvelope}
            className="mt-10 px-8 py-3 rounded-full text-white text-sm font-medium tracking-wider uppercase transition-all hover:opacity-90"
            style={{ background: accent, letterSpacing: '0.1em' }}
          >
            Open
          </button>
          <p className="text-xs text-stone-400 mt-3">Tap to open your invitation</p>
        </div>
      )}

      {/* ── INVITE PAGE ─────────────────────────────────────────────────── */}
      {page === 'invite' && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('envelope')} />

          {/* Card */}
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden mt-4">
            {/* Hero image */}
            <div className="relative h-52 bg-stone-200" style={{ background: s.heroImage ? undefined : 'linear-gradient(135deg, #d4c5b0, #c4b49a)' }}>
              {s.heroImage && <img src={s.heroImage} alt="" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Polaroid overlay */}
              {s.photo1 && (
                <div className="absolute bottom-4 right-4 w-20 bg-white p-1.5 shadow-lg rotate-3">
                  <img src={s.photo1} alt="" className="w-full h-14 object-cover" />
                  <p className="text-center text-[9px] text-stone-400 mt-1 font-serif italic">a new adventure</p>
                </div>
              )}
            </div>

            <div className="px-8 py-7 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1">{s.subheading}</p>
              <h2 className="text-3xl font-light text-stone-800 mb-1" style={{ fontFamily: 'Palatino, Georgia, serif' }}>{s.coupleNames}</h2>
              <div className="w-16 h-px bg-stone-300 mx-auto my-4" />
              <p className="text-sm font-semibold tracking-widest text-stone-600 uppercase mb-1">DATE</p>
              <p className="text-lg text-stone-800 mb-4" style={{ fontFamily: 'Palatino, serif' }}>{s.dateText}</p>
              <p className="text-sm text-stone-500">{s.venueText}</p>
            </div>

            {/* Nav buttons */}
            <div className="px-6 pb-6 grid grid-cols-3 gap-2">
              {[
                { label: 'Details', page: 'details' as Page },
                { label: 'Our Story', page: 'story' as Page },
                { label: 'RSVP', page: 'rsvp-search' as Page },
              ].map(({ label, page: p }) => (
                <button key={label} onClick={() => setPage(p)}
                  className="py-2.5 rounded-xl text-xs font-medium tracking-wide uppercase transition-all"
                  style={{ background: p === 'rsvp-search' ? accent : accentLight, color: p === 'rsvp-search' ? '#fff' : accent }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS PAGE ────────────────────────────────────────────────── */}
      {page === 'details' && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('invite')} />
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden mt-4">
            <div className="px-8 pt-8 pb-2 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1">Date &</p>
              <h2 className="text-3xl font-light text-stone-700 mb-4" style={{ fontFamily: 'Palatino, Georgia, serif' }}>Location</h2>
              <div className="w-12 h-px bg-stone-200 mx-auto mb-5" />

              <p className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-1">DATE</p>
              <p className="text-xl text-stone-800 mb-5" style={{ fontFamily: 'Palatino, serif' }}>{s.dateText}</p>
            </div>

            {/* Timeline grid */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '⛪', time: s.ceremonyTime, label: 'I DO' },
                  { icon: '📸', time: '5:00 PM', label: 'SAY CHEESE' },
                  { icon: '🥂', time: '6:00 PM', label: 'TOAST' },
                  { icon: '🍽️', time: '7:00 PM', label: 'DINNER' },
                  { icon: '🎂', time: '9:00 PM', label: 'CAKE' },
                  { icon: '💃', time: '10:00 PM', label: 'DANCE' },
                ].map(({ icon, time, label }) => (
                  <div key={label} className="text-center py-4 border border-stone-100 rounded-2xl">
                    <div className="text-3xl mb-2">{icon}</div>
                    <p className="text-xs font-semibold text-stone-600">{time}</p>
                    <p className="text-xs uppercase tracking-widest text-stone-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Dress code */}
              <div className="mt-6 text-center border-t border-stone-100 pt-5">
                <p className="text-base text-stone-600 mb-2" style={{ fontFamily: 'Palatino, serif', fontStyle: 'italic' }}>Dress Code</p>
                <p className="text-sm font-semibold tracking-widest text-stone-700 uppercase mb-2">{s.dressCode}</p>
                <p className="text-xs text-stone-400 leading-relaxed">{s.dressCodeNote}</p>
              </div>
            </div>
          </div>

          <button onClick={() => setPage('rsvp-search')}
            className="mt-5 w-full max-w-sm py-3.5 rounded-2xl text-white font-medium text-sm tracking-wider"
            style={{ background: accent }}>
            RSVP now
          </button>
        </div>
      )}

      {/* ── OUR STORY PAGE ──────────────────────────────────────────────── */}
      {page === 'story' && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('invite')} />
          <div className="w-full max-w-sm mt-4">
            {/* Lace card with polaroid */}
            <div className="bg-white rounded-3xl shadow-xl p-6 text-center mb-4" style={{ border: '8px solid', borderColor: '#f0e8e8' }}>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1">Our</p>
              <h2 className="text-3xl text-stone-800 mb-4" style={{ fontFamily: 'Palatino, Georgia, serif', fontStyle: 'italic' }}>Love Story</h2>

              {/* Polaroid photo */}
              {(s.photo2 || s.photo1) && (
                <div className="inline-block bg-white p-2 shadow-lg mb-4 -rotate-1">
                  <img src={s.photo2 || s.photo1} alt="" className="w-48 h-36 object-cover" />
                  <p className="text-center text-[10px] text-stone-400 mt-1.5 font-serif italic">a new adventure will begin</p>
                </div>
              )}
            </div>

            {/* Story text */}
            <div className="bg-white rounded-3xl shadow-xl px-7 py-8">
              {s.ourStory.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-stone-600 leading-7 mb-4 last:mb-0 text-center" style={{ fontFamily: 'Palatino, Georgia, serif', fontStyle: 'italic' }}>
                  {para}
                </p>
              ))}
            </div>
          </div>

          <button onClick={() => setPage('rsvp-search')}
            className="mt-5 w-full max-w-sm py-3.5 rounded-2xl text-white font-medium text-sm tracking-wider"
            style={{ background: accent }}>
            RSVP now
          </button>
        </div>
      )}

      {/* ── RSVP SEARCH ─────────────────────────────────────────────────── */}
      {page === 'rsvp-search' && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('invite')} />
          <div className="w-full max-w-sm mt-4">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-7">
                <Heart size={20} fill={accent} style={{ color: accent }} className="mx-auto mb-3" />
                <h2 className="text-3xl font-light text-stone-800 mb-1" style={{ fontFamily: 'Palatino, Georgia, serif' }}>RSVP</h2>
                <p className="text-sm text-stone-400">{s.searchLabel}</p>
              </div>
              <div className="relative mb-3">
                <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchGuest()}
                  placeholder="Your full name"
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 text-base focus:outline-none pr-12"
                  style={{ fontFamily: 'Georgia, serif' }}
                  autoFocus />
                <Search size={16} className="absolute right-4 top-4 text-stone-300" />
              </div>
              <button onClick={searchGuest} disabled={searching || !nameInput.trim()}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: accent }}>
                {searching ? <><Loader2 size={15} className="animate-spin" />Searching…</> : <>Find my invitation <ChevronRight size={15} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RSVP MULTIPLE ───────────────────────────────────────────────── */}
      {page === 'rsvp-multiple' && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('rsvp-search')} />
          <div className="w-full max-w-sm mt-4 bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: 'Palatino, serif' }}>We found a few matches</h2>
            <p className="text-sm text-stone-400 mb-5">Select your name below</p>
            <div className="space-y-2">
              {matches.map(g => (
                <button key={g.id} onClick={() => pickGuest(g)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-300 transition-all text-left"
                  style={{ '--hover-bg': accentLight } as React.CSSProperties}>
                  <span className="font-medium text-stone-700" style={{ fontFamily: 'Georgia, serif' }}>{g.name}</span>
                  <div className="flex items-center gap-2">
                    {g.already_rsvpd && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: accentLight, color: accent }}>RSVPd</span>}
                    <ChevronRight size={15} className="text-stone-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RSVP NOT FOUND ──────────────────────────────────────────────── */}
      {page === 'rsvp-not-found' && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('rsvp-search')} />
          <div className="w-full max-w-sm mt-4 bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Palatino, serif' }}>Name not found</h2>
            <p className="text-sm text-stone-400 mb-6">We couldn&apos;t find &ldquo;{nameInput}&rdquo; on the guest list. Please try your full name{s.contactEmail ? ` or contact us at ${s.contactEmail}` : ''}.</p>
            <button onClick={() => { setPage('rsvp-search'); setNameInput('') }}
              className="w-full py-3 rounded-2xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── RSVP DETAILS (already RSVPd) ────────────────────────────────── */}
      {page === 'rsvp-details' && guest && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('rsvp-search')} />
          <div className="w-full max-w-sm mt-4 bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-light text-stone-800" style={{ fontFamily: 'Palatino, serif' }}>
                  Hi, {guest.name.split(' ')[0]}!
                </h2>
                <button onClick={startEdit} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: accent }}>
                  <Edit3 size={14} /> Edit
                </button>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium mb-6"
                style={{ background: guest.rsvp_status === 'attending' ? accent + '18' : '#fee2e2', color: guest.rsvp_status === 'attending' ? accent : '#dc2626' }}>
                <Check size={13} /> {guest.rsvp_status === 'attending' ? 'Attending 🎉' : 'Unable to attend'}
              </div>
              <div className="space-y-3">
                <DetailRow label="Name" value={guest.name} />
                <DetailRow label="Email" value={guest.email || 'Not provided'} />
                <DetailRow label="Dietary" value={guest.dietary || 'None'} />
                {guest.has_plus_one && <DetailRow label="Plus one" value={guest.plus_one_name || 'Not bringing one'} />}
                {guest.plus_one_name && <DetailRow label="Plus one dietary" value={guest.plus_one_dietary || 'None'} />}
              </div>
            </div>
            <div className="px-8 py-4 border-t border-stone-100 bg-stone-50">
              <a href="/info" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-medium" style={{ background: accent }}>
                View wedding details <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── RSVP EDIT ───────────────────────────────────────────────────── */}
      {page === 'rsvp-editing' && guest && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('rsvp-details')} />
          <div className="w-full max-w-sm mt-4 bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-light text-stone-800 mb-6" style={{ fontFamily: 'Palatino, serif' }}>Update your RSVP</h2>
            <RSVPFormFields
              attending={attending} setAttending={setAttending}
              dietary={dietary} setDietary={setDietary}
              plusOneName={plusOneName} setPlusOneName={setPlusOneName}
              plusOneDietary={plusOneDietary} setPlusOneDietary={setPlusOneDietary}
              email={email} setEmail={setEmail}
              hasPlusOne={guest.has_plus_one}
              attendingLabel={s.attendingLabel} declineLabel={s.declineLabel}
              accent={accent}
            />
            <button onClick={() => submit(true)} disabled={attending === null || submitting}
              className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2 mt-5"
              style={{ background: accent }}>
              {submitting ? <><Loader2 size={15} className="animate-spin" />Saving…</> : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── RSVP FORM (fresh) ───────────────────────────────────────────── */}
      {page === 'rsvp-form' && guest && (
        <div className="min-h-screen flex flex-col items-center px-6 py-10">
          <Nav onBack={() => setPage('rsvp-search')} />
          <div className="w-full max-w-sm mt-4 bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: 'Palatino, serif' }}>
              Hi, {guest.name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-stone-400 mb-6">We can&apos;t wait to celebrate with you.</p>
            <RSVPFormFields
              attending={attending} setAttending={setAttending}
              dietary={dietary} setDietary={setDietary}
              plusOneName={plusOneName} setPlusOneName={setPlusOneName}
              plusOneDietary={plusOneDietary} setPlusOneDietary={setPlusOneDietary}
              email={email} setEmail={setEmail}
              hasPlusOne={guest.has_plus_one}
              attendingLabel={s.attendingLabel} declineLabel={s.declineLabel}
              accent={accent}
            />
            <button onClick={() => submit(false)} disabled={attending === null || submitting}
              className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2 mt-5"
              style={{ background: accent }}>
              {submitting ? <><Loader2 size={15} className="animate-spin" />Submitting…</> : 'Submit RSVP'}
            </button>
          </div>
        </div>
      )}

      {/* ── DONE ────────────────────────────────────────────────────────── */}
      {page === 'rsvp-done' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: accentLight }}>
              {attending
                ? <Heart size={28} fill={accent} style={{ color: accent }} />
                : <Check size={28} style={{ color: accent }} />}
            </div>
            <h2 className="text-3xl font-light text-stone-800 mb-3" style={{ fontFamily: 'Palatino, Georgia, serif' }}>
              {attending ? "We'll see you there! 🌿" : "We'll miss you!"}
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-8">
              {attending ? s.confirmedMessage : s.declinedMessage}
            </p>
            <div className="space-y-2">
              {attending && (
                <a href="/info" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-medium" style={{ background: accent }}>
                  View wedding details <ChevronRight size={14} />
                </a>
              )}
              <button onClick={() => setPage('rsvp-details')} className="w-full py-3 rounded-2xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50">
                View my RSVP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────

function Nav({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="self-start flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-1">
      <ArrowLeft size={14} /> Back
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-stone-50 last:border-0">
      <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-stone-700 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function RSVPFormFields({ attending, setAttending, dietary, setDietary, plusOneName, setPlusOneName, plusOneDietary, setPlusOneDietary, email, setEmail, hasPlusOne, attendingLabel, declineLabel, accent }: {
  attending: boolean | null; setAttending: (v: boolean) => void
  dietary: string; setDietary: (v: string) => void
  plusOneName: string; setPlusOneName: (v: string) => void
  plusOneDietary: string; setPlusOneDietary: (v: string) => void
  email: string; setEmail: (v: string) => void
  hasPlusOne: boolean; attendingLabel: string; declineLabel: string; accent: string
}) {
  return (
    <div className="space-y-4">
      {/* Attending */}
      <div>
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Will you be joining us?</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setAttending(true)}
            className="py-3 rounded-2xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2"
            style={{ borderColor: attending === true ? accent : '#e7e5e4', background: attending === true ? accent + '18' : 'transparent', color: attending === true ? accent : '#78716c' }}>
            <Heart size={13} style={attending === true ? { fill: accent, color: accent } : {}} />
            {attendingLabel}
          </button>
          <button onClick={() => setAttending(false)}
            className="py-3 rounded-2xl text-sm font-medium border-2 transition-all"
            style={{ borderColor: attending === false ? '#fca5a5' : '#e7e5e4', background: attending === false ? '#fef2f2' : 'transparent', color: attending === false ? '#dc2626' : '#78716c' }}>
            {declineLabel}
          </button>
        </div>
      </div>

      {attending === true && (
        <>
          {hasPlusOne && (
            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Plus one <span className="normal-case text-stone-400 font-normal">(optional)</span></label>
              <input type="text" value={plusOneName} onChange={e => setPlusOneName(e.target.value)} placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none mb-2" style={{ fontFamily: 'Georgia, serif' }} />
              {plusOneName && (
                <select value={plusOneDietary} onChange={e => setPlusOneDietary(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white" style={{ fontFamily: 'Georgia, serif' }}>
                  {DIETARY.map(o => <option key={o} value={o}>{o || 'No dietary restrictions'}</option>)}
                </select>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Dietary requirements</label>
            <select value={dietary} onChange={e => setDietary(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white" style={{ fontFamily: 'Georgia, serif' }}>
              {DIETARY.map(o => <option key={o} value={o}>{o || 'No restrictions'}</option>)}
            </select>
          </div>
        </>
      )}

      {attending !== null && (
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
            Email {attending ? 'for confirmation' : ''}
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none" style={{ fontFamily: 'Georgia, serif' }} />
        </div>
      )}
    </div>
  )
}
