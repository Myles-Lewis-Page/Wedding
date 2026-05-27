'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Incorrect password. Try again.')
        setPassword('')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #EDF4EA 0%, #FAF8F4 60%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart size={20} fill="#7A9C6E" className="text-[#7A9C6E]" />
          </div>
          <h1
            className="text-4xl font-light text-stone-800 mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Jennifer & Myles
          </h1>
          <p className="text-sm text-stone-400">Wedding planner · Private</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2
            className="text-xl font-light text-stone-800 mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Welcome back
          </h2>
          <p className="text-sm text-stone-400 mb-6">Enter your password to continue</p>

          <div className="relative mb-3">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 text-base focus:outline-none focus:border-[#7A9C6E] focus:ring-2 focus:ring-[#7A9C6E]/20 pr-12"
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-4 top-4 text-stone-300 hover:text-stone-500 transition-colors"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-3 px-1">{error}</p>
          )}

          <button
            onClick={login}
            disabled={loading || !password.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
            style={{ background: '#7A9C6E' }}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" />Signing in…</>
              : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          This planner is private — for Jennifer & Myles only.
        </p>
      </div>
    </div>
  )
}
