import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { deletePost, getPostBySlugForAdmin, updatePost } from '@/lib/blog'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isAdminEmail(session.user.email)) return null
  return session.user
}

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  const { slug } = await params
  const post = await getPostBySlugForAdmin(slug)
  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PUT(request: Request, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Send a JSON body.' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const content = typeof body.content === 'string' ? body.content : ''
  const newSlug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const published = body.published !== false

  if (!title || !description || !excerpt || !content.trim()) {
    return NextResponse.json({ error: 'Title, description, excerpt, and content are all required.' }, { status: 400 })
  }

  try {
    const post = await updatePost(slug, { title, slug: newSlug, description, excerpt, content, published })
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Unable to update the post right now.' }, { status: 503 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  const { slug } = await params
  try {
    const ok = await deletePost(slug)
    if (!ok) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unable to delete the post right now.' }, { status: 503 })
  }
}
