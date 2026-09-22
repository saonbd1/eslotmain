'use client'
import { FormEvent, useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'

export default function AnalyticsPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<{ clicks: number; destination: string } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`/api/analytics?code=${encodeURIComponent(code.trim())}`)
      const payload = await response.json() as { clicks?: number; destination?: string; error?: string }
      if (!response.ok || payload.clicks === undefined || !payload.destination) throw new Error(payload.error || 'Analytics are not available for this link yet.')
      setResult({ clicks: payload.clicks, destination: payload.destination })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analytics lookup failed.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="site-shell inner-page-shell"><SiteHeader /><section className="analytics-page page-width"><p className="eyebrow"><span className="eyebrow-line" /> LINK INTELLIGENCE</p><h1>Understand every click.</h1><p className="analytics-intro">Track how your shortened URLs perform with a clear view of total clicks and destination details.</p><div className="analytics-card"><div><span className="analytics-card-label">TRACKING BOX</span><h2>Look up a short link</h2><p>Enter the short code from your eslotmain.xyz link to view its available activity.</p></div><form onSubmit={handleSubmit}><label htmlFor="analytics-code">Short code</label><div className="analytics-form-row"><input id="analytics-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. aB12cd" required /><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Checking…' : 'View analytics'}</button></div></form>{error && <p className="form-error" role="alert">{error}</p>}{result && <div className="analytics-result"><div><span>Total clicks</span><strong>{result.clicks}</strong></div><div><span>Destination</span><strong>{result.destination}</strong></div></div>}</div></section><Footer /></main>
}
