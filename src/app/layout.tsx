import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Wedding Planner',
  description: 'Plan your perfect day',
}

// Runs before paint — reads saved colors from localStorage and applies CSS vars
const colorScript = `
(function() {
  try {
    var c = localStorage.getItem('weddingColors');
    if (c) {
      var colors = JSON.parse(c);
      if (colors.accent) document.documentElement.style.setProperty('--accent', colors.accent);
      if (colors.sage) document.documentElement.style.setProperty('--sage', colors.sage);
    }
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorScript }} />
      </head>
      <body className="bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  )
}
