import Link from 'next/link'
import { RevealLogoMark } from '@/components/site/logo-mark'
import { siteConfig } from '@/lib/site'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="page-shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <RevealLogoMark className="size-8 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">reveal-ui</p>
            <p className="text-sm text-muted-foreground">Inline disclosure for React.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="/docs"
          >
            Documentation
          </Link>
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="/examples"
          >
            Examples
          </Link>
          <a
            className="text-muted-foreground transition-colors hover:text-foreground"
            href={siteConfig.repoUrl}
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </div>

        <p className="text-sm text-muted-foreground">
          MIT ·{' '}
          <a
            className="text-foreground transition-colors hover:text-accent"
            href="https://github.com/HackEAC"
            rel="noreferrer"
            target="_blank"
          >
            HackEAC
          </a>{' '}
          {currentYear}
        </p>
      </div>
    </footer>
  )
}
