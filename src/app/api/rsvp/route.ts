import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const all = await prisma.guest.findMany({
    select: { id: true, name: true, hasPlusOne: true, rsvpStatus: true, dietary: true, email: true, plusOneName: true, plusOneDietary: true },
  })

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  const q = normalize(name)
  const matches = all.filter(g => {
    const gn = normalize(g.name)
    return gn.includes(q) || q.includes(gn) || q.split(' ').some(w => w.length > 2 && gn.includes(w))
  })

  if (!matches.length) return NextResponse.json({ found: false })
  return NextResponse.json({
    found: true,
    guests: matches.map(g => ({
      id:            g.id,
      name:          g.name,
      has_plus_one:  g.hasPlusOne,
      already_rsvpd: g.rsvpStatus !== 'pending',
      rsvp_status:   g.rsvpStatus,
      dietary:       g.dietary,
      email:         g.email,
      plus_one_name:     g.plusOneName,
      plus_one_dietary:  g.plusOneDietary,
    })),
  })
}

export async function POST(req: NextRequest) {
  const { guest_id, attending, plus_one_name, dietary, plus_one_dietary, email } = await req.json()
  if (!guest_id) return NextResponse.json({ error: 'guest_id required' }, { status: 400 })

  const guest = await prisma.guest.update({
    where: { id: guest_id },
    data: {
      rsvpStatus:    attending ? 'attending' : 'declined',
      rsvpAt:        new Date(),
      dietary:       dietary          || null,
      email:         email            || null,
      plusOneName:   plus_one_name    || null,
      plusOneDietary: plus_one_dietary || null,
    },
  })

  // Auto-create plus-one guest record if named
  if (attending && plus_one_name) {
    const existing = await prisma.guest.findFirst({ where: { name: plus_one_name } })
    if (!existing) {
      await prisma.guest.create({
        data: { name: plus_one_name, dietary: plus_one_dietary || null, side: guest.side, hasPlusOne: false, rsvpStatus: 'attending' },
      })
    }
  }

  // Send confirmation email if email provided
  if (attending && email) {
    try { await sendEmail(email, guest.name, plus_one_name) } catch {}
  }

  return NextResponse.json({ success: true, guest })
}

async function sendEmail(to: string, name: string, plusOne?: string) {
  if (!process.env.RESEND_API_KEY) return
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'Wedding <onboarding@resend.dev>',
      to,
      subject: '🌿 RSVP confirmed — Our Wedding',
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e2da">
        <div style="background:#7A9C6E;padding:40px 32px;text-align:center">
          <h1 style="color:#fff;font-size:32px;font-weight:300;margin:0">Our Wedding</h1>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;color:#5a5044;line-height:1.7">Dear ${name},<br><br>
          We can't wait to celebrate with you!${plusOne ? ` We've noted that ${plusOne} will be joining you.` : ''}</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${appUrl}/info" style="display:inline-block;background:#7A9C6E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px">View wedding info →</a>
          </div>
        </div>
        <div style="background:#FAF8F4;padding:16px;text-align:center">
          <p style="font-size:11px;color:#aaa;margin:0">With love 💚</p>
        </div>
      </div>`,
    }),
  })
}
