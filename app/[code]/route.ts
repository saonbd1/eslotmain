import { NextResponse } from 'next/server'
import { getLinkByCode, recordLinkEvent } from '@/lib/links'
import { headers } from 'next/headers'

function getUserAgent(request: Request): { device?: string; browser?: string; os?: string } {
  const userAgent = request.headers.get('user-agent') || ''
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'Mobile' : 'Desktop'

  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'

  let os = 'Unknown'
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'

  return { device, browser, os }
}

function getCountryFromHeaders(request: Request): string | undefined {
  const cfCountry = request.headers.get('cf-ipcountry')
  if (cfCountry) return cfCountry
  return undefined
}

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  if (!/^[a-zA-Z0-9-_]{3,50}$/.test(code)) return NextResponse.redirect(new URL('/', request.url))
  try {
    const link = await getLinkByCode(code)
    if (!link) return NextResponse.redirect(new URL('/', request.url))

    // Capture enhanced analytics data
    const { device, browser, os } = getUserAgent(request)
    const country = getCountryFromHeaders(request)
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || undefined

    // Get IP address (from headers if available, otherwise skip)
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined

    // Record the event with enhanced data
    await recordLinkEvent(code, {
      country,
      device,
      browser,
      os,
      referrer,
      ipAddress,
    })

    return NextResponse.redirect(link.destination, 302)
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
