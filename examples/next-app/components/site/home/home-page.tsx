import Link from 'next/link'
import { HeroDemo } from '@/components/site/home/hero-demo'
import { PageFrame } from '@/components/site/layout/page-frame'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/site'

const highlights = [
  {
    title: 'Persistent regions',
    description: 'Top and bottom stay mounted while richer content inserts between them.',
  },
  {
    title: 'Phase-aware API',
    description: 'Use closed, opening, open, and closing without inventing a second state model.',
  },
  {
    title: 'Built for real flows',
    description:
      'Groups, nested close propagation, scroll alignment, and focus restore are included.',
  },
] as const

export function HomePage() {
  return (
    <PageFrame>
      <section className="page-section page-shell border-b border-border">
        <HeroDemo />
      </section>

      <section className="page-section page-shell">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article className="surface-panel p-5" key={item.title}>
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section page-shell border-t border-border">
        <div className="surface-panel flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="section-label">Get started</p>
            <p className="text-lg font-medium text-foreground">
              Install the package and open the docs when you need the full API surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href={siteConfig.repoUrl} rel="noreferrer" target="_blank">
                View source
              </a>
            </Button>
            <Button asChild>
              <Link href="/docs">Open documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageFrame>
  )
}
