'use client'

import { useMemo, useState } from 'react'

const emptyRows = Array.from({ length: 2 }, () => '')

type Result = { code: string; shortUrl: string; destination: string }

export default function BulkShortener() {
  const [rows, setRows] = useState(emptyRows)
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const filledCount = useMemo(() => rows.filter((row) => row.trim()).length, [rows])

  function updateRow(index: number, value: string) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? value : row))
    setError('')
  }

  function addRow() {
    if (rows.length < 10) setRows((current) => [...current, ''])
  }

  async function submitBulk() {
    const urls = rows.map((row) => row.trim()).filter(Boolean)
    setError('')
    setResults([])
    setCopied('')
    if (!urls.length) {
      setError('Add at least one URL to continue.')
      return
    }
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to shorten these URLs.')
      setResults(payload.results)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to shorten these URLs.')
    }
  }

  async function copyResult(result: Result) {
    await navigator.clipboard?.writeText(result.shortUrl)
    setCopied(result.code)
  }

  return (
    <section className="bulk-shortener page-width" aria-labelledby="bulk-shortener-title">
      <div className="bulk-shortener-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> BULK SHORTENING</p>
          <h2 id="bulk-shortener-title">Shorten up to 10 links at once.</h2>
          <p>Paste multiple destinations, submit them together, and receive a unique short link for every URL.</p>
        </div>
        <span className="bulk-count">{filledCount}/10 links</span>
      </div>
      <div className="bulk-input-list">
        {rows.map((row, index) => (
          <label className="bulk-input-row" key={index}>
            <span>{index + 1}</span>
            <input value={row} onChange={(event) => updateRow(index, event.target.value)} placeholder="https://example.com/your-destination" type="url" />
          </label>
        ))}
      </div>
      <div className="bulk-actions">
        <button className="secondary-button" type="button" onClick={addRow} disabled={rows.length >= 10}>Add another URL</button>
        <button className="primary-button" type="button" onClick={submitBulk}>Shorten {filledCount || ''} links</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {results.length > 0 && (
        <div className="bulk-results" aria-live="polite">
          {results.map((result) => (
            <div className="bulk-result-row" key={result.code}>
              <div><strong>{result.shortUrl}</strong><span>{result.destination}</span></div>
              <button className="secondary-button" type="button" onClick={() => copyResult(result)}>{copied === result.code ? 'Copied' : 'Copy'}</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
