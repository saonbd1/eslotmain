import { LinkIcon } from '@primer/octicons-react'
import HeaderAuth from '@/components/HeaderAuth'

export default function SiteHeader() {
  return (
    <nav className="topbar page-width" aria-label="Main navigation">
      <a className="brand" href="/" aria-label="eslotmain.xyz home">
        <span className="brand-mark"><LinkIcon size={17} /></span>
        <span>eslotmain<span className="brand-dot">.</span>xyz</span>
      </a>
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/analytics">Analytics</a>
        <a href="/bulk">Bulk shortener</a>
        <HeaderAuth />
      </div>
    </nav>
  )
}
