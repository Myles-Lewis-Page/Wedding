'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  const login = async () => {
    if (!password.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) { router.push('/dashboard'); router.refresh() }
      else { setError('Incorrect password. Try again.'); setPassword('') }
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(160deg, #0d1a0c 0%, #111714 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Heart size={24} fill="var(--sage)" style={{ color: 'var(--sage)', margin: '0 auto 16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 300, color: '#e8f0e6', marginBottom: 6 }}>Our Wedding</h1>
          <p style={{ fontSize: 14, color: '#4a6448' }}>Wedding planner · Private</p>
        </div>

        <div style={{ background: '#1a2419', borderRadius: 20, padding: 36, border: '1px solid #2a3829', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: '#e8f0e6', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: '#4a6448', marginBottom: 24 }}>Enter your password to continue</p>

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Password"
              autoFocus
              style={{ width: '100%', padding: '14px 50px 14px 18px', borderRadius: 12, border: '1px solid #2a3829', fontSize: 16, outline: 'none', background: '#141c13', color: '#e8f0e6', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = 'var(--sage)'; e.target.style.boxShadow = '0 0 0 3px #8fb88220' }}
              onBlur={e => { e.target.style.borderColor = '#2a3829'; e.target.style.boxShadow = 'none' }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a6448', lineHeight: 0 }}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12, paddingLeft: 4 }}>{error}</p>}

          <button
            onClick={login}
            disabled={loading || !password.trim()}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: loading || !password.trim() ? '#2a3829' : 'var(--accent)', color: '#e8f0e6', border: 'none', fontSize: 15, fontWeight: 600, cursor: loading || !password.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />Signing in…</> : 'Sign in'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#2a3828', marginTop: 24 }}>This planner is private — for our wedding only.</p>
      </div>
    </div>
  )
}
