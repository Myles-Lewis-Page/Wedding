import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // Fetch the page
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

    const html = await res.text()

    // Extract metadata using regex (no cheerio needed in edge)
    const getMeta = (name: string) => {
      const patterns = [
        new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`, 'i'),
      ]
      for (const p of patterns) {
        const m = html.match(p)
        if (m) return m[1].trim()
      }
      return ''
    }

    const getTitle = () => {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      return m ? m[1].trim().split('|')[0].split('-')[0].trim() : ''
    }

    const getH1 = () => {
      const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      return m ? m[1].replace(/<[^>]+>/g, '').trim() : ''
    }

    // Extract best image
    const getImage = () => {
      // Try og:image first
      const og = getMeta('og:image')
      if (og) return og

      // Try twitter:image
      const tw = getMeta('twitter:image')
      if (tw) return tw

      // Try first large img src
      const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
      for (const m of imgMatches) {
        const src = m[1]
        if (src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
          return src
        }
      }
      return ''
    }

    // Extract description
    const getDescription = () => {
      const og = getMeta('og:description')
      if (og) return og
      const desc = getMeta('description')
      if (desc) return desc
      // Try first paragraph
      const p = html.match(/<p[^>]*>([^<]{50,})<\/p>/i)
      return p ? p[1].replace(/<[^>]+>/g, '').trim().slice(0, 500) : ''
    }

    // Try to find address-like text
    const getAddress = () => {
      // Look for common address patterns
      const patterns = [
        /\d+\s+[A-Z][a-zA-Z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[,\s]+[A-Z][a-zA-Z\s]+[,\s]+[A-Z]{2}\s+\d{5}/,
        /\d+\s+[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/,
      ]
      const text = html.replace(/<[^>]+>/g, ' ')
      for (const p of patterns) {
        const m = text.match(p)
        if (m) return m[0].trim()
      }
      return ''
    }

    // Extract phone
    const getPhone = () => {
      const text = html.replace(/<[^>]+>/g, ' ')
      const m = text.match(/(?:\+1\s?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/)
      return m ? m[0].trim() : ''
    }

    const name = getMeta('og:title') || getH1() || getTitle()
    const imageUrl = getImage()
    const description = getDescription()
    const address = getAddress()
    const phone = getPhone()

    // Resolve relative image URLs
    const resolveUrl = (imgUrl: string) => {
      if (!imgUrl) return ''
      if (imgUrl.startsWith('http')) return imgUrl
      try {
        return new URL(imgUrl, url).href
      } catch {
        return ''
      }
    }

    return NextResponse.json({
      name: name.slice(0, 100),
      image_url: resolveUrl(imageUrl),
      description: description.slice(0, 1000),
      address,
      phone,
      website: url,
    })
  } catch (err) {
    console.error('Scrape error:', err)
    return NextResponse.json({ error: 'Could not fetch venue info. Please fill in details manually.' }, { status: 422 })
  }
}
