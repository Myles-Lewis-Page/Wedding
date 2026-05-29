'use client'
import { useState, useEffect } from 'react'
import { Heart, Check, ChevronRight, Loader2, ArrowLeft } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface S {
  heading: string; subheading: string
  heroImage: string; hero_image: string
  accentColor: string; secondaryColor: string; bgColor: string; tertiaryColor: string
  brideName: string; groomName: string; coupleNames: string
  searchLabel: string; attendingLabel: string; declineLabel: string
  confirmedMessage: string; declinedMessage: string; contactEmail: string
  ourStory: string; photo1: string; photo2: string; photo3: string
  dressCode: string; dressCodeNote: string; weddingDate: string
  swatchBridesmaids: string; swatchSuits: string; swatchVenue: string; swatchFlowers: string
  titleColor: string; subheaderColor: string; bodyColor: string
}
interface Venue { name: string; address: string; isSelected: boolean }
interface TL { id: string; time: string; title: string; desc: string; order: number }
interface Guest {
  id: string; name: string; has_plus_one: boolean; already_rsvpd: boolean
  rsvp_status: string; dietary: string|null; email: string|null
  plus_one_name: string|null; plus_one_dietary: string|null
}
type Page = 'envelope'|'invite'|'details'|'story'|'rsvp-search'|'rsvp-form'|'rsvp-multiple'|'rsvp-not-found'|'rsvp-details'|'rsvp-editing'|'rsvp-done'

const DIETARY = ['','Vegetarian','Vegan','Gluten-free','Nut allergy','Halal','Kosher','Other']

const DEF: S = {
  heading:'Our Wedding', subheading:'Together with their families',
  heroImage:'', hero_image:'',
  accentColor:'#4a7a44', secondaryColor:'#8fb882', bgColor:'#111714', tertiaryColor:'#1a2419',
  brideName:'', groomName:'', coupleNames:'Our Wedding',
  searchLabel:'Enter your name as it appears on your invitation',
  attendingLabel:"Yes, I'll be there!", declineLabel:'Regretfully no',
  confirmedMessage:"We can't wait to celebrate with you!",
  declinedMessage:"Thank you for letting us know. We'll be thinking of you!",
  contactEmail:'',
  ourStory:"We didn't expect our story to begin the way it did, but from the very first moment something just felt right.\n\nWhat started with simple conversations quickly turned into something deeper, and little by little we realised we had found someone truly special.\n\nSince then, we've shared so many memories — the quiet moments, the big laughs, the small adventures that somehow become the ones you cherish most.",
  photo1:'', photo2:'', photo3:'',
  dressCode:'Garden Formal', dressCodeNote:'We would love for you to celebrate with us in attire that feels elegant and true to your style.',
  weddingDate:'',
  swatchBridesmaids:'#9bb89a', swatchSuits:'#4a5568', swatchVenue:'#8b7355', swatchFlowers:'#e8b4bc',
  titleColor:'#ffffff', subheaderColor:'#000000', bodyColor:'#9ca3af',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function Nav({ onBack, col }: { onBack:()=>void; col:string }) {
  return (
    <button onClick={onBack} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:6, fontSize:15, color:col+'88', background:'none', border:'none', cursor:'pointer', marginBottom:8, fontFamily:'Runethia,Georgia,serif' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=col}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=col+'88'}>
      <ArrowLeft size={15}/> Back
    </button>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function RSVPPage() {
  const [page, setPage] = useState<Page>('envelope')
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [s, setS] = useState<S>(DEF)
  const [venue, setVenue] = useState<Venue|null>(null)
  const [timeline, setTimeline] = useState<TL[]>([])
  const [loading, setLoading] = useState(true)
  const [nameInput, setNameInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<Guest[]>([])
  const [guest, setGuest] = useState<Guest|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [attending, setAttending] = useState<boolean|null>(null)
  const [dietary, setDietary] = useState('')
  const [plusOneName, setPlusOneName] = useState('')
  const [plusOneDietary, setPlusOneDietary] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Apply saved colors instantly from localStorage
    try {
      const lc = JSON.parse(localStorage.getItem('weddingColors')||'{}')
      if (lc.accent || lc.bg) setS(p => ({
        ...p,
        ...(lc.accent    && { accentColor:    lc.accent    }),
        ...(lc.sage      && { secondaryColor: lc.sage      }),
        ...(lc.bg        && { bgColor:        lc.bg        }),
        ...(lc.tertiary  && { tertiaryColor:  lc.tertiary  }),
        ...(lc.title     && { titleColor:     lc.title     }),
        ...(lc.body      && { bodyColor:      lc.body      }),
        ...(lc.swatchBridesmaids && { swatchBridesmaids: lc.swatchBridesmaids }),
        ...(lc.swatchSuits       && { swatchSuits:       lc.swatchSuits       }),
        ...(lc.swatchVenue       && { swatchVenue:       lc.swatchVenue       }),
        ...(lc.swatchFlowers     && { swatchFlowers:     lc.swatchFlowers     }),
      }))
    } catch {}

    Promise.all([
      fetch('/api/db?t=rsvp-settings').then(r=>r.json()),
      fetch('/api/db?t=venues').then(r=>r.json()),
      fetch('/api/db?t=timeline').then(r=>r.json()),
    ]).then(([rs, vs, tl]) => {
      if (rs && !rs.error) {
        // hero_image or heroImage — handle both column name variants
        const heroImg = rs.hero_image || rs.heroImage || ''
        setS({ ...DEF, ...rs, heroImage: heroImg, hero_image: heroImg })
        localStorage.setItem('weddingColors', JSON.stringify({
          accent:   rs.accentColor    || '#4a7a44',
          sage:     rs.secondaryColor || '#8fb882',
          bg:       rs.bgColor        || '#111714',
          tertiary: rs.tertiaryColor  || '#1a2419',
          title:    rs.titleColor     || '#ffffff',
          body:     rs.bodyColor      || '#9ca3af',
          swatchBridesmaids: rs.swatchBridesmaids || '#9bb89a',
          swatchSuits:       rs.swatchSuits       || '#4a5568',
          swatchVenue:       rs.swatchVenue        || '#8b7355',
          swatchFlowers:     rs.swatchFlowers      || '#e8b4bc',
        }))
      }
      if (Array.isArray(vs)) setVenue(vs.find((v:Venue)=>v.isSelected)??null)
      if (Array.isArray(tl)) setTimeline(tl)
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [])

  // Derived values
  const names = s.brideName && s.groomName ? `${s.brideName} & ${s.groomName}`
    : s.brideName || s.groomName || (s.coupleNames !== 'Our Wedding' ? s.coupleNames : 'Our Wedding')
  const wdFmt = s.weddingDate || (typeof window!=='undefined' ? localStorage.getItem('weddingDate')||'' : '')
  const dateStr = wdFmt ? new Date(wdFmt+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : 'Date TBD'
  const venueName = venue?.name || 'Venue TBD'
  const venueAddr = venue?.address || ''

  // Colors
  const ac = s.accentColor  || '#4a7a44'
  const sg = s.secondaryColor || '#8fb882'
  const bg = s.bgColor || '#111714'
  const cd = s.tertiaryColor || '#1a2419'
  const tc = s.titleColor  || '#ffffff'
  const bc = s.bodyColor   || '#9ca3af'
  const heroImg = s.heroImage || s.hero_image || ''

  const card  = { background:cd, borderRadius:24, boxShadow:'0 24px 64px rgba(0,0,0,0.6)', border:`1px solid ${cd}cc` }
  const font  = 'Runethia,Palatino,Georgia,serif'
  const wrap  = { minHeight:'100vh', display:'flex' as const, flexDirection:'column' as const, alignItems:'center' as const, padding:'32px 20px' }
  const mw    = { width:'100%', maxWidth:400 }

  // RSVP actions
  const openEnvelope = () => { setEnvelopeOpen(true); setTimeout(()=>setPage('invite'),800) }
  const searchGuest  = async () => {
    if (!nameInput.trim()) return
    setSearching(true)
    try {
      const r = await fetch(`/api/rsvp?name=${encodeURIComponent(nameInput)}`)
      const d = await r.json()
      if (d.found && d.guests?.length>0) {
        setMatches(d.guests)
        if (d.guests.length===1) pickGuest(d.guests[0])
        else setPage('rsvp-multiple')
      } else setPage('rsvp-not-found')
    } finally { setSearching(false) }
  }
  const pickGuest = (g:Guest) => { setGuest(g); setPage(g.already_rsvpd?'rsvp-details':'rsvp-form') }
  const startEdit = () => {
    if (!guest) return
    setAttending(guest.rsvp_status==='attending')
    setDietary(guest.dietary||''); setPlusOneName(guest.plus_one_name||'')
    setPlusOneDietary(guest.plus_one_dietary||''); setEmail(guest.email||'')
    setPage('rsvp-editing')
  }
  const submit = async (isEdit=false) => {
    if (!guest||attending===null) return
    setSubmitting(true)
    try {
      const r = await fetch('/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({guest_id:guest.id,attending,plus_one_name:plusOneName||null,dietary:dietary||null,plus_one_dietary:plusOneDietary||null,email:email||null})})
      if (r.ok) {
        setGuest(g=>g?{...g,rsvp_status:attending?'attending':'declined',already_rsvpd:true,dietary:dietary||null,email:email||null,plus_one_name:plusOneName||null,plus_one_dietary:plusOneDietary||null}:g)
        setPage(isEdit?'rsvp-details':'rsvp-done')
      }
    } finally { setSubmitting(false) }
  }

  // Input / label styles
  const inp = { width:'100%', padding:'13px 16px', borderRadius:12, border:`1px solid ${cd}`, fontSize:15, background:cd+'88', color:tc, outline:'none', boxSizing:'border-box' as const, fontFamily:font }
  const lbl = { display:'block' as const, fontSize:13, fontWeight:700 as const, color:sg, textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:8, fontFamily:font }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:bg }}>
      <Loader2 size={28} style={{ color:ac, animation:'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:bg, fontFamily:font }}>

      {/* ── ENVELOPE ─────────────────────────────────────────────────── */}
      {page==='envelope' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px', textAlign:'center' }}>
          <p style={{ fontSize:12, letterSpacing:'0.28em', textTransform:'uppercase', color:sg+'88', marginBottom:10, fontFamily:font }}>You&apos;ve got mail from</p>
          <h1 style={{ fontFamily:font, fontSize:52, fontWeight:400, color:tc, marginBottom:52, letterSpacing:'0.02em' }}>{names}</h1>
          <div style={{ position:'relative', width:300, height:200, cursor:'pointer' }} onClick={openEnvelope}>
            <div style={{ position:'absolute', inset:0, borderRadius:14, background:`linear-gradient(135deg, ${cd} 0%, ${bg} 100%)`, boxShadow:'0 20px 60px rgba(0,0,0,0.7)' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom right, transparent 49.5%, rgba(0,0,0,0.15) 50%)', borderRadius:14 }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom left, transparent 49.5%, rgba(255,255,255,0.04) 50%)', borderRadius:14 }}/>
            <div style={{ position:'absolute', left:0, right:0, top:0, height:'50%', transformOrigin:'top center', transform:envelopeOpen?'rotateX(180deg)':'rotateX(0deg)', transition:'transform 0.7s cubic-bezier(0.4,0,0.2,1)', background:`linear-gradient(135deg, ${cd}dd 0%, ${bg} 100%)`, clipPath:'polygon(0 0, 100% 0, 50% 100%)', borderRadius:'14px 14px 0 0' }}/>
            <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', width:48, height:48, borderRadius:'50%', background:`linear-gradient(135deg, ${ac}, ${ac}88)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.5)' }}>
              <Heart size={20} fill="#fff" style={{ color:'#fff' }} />
            </div>
          </div>
          <button onClick={openEnvelope} style={{ marginTop:36, padding:'13px 40px', borderRadius:50, background:ac, color:tc, border:'none', fontSize:16, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', fontFamily:font }}>Open</button>
          <p style={{ fontSize:13, color:sg+'44', marginTop:10, fontFamily:font }}>Tap to open your invitation</p>
        </div>
      )}

      {/* ── INVITE CARD ──────────────────────────────────────────────── */}
      {page==='invite' && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('envelope')} col={sg} />
          <div style={{ ...mw, ...card, overflow:'hidden', marginTop:8 }}>
            {/* Hero image — fills full width */}
            <div style={{ position:'relative', height:280, background: heroImg ? undefined : `linear-gradient(160deg, ${cd} 0%, ${bg} 100%)`, overflow:'hidden' }}>
              {heroImg && <img src={heroImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}/>
              {/* Name overlaid on hero */}
              <div style={{ position:'absolute', bottom:20, left:0, right:0, textAlign:'center' }}>
                <h2 style={{ fontFamily:font, fontSize:34, fontWeight:400, color:'#ffffff', textShadow:'0 2px 12px rgba(0,0,0,0.8)' }}>{names}</h2>
              </div>
            </div>
            {/* Content */}
            <div style={{ padding:'28px 28px 20px', textAlign:'center' }}>
              <p style={{ fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:sg, marginBottom:10, fontFamily:font }}>{s.subheading}</p>
              <div style={{ width:36, height:1, background:sg+'44', margin:'0 auto 16px' }}/>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:sg+'aa', marginBottom:6, fontFamily:font }}>DATE</p>
              <p style={{ fontFamily:font, fontSize:20, color:tc, marginBottom:10 }}>{dateStr}</p>
              <p style={{ fontSize:14, color:sg+'88', fontFamily:font }}>{venueName}{venueAddr ? ` · ${venueAddr}` : ''}</p>
            </div>
            {/* Nav buttons */}
            <div style={{ padding:'0 20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {([{label:'Details',p:'details'},{label:'Our Story',p:'story'},{label:'RSVP',p:'rsvp-search'}] as {label:string;p:Page}[]).map(({label,p})=>(
                <button key={label} onClick={()=>setPage(p)} style={{ padding:'11px 0', borderRadius:12, fontSize:14, fontWeight:600, border:'none', cursor:'pointer', background: p==='rsvp-search' ? ac : ac+'22', color: p==='rsvp-search' ? tc : sg, fontFamily:font }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS ──────────────────────────────────────────────────── */}
      {page==='details' && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('invite')} col={sg} />
          <div style={{ ...mw, marginTop:8, display:'flex', flexDirection:'column', gap:12 }}>
            {/* Date & Venue */}
            <div style={{ ...card, padding:'28px' }}>
              <p style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:ac, marginBottom:4, fontFamily:font }}>Date &</p>
              <h2 style={{ fontFamily:font, fontSize:30, fontWeight:400, color:tc, marginBottom:20 }}>Location</h2>
              {[
                { label:'Date', val:dateStr },
                ...(venueName!=='Venue TBD' ? [{ label:'Venue', val:venueName }] : []),
                ...(venueAddr ? [{ label:'Address', val:venueAddr }] : []),
              ].map(({label,val})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${cd}` }}>
                  <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:sg+'88', fontFamily:font }}>{label}</span>
                  <span style={{ fontSize:14, color:tc, textAlign:'right', maxWidth:'60%', fontFamily:font }}>{val}</span>
                </div>
              ))}
            </div>
            {/* Timeline */}
            {timeline.length>0 && (
              <div style={{ ...card, padding:'28px' }}>
                <h3 style={{ fontFamily:font, fontSize:22, fontWeight:400, color:tc, marginBottom:16 }}>Timeline</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[...timeline].sort((a,b)=>a.order-b.order).map(item=>(
                    <div key={item.id} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:ac+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>✨</div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:sg, fontFamily:font }}>{item.time}</p>
                        <p style={{ fontSize:14, letterSpacing:'0.05em', color:tc, fontFamily:font }}>{item.title}</p>
                        {item.desc && <p style={{ fontSize:12, color:bc, marginTop:2, fontFamily:font }}>{item.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Dress code */}
            <div style={{ ...card, padding:'28px', textAlign:'center' }}>
              <p style={{ fontFamily:font, fontStyle:'italic', fontSize:18, color:sg, marginBottom:6 }}>Dress Code</p>
              <p style={{ fontSize:14, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:tc, marginBottom:8, fontFamily:font }}>{s.dressCode}</p>
              <p style={{ fontSize:13, color:bc, lineHeight:1.6, marginBottom:20, fontFamily:font }}>{s.dressCodeNote}</p>
              {/* Colour swatches */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                {[
                  { color:s.swatchBridesmaids, label:'Bridesmaid\ndresses' },
                  { color:s.swatchSuits,       label:"Men's\nsuits"        },
                  { color:s.swatchVenue,       label:'Venue\ncolors'       },
                  { color:s.swatchFlowers,     label:'Floral\ncolors'      },
                ].map(({color,label})=>(
                  <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:color, boxShadow:`0 0 0 3px ${cd}, 0 0 0 5px ${color}66` }}/>
                    <p style={{ fontSize:10, color:sg+'88', lineHeight:1.4, textAlign:'center', whiteSpace:'pre-line', fontFamily:font }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={()=>setPage('rsvp-search')} style={{ width:'100%', padding:'14px', borderRadius:14, background:ac, color:tc, border:'none', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:font }}>RSVP now</button>
          </div>
        </div>
      )}

      {/* ── OUR STORY ────────────────────────────────────────────────── */}
      {page==='story' && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('invite')} col={sg} />
          <div style={{ ...mw, marginTop:8, display:'flex', flexDirection:'column', gap:12 }}>
            {/* Header card */}
            <div style={{ ...card, padding:'28px', textAlign:'center' }}>
              <p style={{ fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:ac, marginBottom:4, fontFamily:font }}>Our</p>
              <h2 style={{ fontFamily:font, fontSize:40, fontWeight:400, color:tc }}>Love Story</h2>
            </div>
            {/* Story body — photos alternate left/right between paragraphs */}
            <div style={{ ...card, padding:'28px' }}>
              {(() => {
                const paras = s.ourStory.split('\n\n').filter(Boolean)
                const photos = [s.photo1, s.photo2, s.photo3].filter(Boolean)
                const polar  = (src:string, rot:number, side:'left'|'right') => (
                  <div style={{ display:'flex', justifyContent: side==='left' ? 'flex-start' : 'flex-end', marginBottom:8 }}>
                    <div style={{ background:'#fff', padding:6, boxShadow:'0 8px 28px rgba(0,0,0,0.5)', transform:`rotate(${rot}deg)`, display:'inline-block' }}>
                      <img src={src} alt="" style={{ width:150, height:115, objectFit:'cover', display:'block' }} />
                    </div>
                  </div>
                )
                const items: React.ReactNode[] = []
                photos[0] && items.push(<div key="p0">{polar(photos[0], -2, 'left')}</div>)
                paras[0]  && items.push(<p key="t0" style={{ fontFamily:font, fontStyle:'italic', fontSize:15, color:bc, lineHeight:1.9, textAlign:'center', marginBottom:8 }}>{paras[0]}</p>)
                photos[1] && items.push(<div key="p1">{polar(photos[1], 1.5, 'right')}</div>)
                paras[1]  && items.push(<p key="t1" style={{ fontFamily:font, fontStyle:'italic', fontSize:15, color:bc, lineHeight:1.9, textAlign:'center', marginBottom:8 }}>{paras[1]}</p>)
                photos[2] && items.push(<div key="p2">{polar(photos[2], -1, 'left')}</div>)
                paras.slice(2).forEach((p,i) => items.push(<p key={`t${i+2}`} style={{ fontFamily:font, fontStyle:'italic', fontSize:15, color:bc, lineHeight:1.9, textAlign:'center', marginBottom:8 }}>{p}</p>))
                return items
              })()}
            </div>
            <button onClick={()=>setPage('rsvp-search')} style={{ width:'100%', padding:'14px', borderRadius:14, background:ac, color:tc, border:'none', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:font }}>RSVP now</button>
          </div>
        </div>
      )}

      {/* ── RSVP SEARCH ──────────────────────────────────────────────── */}
      {page==='rsvp-search' && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('invite')} col={sg} />
          <div style={{ ...mw, ...card, padding:'32px', marginTop:8 }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <Heart size={28} fill={ac} style={{ color:ac }} />
              <h2 style={{ fontFamily:font, fontSize:28, fontWeight:400, color:tc, marginTop:8, marginBottom:6 }}>Find your invitation</h2>
              <p style={{ fontSize:14, color:bc, fontFamily:font }}>{s.searchLabel}</p>
            </div>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchGuest()}
              placeholder="Your full name" style={{ ...inp, marginBottom:12 }} />
            <button onClick={searchGuest} disabled={!nameInput.trim()||searching}
              style={{ width:'100%', padding:'14px', borderRadius:14, background:nameInput.trim()&&!searching?ac:'#1e2e1c', color:tc, border:'none', fontSize:15, fontWeight:600, cursor:nameInput.trim()&&!searching?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:font }}>
              {searching ? <><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Searching…</> : 'Find my invitation'}
            </button>
          </div>
        </div>
      )}

      {/* ── MULTIPLE MATCHES ─────────────────────────────────────────── */}
      {page==='rsvp-multiple' && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('rsvp-search')} col={sg} />
          <div style={{ ...mw, ...card, padding:'28px', marginTop:8 }}>
            <h2 style={{ fontFamily:font, fontSize:24, fontWeight:400, color:tc, marginBottom:6 }}>Multiple guests found</h2>
            <p style={{ fontSize:14, color:bc, marginBottom:20, fontFamily:font }}>Please select your name:</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {matches.map(g=>(
                <button key={g.id} onClick={()=>pickGuest(g)}
                  style={{ padding:'14px 16px', borderRadius:12, background:cd, border:`1px solid ${ac}44`, color:tc, fontSize:15, fontWeight:500, cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:font }}>
                  {g.name} <ChevronRight size={16} style={{ color:sg }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NOT FOUND ────────────────────────────────────────────────── */}
      {page==='rsvp-not-found' && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('rsvp-search')} col={sg} />
          <div style={{ ...mw, ...card, padding:'32px', textAlign:'center', marginTop:8 }}>
            <p style={{ fontSize:32, marginBottom:16 }}>🔍</p>
            <h2 style={{ fontFamily:font, fontSize:24, fontWeight:400, color:tc, marginBottom:8 }}>Name not found</h2>
            <p style={{ fontSize:14, color:bc, lineHeight:1.7, marginBottom:20, fontFamily:font }}>
              We couldn&apos;t find your name. Try a different spelling, or contact us{s.contactEmail ? ` at ${s.contactEmail}` : ''}.
            </p>
            <button onClick={()=>{setPage('rsvp-search');setNameInput('')}} style={{ padding:'12px 28px', borderRadius:50, background:ac, color:tc, border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:font }}>Try again</button>
          </div>
        </div>
      )}

      {/* ── RSVP FORM ────────────────────────────────────────────────── */}
      {page==='rsvp-form' && guest && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('rsvp-search')} col={sg} />
          <div style={{ ...mw, ...card, padding:'28px', marginTop:8 }}>
            <h2 style={{ fontFamily:font, fontSize:28, fontWeight:400, color:tc, marginBottom:4 }}>Hi, {guest.name.split(' ')[0]}!</h2>
            <p style={{ fontSize:14, color:bc, marginBottom:24, fontFamily:font }}>We can&apos;t wait to celebrate with you.</p>
            <RSVPForm {...{attending,setAttending,dietary,setDietary,plusOneName,setPlusOneName,plusOneDietary,setPlusOneDietary,email,setEmail,hasPlusOne:guest.has_plus_one,attendingLabel:s.attendingLabel,declineLabel:s.declineLabel,ac,sg,cd,tc,font,inp,lbl}} />
            <button onClick={()=>submit(false)} disabled={attending===null||submitting}
              style={{ width:'100%', padding:'14px', borderRadius:14, background:attending===null||submitting?'#1e2e1c':ac, color:tc, border:'none', fontSize:15, fontWeight:600, cursor:attending===null||submitting?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:20, fontFamily:font }}>
              {submitting?<><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Submitting…</>:'Submit RSVP'}
            </button>
          </div>
        </div>
      )}

      {/* ── RSVP DETAILS (already rsvp'd) ────────────────────────────── */}
      {page==='rsvp-details' && guest && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('invite')} col={sg} />
          <div style={{ ...mw, ...card, padding:'28px', marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontFamily:font, fontSize:24, fontWeight:400, color:tc }}>Your RSVP</h2>
              <button onClick={startEdit} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:sg, background:'none', border:'none', cursor:'pointer', fontFamily:font }}>Edit</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[
                { label:'Name',     val:guest.name },
                { label:'Status',   val:guest.rsvp_status==='attending'?'✅ Attending':'❌ Declined' },
                ...(guest.dietary   ? [{ label:'Dietary',  val:guest.dietary  }] : []),
                ...(guest.email     ? [{ label:'Email',    val:guest.email    }] : []),
                ...(guest.plus_one_name ? [{ label:'Plus one', val:guest.plus_one_name }] : []),
              ].map(({label,val})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:`1px solid ${cd}` }}>
                  <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:sg+'88', fontFamily:font }}>{label}</span>
                  <span style={{ fontSize:14, color:tc, textAlign:'right', maxWidth:'60%', fontFamily:font }}>{val}</span>
                </div>
              ))}
            </div>
            <a href="/info" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:20, padding:'13px', borderRadius:14, background:ac, color:tc, textDecoration:'none', fontSize:14, fontWeight:600, fontFamily:font }}>
              View wedding details <ChevronRight size={15}/>
            </a>
          </div>
        </div>
      )}

      {/* ── EDIT RSVP ────────────────────────────────────────────────── */}
      {page==='rsvp-editing' && guest && (
        <div style={{ ...wrap }}>
          <Nav onBack={()=>setPage('rsvp-details')} col={sg} />
          <div style={{ ...mw, ...card, padding:'28px', marginTop:8 }}>
            <h2 style={{ fontFamily:font, fontSize:26, fontWeight:400, color:tc, marginBottom:20 }}>Update your RSVP</h2>
            <RSVPForm {...{attending,setAttending,dietary,setDietary,plusOneName,setPlusOneName,plusOneDietary,setPlusOneDietary,email,setEmail,hasPlusOne:guest.has_plus_one,attendingLabel:s.attendingLabel,declineLabel:s.declineLabel,ac,sg,cd,tc,font,inp,lbl}} />
            <button onClick={()=>submit(true)} disabled={attending===null||submitting}
              style={{ width:'100%', padding:'14px', borderRadius:14, background:attending===null||submitting?'#1e2e1c':ac, color:tc, border:'none', fontSize:15, fontWeight:600, cursor:attending===null||submitting?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:20, fontFamily:font }}>
              {submitting?<><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Saving…</>:'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────── */}
      {page==='rsvp-done' && (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
          <div style={{ ...mw, ...card, padding:'40px', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:ac+'22', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              {attending ? <Heart size={28} fill={ac} style={{ color:ac }} /> : <Check size={28} style={{ color:ac }} />}
            </div>
            <h2 style={{ fontFamily:font, fontSize:36, fontWeight:400, color:tc, marginBottom:12 }}>
              {attending ? "We'll see you there! 🌿" : "We'll miss you!"}
            </h2>
            <p style={{ fontSize:15, color:bc, lineHeight:1.7, marginBottom:28, fontFamily:font }}>
              {attending ? s.confirmedMessage : s.declinedMessage}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {attending && <a href="/info" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:14, background:ac, color:tc, textDecoration:'none', fontSize:14, fontWeight:600, fontFamily:font }}>View wedding details <ChevronRight size={15}/></a>}
              <button onClick={()=>setPage('rsvp-details')} style={{ padding:'13px', borderRadius:14, background:'transparent', color:sg, border:`1px solid ${cd}`, fontSize:14, cursor:'pointer', fontFamily:font }}>View my RSVP</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── RSVP Form ──────────────────────────────────────────────────────────────
function RSVPForm({ attending, setAttending, dietary, setDietary, plusOneName, setPlusOneName, plusOneDietary, setPlusOneDietary, email, setEmail, hasPlusOne, attendingLabel, declineLabel, ac, sg, cd, tc, font, inp, lbl }: {
  attending:boolean|null; setAttending:(v:boolean)=>void
  dietary:string; setDietary:(v:string)=>void
  plusOneName:string; setPlusOneName:(v:string)=>void
  plusOneDietary:string; setPlusOneDietary:(v:string)=>void
  email:string; setEmail:(v:string)=>void
  hasPlusOne:boolean; attendingLabel:string; declineLabel:string
  ac:string; sg:string; cd:string; tc:string; font:string
  inp:React.CSSProperties; lbl:React.CSSProperties
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div>
        <p style={lbl}>Will you be joining us?</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={()=>setAttending(true)} style={{ padding:'12px', borderRadius:12, fontSize:14, fontWeight:600, border:`2px solid ${attending===true?ac:'#2a3829'}`, background:attending===true?ac+'20':'transparent', color:attending===true?sg:'#3a5038', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:font }}>
            <Heart size={14} style={attending===true?{fill:ac,color:ac}:{}} />{attendingLabel}
          </button>
          <button onClick={()=>setAttending(false)} style={{ padding:'12px', borderRadius:12, fontSize:14, fontWeight:600, border:`2px solid ${attending===false?'#7f2020':'#2a3829'}`, background:attending===false?'#7f202020':'transparent', color:attending===false?'#f87171':'#3a5038', cursor:'pointer', fontFamily:font }}>
            {declineLabel}
          </button>
        </div>
      </div>
      {attending===true && (<>
        {hasPlusOne && (
          <div>
            <p style={lbl}>Plus one <span style={{ textTransform:'none', fontWeight:400, color:sg+'44' }}>(optional)</span></p>
            <input style={inp} value={plusOneName} onChange={e=>setPlusOneName(e.target.value)} placeholder="Full name" />
            {plusOneName && <select style={{ ...inp, marginTop:8, cursor:'pointer' }} value={plusOneDietary} onChange={e=>setPlusOneDietary(e.target.value)}>{DIETARY.map(o=><option key={o} value={o}>{o||'No dietary restrictions'}</option>)}</select>}
          </div>
        )}
        <div>
          <p style={lbl}>Dietary requirements</p>
          <select style={{ ...inp, cursor:'pointer' }} value={dietary} onChange={e=>setDietary(e.target.value)}>{DIETARY.map(o=><option key={o} value={o}>{o||'No restrictions'}</option>)}</select>
        </div>
      </>)}
      {attending!==null && (
        <div>
          <p style={lbl}>Email {attending?'for confirmation':''}</p>
          <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
        </div>
      )}
    </div>
  )
}
