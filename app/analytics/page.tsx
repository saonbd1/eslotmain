'use client'
import { FormEvent, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'

type AnalyticsResult = {
  clicks: number
  destination: string
  countries?: { country: string | null; count: number }[]
  devices?: { device: string | null; count: number }[]
  browsers?: { browser: string | null; count: number }[]
  referrers?: { referrer: string | null; count: number }[]
}

export default function AnalyticsPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<AnalyticsResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`/api/analytics?code=${encodeURIComponent(code.trim())}`)
      const payload = await response.json() as AnalyticsResult & { error?: string }
      if (!response.ok || payload.clicks === undefined || !payload.destination) throw new Error(payload.error || 'Analytics are not available for this link yet.')
      setResult(payload)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analytics lookup failed.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="site-shell inner-page-shell"><SiteHeader /><section className="analytics-page page-width"><p className="eyebrow"><span className="eyebrow-line" /> LINK INTELLIGENCE</p><h1>Understand every click.</h1><p className="analytics-intro">Track how your shortened URLs perform with a clear view of total clicks, geographic data, devices, and referrers.</p><div className="analytics-card"><div><span className="analytics-card-label">TRACKING BOX</span><h2>Look up a short link</h2><p>Enter the short code from your eslotmain.xyz link to view its available activity.</p></div><form onSubmit={handleSubmit}><label htmlFor="analytics-code">Short code</label><div className="analytics-form-row"><input id="analytics-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. aB12cd" required /><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Checking…' : 'View analytics'}</button></div></form>{error && <p className="form-error" role="alert">{error}</p>}{result && <><div className="analytics-result"><div><span>Total clicks</span><strong>{result.clicks}</strong></div><div><span>Destination</span><strong>{result.destination}</strong></div></div>{result.countries && result.countries.length > 0 && <div className="analytics-section"><h3>Top Countries</h3><div className="analytics-list">{result.countries.map((item, index) => <div key={index} className="analytics-list-item"><span>{item.country || 'Unknown'}</span><strong>{item.count}</strong></div>)}</div></div>}{result.devices && result.devices.length > 0 && <div className="analytics-section"><h3>Top Devices</h3><div className="analytics-list">{result.devices.map((item, index) => <div key={index} className="analytics-list-item"><span>{item.device || 'Unknown'}</span><strong>{item.count}</strong></div>)}</div></div>}{result.browsers && result.browsers.length > 0 && <div className="analytics-section"><h3>Top Browsers</h3><div className="analytics-list">{result.browsers.map((item, index) => <div key={index} className="analytics-list-item"><span>{item.browser || 'Unknown'}</span><strong>{item.count}</strong></div>)}</div></div>}{result.referrers && result.referrers.length > 0 && <div className="analytics-section"><h3>Top Referrers</h3><div className="analytics-list">{result.referrers.map((item, index) => <div key={index} className="analytics-list-item"><span>{item.referrer || 'Direct'}</span><strong>{item.count}</strong></div>)}</div></div>}</>}</div></section><Footer /></main>
}
