import type { Metadata } from 'next'
import { DocsExperience } from '@/components/site/docs-experience'
import { PageFrame } from '@/components/site/layout/page-frame'

export const metadata: Metadata = {
  title: 'Documentation',
  alternates: {
    canonical: '/docs',
  },
}

export default function DocsPage() {
  return (
    <PageFrame>
      <section className="page-section page-shell">
        <DocsExperience />
      </section>
    </PageFrame>
  )
}
