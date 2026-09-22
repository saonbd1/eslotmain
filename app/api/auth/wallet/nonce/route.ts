import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { randomBytes } from 'node:crypto'

export async function GET() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const nonce = randomBytes(32).toString('hex')
  const response = NextResponse.json({ nonce, domain: host, uri: `https://${host}` })
  response.cookies.set('wallet_nonce', nonce, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300,
    path: '/api/auth/wallet',
  })
  return response
}
