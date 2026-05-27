'use client'
import { useState, useEffect } from 'react'
import { Loader2, Search, Check, X, ChevronRight } from 'lucide-react'

interface Settings { heading: string; subheading: string; heroImage: string; photo1: string; accentColor: string; secondaryColor: string; searchLabel: string; attendingLabel: string; declineLabel: string; confirmedMessage: string; declinedMessage: string; contactEmail: string; weddingDate: string }
interface GuestData { id: string; name: string; has_plus_one: boolean; already_rsvpd: boolean; rsvp_status: string; dietary: string | null; email: string | null; plus_one_name: string | null; plus_one_dietary: string | null }

const DEFAULT: Settings = { heading:'Jennifer & Myles', subheading:'Together with their families', heroImage:'', photo1:'', accentColor:'#4a7a44', secondaryColor:'#8fb882', searchLabel:'Enter your name as it appears on your invitation', attendingLabel:"Yes, I'll be there!", declineLabel:'Regretfully no', confirmedMessage:"We can't wait to celebrate with you!", declinedMessage:"Thank you for letting us know. We'll be thinking of you!", contactEmail:'', weddingDate:'' }

const DIETARY = ['','Vegetarian','Vegan','Gluten-free','Nut allergy','Halal','Kosher','Other']

export default function RSVPPage() {
  const [s, setS] = useState<Settings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [searching, setSearching] = useState(false)
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [matches, setMatches] = useState<GuestData[]>([])
  const [page, setPage] = useState<'search'|'multiple'|'form'|'done'|'notfound'>('search')
  const [attending, setAttending] = useState<boolean|null>(null)
  const [dietary, setDietary] = useState('')
  const [plusOneName, setPlusOneName] = useState('')
  const [plusOneDietary, setPlusOneDietary] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/db?t=rsvp-settings').then(r=>r.json()).then(d=>{ if(d&&!d.error) setS({...DEFAULT,...d}); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  const accent = s.accentColor || '#4a7a44'

  const search = async () => {
    if (!name.trim()) return
    setSearching(true)
    const res = await fetch(`/api/rsvp?name=${encodeURIComponent(name)}`).then(r=>r.json())
    setSearching(false)
    if (!res.found) { setPage('notfound'); return }
    if (res.guests.length === 1) { setGuest(res.guests[0]); setPage('form') }
    else { setMatches(res.guests); setPage('multiple') }
  }

  const submit = async () => {
    if (!guest || attending===null) return
    setSubmitting(true)
    await fetch('/api/rsvp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ guest_id:guest.id, attending, plus_one_name:plusOneName||null, dietary:dietary||null, plus_one_dietary:plusOneDietary||null, email:email||null }) })
    setSubmitting(false)
    setPage('done')
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d1a0c'}}><Loader2 size={24} style={{color:'#8fb882',animation:'spin 1s linear infinite'}} /></div>

  const bg = 'linear-gradient(160deg,#0a150a 0%,#111714 100%)'

  return (
    <div style={{minHeight:'100vh',background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 16px',fontFamily:'var(--font-body)'}}>
      <div style={{width:'100%',maxWidth:460}}>
        {/* Hero */}
        {s.heroImage && <div style={{height:200,borderRadius:20,overflow:'hidden',marginBottom:24}}><img src={s.heroImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
        <div style={{textAlign:'center',marginBottom:32}}>
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,6vw,42px)',fontWeight:300,color:'#e8f0e6',lineHeight:1.1}}>{s.heading}</h1>
          <p style={{fontSize:14,color:'#4a6448',marginTop:8,letterSpacing:'0.05em'}}>{s.subheading}</p>
        </div>

        <div style={{background:'#1a2419',borderRadius:20,border:'1px solid #2a3829',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>

          {page === 'search' && (
            <div style={{padding:32}}>
              <p style={{fontSize:14,color:'#5a7057',marginBottom:16,lineHeight:1.6}}>{s.searchLabel}</p>
              <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Your full name" autoFocus
                style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid #2a3829',background:'#141c13',color:'#e8f0e6',fontSize:16,outline:'none',marginBottom:12,boxSizing:'border-box'}} />
              <button onClick={search} disabled={searching||!name.trim()} style={{width:'100%',padding:14,borderRadius:12,background:accent,color:'#e8f0e6',border:'none',fontSize:15,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:searching||!name.trim()?0.5:1}}>
                {searching ? <><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Searching…</> : <><Search size={17}/>Find my invitation</>}
              </button>
            </div>
          )}

          {page === 'notfound' && (
            <div style={{padding:32,textAlign:'center'}}>
              <X size={40} style={{color:'#f87171',margin:'0 auto 16px'}} />
              <h3 style={{color:'#e8f0e6',marginBottom:8,fontFamily:'var(--font-display)',fontSize:22,fontWeight:300}}>Name not found</h3>
              <p style={{color:'#5a7057',fontSize:14,lineHeight:1.6,marginBottom:20}}>We couldn't find "{name}" on our guest list. Try a different spelling or your full name.{s.contactEmail ? ` Questions? ${s.contactEmail}` : ''}</p>
              <button onClick={()=>{setPage('search');setName('')}} style={{padding:'12px 24px',borderRadius:10,background:'#1f2b1e',color:'#8fb882',border:'1px solid #2a3829',cursor:'pointer',fontSize:14}}>Try again</button>
            </div>
          )}

          {page === 'multiple' && (
            <div style={{padding:32}}>
              <h3 style={{color:'#e8f0e6',marginBottom:4,fontFamily:'var(--font-display)',fontSize:22,fontWeight:300}}>Which one are you?</h3>
              <p style={{color:'#5a7057',fontSize:14,marginBottom:20}}>We found a few people named "{name}"</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {matches.map(g=>(
                  <button key={g.id} onClick={()=>{setGuest(g);setPage('form')}} style={{padding:'14px 16px',borderRadius:12,background:'#141c13',border:'1px solid #2a3829',color:'#e8f0e6',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontWeight:500}}>{g.name}</span>
                    <ChevronRight size={17} style={{color:'#5a7057'}} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {page === 'form' && guest && (
            <div style={{padding:32}}>
              <p style={{color:'#5a7057',fontSize:13,marginBottom:4}}>RSVP for</p>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:300,color:'#e8f0e6',marginBottom:24}}>{guest.name}</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                {[true,false].map(a=>(
                  <button key={String(a)} onClick={()=>setAttending(a)} style={{padding:'16px 12px',borderRadius:12,border:`2px solid ${attending===a?accent:'#2a3829'}`,background:attending===a?accent+'20':'#141c13',color:attending===a?'#e8f0e6':'#5a7057',cursor:'pointer',fontSize:14,fontWeight:600,transition:'all 0.15s'}}>
                    {a ? s.attendingLabel : s.declineLabel}
                  </button>
                ))}
              </div>
              {attending && <>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:12,color:'#5a7057',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Dietary requirements</label>
                  <select value={dietary} onChange={e=>setDietary(e.target.value)} style={{width:'100%',padding:'12px 16px',borderRadius:10,border:'1px solid #2a3829',background:'#141c13',color:'#e8f0e6',fontSize:15,outline:'none'}}>
                    {DIETARY.map(d=><option key={d} value={d}>{d||'None'}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:12,color:'#5a7057',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Email (for confirmation)</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{width:'100%',padding:'12px 16px',borderRadius:10,border:'1px solid #2a3829',background:'#141c13',color:'#e8f0e6',fontSize:15,outline:'none',boxSizing:'border-box'}} />
                </div>
                {guest.has_plus_one && <>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:'#5a7057',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Plus one name</label>
                    <input value={plusOneName} onChange={e=>setPlusOneName(e.target.value)} style={{width:'100%',padding:'12px 16px',borderRadius:10,border:'1px solid #2a3829',background:'#141c13',color:'#e8f0e6',fontSize:15,outline:'none',boxSizing:'border-box'}} />
                  </div>
                  {plusOneName && <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:'#5a7057',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}}>Plus one dietary</label>
                    <select value={plusOneDietary} onChange={e=>setPlusOneDietary(e.target.value)} style={{width:'100%',padding:'12px 16px',borderRadius:10,border:'1px solid #2a3829',background:'#141c13',color:'#e8f0e6',fontSize:15,outline:'none'}}>
                      {DIETARY.map(d=><option key={d} value={d}>{d||'None'}</option>)}
                    </select>
                  </div>}
                </>}
              </>}
              <button onClick={submit} disabled={submitting||attending===null} style={{width:'100%',padding:14,borderRadius:12,background:accent,color:'#e8f0e6',border:'none',fontSize:15,fontWeight:600,cursor:'pointer',marginTop:8,opacity:submitting||attending===null?0.5:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                {submitting ? <><Loader2 size={17} style={{animation:'spin 1s linear infinite'}}/>Saving…</> : <><Check size={17}/>Submit RSVP</>}
              </button>
            </div>
          )}

          {page === 'done' && (
            <div style={{padding:40,textAlign:'center'}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:accent+'20',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                <Check size={28} style={{color:accent}} />
              </div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:300,color:'#e8f0e6',marginBottom:8}}>{attending ? 'See you there!' : 'We understand'}</h3>
              <p style={{color:'#5a7057',fontSize:15,lineHeight:1.6}}>{attending ? s.confirmedMessage : s.declinedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
