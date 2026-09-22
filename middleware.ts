import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Optimistic gate only: it checks that a Better Auth session cookie exists.
// Pages and API routes still validate the session on the server (auth.api.getSession),
// so a forged or stale cookie never gets anyone real access.
export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = request.nextUrl.clone()
    const error = request.nextUrl.searchParams.get('error')
    url.pathname = '/signin'
    url.search = ''
    if (error) url.searchParams.set('error', error)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

// Deliberately NOT applied to /signin or /signup, otherwise a stale cookie could cause a redirect loop.
export const config = {
  matcher: ['/account/:path*', '/analytics/:path*', '/blog/dashboard/:path*'],
}
