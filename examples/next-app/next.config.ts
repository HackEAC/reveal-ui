import path from 'node:path'
import type { NextConfig } from 'next'

const isGithubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.GITHUB_PAGES === 'true'
const repoBasePath = '/reveal-ui'

const nextConfig: NextConfig = {
  assetPrefix: isGithubPages ? `${repoBasePath}/` : undefined,
  basePath: isGithubPages ? repoBasePath : '',
  images: {
    unoptimized: true,
  },
  output: 'export',
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  trailingSlash: true,
}

export default nextConfig
