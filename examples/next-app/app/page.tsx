import { ShowcasePage } from '@/components/site/showcase'
import { siteConfig } from '@/lib/site'

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    description: siteConfig.description,
    name: siteConfig.name,
    url: siteConfig.url,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    codeRepository: siteConfig.repoUrl,
    description: siteConfig.description,
    keywords: siteConfig.keywords.join(', '),
    license: `${siteConfig.repoUrl}/blob/main/LICENSE`,
    name: siteConfig.name,
    programmingLanguage: ['TypeScript', 'React'],
    runtimePlatform: 'Web browser',
  },
]

export default function Home() {
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <ShowcasePage />
    </>
  )
}
