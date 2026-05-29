'use client'

import { useState, useEffect } from 'react'
import { Search, Heart, Check, ChevronRight, Loader2, Edit3, X, ArrowLeft } from 'lucide-react'

interface Settings {
  heading: string; subheading: string; heroImage: string; accentColor: string; secondaryColor: string; bgColor: string; tertiaryColor: string
  brideName: string; groomName: string
  searchLabel: string; attendingLabel: string; declineLabel: string
  confirmedMessage: string; declinedMessage: string; contactEmail: string
  coupleNames: string; ourStory: string; photo1: string; photo2: string; photo3: string
  dressCode: string; dressCodeNote: string; weddingDate: string
  swatchBridesmaids: string; swatchSuits: string; swatchVenue: string; swatchFlowers: string
}

interface Venue { name: string; address: string; isSelected: boolean }
interface TimelineItem { id: string; time: string; title: string; desc: string; who: string; order: number }

interface GuestData {
  id: string; name: string; has_plus_one: boolean; already_rsvpd: boolean
  rsvp_status: string; dietary: string | null; email: string | null
  plus_one_name: string | null; plus_one_dietary: string | null
}

type Page = 'envelope' | 'invite' | 'details' | 'story' | 'rsvp-search' | 'rsvp-form' | 'rsvp-multiple' | 'rsvp-not-found' | 'rsvp-details' | 'rsvp-editing' | 'rsvp-done'
const DIETARY = ['', 'Vegetarian', 'Vegan', 'Gluten-free', 'Nut allergy', 'Halal', 'Kosher', 'Other']

const DEFAULT: Settings = {
  heading: 'Our Wedding', subheading: 'Together with their families',
  heroImage: '', accentColor: '#4a7a44',
  searchLabel: 'Enter your name as it appears on your invitation',
  attendingLabel: "Yes, I'll be there!", declineLabel: 'Regretfully no',
  confirmedMessage: "We can't wait to celebrate with you!",
  declinedMessage: "Thank you for letting us know. We'll be thinking of you!",
  contactEmail: '', coupleNames: 'Our Wedding', brideName: '', groomName: '', secondaryColor: '#8fb882', bgColor: '#111714', tertiaryColor: '#1a2419',
  ourStory: "We didn't expect our story to begin the way it did, but from the very first moment something just felt right.\n\nWhat started with simple conversations quickly turned into something deeper, and little by little we realised we had found someone truly special.\n\nSince then, we've shared so many memories — the quiet moments, the big laughs, the small adventures that somehow become the ones you cherish most.",
  photo1: '', photo2: '', photo3: '', dressCode: 'Garden Formal',
  swatchBridesmaids: '#9bb89a', swatchSuits: '#4a5568', swatchVenue: '#8b7355', swatchFlowers: '#e8b4bc',
  dressCodeNote: 'We would love for you to celebrate with us in attire that feels elegant and true to your style.',
  weddingDate: '',
}

const TIMELINE_ICONS: Record<string, string> = {
  'ceremony': '⛪', 'i do': '⛪', 'cocktail': '🥂', 'toast': '🥂',
  'dinner': '🍽️', 'cake': '🎂', 'dance': '💃', 'dancing': '💃',
  'photo': '📸', 'cheese': '📸', 'arrive': '🌿', 'reception': '✨',
  'send': '🎇', 'exit': '🎇',
}
const getIcon = (title: string) => {
  const t = title.toLowerCase()
  for (const [key, icon] of Object.entries(TIMELINE_ICONS)) {
    if (t.includes(key)) return icon
  }
  return '✨'
}

export default function RSVPPage() {
  const [page, setPage] = useState<Page>('envelope')
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [s, setS] = useState<Settings>(DEFAULT)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

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
    // Apply colors from localStorage immediately — no waiting for DB
    try {
      const saved = localStorage.getItem('weddingColors')
      if (saved) {
        const p = JSON.parse(saved)
        setS(prev => ({
          ...prev,
          ...(p.accent    ? { accentColor:    p.accent    } : {}),
          ...(p.sage      ? { secondaryColor: p.sage      } : {}),
          ...(p.bg        ? { bgColor:        p.bg        } : {}),
          ...(p.tertiary  ? { tertiaryColor:  p.tertiary  } : {}),
          ...(p.swatchBridesmaids ? { swatchBridesmaids: p.swatchBridesmaids } : {}),
          ...(p.swatchSuits       ? { swatchSuits:       p.swatchSuits       } : {}),
          ...(p.swatchVenue       ? { swatchVenue:       p.swatchVenue       } : {}),
          ...(p.swatchFlowers     ? { swatchFlowers:     p.swatchFlowers     } : {}),
        }))
      }
    } catch {}

    Promise.all([
      fetch('/api/db?t=rsvp-settings').then(r => r.json()),
      fetch('/api/db?t=venues').then(r => r.json()),
      fetch('/api/db?t=timeline').then(r => r.json()),
    ]).then(([rs, vs, tl]) => {
      if (rs && !rs.error) {
        setS({ ...DEFAULT, ...rs })
        // Keep localStorage in sync with DB
        localStorage.setItem('weddingColors', JSON.stringify({
          accent:   rs.accentColor    || '#4a7a44',
          sage:     rs.secondaryColor || '#8fb882',
          bg:       rs.bgColor        || '#111714',
          tertiary: rs.tertiaryColor  || '#1a2419',
        }))
      }
      if (Array.isArray(vs)) setVenue(vs.find((v: Venue) => v.isSelected) ?? null)
      if (Array.isArray(tl)) setTimeline(tl)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Derive date and venue from live data
  // Build coupleNames from brideName+groomName if coupleNames not set
  const displayNames = (() => {
    if (s.brideName && s.groomName) return `${s.brideName} & ${s.groomName}`
    if (s.brideName) return s.brideName
    if (s.groomName) return s.groomName
    if (s.coupleNames && s.coupleNames !== 'Our Wedding') return s.coupleNames
    return 'Our Wedding'
  })()
  const weddingDateFmt = s.weddingDate || (typeof window !== 'undefined' ? localStorage.getItem('weddingDate') : null)
  const dateDisplay = weddingDateFmt
    ? new Date(weddingDateFmt + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
    : 'Date TBD'
  const venueDisplay = venue ? venue.name : 'Venue TBD'
  const venueAddress = venue ? venue.address : ''

  const accent = s.accentColor || '#4a7a44'
  const sage = s.secondaryColor || '#8fb882'
  const bg = s.bgColor || '#111714'
  const card = s.tertiaryColor || '#1a2419'
  const accentLight = accent + '18'
  // Text colors from localStorage (set by Color scheme tab)
  const getStoredColor = (key: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback
    try { const p = JSON.parse(localStorage.getItem('weddingColors')||'{}'); return p[key] || fallback } catch { return fallback }
  }
  const titleCol = getStoredColor('title', '#ffffff')
  const bodyCol = getStoredColor('body', '#9ca3af')

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

  const pickGuest = (g: GuestData) => { setGuest(g); setPage(g.already_rsvpd ? 'rsvp-details' : 'rsvp-form') }

  const startEdit = () => {
    if (!guest) return
    setAttending(guest.rsvp_status === 'attending')
    setDietary(guest.dietary || ''); setPlusOneName(guest.plus_one_name || '')
    setPlusOneDietary(guest.plus_one_dietary || ''); setEmail(guest.email || '')
    setPage('rsvp-editing')
  }

  const submit = async (isEdit = false) => {
    if (!guest || attending === null) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guest.id, attending, plus_one_name: plusOneName||null, dietary: dietary||null, plus_one_dietary: plusOneDietary||null, email: email||null }),
      })
      if (res.ok) {
        setGuest(g => g ? { ...g, rsvp_status: attending?'attending':'declined', already_rsvpd:true, dietary:dietary||null, email:email||null, plus_one_name:plusOneName||null, plus_one_dietary:plusOneDietary||null } : g)
        setPage(isEdit ? 'rsvp-details' : 'rsvp-done')
      }
    } finally { setSubmitting(false) }
  }

  const cardStyle = { background:card, borderRadius:24, boxShadow:'0 30px 80px rgba(0,0,0,0.6)', border:`1px solid ${card}dd` }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:bg }}>
      <Loader2 size={28} style={{ color:'#3a5038', animation:'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', fontFamily:'Runethia, Georgia, serif', background: bg }}>

      {/* ── ENVELOPE ──────────────────────────────────────────────────── */}
      {page === 'envelope' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px' }}>
          <p style={{ fontSize:12, letterSpacing:'0.25em', textTransform:'uppercase', color:sage+'aa', marginBottom:8 }}>You&apos;ve got mail from</p>
          <h1 style={{ fontFamily:'Runethia,Palatino,Georgia,serif', fontSize:48, fontWeight:400, color:titleCol, marginBottom:48 }}>{displayNames}</h1>

          <div style={{ position:'relative', width:320, height:210, cursor:'pointer' }} onClick={openEnvelope}>
            {/* Body */}
            <div style={{ position:'absolute', inset:0, borderRadius:16, background:'linear-gradient(135deg, #1a0a0f 0%, #2d1018 100%)', boxShadow:'0 20px 60px rgba(0,0,0,0.7)' }}/>
            {/* Side folds */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom right, transparent 49.5%, rgba(0,0,0,0.2) 50%)', borderRadius:16 }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom left, transparent 49.5%, rgba(255,255,255,0.04) 50%)', borderRadius:16 }}/>
            {/* Flap */}
            <div style={{ position:'absolute', left:0, right:0, top:0, height:'50%', transformOrigin:'top center', transform: envelopeOpen ? 'rotateX(180deg)' : 'rotateX(0deg)', transition:'transform 0.7s cubic-bezier(0.4,0,0.2,1)', background:'linear-gradient(135deg, #150508 0%, #260c13 100%)', clipPath:'polygon(0 0, 100% 0, 50% 100%)', borderRadius:'16px 16px 0 0' }}/>
            {/* Wax seal — heart */}
            <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg, #c8956a, #a87040)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.5)' }}>
              <Heart size={22} fill="#fff" style={{ color:'#fff' }} />
            </div>
          </div>

          <button onClick={openEnvelope} style={{ marginTop:40, padding:'12px 36px', borderRadius:50, background:accent, color:titleCol, border:'none', fontSize:15, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
            Open
          </button>
          <p style={{ fontSize:13, color:sage+'44', marginTop:12 }}>Tap to open your invitation</p>
        </div>
      )}

      {/* ── INVITE CARD ───────────────────────────────────────────────── */}
      {page === 'invite' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('envelope')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, overflow:'hidden', marginTop:12 }}>
            {/* Hero */}
            <div style={{ position:'relative', height:260, background: s.heroImage ? undefined : `linear-gradient(135deg, ${card}, ${bg})` }}>
              {s.heroImage && <img src={s.heroImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}/>
              {s.photo1 && (
                <div style={{ position:'absolute', bottom:12, right:12, background:'#fff', padding:6, boxShadow:'0 8px 24px rgba(0,0,0,0.5)', transform:'rotate(2deg)' }}>
                  <img src={s.photo1} alt="" style={{ width:72, height:56, objectFit:'cover' }} />
                  <p style={{ textAlign:'center', fontSize:9, color:bodyCol, marginTop:4, fontStyle:'italic' }}>a new adventure</p>
                </div>
              )}
            </div>
            {/* Content */}
            <div style={{ padding:'28px 32px', textAlign:'center' }}>
              <p style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:6 }}>{s.subheading}</p>
              <h2 style={{ fontFamily:'Runethia,Palatino,Georgia,serif', fontSize:36, fontWeight:400, color:titleCol, marginBottom:12 }}>{displayNames}</h2>
              <div style={{ width:40, height:1, background:'#2a3829', margin:'0 auto 16px' }}/>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:sage, marginBottom:6 }}>DATE</p>
              <p style={{ fontFamily:'Runethia,Palatino,serif', fontSize:18, color:titleCol, marginBottom:12 }}>{dateDisplay}</p>
              <p style={{ fontSize:13, color:sage+'aa' }}>{venueDisplay}{venueAddress ? ` · ${venueAddress}` : ''}</p>
            </div>
            {/* Nav buttons */}
            <div style={{ padding:'0 20px 24px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {[{ label:'Details', p:'details' as Page }, { label:'Our Story', p:'story' as Page }, { label:'RSVP', p:'rsvp-search' as Page }].map(({ label, p }) => (
                <button key={label} onClick={() => setPage(p)} style={{ padding:'10px 0', borderRadius:12, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background: p==='rsvp-search' ? accent : accentLight, color: p==='rsvp-search' ? '#e8f0e6' : sage, letterSpacing:'0.05em' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS ───────────────────────────────────────────────────── */}
      {page === 'details' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('invite')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, overflow:'hidden', marginTop:12 }}>
            <div style={{ padding:'28px 28px 12px', textAlign:'center' }}>
              <p style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:4 }}>Date &</p>
              <h2 style={{ fontFamily:'Runethia,Palatino,Georgia,serif', fontSize:30, fontWeight:300, color:titleCol, marginBottom:16 }}>Location</h2>
              <div style={{ width:32, height:1, background:'#2a3829', margin:'0 auto 16px' }}/>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:sage+'aa', marginBottom:4 }}>DATE</p>
              <p style={{ fontFamily:'Runethia,Palatino,serif', fontSize:19, color:titleCol, marginBottom:6 }}>{dateDisplay}</p>
              {venueAddress && <p style={{ fontSize:13, color:sage+'aa', marginBottom:4 }}>{venueDisplay}</p>}
              {venueAddress && <p style={{ fontSize:12, color:sage+'44' }}>{venueAddress}</p>}
            </div>

            {/* Timeline grid — from DB */}
            <div style={{ padding:'16px 20px 20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                {(timeline.length > 0 ? timeline : [
                  {id:'a',time:'4:00 PM',title:'I Do',desc:'',who:'',order:1},
                  {id:'b',time:'5:00 PM',title:'Say Cheese',desc:'',who:'',order:2},
                  {id:'c',time:'6:00 PM',title:'Toast',desc:'',who:'',order:3},
                  {id:'d',time:'7:00 PM',title:'Dinner',desc:'',who:'',order:4},
                  {id:'e',time:'9:00 PM',title:'Cake',desc:'',who:'',order:5},
                  {id:'f',time:'10:00 PM',title:'Dance',desc:'',who:'',order:6},
                ]).slice(0, 6).map(item => (
                  <div key={item.id} style={{ textAlign:'center', padding:'14px 8px', border:`1px solid ${card}`, borderRadius:14, background:card+'cc' }}>
                    <div style={{ fontSize:28, marginBottom:6 }}>{getIcon(item.title)}</div>
                    <p style={{ fontSize:12, fontWeight:600, color:sage }}>{item.time}</p>
                    <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:sage, marginTop:2 }}>{item.title}</p>
                  </div>
                ))}
              </div>

              {/* Dress code */}
              <div style={{ marginTop:20, textAlign:'center', borderTop:`1px solid ${card}`, paddingTop:18 }}>
                <p style={{ fontFamily:'Runethia,Palatino,serif', fontStyle:'italic', fontSize:16, color:sage, marginBottom:6 }}>Dress Code</p>
                <p style={{ fontSize:13, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:titleCol, marginBottom:8 }}>{s.dressCode}</p>
                <p style={{ fontSize:12, color:sage+'aa', lineHeight:1.6, marginBottom:20 }}>{s.dressCodeNote}</p>
                {/* Color palette swatches */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  {([
                    { color: s.swatchBridesmaids, label: 'Bridesmaid\ndresses' },
                    { color: s.swatchSuits,       label: "Men's\nsuits" },
                    { color: s.swatchVenue,       label: 'Venue\ncolors' },
                    { color: s.swatchFlowers,     label: 'Floral\ncolors' },
                  ] as {color:string; label:string}[]).map(({ color, label }) => (
                    <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:color, boxShadow:`0 0 0 3px ${card}, 0 0 0 5px ${color}66`, flexShrink:0 }} />
                      <p style={{ fontSize:10, color:sage+'88', lineHeight:1.4, textAlign:'center', whiteSpace:'pre-line' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setPage('rsvp-search')} style={{ marginTop:16, width:'100%', maxWidth:380, padding:'14px', borderRadius:14, background:accent, color:titleCol, border:'none', fontSize:15, fontWeight:600, cursor:'pointer' }}>
            RSVP now
          </button>
        </div>
      )}

      {/* ── OUR STORY ─────────────────────────────────────────────────── */}
      {page === 'story' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('invite')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, marginTop:12 }}>
            {/* Story header */}
            <div style={{ ...cardStyle, padding:'28px', textAlign:'center', marginBottom:12 }}>
              <p style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:4 }}>Our</p>
              <h2 style={{ fontFamily:'Runethia,Palatino,serif', fontSize:38, fontWeight:400, color:titleCol }}>Love Story</h2>
            </div>

            {/* Alternating photo + text layout */}
            <div style={{ ...cardStyle, padding:'24px' }}>
              {(() => {
                const paras = s.ourStory.split('\n\n').filter(Boolean)
                const photos = [s.photo1, s.photo2, s.photo3].filter(Boolean)
                const photoStyle = (rot: number) => ({
                  background:'#fff', padding:6,
                  boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
                  transform:`rotate(${rot}deg)`,
                  display:'inline-block'
                })
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    {/* Photo 1 — top left */}
                    {photos[0] && (
                      <div style={{ display:'flex', justifyContent:'flex-start' }}>
                        <div style={photoStyle(-2)}>
                          <img src={photos[0]} alt="" style={{ width:140, height:110, objectFit:'cover', display:'block' }} />
                        </div>
                      </div>
                    )}
                    {/* Para 1 */}
                    {paras[0] && <p style={{ fontFamily:'Runethia,Palatino,serif', fontSize:15, color:bodyCol, lineHeight:1.9, textAlign:'center', fontStyle:'italic' }}>{paras[0]}</p>}
                    {/* Photo 2 — middle right */}
                    {photos[1] && (
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <div style={photoStyle(1.5)}>
                          <img src={photos[1]} alt="" style={{ width:140, height:110, objectFit:'cover', display:'block' }} />
                        </div>
                      </div>
                    )}
                    {/* Para 2 */}
                    {paras[1] && <p style={{ fontFamily:'Runethia,Palatino,serif', fontSize:15, color:bodyCol, lineHeight:1.9, textAlign:'center', fontStyle:'italic' }}>{paras[1]}</p>}
                    {/* Photo 3 — bottom left */}
                    {photos[2] && (
                      <div style={{ display:'flex', justifyContent:'flex-start' }}>
                        <div style={photoStyle(-1)}>
                          <img src={photos[2]} alt="" style={{ width:140, height:110, objectFit:'cover', display:'block' }} />
                        </div>
                      </div>
                    )}
                    {/* Remaining paragraphs */}
                    {paras.slice(2).map((para, i) => (
                      <p key={i} style={{ fontFamily:'Runethia,Palatino,serif', fontSize:15, color:bodyCol, lineHeight:1.9, textAlign:'center', fontStyle:'italic' }}>{para}</p>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
          <button onClick={() => setPage('rsvp-search')} style={{ marginTop:16, width:'100%', maxWidth:380, padding:'14px', borderRadius:14, background:accent, color:titleCol, border:'none', fontSize:15, fontWeight:600, cursor:'pointer' }}>
            RSVP now
          </button>
        </div>
      )}

      {/* ── RSVP SEARCH ───────────────────────────────────────────────── */}
      {page === 'rsvp-search' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('invite')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, padding:'32px', marginTop:12 }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <Heart size={22} fill={accent} style={{ color:accent, margin:'0 auto 12px' }} />
              <h2 style={{ fontFamily:'Runethia,Palatino,Georgia,serif', fontSize:30, fontWeight:300, color:titleCol, marginBottom:6 }}>RSVP</h2>
              <p style={{ fontSize:14, color:sage+'aa' }}>{s.searchLabel}</p>
            </div>
            <div style={{ position:'relative', marginBottom:12 }}>
              <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && searchGuest()} placeholder="Your full name" autoFocus
                style={{ width:'100%', padding:'14px 48px 14px 18px', borderRadius:14, border:'1px solid #2a3829', fontSize:16, background:'#141c13', color:titleCol, outline:'none', boxSizing:'border-box' }}
                onFocus={e=>{e.target.style.borderColor=accent;e.target.style.boxShadow=`0 0 0 3px ${accent}25`}}
                onBlur={e=>{e.target.style.borderColor='#2a3829';e.target.style.boxShadow='none'}} />
              <Search size={17} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color:sage+'44' }} />
            </div>
            <button onClick={searchGuest} disabled={searching || !nameInput.trim()}
              style={{ width:'100%', padding:'14px', borderRadius:14, background: searching||!nameInput.trim() ? '#1e2e1c' : accent, color:titleCol, border:'none', fontSize:15, fontWeight:600, cursor: searching||!nameInput.trim() ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {searching ? <><Loader2 size={17} style={{animation:'spin 1s linear infinite'}} />Searching…</> : <>Find my invitation <ChevronRight size={17}/></>}
            </button>
          </div>
        </div>
      )}

      {/* ── MULTIPLE MATCHES ──────────────────────────────────────────── */}
      {page === 'rsvp-multiple' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('rsvp-search')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, padding:'32px', marginTop:12 }}>
            <h2 style={{ fontFamily:'Runethia,Palatino,serif', fontSize:26, fontWeight:300, color:titleCol, marginBottom:6 }}>A few matches</h2>
            <p style={{ fontSize:14, color:sage+'aa', marginBottom:20 }}>Select your name below</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {matches.map(g => (
                <button key={g.id} onClick={() => pickGuest(g)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderRadius:14, border:'1px solid #2a3829', background:'#141c13', color:titleCol, cursor:'pointer', textAlign:'left', fontSize:15, fontWeight:500 }}>
                  {g.name}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {g.already_rsvpd && <span style={{ fontSize:12, padding:'2px 8px', borderRadius:20, background:accentLight, color:accent }}>RSVPd</span>}
                    <ChevronRight size={17} style={{ color:sage+'44' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NOT FOUND ─────────────────────────────────────────────────── */}
      {page === 'rsvp-not-found' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('rsvp-search')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, padding:'36px', marginTop:12, textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#2a1a08', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Search size={24} style={{ color:'#d97706' }} />
            </div>
            <h2 style={{ fontFamily:'Runethia,Palatino,serif', fontSize:24, color:titleCol, marginBottom:8 }}>Name not found</h2>
            <p style={{ fontSize:14, color:sage+'aa', lineHeight:1.6, marginBottom:24 }}>We couldn&apos;t find &ldquo;{nameInput}&rdquo; on the guest list. Please try your full name{s.contactEmail ? ` or contact us at ${s.contactEmail}` : ''}.</p>
            <button onClick={() => { setPage('rsvp-search'); setNameInput('') }} style={{ width:'100%', padding:'13px', borderRadius:14, background:'#1e2e1c', color:sage, border:'1px solid #2a3829', fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── DETAILS VIEW (already RSVPd) ──────────────────────────────── */}
      {page === 'rsvp-details' && guest && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('rsvp-search')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, overflow:'hidden', marginTop:12 }}>
            <div style={{ padding:'28px 28px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <h2 style={{ fontFamily:'Runethia,Palatino,serif', fontSize:28, fontWeight:300, color:titleCol }}>Hi, {guest.name.split(' ')[0]}!</h2>
                <button onClick={startEdit} style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, color:sage, background:'none', border:'none', cursor:'pointer' }}><Edit3 size={15}/>Edit</button>
              </div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:20, fontSize:14, fontWeight:600, marginBottom:20, background: guest.rsvp_status==='attending' ? accent+'20' : '#7f202020', color: guest.rsvp_status==='attending' ? sage : '#f87171' }}>
                <Check size={14}/> {guest.rsvp_status==='attending' ? 'Attending 🎉' : 'Unable to attend'}
              </div>
              {[
                ['Name', guest.name], ['Email', guest.email||'Not provided'], ['Dietary', guest.dietary||'None'],
                ...(guest.has_plus_one ? [['Plus one', guest.plus_one_name||'Not bringing one']] : []),
                ...(guest.plus_one_name ? [['Plus one dietary', guest.plus_one_dietary||'None']] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${card}` }}>
                  <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:sage+'aa' }}>{label}</span>
                  <span style={{ fontSize:14, color:titleCol, textAlign:'right', maxWidth:'60%' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #1a2419', background:card+'cc' }}>
              <a href="/info" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px', borderRadius:14, background:accent, color:titleCol, textDecoration:'none', fontSize:14, fontWeight:600 }}>
                View wedding details <ChevronRight size={15}/>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT RSVP ─────────────────────────────────────────────────── */}
      {page === 'rsvp-editing' && guest && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('rsvp-details')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, padding:'28px', marginTop:12 }}>
            <h2 style={{ fontFamily:'Runethia,Palatino,serif', fontSize:26, fontWeight:300, color:titleCol, marginBottom:20 }}>Update your RSVP</h2>
            <RSVPForm attending={attending} setAttending={setAttending} dietary={dietary} setDietary={setDietary} plusOneName={plusOneName} setPlusOneName={setPlusOneName} plusOneDietary={plusOneDietary} setPlusOneDietary={setPlusOneDietary} email={email} setEmail={setEmail} hasPlusOne={guest.has_plus_one} attendingLabel={s.attendingLabel} declineLabel={s.declineLabel} accent={accent} sage={sage} card={card} titleCol={titleCol} />
            <button onClick={() => submit(true)} disabled={attending===null||submitting} style={{ width:'100%', padding:'14px', borderRadius:14, background: attending===null||submitting ? '#1e2e1c' : accent, color:titleCol, border:'none', fontSize:15, fontWeight:600, cursor: attending===null||submitting ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:20 }}>
              {submitting ? <><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Saving…</> : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── FRESH RSVP FORM ───────────────────────────────────────────── */}
      {page === 'rsvp-form' && guest && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px' }}>
          <Nav onBack={() => setPage('rsvp-search')} sage={sage} />
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, padding:'28px', marginTop:12 }}>
            <h2 style={{ fontFamily:'Runethia,Palatino,serif', fontSize:28, fontWeight:300, color:titleCol, marginBottom:4 }}>Hi, {guest.name.split(' ')[0]}!</h2>
            <p style={{ fontSize:14, color:sage+'aa', marginBottom:24 }}>We can&apos;t wait to celebrate with you.</p>
            <RSVPForm attending={attending} setAttending={setAttending} dietary={dietary} setDietary={setDietary} plusOneName={plusOneName} setPlusOneName={setPlusOneName} plusOneDietary={plusOneDietary} setPlusOneDietary={setPlusOneDietary} email={email} setEmail={setEmail} hasPlusOne={guest.has_plus_one} attendingLabel={s.attendingLabel} declineLabel={s.declineLabel} accent={accent} sage={sage} card={card} titleCol={titleCol} />
            <button onClick={() => submit(false)} disabled={attending===null||submitting} style={{ width:'100%', padding:'14px', borderRadius:14, background: attending===null||submitting ? '#1e2e1c' : accent, color:titleCol, border:'none', fontSize:15, fontWeight:600, cursor: attending===null||submitting ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:20 }}>
              {submitting ? <><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Submitting…</> : 'Submit RSVP'}
            </button>
          </div>
        </div>
      )}

      {/* ── DONE ──────────────────────────────────────────────────────── */}
      {page === 'rsvp-done' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
          <div style={{ width:'100%', maxWidth:380, ...cardStyle, padding:'40px', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:accentLight, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              {attending ? <Heart size={28} fill={accent} style={{ color:accent }} /> : <Check size={28} style={{ color:accent }} />}
            </div>
            <h2 style={{ fontFamily:'Runethia,Palatino,Georgia,serif', fontSize:36, fontWeight:400, color:titleCol, marginBottom:12 }}>
              {attending ? "We'll see you there! 🌿" : "We'll miss you!"}
            </h2>
            <p style={{ fontSize:14, color:sage+'aa', lineHeight:1.7, marginBottom:28 }}>
              {attending ? s.confirmedMessage : s.declinedMessage}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {attending && <a href="/info" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:14, background:accent, color:titleCol, textDecoration:'none', fontSize:14, fontWeight:600 }}>View wedding details <ChevronRight size={15}/></a>}
              <button onClick={() => setPage('rsvp-details')} style={{ padding:'13px', borderRadius:14, background:'transparent', color:sage, border:`1px solid ${card}`, fontSize:14, cursor:'pointer', fontWeight:500 }}>View my RSVP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Nav({ onBack, sage }: { onBack: () => void; sage: string }) {
  return (
    <button onClick={onBack} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:6, fontSize:14, color:sage+'88', background:'none', border:'none', cursor:'pointer', marginBottom:4 }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=sage}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=sage+'88'}>
      <ArrowLeft size={15}/> Back
    </button>
  )
}

function RSVPForm({ attending, setAttending, dietary, setDietary, plusOneName, setPlusOneName, plusOneDietary, setPlusOneDietary, email, setEmail, hasPlusOne, attendingLabel, declineLabel, accent, sage, card, titleCol }: {
  attending: boolean|null; setAttending:(v:boolean)=>void; dietary:string; setDietary:(v:string)=>void
  plusOneName:string; setPlusOneName:(v:string)=>void; plusOneDietary:string; setPlusOneDietary:(v:string)=>void
  email:string; setEmail:(v:string)=>void; hasPlusOne:boolean; attendingLabel:string; declineLabel:string; accent:string; sage:string; card:string; titleCol:string
}) {
  const inp = { width:'100%', padding:'12px 16px', borderRadius:12, border:'1px solid #2a3829', fontSize:15, background:card+'88', color:titleCol, outline:'none', boxSizing:'border-box' as const }
  const lbl = { display:'block' as const, fontSize:12, fontWeight:700 as const, color:sage, textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:8 }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div>
        <p style={lbl}>Will you be joining us?</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={() => setAttending(true)} style={{ padding:'12px', borderRadius:12, fontSize:14, fontWeight:600, border:`2px solid ${attending===true ? accent : '#2a3829'}`, background: attending===true ? accent+'20' : 'transparent', color: attending===true ? sage : '#3a5038', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Heart size={14} style={attending===true ? {fill:accent,color:accent} : {}} /> {attendingLabel}
          </button>
          <button onClick={() => setAttending(false)} style={{ padding:'12px', borderRadius:12, fontSize:14, fontWeight:600, border:`2px solid ${attending===false ? '#7f2020' : '#2a3829'}`, background: attending===false ? '#7f202020' : 'transparent', color: attending===false ? '#f87171' : '#3a5038', cursor:'pointer' }}>
            {declineLabel}
          </button>
        </div>
      </div>
      {attending===true && (<>
        {hasPlusOne && <div>
          <p style={lbl}>Plus one <span style={{ textTransform:'none', fontWeight:400, color:sage+'44' }}>(optional)</span></p>
          <input style={inp} value={plusOneName} onChange={e=>setPlusOneName(e.target.value)} placeholder="Full name" />
          {plusOneName && <select style={{ ...inp, marginTop:8, cursor:'pointer' }} value={plusOneDietary} onChange={e=>setPlusOneDietary(e.target.value)}>{DIETARY.map(o=><option key={o} value={o}>{o||'No dietary restrictions'}</option>)}</select>}
        </div>}
        <div>
          <p style={lbl}>Dietary requirements</p>
          <select style={{ ...inp, cursor:'pointer' }} value={dietary} onChange={e=>setDietary(e.target.value)}>{DIETARY.map(o=><option key={o} value={o}>{o||'No restrictions'}</option>)}</select>
        </div>
      </>)}
      {attending!==null && <div>
        <p style={lbl}>Email {attending ? 'for confirmation' : ''}</p>
        <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
      </div>}
    </div>
  )
}
