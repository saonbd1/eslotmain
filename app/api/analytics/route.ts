import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shortLinkEvents, shortLinks } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code')?.trim() ?? ''
  if (!/^[a-zA-Z0-9]{4,32}$/.test(code)) return NextResponse.json({ error: 'Enter a valid short code.' }, { status: 400 })
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in to view private analytics.' }, { status: 401 })
  try {
    const [link] = await db.select({ destination: shortLinks.destination }).from(shortLinks).where(and(eq(shortLinks.code, code), eq(shortLinks.userId, session.user.id))).limit(1)
    if (!link) return NextResponse.json({ error: 'Short link not found or not owned by this account.' }, { status: 404 })
    const [result] = await db.select({ clicks: sql<number>`count(*)` }).from(shortLinkEvents).where(eq(shortLinkEvents.code, code))
    return NextResponse.json({ clicks: Number(result?.clicks ?? 0), destination: link.destination })
  } catch {
    return NextResponse.json({ error: 'Analytics are not available right now.' }, { status: 503 })
  }
}
