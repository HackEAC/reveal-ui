import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: 'weekly',
      lastModified: '2026-03-16T00:00:00.000Z',
      priority: 1,
      url: siteConfig.url,
    },
  ]
}
