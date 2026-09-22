'use client'

import { useState } from 'react'

export function SharePost({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://eslotmain.xyz/blog/${slug}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="blog-share" aria-label="Share this article">
      <span>Share this article</span>
      <div className="blog-share-links">
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer">X</a>
        <button type="button" onClick={() => void copyLink()}>{copied ? 'Copied' : 'Copy link'}</button>
      </div>
    </div>
  )
}
