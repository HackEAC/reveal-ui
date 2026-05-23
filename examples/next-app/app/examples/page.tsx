import type { Metadata } from 'next'
import { ExamplesPage } from '@/components/site/examples/examples-page'

export const metadata: Metadata = {
  title: 'Examples',
  alternates: {
    canonical: '/examples',
  },
}

export default function ExamplesRoute() {
  return <ExamplesPage />
}
