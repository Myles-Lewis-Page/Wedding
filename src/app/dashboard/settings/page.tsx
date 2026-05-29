'use client'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader, Card, SectionLabel } from '@/components/ui'
import { $get, $patch } from '@/lib/utils'

type ColorSet = { accent: string; sage: string; bg: string; tertiary: string; title: string; subheader: string; body: string; swatchBridesmaids: string; swatchSuits: string; swatchVenue: string; swatchFlowers: string }

const DEFAULT_COLORS: ColorSet = { accent: '#4a7a44', sage: '#8fb882', bg: '#111714', tertiary: '#1a2419', title: '#ffffff', subheader: '#000000', body: '#9ca3af', swatchBridesmaids: '#9bb89a', swatchSuits: '#4a5568', swatchVenue: '#8b7355', swatchFlowers: '#e8b4bc' }

const applyCSS = (col: ColorSet) => {
  const map: Record<string, string> = {
    '--accent':    col.accent,
    '--sage':      col.sage,
    '--bg':        col.bg,
    '--bg2':       col.bg,
    '--bg3':       col.tertiary,
    '--title':     col.title    || '#ffffff',
    '--subheader': col.subheader || '#000000',
    '--body':      col.body      || '#9ca3af',
  }
  Object.entries(map).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
}

export default function SettingsPage() {
  const [names, setNames]       = useState({ brideName: '', groomName: '', lastName: '' })
  const [weddingDate, setWDate] = useState('')
  const [namesSaved, setNSaved] = useState(false)
  const [dateSaved, setDSaved]  = useState(false)
  const [colors, setColors]     = useState<ColorSet>(DEFAULT_COLORS)
  const [loading, setLoading]   = useState(true)
  const [presets, setPresets]   = useState<(ColorSet & { name: string })[]>([
    { name: 'Preset 1', ...DEFAULT_COLORS },
    { name: 'Preset 2', ...DEFAULT_COLORS },
    { name: 'Preset 3', ...DEFAULT_COLORS },
    { name: 'Preset 4', ...DEFAULT_COLORS },
    { name: 'Preset 5', ...DEFAULT_COLORS },
  ])

  useEffect(() => {
    Promise.all([$get('rsvp-settings'), $get('wedding-settings')]).then(([rs, ws]) => {
      if (rs && !rs.error) {
        setNames({ brideName: rs.brideName || '', groomName: rs.groomName || '', lastName: rs.lastName || '' })
        setColors(prev => ({
          ...prev,
          ...(rs.accentColor         && { accent:            rs.accentColor         }),
          ...(rs.secondaryColor      && { sage:              rs.secondaryColor      }),
          ...(rs.bgColor             && { bg:                rs.bgColor             }),
          ...(rs.tertiaryColor       && { tertiary:          rs.tertiaryColor       }),
          ...(rs.titleColor          && { title:             rs.titleColor          }),
          ...(rs.subheaderColor      && { subheader:         rs.subheaderColor      }),
          ...(rs.bodyColor           && { body:              rs.bodyColor           }),
          ...(rs.swatchBridesmaids   && { swatchBridesmaids: rs.swatchBridesmaids   }),
          ...(rs.swatchSuits         && { swatchSuits:       rs.swatchSuits         }),
          ...(rs.swatchVenue         && { swatchVenue:       rs.swatchVenue         }),
          ...(rs.swatchFlowers       && { swatchFlowers:     rs.swatchFlowers       }),
        }))
      }
      if (ws && !ws.error) {
        setWDate(ws.weddingDate || '')
      }
      // Load presets from localStorage
      try { const ps = localStorage.getItem('colorPresets'); if (ps) setPresets(JSON.parse(ps)) } catch {}
      setLoading(false)
    })
  }, [])

  const saveNames = async () => {
    const coupled = [names.brideName, names.groomName].filter(Boolean).join(' & ') || 'Our Wedding'
    const full    = coupled + (names.lastName ? ' ' + names.lastName : '')
    await $patch('rsvp-settings', { id: 'main', brideName: names.brideName, groomName: names.groomName, lastName: names.lastName })
    try {
      localStorage.setItem('coupleName', full)
      localStorage.setItem('weddingNamesCache', JSON.stringify(names))
      window.dispatchEvent(new StorageEvent('storage', { key: 'coupleName', newValue: full }))
    } catch {}
    setNSaved(true); setTimeout(() => setNSaved(false), 2000)
  }

  const saveDate = async () => {
    await $patch('wedding-settings', { weddingDate })
    // Also sync to rsvp-settings so public page can read it
    await $patch('rsvp-settings', { id: 'main', weddingDate })
    try {
      localStorage.setItem('weddingDate', weddingDate)
      window.dispatchEvent(new StorageEvent('storage', { key: 'weddingDate', newValue: weddingDate }))
    } catch {}
    setDSaved(true); setTimeout(() => setDSaved(false), 2000)
  }

  const saveColor = async (key: keyof ColorSet, val: string) => {
    const updated = { ...colors, [key]: val }
    setColors(updated); applyCSS(updated)
    localStorage.setItem('weddingColors', JSON.stringify(updated))
    await $patch('rsvp-settings', {
      id: 'main',
      accentColor:       updated.accent,
      secondaryColor:    updated.sage,
      bgColor:           updated.bg,
      tertiaryColor:     updated.tertiary,
      titleColor:        updated.title,
      subheaderColor:    updated.subheader,
      bodyColor:         updated.body,
      swatchBridesmaids: updated.swatchBridesmaids,
      swatchSuits:       updated.swatchSuits,
      swatchVenue:       updated.swatchVenue,
      swatchFlowers:     updated.swatchFlowers,
    })
  }

  const loadPreset = (p: ColorSet & { name: string }) => {
    setColors(p); applyCSS(p)
    localStorage.setItem('weddingColors', JSON.stringify(p))
    $patch('rsvp-settings', { id: 'main', accentColor: p.accent, secondaryColor: p.sage, bgColor: p.bg, tertiaryColor: p.tertiary, titleColor: p.title, subheaderColor: p.subheader, bodyColor: p.body })
  }

  const saveToPreset = (idx: number) => {
    const updated = [...presets]; updated[idx] = { ...colors, name: presets[idx].name }
    setPresets(updated); localStorage.setItem('colorPresets', JSON.stringify(updated))
  }

  const renamePreset = (idx: number, name: string) => {
    const updated = [...presets]; updated[idx] = { ...updated[idx], name }
    setPresets(updated); localStorage.setItem('colorPresets', JSON.stringify(updated))
  }

  // Self-contained color picker component
  function Picker({ label, desc, colorKey }: { label: string; desc?: string; colorKey: keyof ColorSet }) {
    const [val, setVal]     = useState(colors[colorKey] as string)
    const [saved, setSaved] = useState(false)
    useEffect(() => { setVal(colors[colorKey] as string) }, [colors[colorKey]])
    const save = async () => { await saveColor(colorKey, val); setSaved(true); setTimeout(() => setSaved(false), 1500) }
    return (
      <div style={{ background: 'var(--bg3,#1a2419)', borderRadius: 12, border: '1px solid #202e1f', overflow: 'hidden' }}>
        <div style={{ padding: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--subheader)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: desc ? 3 : 10 }}>{label}</p>
          {desc && <p style={{ fontSize: 11, color: 'var(--body)', marginBottom: 10 }}>{desc}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={val} onChange={e => setVal(e.target.value)}
              style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #2a3829', cursor: 'pointer', padding: 2, background: 'transparent', flexShrink: 0 }} />
            <input type="text" value={val} onChange={e => setVal(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid #2a3829', fontSize: 13, background: 'var(--bg3,#1a2419)', color: 'var(--title)', outline: 'none' }} />
            <button onClick={save}
              style={{ flexShrink: 0, padding: '8px 12px', borderRadius: 8, background: saved ? '#22c55e' : 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
              {saved ? '✓' : 'Save'}
            </button>
          </div>
        </div>
        <div style={{ height: 5, background: val }} />
      </div>
    )
  }

  const fmtDate = weddingDate ? new Date(weddingDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : null

  if (loading) return <div className="flex justify-center pt-20"><Loader2 size={24} className="animate-spin" style={{ color: '#3a5038' }} /></div>

  return (
    <div>
      <PageHeader title="Settings" sub="Names, date and theme" />

      {/* Wedding names */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <SectionLabel>Wedding names</SectionLabel>
          <button onClick={saveNames} style={{ padding: '8px 16px', borderRadius: 8, background: namesSaved ? 'var(--sage)' : 'var(--accent)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {namesSaved ? '✓ Saved' : 'Save names'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {([['brideName', 'Bride / Partner 1'], ['groomName', 'Groom / Partner 2'], ['lastName', 'Shared last name']] as const).map(([key, label]) => (
            <div key={key}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--subheader)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
              <input value={names[key]} onChange={e => setNames(p => ({ ...p, [key]: e.target.value }))}
                placeholder={key === 'lastName' ? 'Last name' : key === 'brideName' ? 'Bride' : 'Groom'}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #2a3829', background: '#141c13', color: 'var(--title)', fontSize: 14, outline: 'none' }} />
            </div>
          ))}
        </div>
        {(names.brideName || names.groomName) && (
          <p style={{ marginTop: 14, fontSize: 13, color: 'var(--body)' }}>
            Preview: <span style={{ color: 'var(--title)', fontWeight: 600 }}>
              {[names.brideName, names.groomName].filter(Boolean).join(' & ')}{names.lastName ? ` ${names.lastName}` : ''}
            </span>
          </p>
        )}
      </Card>

      {/* Wedding date */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionLabel>Wedding date</SectionLabel>
          <button onClick={saveDate} disabled={!weddingDate} style={{ padding: '8px 16px', borderRadius: 8, background: dateSaved ? 'var(--sage)' : 'var(--accent)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: weddingDate ? 'pointer' : 'not-allowed', opacity: weddingDate ? 1 : 0.5 }}>
            {dateSaved ? '✓ Saved' : 'Save date'}
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--body)', marginBottom: 12 }}>
          {fmtDate || 'Pick your date — it shows across the whole app and on the RSVP page'}
        </p>
        <input type="date" value={weddingDate} onChange={e => setWDate(e.target.value)}
          style={{ width: '100%', maxWidth: 280, padding: '10px 14px', borderRadius: 10, border: '1px solid #2a3829', background: '#141c13', color: 'var(--title)', fontSize: 14, outline: 'none' }} />
      </Card>

      {/* Color presets */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Presets</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {presets.map((p, i) => (
            <div key={i} style={{ background: 'var(--bg3,#1a2419)', borderRadius: 12, border: '1px solid #202e1f', overflow: 'hidden' }}>
              <div style={{ display: 'flex', height: 28 }}>
                {[p.accent, p.sage, p.bg, p.tertiary].map((col, j) => <div key={j} style={{ flex: 1, background: col }} />)}
              </div>
              <div style={{ padding: '10px' }}>
                <input value={p.name} onChange={e => renamePreset(i, e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600, color: 'var(--title)', marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => loadPreset(p)} style={{ flex: 1, padding: '5px 0', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
                  <button onClick={() => saveToPreset(i)} style={{ flex: 1, padding: '5px 0', borderRadius: 6, background: '#1f2b1e', color: 'var(--sage)', border: '1px solid #2a3829', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme colors */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Theme colors</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          <Picker label="Primary / buttons"      desc="Buttons, active states"   colorKey="accent"   />
          <Picker label="Secondary / highlights" desc="Icons, tags, nav accents" colorKey="sage"     />
          <Picker label="Background"             desc="App & RSVP background"    colorKey="bg"       />
          <Picker label="Card / surface"         desc="Card backgrounds"         colorKey="tertiary" />
        </div>
      </div>

      {/* Text colors */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Text colors</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          <Picker label="Page titles"  desc="Section headings, card titles" colorKey="title"     />
          <Picker label="Sub-headers"  desc="Labels, table headers"         colorKey="subheader" />
          <Picker label="Body text"    desc="Descriptions, helper text"     colorKey="body"      />
        </div>
      </div>

      {/* Dress code colors */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Dress code colors</SectionLabel>
        <p style={{ fontSize: 12, color: 'var(--body)', marginBottom: 16 }}>These 4 dots appear on the RSVP details page under dress code</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          <Picker label="Bridesmaid dresses" colorKey="swatchBridesmaids" />
          <Picker label="Men's suits"        colorKey="swatchSuits"       />
          <Picker label="Venue colors"       colorKey="swatchVenue"       />
          <Picker label="Floral colors"      colorKey="swatchFlowers"     />
        </div>
      </div>
    </div>
  )
}
