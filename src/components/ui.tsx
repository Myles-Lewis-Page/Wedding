'use client'
import { X, Loader2 } from 'lucide-react'
import React from 'react'

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: 'var(--bg3,#1a2419)', borderRadius: 20, width: '100%', maxWidth: 580, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', maxHeight: '88vh', border: '1px solid #2a3829' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 30px', borderBottom: '1px solid #202e1f', flexShrink: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--title)', fontFamily: 'var(--font-display)' }}>{title}</h2>
          <button onClick={onClose} style={{ color: '#5a7057', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '24px 30px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '18px 30px', borderTop: '1px solid #202e1f', background: 'var(--bg3,#1a2419)', borderRadius: '0 0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Field ──────────────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#5a7857', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid #2a3829',
  fontSize: 15,
  outline: 'none',
  background: 'var(--bg3,#1a2419)',
  color: 'var(--title)',
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...(props.style || {}) }}
      onFocus={e => { e.target.style.borderColor = '#8fb882'; e.target.style.boxShadow = '0 0 0 3px #8fb88220' }}
      onBlur={e => { e.target.style.borderColor = '#2a3829'; e.target.style.boxShadow = 'none' }}
    />
  )
}

// ── Textarea ───────────────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputBase, resize: 'vertical', ...(props.style || {}) }}
      onFocus={e => { e.target.style.borderColor = '#8fb882'; e.target.style.boxShadow = '0 0 0 3px #8fb88220' }}
      onBlur={e => { e.target.style.borderColor = '#2a3829'; e.target.style.boxShadow = 'none' }}
    />
  )
}

// ── Select ─────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      style={{ ...inputBase, cursor: 'pointer', ...(props.style || {}) }}
    />
  )
}

// ── Btn ────────────────────────────────────────────────────────────────────
export function Btn({
  children,
  variant = 'primary',
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 22px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    whiteSpace: 'nowrap',
    opacity: p.disabled ? 0.4 : 1,
  }
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: 'var(--accent)', color: 'var(--title)', ...p.style },
    ghost:   { ...base, background: 'transparent', color: 'var(--sage)', border: '1px solid #2a3829', ...p.style },
    danger:  { ...base, background: 'transparent', color: '#f87171', ...p.style },
  }
  return <button {...p} style={styles[variant]}>{children}</button>
}

// ── Tag ────────────────────────────────────────────────────────────────────
export function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, fontWeight: 600, background: color + '25', color, display: 'inline-block' }}>
      {children}
    </span>
  )
}

// ── PageHeader ─────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 16 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 300, color: 'var(--title)', marginBottom: 4 }}>
          {title}
        </h1>
        {sub && <p style={{ fontSize: 15, color: 'var(--body)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── SaveBtn ────────────────────────────────────────────────────────────────
// Btn that shows a checkmark briefly after saving
export function SaveBtn({ saving, saved, onClick, children }: { saving: boolean; saved: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Btn onClick={onClick} disabled={saving} style={{ background: saved ? 'var(--sage)' : 'var(--accent)' }}>
      {saving ? <><Loader2 size={15} className="animate-spin" />Saving…</> : saved ? '✓ Saved' : children}
    </Btn>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, transition: 'background 0.2s', position: 'relative', border: 'none', cursor: 'pointer', background: value ? 'var(--accent)' : '#243022', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg3,#1a2419)', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: value ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--bg3,#1a2419)', borderRadius: 16, border: '1px solid #202e1f', padding: 28, ...style }}>
      {children}
    </div>
  )
}

// ── SectionLabel ───────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--subheader)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
      {children}
    </p>
  )
}
