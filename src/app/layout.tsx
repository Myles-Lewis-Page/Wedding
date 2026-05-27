import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-display' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Jennifer & Myles · Wedding Planner',
  description: 'Private wedding planner',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

const colorScript = `(function(){try{var c=localStorage.getItem('weddingColors');if(c){var p=JSON.parse(c);if(p.accent)document.documentElement.style.setProperty('--accent',p.accent);if(p.sage)document.documentElement.style.setProperty('--sage',p.sage);if(p.bg){document.documentElement.style.setProperty('--bg',p.bg);document.documentElement.style.setProperty('--bg2',p.bg);}}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: colorScript }} /></head>
      <body>{children}</body>
    </html>
  )
}
