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

    // Get total clicks
    const [clicksResult] = await db.select({ clicks: sql<number>`count(*)` }).from(shortLinkEvents).where(eq(shortLinkEvents.code, code))

    // Get geographic data
    const countryResults = await db.select({ country: shortLinkEvents.country, count: sql<number>`count(*)` }).from(shortLinkEvents).where(eq(shortLinkEvents.code, code)).groupBy(shortLinkEvents.country).orderBy(sql`count(*) DESC`).limit(5)

    // Get device data
    const deviceResults = await db.select({ device: shortLinkEvents.device, count: sql<number>`count(*)` }).from(shortLinkEvents).where(eq(shortLinkEvents.code, code)).groupBy(shortLinkEvents.device).orderBy(sql`count(*) DESC`).limit(5)

    // Get browser data
    const browserResults = await db.select({ browser: shortLinkEvents.browser, count: sql<number>`count(*)` }).from(shortLinkEvents).where(eq(shortLinkEvents.code, code)).groupBy(shortLinkEvents.browser).orderBy(sql`count(*) DESC`).limit(5)

    // Get referrer data
    const referrerResults = await db.select({ referrer: shortLinkEvents.referrer, count: sql<number>`count(*)` }).from(shortLinkEvents).where(eq(shortLinkEvents.code, code)).groupBy(shortLinkEvents.referrer).orderBy(sql`count(*) DESC`).limit(5)

    return NextResponse.json({
      clicks: Number(clicksResult?.clicks ?? 0),
      destination: link.destination,
      countries: countryResults.map(r => ({ country: r.country, count: Number(r.count) })),
      devices: deviceResults.map(r => ({ device: r.device, count: Number(r.count) })),
      browsers: browserResults.map(r => ({ browser: r.browser, count: Number(r.count) })),
      referrers: referrerResults.map(r => ({ referrer: r.referrer, count: Number(r.count) })),
    })
  } catch {
    return NextResponse.json({ error: 'Analytics are not available right now.' }, { status: 503 })
  }
}
