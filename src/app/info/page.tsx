import { Heart, MapPin, Clock, Shirt } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const [rs, venue, ws, timeline] = await Promise.all([
      prisma.rsvpSettings.findUnique({ where: { id: 'main' } }),
      prisma.venue.findFirst({ where: { isSelected: true } }),
      prisma.weddingSettings.findFirst(),
      prisma.timelineItem.findMany({ orderBy: { order: 'asc' } }),
    ])
    return { rs, venue, ws, timeline }
  } catch {
    return { rs: null, venue: null, ws: null, timeline: [] }
  }
}

export default async function InfoPage() {
  const { rs, venue, ws, timeline } = await getData()

  const coupleNames = rs?.brideName && rs?.groomName
    ? `${rs.brideName} & ${rs.groomName}`
    : rs?.heading || 'Our Wedding'

  const weddingDate = ws?.weddingDate || rs?.weddingDate || ''
  const dateStr = weddingDate
    ? new Date(weddingDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBD'

  // Derive ceremony + reception times from timeline
  const ceremonyItem  = timeline.find(t => t.title.toLowerCase().includes('ceremony'))
  const receptionItem = timeline.find(t => t.title.toLowerCase().includes('reception'))
  const ceremonyTime  = ceremonyItem?.time  || ''
  const receptionTime = receptionItem?.time || ''

  const timeStr = [
    ceremonyTime  && `Ceremony ${ceremonyTime}`,
    receptionTime && `Reception ${receptionTime}`,
  ].filter(Boolean).join(' · ') || 'Times TBD'

  const venueName = venue?.name    || 'Venue TBD'
  const venueAddr = venue?.address || ''
  const dressCode = rs?.dressCode  || 'Garden Formal'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px', background: 'linear-gradient(180deg,#EDF4EA,#FAF8F4)' }}>
        <Heart size={20} fill="#7A9C6E" style={{ color: '#7A9C6E', margin: '0 auto 16px' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 300, color: '#2d2825', lineHeight: 1.1 }}>
          {coupleNames}
        </h1>
        <p style={{ color: '#7A9C6E', marginTop: 8, letterSpacing: '3px', fontSize: 13, textTransform: 'uppercase' }}>{dateStr}</p>
      </div>

      {/* Details card */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e7e2da', overflow: 'hidden', marginBottom: 32 }}>
          {[
            { icon: MapPin, label: 'Venue',     value: venueAddr ? `${venueName} · ${venueAddr}` : venueName },
            { icon: Clock,  label: 'Timing',    value: timeStr },
            { icon: Shirt,  label: 'Dress code', value: dressCode },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EDF4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#7A9C6E" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#7A9C6E', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, color: '#5a5044', lineHeight: 1.6 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {timeline.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e7e2da', overflow: 'hidden', marginBottom: 32 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#2d2825' }}>Day-of timeline</p>
            </div>
            {timeline.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 24px', borderBottom: '1px solid #f0ede8', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#7A9C6E', width: 60, flexShrink: 0 }}>{item.time}</p>
                <div>
                  <p style={{ fontSize: 14, color: '#2d2825', fontWeight: 500 }}>{item.title}</p>
                  {item.desc && <p style={{ fontSize: 13, color: '#9a8c80', marginTop: 2 }}>{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #e7e2da' }}>
          <Heart size={16} fill="#7A9C6E" style={{ color: '#7A9C6E', margin: '0 auto 8px' }} />
          <p style={{ color: '#aaa', fontSize: 13 }}>With love, the couple</p>
        </div>
      </div>
    </div>
  )
}
