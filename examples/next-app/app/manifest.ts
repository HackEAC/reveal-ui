import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#f7f3ea',
    description:
      'Documentation and examples for reveal-ui — inline disclosure for React editors, comparisons, and nested flows.',
    display: 'standalone',
    icons: [
      {
        sizes: 'any',
        src: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    name: 'reveal-ui',
    short_name: 'reveal-ui',
    start_url: '/',
    theme_color: '#f7f3ea',
  }
}
