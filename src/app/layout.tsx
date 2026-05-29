import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-display' })
const dmSans    = DM_Sans({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Wedding Planner',
  description: 'Private wedding planner for Jennifer & Myles',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// Inline script: apply saved colors before first paint — prevents flash
const colorScript = `(function(){try{
  var c=localStorage.getItem('weddingColors');
  if(c){
    var p=JSON.parse(c);
    var r=document.documentElement;
    if(p.accent)   r.style.setProperty('--accent',p.accent);
    if(p.sage)     r.style.setProperty('--sage',p.sage);
    if(p.bg){      r.style.setProperty('--bg',p.bg); r.style.setProperty('--bg2',p.bg); }
    if(p.tertiary) r.style.setProperty('--bg3',p.tertiary);
    if(p.title)    r.style.setProperty('--title',p.title);
    if(p.subheader)r.style.setProperty('--subheader',p.subheader);
    if(p.body)     r.style.setProperty('--body',p.body);
  }
}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
