'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import {
  ArrowRightIcon,
  CheckCircleFillIcon,
  ChevronRightIcon,
  CopyIcon,
  DeviceDesktopIcon,
  GraphIcon,
  LinkIcon,
  LocationIcon,
  PeopleIcon,
  RocketIcon,
  ZapIcon,
} from '@primer/octicons-react'

export default function Page() {
  const [url, setUrl] = useState('')
  const [shortened, setShortened] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isShortening, setIsShortening] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function shortenUrl() {
    if (!url.trim() || isShortening) return
    setIsShortening(true)
    setErrorMessage('')
    setShortened(null)
    setCopied(false)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const payload = await response.json() as { shortUrl?: string; error?: string }
      if (!response.ok || !payload.shortUrl) throw new Error(payload.error || 'Unable to shorten this URL right now.')
      setShortened(payload.shortUrl)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to shorten this URL right now.')
    } finally {
      setIsShortening(false)
    }
  }

  async function copyUrl() {
    if (!shortened) return
    await navigator.clipboard?.writeText(shortened)
    setCopied(true)
  }

  return (
    <main className="site-shell">
      <nav className="topbar page-width" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="eslotmain.xyz home">
          <span className="brand-mark"><LinkIcon size={17} /></span>
          <span>eslotmain<span className="brand-dot">.</span>xyz</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="/analytics">Analytics</a>
          <a href="/blog">Blog</a>
          <a href="/bulk">Bulk submit</a>
          <a className="nav-signin" href="/signin">Sign in</a>
          <a className="nav-cta" href="/signup">Get started <ArrowRightIcon size={15} /></a>
        </div>
        <div className="mobile-actions"><a className="mobile-signin" href="/signin">Sign in</a><a className="mobile-bulk" href="/bulk">Bulk</a><a className="mobile-cta" href="/signup">Start free</a></div>
      </nav>

      <section id="top" className="hero page-width">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LINKS, BUT BETTER</div>
          <h1>Make every link<br /><span>worth clicking.</span></h1>
          <p className="hero-subtitle">Turn long, messy URLs into memorable links your audience can trust — then learn what every click means.</p>
        </div>

        <div id="shorten" className="shortener-card">
          <div className="shortener-topline"><span className="live-dot" /> Your next link starts here</div>
          <div className="shortener-form">
            <div className="input-wrap">
              <LinkIcon size={18} className="input-icon" />
              <input
                aria-label="Paste a long URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) void shortenUrl() }}
                placeholder="Paste a long URL here..."
              />
            </div>
            <button className="primary-button" type="button" onClick={() => void shortenUrl()} disabled={isShortening}>
              {isShortening ? 'Shortening…' : 'Shorten URL'} <ArrowRightIcon size={17} />
            </button>
          </div>
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          {shortened && (
            <div className="result-row">
              <div className="result-link"><CheckCircleFillIcon size={17} /> <span>{shortened}</span></div>
              <button className="copy-button" type="button" onClick={() => void copyUrl()}><CopyIcon size={15} /> {copied ? 'Copied' : 'Copy link'}</button>
            </div>
          )}
          <div className="shortener-foot"><span>Free forever for personal links</span><span>No credit card required</span><span>Ready in seconds</span></div>
        </div>

        <div className="trust-row"><span>Trusted by teams moving fast</span><span className="trust-divider" /><strong>24.8K+</strong> links created this month</div>
      </section>

      <section id="features" className="features-section page-width">
        <div className="section-heading">
          <div className="eyebrow"><span className="eyebrow-line" /> BUILT FOR MOMENTS THAT MATTER</div>
          <h2>Simple on the surface.<br /><span>Powerful underneath.</span></h2>
          <p>Everything you need to share with confidence, understand your audience, and keep your brand in the conversation.</p>
        </div>
        <div className="feature-grid">
          <Feature icon={<ZapIcon size={20} />} eyebrow="FAST TO LAUNCH" title="Shorten in seconds" text="Clean, shareable links without the busywork. Keep your momentum from idea to publish." />
          <Feature icon={<GraphIcon size={20} />} eyebrow="SMART ANALYTICS" title="Understand every click" text="See what resonates with clicks, locations, devices, and referrers in one calm dashboard." />
          <Feature icon={<LinkIcon size={20} />} eyebrow="YOUR BRAND" title="Stay recognizable" text="Customize slugs and use branded domains to build trust wherever your links appear." />
        </div>
      </section>

      <section id="analytics" className="analytics-wrap page-width">
        <div className="analytics-card">
          <div className="analytics-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> LINK INTELLIGENCE</div>
            <h2>Every click<br /><span>tells a story.</span></h2>
            <p>A focused dashboard that turns link activity into a clearer picture of your audience and what to do next.</p>
            <div className="metrics">
              <Metric value="24.8K" label="Total clicks" />
              <Metric value="68%" label="Returning visitors" />
              <Metric value="12" label="Top markets" />
            </div>
            <a className="secondary-button" href="/analytics">Explore analytics <ChevronRightIcon size={16} /></a>
          </div>
          <div className="dashboard-preview">
            <div className="preview-header"><span className="preview-title"><span className="mini-mark"><GraphIcon size={12} /></span> Campaign overview</span><span className="preview-range">Last 30 days <ChevronRightIcon size={12} /></span></div>
            <div className="chart-area"><div className="chart-labels"><span>1,200</span><span>800</span><span>400</span><span>0</span></div><div className="chart-grid"><div className="chart-line chart-line-a" /><div className="chart-line chart-line-b" /><div className="chart-line chart-line-c" /></div><div className="chart-bars"><i style={{ height: '27%' }} /><i style={{ height: '38%' }} /><i style={{ height: '31%' }} /><i style={{ height: '48%' }} /><i style={{ height: '45%' }} /><i style={{ height: '62%' }} /><i style={{ height: '59%' }} /><i style={{ height: '78%' }} /><i style={{ height: '72%' }} /><i style={{ height: '92%' }} /><i style={{ height: '84%' }} /><i style={{ height: '100%' }} /></div></div>
            <div className="preview-stats"><span><PeopleIcon size={14} /> Visitors <strong>8,420</strong></span><span><LocationIcon size={14} /> Top market <strong>United States</strong></span><span><DeviceDesktopIcon size={14} /> Devices <strong>Mobile 72%</strong></span></div>
          </div>
        </div>
      </section>

      <section id="blog" className="blog-section page-width">
        <div className="blog-heading-row">
          <div className="section-heading">
            <div className="eyebrow"><span className="eyebrow-line" /> FROM THE LINK LAB</div>
            <h2>Ideas for your<br /><span>next click.</span></h2>
            <p>Practical guidance on better sharing, smarter campaigns, and building trust one link at a time.</p>
          </div>
          <a className="secondary-button blog-view-all" href="#blog">View all articles <ArrowRightIcon size={15} /></a>
        </div>
        <div className="blog-grid">
          <BlogCard category="LINK STRATEGY" date="6 min read" title="The anatomy of a link people actually want to click" text="Five small details that make a short link feel clearer, safer, and more memorable." accent="blue" />
          <BlogCard category="CAMPAIGNS" date="8 min read" title="How to turn clicks into a clearer campaign story" text="A simple framework for reading link activity and making your next launch more intentional." accent="violet" />
          <BlogCard category="BEST PRACTICES" date="5 min read" title="Branded links build trust before the page loads" text="Why recognizable links matter in social posts, email, and every place your audience sees you." accent="teal" />
        </div>
      </section>

      <section className="closing-section page-width">
        <div className="closing-inner"><div className="closing-icon"><RocketIcon size={22} /></div><div><h2>Ready to make your links work harder?</h2><p>Start for free. Upgrade when your audience grows.</p></div><a className="primary-button" href="/signup">Create your free account <ArrowRightIcon size={17} /></a></div>
      </section>

      <Footer />
    </main>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>
}

function Feature({ icon, eyebrow, title, text }: { icon: React.ReactNode; eyebrow: string; title: string; text: string }) {
  return <article className="feature-card"><div className="feature-icon">{icon}</div><div className="eyebrow feature-eyebrow">{eyebrow}</div><h3>{title}</h3><p>{text}</p><span className="feature-arrow"><ArrowRightIcon size={15} /></span></article>
}

function BlogCard({ category, date, title, text, accent }: { category: string; date: string; title: string; text: string; accent: 'blue' | 'violet' | 'teal' }) {
  return <article className={`blog-card blog-${accent}`}><div className="blog-art"><span className="blog-art-mark"><LinkIcon size={22} /></span><span className="blog-art-orbit blog-art-orbit-one" /><span className="blog-art-orbit blog-art-orbit-two" /></div><div className="blog-card-body"><div className="blog-meta"><span>{category}</span><span>{date}</span></div><h3>{title}</h3><p>{text}</p><a className="blog-read" href="#blog">Read article <ArrowRightIcon size={14} /></a></div></article>
}
