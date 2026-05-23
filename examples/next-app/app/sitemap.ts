import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-05-23T00:00:00.000Z')

  return [
    {
      changeFrequency: 'weekly',
      lastModified,
      priority: 1,
      url: siteConfig.url,
    },
    {
      changeFrequency: 'weekly',
      lastModified,
      priority: 0.9,
      url: `${siteConfig.url}/docs`,
    },
    {
      changeFrequency: 'weekly',
      lastModified,
      priority: 0.9,
      url: `${siteConfig.url}/examples`,
    },
  ]
}
