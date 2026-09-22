import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { getAddress, verifyMessage } from 'viem'

const MAX_CLOCK_SKEW_SECONDS = 60

export async function POST(request: Request) {
  try {
    const body = await request.json() as { address?: string; message?: string; signature?: string }
    const address = body.address ? getAddress(body.address) : ''
    const message = body.message ?? ''
    const signature = body.signature ?? ''
    const cookieStore = await cookies()
    const expectedNonce = cookieStore.get('wallet_nonce')?.value
    const requestHeaders = await headers()
    const expectedDomain = requestHeaders.get('host') ?? ''

    if (!expectedNonce || !address || !message || !signature) {
      return NextResponse.json({ error: 'Invalid wallet authentication request.' }, { status: 400 })
    }

    const lines = message.split('\n')
    const domain = lines[0]?.split(' wants you to sign in with your Ethereum account:')[0]
    const messageAddress = lines[1]
    const nonceLine = lines.find((line) => line.startsWith('Nonce: '))
    const issuedLine = lines.find((line) => line.startsWith('Issued At: '))
    const expirationLine = lines.find((line) => line.startsWith('Expiration Time: '))
    const nonce = nonceLine?.slice('Nonce: '.length)
    const chainLine = lines.find((line) => line.startsWith('Chain ID: '))
    const chainId = chainLine?.slice('Chain ID: '.length)
    const issuedAt = issuedLine ? Date.parse(issuedLine.slice('Issued At: '.length)) : NaN
    const expiration = expirationLine ? Date.parse(expirationLine.slice('Expiration Time: '.length)) : NaN
    const now = Date.now()

    if (domain !== expectedDomain || messageAddress?.toLowerCase() !== address.toLowerCase() || nonce !== expectedNonce || chainId !== '1' || Number.isNaN(expiration) || expiration <= now || Number.isNaN(issuedAt) || issuedAt > now + MAX_CLOCK_SKEW_SECONDS * 1000) {
      return NextResponse.json({ error: 'Invalid or expired wallet authentication message.' }, { status: 401 })
    }

    const valid = await verifyMessage({ address, message, signature: signature as `0x${string}` })
    if (!valid) return NextResponse.json({ error: 'Wallet signature could not be verified.' }, { status: 401 })

    const response = NextResponse.json({ verified: true, address })
    response.cookies.set('wallet_nonce', '', { httpOnly: true, maxAge: 0, path: '/api/auth/wallet' })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid wallet authentication request.' }, { status: 400 })
  }
}
