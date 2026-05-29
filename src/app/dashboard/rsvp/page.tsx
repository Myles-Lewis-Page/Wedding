'use client'
import { useState, useEffect, useRef } from 'react'
import { QrCode, Check, ExternalLink, Upload, Loader2, Plus, X } from 'lucide-react'
import { PageHeader, Card, Field, Input, Btn, SectionLabel, Textarea } from '@/components/ui'
import { $get, $patch } from '@/lib/utils'

interface RsvpSettings {
  heading: string; subheading: string; ourStory: string
  dressCode: string; dressCodeNote: string; contactEmail: string
  searchLabel: string; attendingLabel: string; declineLabel: string
  confirmedMessage: string; declinedMessage: string
  heroImage: string; photo1: string; photo2: string; photo3: string
}

const RSVP_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/rsvp`
  : 'https://wedding-production-7483.up.railway.app/rsvp'

export default function RsvpPage() {
  const [s, setS]           = useState<RsvpSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [saved, setSaved]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    $get('rsvp-settings').then(d => {
      if (d && !d.error) setS({
        heading:          d.heading          || '',
        subheading:       d.subheading       || '',
        ourStory:         d.ourStory         || '',
        dressCode:        d.dressCode        || 'Garden Formal',
        dressCodeNote:    d.dressCodeNote    || '',
        contactEmail:     d.contactEmail     || d.contact_email || '',
        searchLabel:      d.searchLabel      || d.search_label  || '',
        attendingLabel:   d.attendingLabel   || d.attending_label || '',
        declineLabel:     d.declineLabel     || d.decline_label   || '',
        confirmedMessage: d.confirmedMessage || d.confirmed_message || '',
        declinedMessage:  d.declinedMessage  || d.declined_message  || '',
        heroImage:        d.heroImage        || d.hero_image || '',
        photo1:           d.photo1  || '',
        photo2:           d.photo2  || '',
        photo3:           d.photo3  || '',
      })
      setLoading(false)
    })

    // Draw QR code
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(RSVP_URL)}&bgcolor=ffffff&color=3d6b2e&margin=10`
    img.onload = () => { const ctx = canvas.getContext('2d'); if (ctx) ctx.drawImage(img, 0, 0, 160, 160) }
  }, [])

  const saveField = async (field: keyof RsvpSettings, val: string) => {
    if (!s) return
    setS(p => p ? { ...p, [field]: val } : p)
    setSaving(field)
    await $patch('rsvp-settings', { id: 'main', [field]: val })
    setSaving(null); setSaved(field)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleFile = (field: string, file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(field)
    const reader = new FileReader()
    reader.onload = async e => {
      setUploading(null)
      await saveField(field as keyof RsvpSettings, e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (loading) return <div className="flex justify-center pt-20"><Loader2 size={24} className="animate-spin" style={{ color: '#3a5038' }} /></div>
  if (!s) return null

  const TextField = ({ label, desc, field, multiline = false, rows = 2 }: { label: string; desc?: string; field: keyof RsvpSettings; multiline?: boolean; rows?: number }) => {
    const [val, setVal] = useState(s![field] as string)
    useEffect(() => { setVal(s![field] as string) }, [s![field]])
    const isSaving = saving === field
    const isSaved  = saved  === field
    return (
      <div style={{ background: 'var(--bg3,#1a2419)', borderRadius: 12, border: '1px solid #202e1f', padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--subheader)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: desc ? 3 : 10 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: 'var(--body)', marginBottom: 10 }}>{desc}</p>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {multiline
            ? <textarea value={val} onChange={e => setVal(e.target.value)} rows={rows}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #2a3829', fontSize: 13, background: '#141c13', color: 'var(--title)', outline: 'none', resize: 'vertical' }} />
            : <input value={val} onChange={e => setVal(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #2a3829', fontSize: 13, background: '#141c13', color: 'var(--title)', outline: 'none' }} />}
          <button onClick={() => saveField(field, val)}
            style={{ flexShrink: 0, padding: '10px 14px', borderRadius: 8, background: isSaved ? '#22c55e' : 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
            {isSaving ? '…' : isSaved ? '✓' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  const PhotoField = ({ field, label, desc }: { field: keyof RsvpSettings; label: string; desc: string }) => {
    const [urlInput, setUrlInput] = useState('')
    const current   = s![field] as string
    const isUploading = uploading === field
    const isSaving    = saving   === field
    const isSaved     = saved    === field
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 24, borderBottom: '1px solid #202e1f' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--title)', marginBottom: 3 }}>{label}</p>
          <p style={{ fontSize: 12, color: 'var(--body)', marginBottom: 12 }}>{desc}</p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
            {isUploading ? <><Loader2 size={14} className="animate-spin" />Uploading…</> : <><Upload size={14} />Upload JPG / PNG</>}
            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(field, e.target.files[0])} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="or paste image URL…"
              onKeyDown={e => { if (e.key === 'Enter' && urlInput.trim()) { saveField(field, urlInput.trim()); setUrlInput('') } }}
              style={{ flex: 1, minWidth: 0, padding: '8px 12px', borderRadius: 10, border: '1px solid #2a3829', background: '#141c13', color: 'var(--title)', fontSize: 13, outline: 'none' }} />
            <button onClick={() => { if (urlInput.trim()) { saveField(field, urlInput.trim()); setUrlInput('') } }} disabled={!urlInput.trim()}
              style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: urlInput.trim() ? 'var(--accent)' : '#1f2b1e', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: urlInput.trim() ? 'pointer' : 'default' }}>
              Save
            </button>
          </div>
          {current && <button onClick={() => saveField(field, '')} style={{ marginTop: 8, fontSize: 12, color: 'var(--body)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove photo</button>}
        </div>
        <div style={{ flexShrink: 0, width: 130 }}>
          {current
            ? (
              <div style={{ width: 130, height: 100, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--accent)', position: 'relative' }}>
                <img src={current} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {(isSaving || isSaved) && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSaving ? <Loader2 size={20} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} /> : <Check size={22} style={{ color: '#4ade80' }} />}
                  </div>
                )}
              </div>
            )
            : <div style={{ width: 130, height: 100, borderRadius: 10, border: '2px dashed #2a3829', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: 11, color: 'var(--body)', textAlign: 'center' }}>No photo</p></div>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="RSVP portal" sub="Manage your public RSVP page" />

      {/* QR + Links */}
      <Card style={{ marginBottom: 24 }}>
        <div className="flex gap-8 items-start flex-wrap">
          <div className="flex flex-col items-center gap-3">
            <canvas ref={canvasRef} width={160} height={160} className="rounded-xl block" style={{ imageRendering: 'pixelated', width: 160, height: 160 }} />
            <p className="text-xs text-[var(--body)] break-all text-center max-w-[160px]">{RSVP_URL}</p>
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-[180px] justify-center" style={{ paddingTop: 8 }}>
            <Btn onClick={() => { const cv = canvasRef.current; if (cv) { const a = document.createElement('a'); a.download = 'rsvp-qr.png'; a.href = cv.toDataURL(); a.click() } }}>
              <QrCode size={15} />Download QR
            </Btn>
            <Btn variant="ghost" onClick={() => { navigator.clipboard.writeText(RSVP_URL); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
              {copied ? <><Check size={15} />Copied!</> : 'Copy link'}
            </Btn>
            <Btn variant="ghost" onClick={() => window.open(RSVP_URL, '_blank')}>
              <ExternalLink size={15} />Preview RSVP page
            </Btn>
          </div>
        </div>
      </Card>

      {/* Content fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
        <div>
          <SectionLabel>Page copy</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Page heading"        field="heading"          desc="Main title on the invite card" />
            <TextField label="Subheading"          field="subheading"       desc="Tagline below the heading" />
            <TextField label="Contact email"       field="contactEmail"     desc="Shown if guests can't find their name" />
            <TextField label="Guest search label"  field="searchLabel"      desc="Hint text on the name search field" />
          </div>
        </div>

        <div>
          <SectionLabel>RSVP labels</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Attending button"    field="attendingLabel"   desc='e.g. "Yes, I\'ll be there!"' />
            <TextField label="Decline button"      field="declineLabel"     desc='e.g. "Regretfully no"' />
            <TextField label="Confirmed message"   field="confirmedMessage" desc="Shown after guest RSVPs yes" />
            <TextField label="Declined message"    field="declinedMessage"  desc="Shown after guest RSVPs no" />
          </div>
        </div>

        <div>
          <SectionLabel>Dress code</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Dress code"          field="dressCode"     desc='e.g. "Garden Formal", "Black Tie"' />
            <TextField label="Dress code note"     field="dressCodeNote" desc="Extended description shown to guests" multiline rows={3} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--body)', marginTop: 8 }}>Dress code color swatches are managed in <strong style={{ color: 'var(--sage)' }}>Settings → Dress code colors</strong></p>
        </div>

        <div>
          <SectionLabel>Our story</SectionLabel>
          <TextField label="Story text" field="ourStory" multiline rows={8} desc="Shown on the 'Our Story' page. Separate paragraphs with a blank line." />
        </div>

        <div>
          <SectionLabel>Photos</SectionLabel>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <PhotoField field="heroImage" label="Cover photo"  desc="Main background on the invite card" />
            <PhotoField field="photo1"    label="Photo 1"      desc="Top-left polaroid on Our Story page" />
            <PhotoField field="photo2"    label="Photo 2"      desc="Right-side polaroid on Our Story page" />
            <div style={{ paddingBottom: 0, borderBottom: 'none' }}>
              <PhotoField field="photo3"  label="Photo 3"      desc="Bottom-left polaroid on Our Story page" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
