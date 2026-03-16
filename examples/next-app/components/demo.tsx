'use client'

import { RevealClose, RevealGroup, RevealPanel, RevealTrigger } from '@mijengo/reveal-ui'
import { useState } from 'react'

export function Demo() {
  const [headline, setHeadline] = useState('Service blueprint')
  const [summary, setSummary] = useState(
    'A persistent-summary disclosure lets the card stay readable while an inline editor opens in the middle.',
  )

  return (
    <main className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Persistent-Summary Disclosure</p>
        <h1>Inline reveal editors and expanding cards without losing context.</h1>
        <p className="lede">
          This demo keeps the summary visible above and below the revealed content while supporting
          grouped cards, explicit triggers, and migration-safe aliases.
        </p>
      </div>

      <section className="stack">
        <RevealPanel
          content={({ close }) => (
            <div className="editor-panel">
              <label className="field">
                <span>Headline</span>
                <input value={headline} onChange={(event) => setHeadline(event.target.value)} />
              </label>
              <label className="field">
                <span>Summary</span>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                />
              </label>
              <div className="editor-actions">
                <button className="ghost-button" type="button" onClick={() => close()}>
                  Save and collapse
                </button>
                <RevealClose className="secondary-button">Close</RevealClose>
              </div>
            </div>
          )}
          magicMotion
          scrollOnOpen
        >
          <RevealPanel.Top>
            <article className="card card-top">
              <div>
                <p className="eyebrow">Inline Reveal Editor</p>
                <h2>{headline}</h2>
                <p>{summary}</p>
              </div>
              <RevealTrigger className="primary-button">Edit summary</RevealTrigger>
            </article>
          </RevealPanel.Top>

          <RevealPanel.Bottom>
            <div className="card card-bottom">
              <span>Status</span>
              <strong>Context stays mounted during editing.</strong>
            </div>
          </RevealPanel.Bottom>
        </RevealPanel>

        <RevealGroup>
          <div className="accordion-grid">
            <RevealPanel content={<CardDetails title="Compound amenities" />}>
              <RevealPanel.Top>
                <article className="mini-card">
                  <div>
                    <p className="eyebrow">Expanding Card Disclosure</p>
                    <h3>Compound amenities</h3>
                    <p>Single-open behavior is coordinated through `RevealGroup`.</p>
                  </div>
                  <RevealTrigger className="secondary-button">Inspect</RevealTrigger>
                </article>
              </RevealPanel.Top>
              <RevealPanel.Bottom>
                <div className="mini-card-footer">Top and bottom regions remain visible.</div>
              </RevealPanel.Bottom>
            </RevealPanel>

            <RevealPanel content={<CardDetails title="Provider notes" />}>
              <RevealPanel.Top>
                <article className="mini-card">
                  <div>
                    <p className="eyebrow">Grouped Reveal</p>
                    <h3>Provider notes</h3>
                    <p>Opening this card closes the other one in the stack.</p>
                  </div>
                  <RevealTrigger className="secondary-button">Inspect</RevealTrigger>
                </article>
              </RevealPanel.Top>
              <RevealPanel.Bottom>
                <div className="mini-card-footer">Ideal for accordion-like inspection flows.</div>
              </RevealPanel.Bottom>
            </RevealPanel>
          </div>
        </RevealGroup>
      </section>
    </main>
  )
}

function CardDetails({ title }: { title: string }) {
  return (
    <div className="details-panel">
      <h4>{title}</h4>
      <p>
        Revealed content is inserted between persistent regions, which keeps summary context
        available during review and editing.
      </p>
      <RevealClose className="ghost-button">Collapse</RevealClose>
    </div>
  )
}
