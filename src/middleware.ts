import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /dashboard routes
  if (!pathname.startsWith('/dashboard')) return NextResponse.next()

  const auth = req.cookies.get('auth')?.value
  if (auth === 'true') return NextResponse.next()

  // Redirect to login
  const login = req.nextUrl.clone()
  login.pathname = '/login'
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
