import { NextRequest, NextResponse } from 'next/server'
export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/dashboard')) return NextResponse.next()
  if (req.cookies.get('auth')?.value === 'true') return NextResponse.next()
  const url = req.nextUrl.clone(); url.pathname = '/login'
  return NextResponse.redirect(url)
}
export const config = { matcher: ['/dashboard/:path*'] }
