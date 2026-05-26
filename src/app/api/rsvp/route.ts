import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/rsvp?name=John+Smith  — fuzzy name lookup
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const all = await prisma.guest.findMany({ select: { id: true, name: true, hasPlusOne: true, rsvpStatus: true } })

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
      id: g.id,
      name: g.name,
      has_plus_one: g.hasPlusOne,
      already_rsvpd: g.rsvpStatus !== 'pending',
      rsvp_status: g.rsvpStatus,
    })),
  })
}

// POST /api/rsvp  — submit RSVP
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { guest_id, attending, plus_one_name, dietary, plus_one_dietary, email } = body

  if (!guest_id) return NextResponse.json({ error: 'guest_id required' }, { status: 400 })

  const data: Record<string, unknown> = {
    rsvpStatus: attending ? 'attending' : 'declined',
    rsvpAt: new Date(),
    dietary: dietary || null,
    email: email || null,
  }
  if (attending && plus_one_name) {
    data.plusOneName = plus_one_name
    data.plusOneDietary = plus_one_dietary || null
  }

  const guest = await prisma.guest.update({ where: { id: guest_id }, data })

  // If attending with a plus one, add them as a guest tagged as invitee
  if (attending && plus_one_name) {
    const existing = await prisma.guest.findFirst({ where: { name: plus_one_name } })
    if (!existing) {
      await prisma.guest.create({ data: {
        name: plus_one_name,
        dietary: plus_one_dietary || null,
        side: guest.side,
        hasPlusOne: false,
        rsvpStatus: 'attending',
        isInvitee: true,
        notes: `Plus one of ${guest.name}`,
      }})
    }
  }

  if (attending && email) {
    try { await sendConfirmationEmail(email, guest.name, plus_one_name) } catch {}
  }

  return NextResponse.json({ success: true, guest })
}

async function sendConfirmationEmail(to: string, name: string, plusOne?: string) {
  if (!process.env.RESEND_API_KEY) return
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#FAF8F4;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e2da">
    <div style="background:#7A9C6E;padding:40px 32px;text-align:center">
      <p style="color:#fff;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px">You're coming! 🌿</p>
      <h1 style="color:#fff;font-size:32px;font-weight:300;margin:0">Jennifer &amp; Myles</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">TBD</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:16px;color:#5a5044">Dear ${name},</p>
      <p style="font-size:15px;color:#5a5044;line-height:1.7">We're so excited to celebrate with you!${plusOne ? ` We've noted that ${plusOne} will be joining you.` : ''}</p>
      <div style="background:#EDF4EA;border-radius:12px;padding:20px;margin:24px 0">
        <h3 style="color:#4A6B3E;font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px">Wedding details</h3>
        <table style="width:100%;font-size:14px;color:#5a5044">
          <tr><td style="padding:4px 0;color:#888">Date</td><td style="padding:4px 0;font-weight:500">Saturday, TBD</td></tr>
          <tr><td style="padding:4px 0;color:#888">Ceremony</td><td>4:00 PM</td></tr>
          <tr><td style="padding:4px 0;color:#888">Reception</td><td>6:00 PM</td></tr>
          <tr><td style="padding:4px 0;color:#888">Dress code</td><td>Garden Formal</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="${appUrl}/info" style="display:inline-block;background:#7A9C6E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px">View all wedding info →</a>
      </div>
    </div>
    <div style="background:#FAF8F4;padding:16px;text-align:center;border-top:1px solid #e7e2da">
      <p style="font-size:11px;color:#aaa;margin:0">With love, Jennifer &amp; Myles 💚</p>
    </div>
  </div></body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Wedding <onboarding@resend.dev>', to, subject: `🌿 RSVP confirmed — Jennifer & Myles, TBD`, html }),
  })
}
