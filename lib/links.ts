import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shortLinks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function createCode(length = 7) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export type ShortLink = { id: string; code: string; destination: string; created_at: string; user_id?: string | null }

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export async function isDestinationTaken(destination: string) {
  const result = await db.select().from(shortLinks).where(eq(shortLinks.destination, destination)).limit(1)
  const link = result[0]
  return link ? { id: link.id, code: link.code, destination: link.destination, created_at: link.createdAt.toISOString(), user_id: link.userId } : null
}

export async function createLink(destination: string) {
  const userId = await currentUserId()
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = createCode()
    try {
      const [link] = await db.insert(shortLinks).values({ code, destination, userId }).returning()
      return { id: link.id, code: link.code, destination: link.destination, created_at: link.createdAt.toISOString(), user_id: link.userId }
    } catch (error) {
      if (attempt === 2) throw error
    }
  }
  throw new Error('Unable to generate a unique short link. Please try again.')
}

export async function getLinkByCode(code: string) {
  const result = await db.select({ destination: shortLinks.destination }).from(shortLinks).where(eq(shortLinks.code, code)).limit(1)
  return result[0] ?? null
}
