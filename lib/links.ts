import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shortLinks, shortLinkEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export function addUtmParams(url: string, utmParams?: { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string }): string {
  if (!utmParams) return url

  try {
    const urlObj = new URL(url)
    if (utmParams.utm_source) urlObj.searchParams.set('utm_source', utmParams.utm_source)
    if (utmParams.utm_medium) urlObj.searchParams.set('utm_medium', utmParams.utm_medium)
    if (utmParams.utm_campaign) urlObj.searchParams.set('utm_campaign', utmParams.utm_campaign)
    if (utmParams.utm_term) urlObj.searchParams.set('utm_term', utmParams.utm_term)
    if (utmParams.utm_content) urlObj.searchParams.set('utm_content', utmParams.utm_content)
    return urlObj.toString()
  } catch {
    return url
  }
}

const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function createCode(length = 7) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export type ShortLink = { id: string; code: string; destination: string; created_at: string; user_id?: string | null; utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null; utm_term?: string | null; utm_content?: string | null }

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export async function isDestinationTaken(destination: string) {
  const result = await db.select().from(shortLinks).where(eq(shortLinks.destination, destination)).limit(1)
  const link = result[0]
  return link ? { id: link.id, code: link.code, destination: link.destination, created_at: link.createdAt.toISOString(), user_id: link.userId, utm_source: link.utmSource, utm_medium: link.utmMedium, utm_campaign: link.utmCampaign, utm_term: link.utmTerm, utm_content: link.utmContent } : null
}

export async function createLink(destination: string, customCode?: string, utmParams?: { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string }) {
  const userId = await currentUserId()
  const code = customCode || createCode()

  // If custom code is provided, check if it's already taken
  if (customCode) {
    const existing = await db.select().from(shortLinks).where(eq(shortLinks.code, customCode)).limit(1)
    if (existing[0]) {
      throw new Error('This custom slug is already taken. Please choose another.')
    }
  }

  try {
    const [link] = await db.insert(shortLinks).values({
      code,
      destination,
      userId,
      utmSource: utmParams?.utm_source,
      utmMedium: utmParams?.utm_medium,
      utmCampaign: utmParams?.utm_campaign,
      utmTerm: utmParams?.utm_term,
      utmContent: utmParams?.utm_content,
    }).returning()
    return { id: link.id, code: link.code, destination: link.destination, created_at: link.createdAt.toISOString(), user_id: link.userId, utm_source: link.utmSource, utm_medium: link.utmMedium, utm_campaign: link.utmCampaign, utm_term: link.utmTerm, utm_content: link.utmContent }
  } catch (error) {
    throw new Error('Unable to create short link. Please try again.')
  }
}

export async function getLinkByCode(code: string) {
  const result = await db.select().from(shortLinks).where(eq(shortLinks.code, code)).limit(1)
  const link = result[0]
  if (!link) return null

  // Apply UTM parameters to destination
  const destination = addUtmParams(link.destination, {
    utm_source: link.utmSource || undefined,
    utm_medium: link.utmMedium || undefined,
    utm_campaign: link.utmCampaign || undefined,
    utm_term: link.utmTerm || undefined,
    utm_content: link.utmContent || undefined,
  })

  return { destination, link }
}

export async function recordLinkEvent(code: string, analyticsData?: { country?: string; city?: string; device?: string; browser?: string; os?: string; referrer?: string; ipAddress?: string }) {
  await db.insert(shortLinkEvents).values({
    code,
    country: analyticsData?.country,
    city: analyticsData?.city,
    device: analyticsData?.device,
    browser: analyticsData?.browser,
    os: analyticsData?.os,
    referrer: analyticsData?.referrer,
    ipAddress: analyticsData?.ipAddress,
  })
}
