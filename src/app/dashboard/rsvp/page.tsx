'use client'
import { useState, useEffect, useRef } from 'react'
import { QrCode, Check, ExternalLink, Upload, Loader2 } from 'lucide-react'
import { PageHeader, Card, Btn, SectionLabel } from '@/components/ui'
import { $get, $patch } from '@/lib/utils'

interface RsvpSettings {
  heading: string
  subheading: string
  ourStory: string
  dressCode: string
  dressCodeNote: string
  contactEmail: string
  searchLabel: string
  attendingLabel: string
  declineLabel: string
  confirmedMessage: string
  declinedMessage: string
  heroImage: string
  photo1: string
  photo2: string
  photo3: string
}

const RSVP_URL = 'https://wedding-production-7483.up.railway.app/rsvp'

// -- TextField --------------------------------------------------------------
// Defined at module level so hooks are never called inside another render
interface TextFieldProps {
  label: string
  desc?: string
  field: string
  value: string
  multiline?: boolean
  rows?: number
  onSave: (field: string, val: string) => Promise<void>
}

function TextField({ label, desc, field, value, multiline, rows = 2, onSave }: TextFieldProps) {
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setVal(value) }, [value])

  const handleSave = async () => {
    setSaving(true)
    await onSave(field, val)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #2a3829',
    fontSize: 13,
    background: '#141c13',
    color: 'var(--title)',
    outline: 'none',
  }

  return (
    <div style={{ background: 'var(--bg3,#1a2419)', borderRadius: 12, border: '1px solid #202e1f' }}>
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--subheader)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: desc ? 3 : 10 }}>
          {label}
        </p>
        {desc && (
          <p style={{ fontSize: 11, color: 'var(--body)', marginBottom: 10 }}>{desc}</p>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {multiline ? (
            <textarea
              value={val}
              onChange={e => setVal(e.target.value)}
              rows={rows}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          ) : (
            <input
              value={val}
              onChange={e => setVal(e.target.value)}
              style={inputStyle}
            />
          )}
          <button
            onClick={handleSave}
            style={{
              flexShrink: 0,
              padding: '10px 14px',
              borderRadius: 8,
              background: saved ? '#22c55e' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saving ? '...' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// -- PhotoField -------------------------------------------------------------
interface PhotoFieldProps {
  field: string
  label: string
  desc: string
  value: string
  saving: string | null
  saved: string | null
  uploading: string | null
  onSave: (field: string, val: string) => Promise<void>
  onUpload: (field: string, file: File) => void
}

function PhotoField({ field, label, desc, value, saving, saved, uploading, onSave, onUpload }: PhotoFieldProps) {
  const [urlInput, setUrlInput] = useState('')
  const isSaving = saving === field
  const isSaved = saved === field
  const isUploading = uploading === field

  const handleUrl = () => {
    if (!urlInput.trim()) return
    onSave(field, urlInput.trim())
    setUrlInput('')
  }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 24, borderBottom: '1px solid #202e1f' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--title)', marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--body)', marginBottom: 12 }}>{desc}</p>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
          {isUploading ? (
            <><Loader2 size={14} className="animate-spin" />Uploading...</>
          ) : (
            <><Upload size={14} />Upload JPG / PNG</>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && onUpload(field, e.target.files[0])}
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUrl()}
            placeholder="or paste image URL..."
            style={{ flex: 1, minWidth: 0, padding: '8px 12px', borderRadius: 10, border: '1px solid #2a3829', background: '#141c13', color: 'var(--title)', fontSize: 13, outline: 'none' }}
          />
          <button
            onClick={handleUrl}
            disabled={!urlInput.trim()}
            style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: urlInput.trim() ? 'var(--accent)' : '#1f2b1e', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: urlInput.trim() ? 'pointer' : 'default' }}
          >
            Save
          </button>
        </div>

        {value && (
          <button
            onClick={() => onSave(field, '')}
            style={{ marginTop: 8, fontSize: 12, color: 'var(--body)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Remove photo
          </button>
        )}
      </div>

      <div style={{ flexShrink: 0, width: 130 }}>
        {value ? (
          <div style={{ width: 130, height: 100, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--accent)', position: 'relative' }}>
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {(isSaving || isSaved) && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSaving
                  ? <Loader2 size={20} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                  : <Check size={22} style={{ color: '#4ade80' }} />}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: 130, height: 100, borderRadius: 10, border: '2px dashed #2a3829', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--body)', textAlign: 'center' }}>No photo</p>
          </div>
        )}
      </div>
    </div>
  )
}

// -- Page -------------------------------------------------------------------
export default function RsvpDashboardPage() {
  const [s, setS] = useState<RsvpSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    $get('rsvp-settings').then(d => {
      if (d && !d.error) {
        setS({
          heading:          d.heading          || '',
          subheading:       d.subheading       || '',
          ourStory:         d.ourStory         || '',
          dressCode:        d.dressCode        || 'Garden Formal',
          dressCodeNote:    d.dressCodeNote    || '',
          contactEmail:     d.contactEmail     || d.contact_email     || '',
          searchLabel:      d.searchLabel      || d.search_label      || '',
          attendingLabel:   d.attendingLabel   || d.attending_label   || '',
          declineLabel:     d.declineLabel     || d.decline_label     || '',
          confirmedMessage: d.confirmedMessage || d.confirmed_message || '',
          declinedMessage:  d.declinedMessage  || d.declined_message  || '',
          heroImage:        d.heroImage        || d.hero_image        || '',
          photo1:           d.photo1 || '',
          photo2:           d.photo2 || '',
          photo3:           d.photo3 || '',
        })
      }
      setLoading(false)
    })

    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(RSVP_URL)}&bgcolor=ffffff&color=3d6b2e&margin=10`
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(img, 0, 0, 160, 160)
    }
  }, [])

  const saveField = async (field: string, val: string) => {
    setS(p => p ? { ...p, [field]: val } : p)
    setSaving(field)
    await $patch('rsvp-settings', { id: 'main', [field]: val })
    setSaving(null)
    setSaved(field)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleUpload = (field: string, file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(field)
    const reader = new FileReader()
    reader.onload = async e => {
      setUploading(null)
      await saveField(field, e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 size={24} className="animate-spin" style={{ color: '#3a5038' }} />
      </div>
    )
  }

  if (!s) return null

  const PHOTO_FIELDS = [
    { field: 'heroImage', label: 'Cover photo', desc: 'Main background on the invite card',     value: s.heroImage },
    { field: 'photo1',    label: 'Photo 1',     desc: 'Top-left polaroid on Our Story page',    value: s.photo1    },
    { field: 'photo2',    label: 'Photo 2',     desc: 'Right-side polaroid on Our Story page',  value: s.photo2    },
    { field: 'photo3',    label: 'Photo 3',     desc: 'Bottom-left polaroid on Our Story page', value: s.photo3    },
  ]

  return (
    <div>
      <PageHeader title="RSVP portal" sub="Manage your public RSVP page" />

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <canvas
              ref={canvasRef}
              width={160}
              height={160}
              style={{ borderRadius: 12, display: 'block', imageRendering: 'pixelated', width: 160, height: 160 }}
            />
            <p style={{ fontSize: 11, color: 'var(--body)', wordBreak: 'break-all', textAlign: 'center', maxWidth: 160 }}>{RSVP_URL}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 180, paddingTop: 8 }}>
            <Btn onClick={() => {
              const cv = canvasRef.current
              if (cv) {
                const a = document.createElement('a')
                a.download = 'rsvp-qr.png'
                a.href = cv.toDataURL()
                a.click()
              }
            }}>
              <QrCode size={15} />Download QR
            </Btn>
            <Btn variant="ghost" onClick={() => {
              navigator.clipboard.writeText(RSVP_URL)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}>
              {copied ? <><Check size={15} />Copied!</> : 'Copy link'}
            </Btn>
            <Btn variant="ghost" onClick={() => window.open(RSVP_URL, '_blank')}>
              <ExternalLink size={15} />Preview RSVP page
            </Btn>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>

        <div>
          <SectionLabel>Page copy</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Page heading"       field="heading"          value={s.heading}          desc="Main title on the invite card"         onSave={saveField} />
            <TextField label="Subheading"         field="subheading"       value={s.subheading}       desc="Tagline below the heading"             onSave={saveField} />
            <TextField label="Contact email"      field="contactEmail"     value={s.contactEmail}     desc="Shown if guests can't find their name" onSave={saveField} />
            <TextField label="Guest search label" field="searchLabel"      value={s.searchLabel}      desc="Hint text on the name search field"    onSave={saveField} />
          </div>
        </div>

        <div>
          <SectionLabel>RSVP labels</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Attending button"  field="attendingLabel"   value={s.attendingLabel}   desc='e.g. "Yes, I\'ll be there!"' onSave={saveField} />
            <TextField label="Decline button"    field="declineLabel"     value={s.declineLabel}     desc='e.g. "Regretfully no"'       onSave={saveField} />
            <TextField label="Confirmed message" field="confirmedMessage" value={s.confirmedMessage} desc="Shown after guest RSVPs yes"  onSave={saveField} />
            <TextField label="Declined message"  field="declinedMessage"  value={s.declinedMessage}  desc="Shown after guest RSVPs no"   onSave={saveField} />
          </div>
        </div>

        <div>
          <SectionLabel>Dress code</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Dress code"      field="dressCode"     value={s.dressCode}     desc='e.g. "Garden Formal", "Black Tie"'    onSave={saveField} />
            <TextField label="Dress code note" field="dressCodeNote" value={s.dressCodeNote} desc="Extended description shown to guests" multiline rows={3} onSave={saveField} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--body)', marginTop: 8 }}>
            Dress code color swatches are managed in{' '}
            <strong style={{ color: 'var(--sage)' }}>Settings &gt; Dress code colors</strong>
          </p>
        </div>

        <div>
          <SectionLabel>Our story</SectionLabel>
          <TextField
            label="Story text"
            field="ourStory"
            value={s.ourStory}
            multiline
            rows={8}
            desc="Shown on the 'Our Story' page. Separate paragraphs with a blank line."
            onSave={saveField}
          />
        </div>

        <div>
          <SectionLabel>Photos</SectionLabel>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PHOTO_FIELDS.map(({ field, label, desc, value }) => (
              <PhotoField
                key={field}
                field={field}
                label={label}
                desc={desc}
                value={value}
                saving={saving}
                saved={saved}
                uploading={uploading}
                onSave={saveField}
                onUpload={handleUpload}
              />
            ))}
          </Card>
        </div>

      </div>
    </div>
  )
}
