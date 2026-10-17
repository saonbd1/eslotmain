import { NextResponse } from 'next/server'
import { createLink, isDestinationTaken } from '@/lib/links'

export const runtime = 'nodejs'

type Body = { url?: unknown; urls?: unknown; customSlug?: unknown; utm_source?: unknown; utm_medium?: unknown; utm_campaign?: unknown; utm_term?: unknown; utm_content?: unknown }

function normalizeUrl(value: unknown) {
  if (typeof value !== 'string') throw new Error('Each item must be a URL.')
  const trimmed = value.trim()
  if (trimmed.length > 2048) throw new Error('URLs must be 2,048 characters or fewer.')
  const destination = new URL(trimmed)
  if (!['http:', 'https:'].includes(destination.protocol)) throw new Error('Only http:// and https:// URLs are supported.')
  return destination.toString()
}

function normalizeCustomSlug(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error('Custom slug must be a string.')
  const trimmed = value.trim()
  if (trimmed.length < 3) throw new Error('Custom slug must be at least 3 characters.')
  if (trimmed.length > 50) throw new Error('Custom slug must be 50 characters or fewer.')
  if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) throw new Error('Custom slug can only contain letters, numbers, hyphens, and underscores.')
  return trimmed
}

function normalizeUtmParam(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error('UTM parameters must be strings.')
  const trimmed = value.trim()
  if (trimmed.length > 200) throw new Error('UTM parameters must be 200 characters or fewer.')
  return trimmed
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Send a JSON body with a valid URL or URL list.' }, { status: 400 })
  }

  const rawUrls = Array.isArray(body.urls) ? body.urls : [body.url]
  if (rawUrls.length < 1 || rawUrls.length > 10) {
    return NextResponse.json({ error: 'Submit between 1 and 10 URLs at a time.' }, { status: 400 })
  }

  let destinations: string[]
  try {
    destinations = [...new Set(rawUrls.map(normalizeUrl))]
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Enter valid URLs.' }, { status: 400 })
  }

  // Normalize custom slug and UTM parameters
  let customSlug: string | undefined
  let utmParams: { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string } = {}

  try {
    customSlug = normalizeCustomSlug(body.customSlug)
    utmParams = {
      utm_source: normalizeUtmParam(body.utm_source),
      utm_medium: normalizeUtmParam(body.utm_medium),
      utm_campaign: normalizeUtmParam(body.utm_campaign),
      utm_term: normalizeUtmParam(body.utm_term),
      utm_content: normalizeUtmParam(body.utm_content),
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid custom slug or UTM parameters.' }, { status: 400 })
  }

  try {
    const origin = 'https://eslotmain.xyz'
    const results = []
    for (const destination of destinations) {
      const existing = await isDestinationTaken(destination)
      const link = existing ?? await createLink(destination, customSlug, utmParams)
      results.push({ code: link.code, shortUrl: `${origin}/${link.code}`, destination: link.destination })
    }
    return NextResponse.json({ results, ...results[0] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to shorten these URLs right now.' }, { status: 503 })
  }
}
