import { Heart, MapPin, Clock, Shirt, Camera } from 'lucide-react'

export default function InfoPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F4', fontFamily: 'var(--font-body)' }}>
      {/* Hero */}
      <div className="text-center py-20 px-6" style={{ background: 'linear-gradient(180deg, #EDF4EA, #FAF8F4)' }}>
        <Heart size={20} fill="#7A9C6E" className="text-[#7A9C6E] mx-auto mb-4" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 300, color: '#2d2825', lineHeight: 1.1 }}>
          Jennifer & Myles
        </h1>
        <p style={{ color: '#7A9C6E', marginTop: '0.5rem', letterSpacing: '3px', fontSize: '13px', textTransform: 'uppercase' }}>
          TBD
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-12">
        {/* Our Story */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#2d2825', marginBottom: '1rem' }}>
            Our story
          </h2>
          <p style={{ color: '#6b6460', lineHeight: 1.8, fontSize: '15px' }}>
            We met at a farmers market on a rainy Saturday in 2020 — Jennifer was looking for the perfect tomatoes,
            Myles was looking for an excuse to talk to her. Three years, two dogs, and one very well-planned proposal later,
            we&apos;re getting married in the place we love most: surrounded by nature, family, and the people who mean everything to us.
          </p>
        </section>

        {/* Details */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#2d2825', marginBottom: '1rem' }}>
            The details
          </h2>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e7e2da', overflow: 'hidden' }}>
            {[
              { icon: MapPin, label: 'Venue', value: 'The Barn at Stonegate\n1234 Country Lane, Nashville, TN 37201' },
              { icon: Clock, label: 'Ceremony', value: 'Saturday, June 14 at 4:00 PM\nReception follows at 6:00 PM' },
              { icon: Shirt, label: 'Dress code', value: 'Garden Formal\nThink: floral dresses, linen suits, earthy tones' },
              { icon: Camera, label: 'Photography', value: 'We\'d love for you to be present!\nUnplugged ceremony — phones away until after the kiss 📵' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EDF4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#7A9C6E" />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#7A9C6E', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '14px', color: '#5a5044', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#2d2825', marginBottom: '1rem' }}>
            Day-of timeline
          </h2>
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '1px', background: '#e7e2da' }} />
            {[
              { time: '3:30 PM', label: 'Guests arrive & find their seats' },
              { time: '4:00 PM', label: 'Ceremony begins' },
              { time: '4:45 PM', label: 'Cocktail hour on the terrace' },
              { time: '6:00 PM', label: 'Reception doors open' },
              { time: '6:30 PM', label: 'First dances & toasts' },
              { time: '7:00 PM', label: 'Dinner is served' },
              { time: '9:00 PM', label: 'Dancing until midnight!' },
            ].map(({ time, label }) => (
              <div key={time} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-28px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: '#7A9C6E', border: '2px solid #FAF8F4', flexShrink: 0 }} />
                <div style={{ paddingTop: '1px' }}>
                  <p style={{ fontSize: '11px', color: '#7A9C6E', fontWeight: 500, letterSpacing: '0.5px' }}>{time}</p>
                  <p style={{ fontSize: '14px', color: '#5a5044', marginTop: '2px' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #e7e2da' }}>
          <Heart size={16} fill="#7A9C6E" color="#7A9C6E" style={{ margin: '0 auto 8px' }} />
          <p style={{ color: '#aaa', fontSize: '13px' }}>Questions? hello@ourwedding.com</p>
        </div>
      </div>
    </div>
  )
}
