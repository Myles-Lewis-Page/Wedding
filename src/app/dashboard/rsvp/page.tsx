'use client'
import Link from 'next/link'
import { QrCode, ExternalLink, Copy } from 'lucide-react'

export default function RSVPPortalPage() {
  const rsvpUrl = typeof window !== 'undefined' ? `${window.location.origin}/rsvp` : '/rsvp'
  return (
    <div className="p-6">
      <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800 mb-2">RSVP Portal</h1>
      <p className="text-stone-400 text-sm mb-6">Share this link or QR code on your invitations.</p>
      <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md">
        <div className="w-32 h-32 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <QrCode size={48} className="text-stone-400" />
        </div>
        <p className="text-center text-xs text-stone-400 mb-4">QR code for: <span className="text-stone-600">/rsvp</span></p>
        <div className="flex gap-2">
          <Link href="/rsvp" target="_blank" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-600 hover:bg-stone-50">
            <ExternalLink size={14} /> Preview RSVP
          </Link>
        </div>
      </div>
    </div>
  )
}
