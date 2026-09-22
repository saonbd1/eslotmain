import { NextResponse } from 'next/server'
import { createLink, isDestinationTaken } from '@/lib/links'

export const runtime = 'nodejs'

type Body = { url?: unknown; urls?: unknown }

function normalizeUrl(value: unknown) {
  if (typeof value !== 'string') throw new Error('Each item must be a URL.')
  const trimmed = value.trim()
  if (trimmed.length > 2048) throw new Error('URLs must be 2,048 characters or fewer.')
  const destination = new URL(trimmed)
  if (!['http:', 'https:'].includes(destination.protocol)) throw new Error('Only http:// and https:// URLs are supported.')
  return destination.toString()
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

  try {
    const origin = 'https://eslotmain.xyz'
    const results = []
    for (const destination of destinations) {
      const existing = await isDestinationTaken(destination)
      const link = existing ?? await createLink(destination)
      results.push({ code: link.code, shortUrl: `${origin}/${link.code}`, destination: link.destination })
    }
    return NextResponse.json({ results, ...results[0] })
  } catch {
    return NextResponse.json({ error: 'Unable to shorten these URLs right now.' }, { status: 503 })
  }
}
